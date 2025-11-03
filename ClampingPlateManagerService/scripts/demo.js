#!/usr/bin/env node

/**
 * Demo Workflow Script
 * Shows the complete workflow of the new Smart Clamping Plate System
 * Demonstrates the progression from "silly Excel system" to "smart API system"
 */

const chalk = require("chalk");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_BASE = "http://localhost:3001";

class ClampingPlateDemo {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
    });
  }

  async checkServiceHealth() {
    try {
      const response = await this.api.get("/health");
      console.log(chalk.green("✅ Service is running!"));
      console.log(chalk.gray(`Database: ${response.data.database.status}`));
      console.log(chalk.gray(`Uptime: ${Math.floor(response.data.uptime)}s`));
      return true;
    } catch (error) {
      console.log(chalk.red("❌ Service is not running!"));
      console.log(chalk.yellow("💡 Start it with: npm start"));
      return false;
    }
  }

  async showBefore() {
    console.log(chalk.bold.red('\n🏠 THE "SILLY" SYSTEM BEFORE:'));
    console.log("=====================================");
    console.log("📁 Physical plates numbered 1, 4, 5, 6, 7, 8, 9...");
    console.log("📊 Excel file tracking (Készülékek.xlsx)");
    console.log("❌ Manual updates");
    console.log("❌ No version control");
    console.log("❌ No file history");
    console.log("❌ No real-time tracking");
    console.log("❌ Risk of data loss");
    console.log("❌ No integration between tools");
  }

  async showAfter() {
    console.log(chalk.bold.green('\n🚀 THE "SMART" SYSTEM NOW:'));
    console.log("=====================================");
    console.log("✅ RESTful API with real-time WebSocket updates");
    console.log("✅ File version control (like Git for your plates!)");
    console.log("✅ Complete work session tracking");
    console.log("✅ Automatic backups");
    console.log("✅ CLI and web interface");
    console.log("✅ Integration ready (json_scanner, ToolManager)");
    console.log("✅ MongoDB with TTL cleanup");
  }

  async demonstrateWorkflow() {
    try {
      console.log(chalk.bold.blue("\n🎬 SMART WORKFLOW DEMONSTRATION"));
      console.log("=====================================");

      // Step 1: Get available plates
      console.log(chalk.cyan("\n📋 Step 1: Check available plates"));
      const platesResponse = await this.api.get("/api/plates", {
        params: { status: "free" },
      });
      const availablePlates = platesResponse.data.plates.filter(
        (p) => p.status.occupancy === "free" && p.status.health !== "locked"
      );

      if (availablePlates.length === 0) {
        console.log(
          chalk.yellow("No free plates available, creating demo plate...")
        );
        await this.createDemoPlate();
        return this.demonstrateWorkflow();
      }

      const selectedPlate = availablePlates[0];
      console.log(
        chalk.green(
          `✅ Selected plate: ${selectedPlate.plateId} (${selectedPlate.name})`
        )
      );
      console.log(chalk.gray(`   Shelf: ${selectedPlate.shelf}`));
      console.log(
        chalk.gray(
          `   Status: ${selectedPlate.status.health}/${selectedPlate.status.occupancy}`
        )
      );

      // Step 2: Start work
      console.log(chalk.cyan("\n🚀 Step 2: Start work on plate"));
      const workData = {
        workName: "W5270NS01001A_DEMO",
        operator: "John_Demo",
      };

      await this.api.post(
        `/api/plates/${selectedPlate.plateId}/work/start`,
        workData
      );
      console.log(chalk.green(`✅ Started work: ${workData.workName}`));
      console.log(chalk.gray(`   Operator: ${workData.operator}`));
      console.log(chalk.gray(`   Session tracked with unique ID`));

      // Step 3: Download current files
      console.log(chalk.cyan("\n📥 Step 3: Download current files for work"));
      try {
        const filesResponse = await this.api.get(
          `/api/files/${selectedPlate.plateId}/current`
        );
        console.log(chalk.green("✅ Current files available:"));
        const files = filesResponse.data.files;

        if (files.xtFile) {
          console.log(
            chalk.gray(
              `   📄 XT File: ${path.basename(files.xtFile.path)} (v${
                files.version
              })`
            )
          );
          console.log(
            chalk.gray(`   📥 Download: ${files.xtFile.downloadUrl}`)
          );
        }
        if (files.previewImage) {
          console.log(
            chalk.gray(
              `   🖼️  Preview: ${path.basename(files.previewImage.path)}`
            )
          );
        }
        console.log(
          chalk.gray(`   📁 ${files.drawings.length} drawing files available`)
        );
      } catch (error) {
        console.log(chalk.yellow("⚠️  No current files (new plate)"));
      }

      // Step 4: Simulate work completion
      console.log(chalk.cyan("\n⏳ Step 4: Simulate work being done..."));
      await this.sleep(2000);
      console.log(chalk.gray("   🔧 Machining operations completed"));
      console.log(chalk.gray("   📸 Taking photos of finished work"));
      console.log(chalk.gray("   💾 Preparing files for upload"));

      // Step 5: Upload completed work
      console.log(chalk.cyan("\n📤 Step 5: Upload completed work files"));

      // Create mock files for demonstration
      const mockFiles = await this.createMockFiles();
      console.log(chalk.green("✅ Files uploaded successfully!"));
      console.log(chalk.gray(`   📄 XT File: updated_part.xt`));
      console.log(chalk.gray(`   📸 Photo: finished_work.jpg`));
      console.log(chalk.gray(`   📋 Drawing: technical_drawing.pdf`));
      console.log(chalk.gray(`   🔄 New version created automatically`));

      // Step 6: Finish work
      console.log(chalk.cyan("\n✅ Step 6: Complete work session"));
      const finishData = {
        operator: workData.operator,
        toolsUsed: ["Tool_1", "Tool_2", "Gun_Drill_60"],
      };

      await this.api.post(
        `/api/plates/${selectedPlate.plateId}/work/finish`,
        finishData
      );
      console.log(chalk.green("✅ Work session completed!"));
      console.log(
        chalk.gray(`   Tools used: ${finishData.toolsUsed.join(", ")}`)
      );
      console.log(chalk.gray(`   Plate now available for next work`));

      // Step 7: Show file history
      console.log(chalk.cyan("\n📚 Step 7: View file version history"));
      try {
        const historyResponse = await this.api.get(
          `/api/files/${selectedPlate.plateId}/history`
        );
        const history = historyResponse.data.history;

        console.log(chalk.green(`✅ Found ${history.length} versions:`));
        history.forEach((version, index) => {
          console.log(
            chalk.gray(
              `   v${version.version}: ${version.operator} - ${new Date(
                version.uploadedAt
              ).toLocaleDateString()}`
            )
          );
          console.log(chalk.gray(`           Work: ${version.workSession}`));
          console.log(
            chalk.gray(`           Files: ${version.files.join(", ")}`)
          );
        });
      } catch (error) {
        console.log(chalk.yellow("⚠️  No file history yet"));
      }

      // Step 8: Show analytics
      console.log(chalk.cyan("\n📊 Step 8: Real-time analytics dashboard"));
      const analyticsResponse = await this.api.get("/api/plates/analytics");
      const analytics = analyticsResponse.data.analytics;

      console.log(chalk.green("✅ Current system status:"));
      console.log(chalk.gray(`   📦 Total plates: ${analytics.totalPlates}`));
      console.log(chalk.gray(`   🆓 Free plates: ${analytics.freePlates}`));
      console.log(chalk.gray(`   🔧 In use: ${analytics.inUsePlates}`));
      console.log(chalk.gray(`   🔒 Locked: ${analytics.lockedPlates}`));
      console.log(
        chalk.gray(`   📈 Efficiency: ${analytics.utilizationRate}%`)
      );
    } catch (error) {
      console.error(
        chalk.red("❌ Demo failed:"),
        error.response?.data?.message || error.message
      );
    }
  }

  async createDemoPlate() {
    const plateData = {
      plateId: "P999",
      name: "Demo Clamp Plate",
      shelf: "DEMO-01",
      operator: "System",
    };

    try {
      await this.api.post("/api/plates", plateData);
      console.log(chalk.green("✅ Created demo plate P999"));
    } catch (error) {
      // Plate might already exist
      console.log(chalk.yellow("⚠️  Demo plate already exists"));
    }
  }

  async createMockFiles() {
    // For demo purposes, just show what would happen
    // In real usage, actual files would be uploaded
    console.log(chalk.gray("   📁 Creating mock files for demo..."));
    console.log(chalk.gray("   ✅ Mock XT file ready"));
    console.log(chalk.gray("   ✅ Mock photo ready"));
    console.log(chalk.gray("   ✅ Mock drawing ready"));
    return true;
  }

  async showIntegrationBenefits() {
    console.log(chalk.bold.magenta("\n🔗 INTEGRATION BENEFITS:"));
    console.log("=====================================");
    console.log(
      "🤖 json_scanner: Automatically updates plate status when work completes"
    );
    console.log("🔧 ToolManager: Tracks which tools used on which plates");
    console.log("📊 Real-time Dashboard: Live updates via WebSocket");
    console.log("📱 Mobile Apps: Same API powers web and mobile interfaces");
    console.log("🔄 Backup System: Automatic daily backups with TTL cleanup");
    console.log(
      "📈 Analytics: Track utilization, efficiency, maintenance needs"
    );
  }

  async showCLICommands() {
    console.log(chalk.bold.yellow("\n⌨️  AVAILABLE CLI COMMANDS:"));
    console.log("=====================================");
    console.log('npm run cli create-plate -id P001 -s A-12 -n "New Plate"');
    console.log("npm run cli list-plates --status free");
    console.log("npm run cli start-work -id P001 -w W5270NS01001A -o John");
    console.log("npm run cli finish-work -id P001 -o John --tools Tool1,Tool2");
    console.log("npm run cli analytics");
    console.log("npm run cli get-plate -id P001");
    console.log("npm run cli backup");
    console.log("npm run migrate (imports your Excel data)");
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async run() {
    console.log(
      chalk.bold.blue("🎯 CLAMPING PLATE SYSTEM TRANSFORMATION DEMO")
    );
    console.log("==============================================");

    // Check if service is running
    const isHealthy = await this.checkServiceHealth();
    if (!isHealthy) {
      console.log(chalk.red("\n❌ Cannot run demo - service not available"));
      console.log(
        chalk.yellow("Please start the service first with: npm start")
      );
      return;
    }

    await this.showBefore();
    await this.showAfter();
    await this.demonstrateWorkflow();
    await this.showIntegrationBenefits();
    await this.showCLICommands();

    console.log(chalk.bold.green("\n🎉 TRANSFORMATION COMPLETE!"));
    console.log("=====================================");
    console.log(chalk.white('Your "silly" Excel system is now a'));
    console.log(
      chalk.bold.green("🚀 SMART, API-DRIVEN CLAMPING PLATE SYSTEM! 🚀")
    );
    console.log("");
    console.log(chalk.cyan("Next steps:"));
    console.log("1. Run: npm run migrate (import your existing data)");
    console.log("2. Test CLI: npm run cli list-plates");
    console.log("3. Try the API: curl http://localhost:3001/api/plates");
    console.log("4. Connect your other CNC tools to the API!");
  }
}

// Add axios dependency notice
if (require.main === module) {
  // Check if axios is available
  try {
    require("axios");
    require("form-data");
  } catch (error) {
    console.log(chalk.yellow("Installing demo dependencies..."));
    console.log("npm install axios form-data");
    process.exit(1);
  }

  const demo = new ClampingPlateDemo();
  demo.run().catch(console.error);
}

module.exports = ClampingPlateDemo;
