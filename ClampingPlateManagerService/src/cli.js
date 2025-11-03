// src/cli.js
/**
 * Command Line Interface for ClampingPlateManager Service
 * Allows testing all functionality without UI
 */

const { Command } = require("commander");
const chalk = require("chalk");
const database = require("../utils/Database");
const PlateService = require("./services/PlateService");
const config = require("../config");

const program = new Command();

class ClampingPlateManagerCLI {
  constructor() {
    this.plateService = null;
    this.database = null;
  }

  async initialize() {
    try {
      console.log(chalk.blue("🔌 Connecting to database..."));
      this.database = await database.connect();
      this.plateService = new PlateService(this.database);
      console.log(chalk.green("✅ CLI initialized successfully"));
    } catch (error) {
      console.error(chalk.red("❌ Failed to initialize CLI:", error.message));
      process.exit(1);
    }
  }

  async cleanup() {
    if (this.database) {
      await database.disconnect();
    }
  }
}

const cli = new ClampingPlateManagerCLI();

// Setup CLI commands
program
  .name("clamping-plate-cli")
  .description("CLI interface for ClampingPlateManager Service")
  .version(config.service.version);

// Create plate command
program
  .command("create-plate")
  .description("Create a new clamping plate")
  .requiredOption("-id, --plate-id <plateId>", "Plate ID (e.g., P001)")
  .requiredOption("-s, --shelf <shelf>", "Shelf location (e.g., A-12)")
  .option("-n, --name <name>", "Plate name")
  .option("-o, --operator <operator>", "Operator name", "CLI")
  .option("--notes <notes>", "Additional notes")
  .action(async (options) => {
    await cli.initialize();

    try {
      const plateData = {
        plateId: options.plateId,
        name: options.name,
        shelf: options.shelf,
        notes: options.notes,
      };

      const plate = await cli.plateService.createPlate(
        plateData,
        options.operator
      );

      console.log(chalk.green("✅ Plate created successfully:"));
      console.log(chalk.cyan("📋 Plate ID:"), plate.plateId);
      console.log(chalk.cyan("📍 Shelf:"), plate.shelf);
      console.log(
        chalk.cyan("💚 Status:"),
        `${plate.status.health}/${plate.status.occupancy}`
      );
      if (plate.name) console.log(chalk.cyan("🏷️  Name:"), plate.name);
    } catch (error) {
      console.error(chalk.red("❌ Error:"), error.message);
    } finally {
      await cli.cleanup();
    }
  });

// List plates command
program
  .command("list-plates")
  .description("List all plates")
  .option(
    "-s, --status <status>",
    "Filter by status (free, in-use, new, used, locked)"
  )
  .option("--shelf <shelf>", "Filter by shelf")
  .option("--search <search>", "Search plates")
  .action(async (options) => {
    await cli.initialize();

    try {
      const filters = {
        status: options.status,
        shelf: options.shelf,
        search: options.search,
      };

      const plates = await cli.plateService.getAllPlates(filters);

      if (plates.length === 0) {
        console.log(chalk.yellow("📋 No plates found"));
        return;
      }

      console.log(chalk.green(`📋 Found ${plates.length} plates:`));
      console.log();

      plates.forEach((plate) => {
        const statusColor =
          plate.status.occupancy === "in-use" ? chalk.red : chalk.green;
        const healthColor =
          plate.status.health === "new"
            ? chalk.green
            : plate.status.health === "locked"
            ? chalk.red
            : chalk.yellow;

        console.log(
          `${chalk.cyan(plate.plateId)} | ${healthColor(
            plate.status.health
          )} | ${statusColor(plate.status.occupancy)} | ${chalk.blue(
            plate.shelf
          )}`
        );

        if (plate.name) console.log(`  📛 ${plate.name}`);
        if (plate.currentWork) {
          console.log(
            `  🔧 Work: ${chalk.magenta(plate.currentWork.workName)} by ${
              plate.currentWork.operator
            }`
          );
        }
        console.log();
      });
    } catch (error) {
      console.error(chalk.red("❌ Error:"), error.message);
    } finally {
      await cli.cleanup();
    }
  });

// Start work command
program
  .command("start-work")
  .description("Start work on a plate")
  .requiredOption("-id, --plate-id <plateId>", "Plate ID")
  .requiredOption(
    "-w, --work-name <workName>",
    "Work name (e.g., W5270NS01001A)"
  )
  .requiredOption("-o, --operator <operator>", "Operator name")
  .action(async (options) => {
    await cli.initialize();

    try {
      const plate = await cli.plateService.startWork(
        options.plateId,
        options.workName,
        options.operator
      );

      console.log(chalk.green("✅ Work started successfully:"));
      console.log(chalk.cyan("📋 Plate:"), plate.plateId);
      console.log(chalk.cyan("🔧 Work:"), options.workName);
      console.log(chalk.cyan("👤 Operator:"), options.operator);
      console.log(
        chalk.cyan("🕐 Started:"),
        new Date(plate.currentWork.startedAt).toLocaleString()
      );
    } catch (error) {
      console.error(chalk.red("❌ Error:"), error.message);
    } finally {
      await cli.cleanup();
    }
  });

// Finish work command
program
  .command("finish-work")
  .description("Finish work on a plate")
  .requiredOption("-id, --plate-id <plateId>", "Plate ID")
  .requiredOption("-o, --operator <operator>", "Operator name")
  .option("--tools <tools>", "Tools used (comma-separated)")
  .action(async (options) => {
    await cli.initialize();

    try {
      const toolsUsed = options.tools
        ? options.tools.split(",").map((tool) => ({ toolName: tool.trim() }))
        : [];

      const plate = await cli.plateService.finishWork(
        options.plateId,
        options.operator,
        toolsUsed
      );

      console.log(chalk.green("✅ Work finished successfully:"));
      console.log(chalk.cyan("📋 Plate:"), plate.plateId);
      console.log(chalk.cyan("👤 Operator:"), options.operator);
      console.log(chalk.cyan("🔧 Tools used:"), toolsUsed.length);
      console.log(
        chalk.cyan("💚 Status:"),
        `${plate.status.health}/${plate.status.occupancy}`
      );
    } catch (error) {
      console.error(chalk.red("❌ Error:"), error.message);
    } finally {
      await cli.cleanup();
    }
  });

// Get plate details command
program
  .command("get-plate")
  .description("Get detailed information about a plate")
  .requiredOption("-id, --plate-id <plateId>", "Plate ID")
  .action(async (options) => {
    await cli.initialize();

    try {
      const plate = await cli.plateService.getPlateById(options.plateId);

      console.log(chalk.green("📋 Plate Details:"));
      console.log(chalk.cyan("ID:"), plate.plateId);
      console.log(chalk.cyan("Name:"), plate.name || "N/A");
      console.log(chalk.cyan("Shelf:"), plate.shelf);
      console.log(chalk.cyan("Health:"), plate.status.health);
      console.log(chalk.cyan("Occupancy:"), plate.status.occupancy);
      console.log(
        chalk.cyan("Created:"),
        new Date(plate.createdAt).toLocaleString()
      );
      console.log(
        chalk.cyan("Last Modified:"),
        new Date(plate.lastModifiedDate).toLocaleString()
      );

      if (plate.currentWork) {
        console.log();
        console.log(chalk.yellow("🔧 Current Work:"));
        console.log(chalk.cyan("  Work Name:"), plate.currentWork.workName);
        console.log(chalk.cyan("  Operator:"), plate.currentWork.operator);
        console.log(
          chalk.cyan("  Started:"),
          new Date(plate.currentWork.startedAt).toLocaleString()
        );
      }

      if (plate.history && plate.history.length > 0) {
        console.log();
        console.log(chalk.yellow("📜 Recent History:"));
        plate.history.slice(-5).forEach((entry) => {
          console.log(
            `  ${chalk.blue(entry.action)} by ${chalk.green(
              entry.user
            )} - ${new Date(entry.date).toLocaleString()}`
          );
        });
      }

      if (plate.toolsUsed && plate.toolsUsed.length > 0) {
        console.log();
        console.log(chalk.yellow("🔧 Tools Used:"));
        plate.toolsUsed.slice(-5).forEach((tool) => {
          console.log(
            `  ${chalk.magenta(tool.toolName)} - ${tool.workName || "N/A"}`
          );
        });
      }
    } catch (error) {
      console.error(chalk.red("❌ Error:"), error.message);
    } finally {
      await cli.cleanup();
    }
  });

// Analytics command
program
  .command("analytics")
  .description("Get dashboard analytics")
  .action(async () => {
    await cli.initialize();

    try {
      const analytics = await cli.plateService.getAnalytics();

      console.log(chalk.green("📊 Dashboard Analytics:"));
      console.log();

      const summary = analytics.summary;
      console.log(chalk.cyan("📋 Total Plates:"), summary.totalPlates);
      console.log(chalk.cyan("🟢 Free:"), summary.free);
      console.log(chalk.cyan("🔴 In Use:"), summary.inUse);
      console.log(chalk.cyan("🆕 New:"), summary.newPlates);
      console.log(chalk.cyan("🟡 Used:"), summary.usedPlates);
      console.log(chalk.cyan("🔒 Locked:"), summary.lockedPlates);

      if (analytics.recentActivity && analytics.recentActivity.length > 0) {
        console.log();
        console.log(chalk.yellow("📰 Recent Activity:"));
        analytics.recentActivity.slice(0, 5).forEach((activity) => {
          console.log(
            `  ${chalk.blue(activity.action)} on ${chalk.green(
              activity.plateId
            )} by ${chalk.cyan(activity.user)}`
          );
        });
      }
    } catch (error) {
      console.error(chalk.red("❌ Error:"), error.message);
    } finally {
      await cli.cleanup();
    }
  });

// Lock/Unlock commands
program
  .command("lock-plate")
  .description("Lock a plate")
  .requiredOption("-id, --plate-id <plateId>", "Plate ID")
  .requiredOption("-o, --operator <operator>", "Operator name")
  .option("-r, --reason <reason>", "Reason for locking")
  .action(async (options) => {
    await cli.initialize();

    try {
      await cli.plateService.lockPlate(
        options.plateId,
        options.operator,
        options.reason
      );
      console.log(chalk.green("✅ Plate locked successfully"));
    } catch (error) {
      console.error(chalk.red("❌ Error:"), error.message);
    } finally {
      await cli.cleanup();
    }
  });

program
  .command("unlock-plate")
  .description("Unlock a plate")
  .requiredOption("-id, --plate-id <plateId>", "Plate ID")
  .requiredOption("-o, --operator <operator>", "Operator name")
  .action(async (options) => {
    await cli.initialize();

    try {
      await cli.plateService.unlockPlate(options.plateId, options.operator);
      console.log(chalk.green("✅ Plate unlocked successfully"));
    } catch (error) {
      console.error(chalk.red("❌ Error:"), error.message);
    } finally {
      await cli.cleanup();
    }
  });

// Database commands
program
  .command("backup")
  .description("Create database backup")
  .action(async () => {
    await cli.initialize();

    try {
      const result = await database.createBackup();
      console.log(chalk.green("✅ Backup created successfully:"));
      console.log(chalk.cyan("Plates backed up:"), result.platesBackedUp);
      console.log(
        chalk.cyan("Activities backed up:"),
        result.activitiesBackedUp
      );
    } catch (error) {
      console.error(chalk.red("❌ Error:"), error.message);
    } finally {
      await cli.cleanup();
    }
  });

// Help examples
program.on("--help", () => {
  console.log();
  console.log(chalk.yellow("Examples:"));
  console.log(
    '  $ node src/cli.js create-plate -id P001 -s A-12 -n "Standard Clamp" -o "John"'
  );
  console.log("  $ node src/cli.js list-plates --status free");
  console.log(
    '  $ node src/cli.js start-work -id P001 -w W5270NS01001A -o "John"'
  );
  console.log(
    '  $ node src/cli.js finish-work -id P001 -o "John" --tools "Tool1,Tool2"'
  );
  console.log("  $ node src/cli.js get-plate -id P001");
  console.log("  $ node src/cli.js analytics");
  console.log();
});

// Parse and execute
program.parse(process.argv);

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
