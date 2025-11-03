// src/main.js
/**
 * Main entry point for ClampingPlateManager headless service
 * Replaces the React App.tsx with a REST API server
 */

const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const path = require("path");

const config = require("../config");
const StorageAdapter = require("../utils/StorageAdapter");
const createPlateRoutes = require("./api/plateRoutes");

class ClampingPlateManagerService {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: config.websocket.cors,
    });
    this.storage = null;
  }

  async initialize() {
    try {
      console.log("🚀 Initializing ClampingPlateManager Service...");

      // Initialize storage (auto-detects MongoDB or falls back to local)
      this.storage = new StorageAdapter(config.storage.type);
      await this.storage.initialize();

      console.log(`📊 Storage initialized: ${this.storage.getStorageType()}`);

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup WebSocket
      this.setupWebSocket();

      // Setup scheduled tasks
      this.setupScheduledTasks();

      console.log("✅ Service initialization complete");
    } catch (error) {
      console.error("❌ Service initialization failed:", error);
      throw error;
    }
  }

  setupMiddleware() {
    // CORS
    this.app.use(cors(config.api.cors));

    // JSON parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });

    // Store storage instance for routes to access
    this.app.set("storage", this.storage);
    this.app.set("io", this.io);
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get("/health", async (req, res) => {
      const storageHealth = await this.storage.healthCheck();
      res.json({
        service: config.service.name,
        version: config.service.version,
        status: "running",
        storage: storageHealth,
        timestamp: new Date(),
        uptime: process.uptime(),
      });
    });

    // API routes
    this.app.use("/api/plates", createPlateRoutes(this.storage, this.io));
    this.app.use("/api/files", require("./api/fileRoutes"));

    // API documentation endpoint
    this.app.get("/api", (req, res) => {
      res.json({
        service: "ClampingPlateManager API",
        version: config.service.version,
        endpoints: {
          "GET /health": "Service health check",
          "GET /api/plates": "Get all plates (with filtering)",
          "GET /api/plates/analytics": "Get dashboard analytics",
          "GET /api/plates/:plateId": "Get specific plate",
          "POST /api/plates": "Create new plate",
          "PUT /api/plates/:plateId": "Update plate",
          "DELETE /api/plates/:plateId": "Delete plate",
          "POST /api/plates/:plateId/work/start": "Start work on plate",
          "POST /api/plates/:plateId/work/finish": "Finish work on plate",
          "POST /api/plates/:plateId/lock": "Lock plate",
          "POST /api/plates/:plateId/unlock": "Unlock plate",
          "GET /api/files/:plateId/current": "Get current files for plate",
          "POST /api/files/:plateId/upload": "Upload files when work finished",
          "GET /api/files/:plateId/download/:type/:filename":
            "Download specific file",
          "GET /api/files/:plateId/history": "Get file version history",
          "POST /api/files/:plateId/restore/:version":
            "Restore specific version",
          "GET /api/files/:plateId/preview/:type/:filename":
            "Preview image files",
        },
        websocket: {
          events: [
            "plate-created",
            "plate-updated",
            "plate-deleted",
            "work-started",
            "work-finished",
            "plate-locked",
            "plate-unlocked",
          ],
        },
      });
    });

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "Endpoint not found",
        path: req.originalUrl,
        availableEndpoints: "/api",
      });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error("🚨 Unhandled error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message:
          config.service.environment === "development"
            ? error.message
            : "Something went wrong",
      });
    });
  }

  setupWebSocket() {
    this.io.on("connection", (socket) => {
      console.log(`🔌 WebSocket client connected: ${socket.id}`);

      // Send welcome message
      socket.emit("connected", {
        message: "Connected to ClampingPlateManager service",
        timestamp: new Date(),
      });

      // Handle client events
      socket.on("subscribe-analytics", () => {
        socket.join("analytics");
        console.log(`📊 Client ${socket.id} subscribed to analytics`);
      });

      socket.on("disconnect", () => {
        console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
      });

      socket.on("error", (error) => {
        console.error(`🚨 WebSocket error from ${socket.id}:`, error);
      });
    });

    console.log("📡 WebSocket server configured");
  }

  setupScheduledTasks() {
    // Daily backup at 2 AM (if running continuously)
    const scheduleBackup = () => {
      const now = new Date();
      const nextBackup = new Date();
      nextBackup.setHours(2, 0, 0, 0);

      if (nextBackup <= now) {
        nextBackup.setDate(nextBackup.getDate() + 1);
      }

      const msUntilBackup = nextBackup.getTime() - now.getTime();

      setTimeout(async () => {
        try {
          console.log("🕐 Starting scheduled backup...");
          await this.storage.createBackup();

          // Emit backup completion event
          this.io.emit("backup-completed", {
            timestamp: new Date(),
            success: true,
          });

          // Schedule next backup
          scheduleBackup();
        } catch (error) {
          console.error("❌ Scheduled backup failed:", error);
          this.io.emit("backup-failed", {
            timestamp: new Date(),
            error: error.message,
          });
        }
      }, msUntilBackup);

      console.log(`📅 Next backup scheduled for: ${nextBackup.toISOString()}`);
    };

    scheduleBackup();
  }

  async start() {
    try {
      await this.initialize();

      const port = config.service.port;
      this.server.listen(port, () => {
        console.log("\n🎉 ClampingPlateManager Service Started Successfully!");
        console.log("=====================================");
        console.log(`🌐 API Server: http://localhost:${port}`);
        console.log(`📋 API Documentation: http://localhost:${port}/api`);
        console.log(`❤️  Health Check: http://localhost:${port}/health`);
        console.log(`📡 WebSocket: ws://localhost:${port}`);
        console.log(`🗄️  Storage: ${this.storage.getStorageType()}`);
        console.log(`🔧 Environment: ${config.service.environment}`);
        console.log("=====================================\n");
      });
    } catch (error) {
      console.error("❌ Failed to start service:", error);
      process.exit(1);
    }
  }

  async stop() {
    console.log("🛑 Stopping ClampingPlateManager Service...");

    if (this.server) {
      this.server.close();
    }

    if (this.io) {
      this.io.close();
    }

    if (this.storage) {
      await this.storage.disconnect();
    }

    console.log("✅ Service stopped");
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...");
  if (global.serviceInstance) {
    await global.serviceInstance.stop();
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  if (global.serviceInstance) {
    await global.serviceInstance.stop();
  }
  process.exit(0);
});

// Start service if called directly
if (require.main === module) {
  const service = new ClampingPlateManagerService();
  global.serviceInstance = service;
  service.start().catch(console.error);
}

module.exports = ClampingPlateManagerService;
