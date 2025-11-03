const XLSX = require("xlsx");
const fs = require("fs").promises;
const path = require("path");
const Database = require("../utils/Database");
const Plate = require("../src/models/Plate");
const config = require("../config");

/**
 * Migration script to import existing plate data from Excel
 * Based on your test_data structure: numbered plates 1-38+ with work history
 */

class PlateMigration {
  constructor() {
    this.database = null;
    this.importedPlates = [];
    this.errors = [];
  }

  async connect() {
    try {
      this.database = await Database.connect();
      console.log("✅ Connected to database for migration");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw error;
    }
  }

  async importFromExcel(excelPath) {
    try {
      console.log("📊 Reading Excel file:", excelPath);

      // Read the Excel file
      const workbook = XLSX.readFile(excelPath);
      const sheetName = workbook.SheetNames[0]; // First sheet
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet);
      console.log(`📋 Found ${data.length} rows in Excel`);

      for (const row of data) {
        try {
          await this.processPlateRow(row);
        } catch (error) {
          console.error(`❌ Error processing row:`, row, error);
          this.errors.push({
            row,
            error: error.message,
          });
        }
      }

      console.log(
        `✅ Migration complete! Imported ${this.importedPlates.length} plates`
      );
      if (this.errors.length > 0) {
        console.log(`⚠️  ${this.errors.length} errors occurred`);
      }
    } catch (error) {
      console.error("❌ Excel import failed:", error);
      throw error;
    }
  }

  async processPlateRow(row) {
    // Extract plate information from Excel row
    // Assuming columns like: PlateNumber, Name, Shelf, Projects, etc.
    const plateNumber = row["Plate"] || row["PlateNumber"] || row["Number"];
    const plateId = `P${String(plateNumber).padStart(3, "0")}`; // P001, P002, etc.

    const plateName =
      row["Name"] || row["Description"] || `Clamp Plate ${plateNumber}`;
    const shelf =
      row["Shelf"] || row["Location"] || this.guessShelfLocation(plateNumber);
    const projects = row["Projects"] || row["WorkHistory"] || "";

    // Create plate object
    const plateData = {
      plateId: plateId,
      name: plateName,
      shelf: shelf,
      health: this.determineHealthStatus(projects),
      occupancy: "free", // All plates start as free
      notes: `Migrated from Excel. Original projects: ${projects}`,
      workSessions: this.parseWorkHistory(projects, plateId),
      history: [],
      toolsUsed: [],
      files: {
        currentVersion: 0,
        previewImage: null,
        xtFile: null,
        drawings: [],
        versions: [],
        totalVersions: 0,
      },
    };

    const plate = new Plate(plateData);

    // Add migration history entry
    plate.addHistoryEntry("plate-created", "MIGRATION", {
      source: "Excel import",
      originalData: projects,
      migratedAt: new Date(),
    });

    // Save to database
    const collection = this.database.collection("plates");

    // Check if plate already exists
    const existingPlate = await collection.findOne({ plateId: plateId });
    if (existingPlate) {
      console.log(`⚠️  Plate ${plateId} already exists, skipping...`);
      return;
    }

    await collection.insertOne(plate.toJSON());
    console.log(`✅ Imported plate ${plateId}: ${plateName}`);

    this.importedPlates.push(plateId);
  }

  parseWorkHistory(projectsString, plateId) {
    if (!projectsString || projectsString.trim() === "") {
      return [];
    }

    const workSessions = [];

    // Split projects by common separators
    const projects = projectsString
      .split(/[,;|\n]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    projects.forEach((project, index) => {
      // Create a work session for each project
      // Since we don't have exact dates, estimate based on creation
      const estimatedDate = new Date();
      estimatedDate.setDate(
        estimatedDate.getDate() - (projects.length - index) * 7
      ); // Space them 1 week apart

      workSessions.push({
        sessionId: require("uuid").v4(),
        workName: project,
        operator: "HISTORICAL", // Unknown operator
        startedAt: estimatedDate,
        finishedAt: new Date(estimatedDate.getTime() + 4 * 60 * 60 * 1000), // Assume 4 hours work
        status: "completed",
        duration: 240, // 4 hours in minutes
        filesDownloaded: [],
        filesUploaded: [],
        toolsUsed: [],
        notes: "Historical work session from Excel migration",
      });
    });

    return workSessions;
  }

  determineHealthStatus(projects) {
    if (!projects || projects.trim() === "") {
      return "new"; // No projects means new plate
    }
    return "used"; // Has been used for projects
  }

  guessShelfLocation(plateNumber) {
    // Create shelf locations based on plate number
    // A-01 to A-12, B-01 to B-12, etc.
    const shelfLetter = String.fromCharCode(
      65 + Math.floor((plateNumber - 1) / 12)
    ); // A, B, C...
    const shelfNumber = String(((plateNumber - 1) % 12) + 1).padStart(2, "0");
    return `${shelfLetter}-${shelfNumber}`;
  }

  async importFromTestDataFolders() {
    try {
      console.log("📁 Scanning test_data folders for plate information...");

      const testDataPath =
        "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Projects/ClampingPlateManager/test_data";

      // Scan for numbered folders (1, 4, 5, 6, etc.)
      const entries = await fs.readdir(testDataPath);
      const plateFolders = entries.filter((entry) => /^\d+$/.test(entry));

      console.log(
        `📋 Found ${plateFolders.length} plate folders:`,
        plateFolders
      );

      for (const folder of plateFolders) {
        try {
          await this.processPlateFolder(testDataPath, folder);
        } catch (error) {
          console.error(`❌ Error processing folder ${folder}:`, error);
          this.errors.push({
            folder,
            error: error.message,
          });
        }
      }
    } catch (error) {
      console.error("❌ Test data import failed:", error);
      throw error;
    }
  }

  async processPlateFolder(basePath, folderName) {
    const plateNumber = parseInt(folderName);
    const plateId = `P${String(plateNumber).padStart(3, "0")}`;
    const folderPath = path.join(basePath, folderName);

    try {
      const folderStats = await fs.stat(folderPath);
      if (!folderStats.isDirectory()) {
        return;
      }

      // Read folder contents to find projects
      const files = await fs.readdir(folderPath);
      const workProjects = files.filter((f) => f !== ".DS_Store");

      console.log(
        `📂 Plate ${plateId} has ${workProjects.length} projects:`,
        workProjects
      );

      // Check if plate already exists
      const collection = this.database.collection("plates");
      const existingPlate = await collection.findOne({ plateId: plateId });

      if (existingPlate) {
        console.log(
          `⚠️  Plate ${plateId} already exists, updating work history...`
        );

        // Add new work sessions for any missing projects
        const existingWorkNames = existingPlate.workSessions.map(
          (ws) => ws.workName
        );
        const newProjects = workProjects.filter(
          (p) => !existingWorkNames.includes(p)
        );

        if (newProjects.length > 0) {
          const newSessions = this.parseWorkHistory(
            newProjects.join(","),
            plateId
          );
          await collection.updateOne(
            { plateId: plateId },
            {
              $push: {
                workSessions: { $each: newSessions },
                history: {
                  $each: [
                    {
                      id: require("uuid").v4(),
                      action: "work-history-updated",
                      user: "MIGRATION",
                      date: new Date(),
                      details: { addedProjects: newProjects },
                    },
                  ],
                },
              },
            }
          );
          console.log(
            `✅ Updated ${plateId} with ${newProjects.length} new projects`
          );
        }
        return;
      }

      // Create new plate
      const plateData = {
        plateId: plateId,
        name: `Clamp Plate ${plateNumber}`,
        shelf: this.guessShelfLocation(plateNumber),
        health: workProjects.length > 0 ? "used" : "new",
        occupancy: "free",
        notes: `Migrated from test_data folder. Found ${workProjects.length} projects.`,
        workSessions: this.parseWorkHistory(workProjects.join(","), plateId),
        history: [],
        toolsUsed: [],
        files: {
          currentVersion: 0,
          previewImage: null,
          xtFile: null,
          drawings: [],
          versions: [],
          totalVersions: 0,
        },
      };

      const plate = new Plate(plateData);

      // Add migration history entry
      plate.addHistoryEntry("plate-created", "MIGRATION", {
        source: "test_data folder scan",
        folderPath: folderPath,
        projectsFound: workProjects,
        migratedAt: new Date(),
      });

      await collection.insertOne(plate.toJSON());
      console.log(
        `✅ Created plate ${plateId} with ${workProjects.length} historical projects`
      );

      this.importedPlates.push(plateId);
    } catch (error) {
      console.error(`❌ Error reading folder ${folderPath}:`, error);
      throw error;
    }
  }

  async generateReport() {
    console.log("\n📋 MIGRATION REPORT");
    console.log("==================");
    console.log(
      `✅ Successfully imported: ${this.importedPlates.length} plates`
    );
    console.log(`❌ Errors encountered: ${this.errors.length}`);

    if (this.importedPlates.length > 0) {
      console.log("\n📦 Imported Plates:");
      this.importedPlates.forEach((plateId) => {
        console.log(`  - ${plateId}`);
      });
    }

    if (this.errors.length > 0) {
      console.log("\n🚨 Errors:");
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.error}`);
        if (error.row) console.log(`     Row: ${JSON.stringify(error.row)}`);
        if (error.folder) console.log(`     Folder: ${error.folder}`);
      });
    }

    // Get final count from database
    try {
      const collection = this.database.collection("plates");
      const totalPlates = await collection.countDocuments();
      console.log(`\n📊 Total plates in database: ${totalPlates}`);
    } catch (error) {
      console.error("Error getting final count:", error);
    }
  }

  async disconnect() {
    if (this.database) {
      await Database.disconnect();
      console.log("✅ Disconnected from database");
    }
  }
}

// CLI interface
async function runMigration() {
  const migration = new PlateMigration();

  try {
    await migration.connect();

    // Check if Excel file exists
    const excelPath =
      "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Projects/ClampingPlateManager/test_data/Készülékek.xlsx";

    try {
      await fs.access(excelPath);
      console.log("📊 Found Excel file, importing...");
      await migration.importFromExcel(excelPath);
    } catch (error) {
      console.log("📊 Excel file not accessible, skipping Excel import");
    }

    // Import from test_data folders
    console.log("📁 Importing from test_data folders...");
    await migration.importFromTestDataFolders();

    // Generate report
    await migration.generateReport();
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await migration.disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = PlateMigration;
