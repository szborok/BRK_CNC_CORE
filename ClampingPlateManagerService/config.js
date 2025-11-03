// config.js
const path = require("path");

const config = {
  // Service settings
  service: {
    name: "clamping-plate-manager-service",
    version: "1.0.0",
    port: process.env.PORT || 3001,
    environment: process.env.NODE_ENV || "development",
  },

  // Storage settings - supports both local and MongoDB
  storage: {
    type: process.env.STORAGE_TYPE || "auto", // 'local', 'mongodb', 'auto'
    local: {
      dataDirectory: process.env.LOCAL_DATA_DIR || path.join(__dirname, "data"),
      backupDirectory: path.join(__dirname, "data", "backups"),
      maxBackups: 10,
    },
  },

  // MongoDB connection (fallback when storage.type is 'mongodb' or 'auto')
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
    database: process.env.MONGODB_DATABASE || "cnc_management", // ClampingPlateManager database
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // Backup and retention settings (as per your requirements)
  dataRetention: {
    // ClampingPlate data - keep forever with 1 week backup
    plates: {
      permanent: true,
      backupDays: 7,
    },
    // Backup collections with TTL
    backupCollections: {
      plates_backup: 7 * 24 * 60 * 60, // 7 days in seconds
      works_backup: 7 * 24 * 60 * 60,
      activity_backup: 7 * 24 * 60 * 60,
    },
  },

  // File upload settings
  uploads: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [".jpg", ".jpeg", ".png", ".pdf", ".x_t", ".step"],
    directory: process.env.UPLOAD_DIR || path.join(__dirname, "uploads"),
    baseUrl: process.env.BASE_URL || "http://localhost:3001",
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    enableConsole: true,
    enableFile: false,
    logDirectory: path.join(__dirname, "logs"),
  },

  // API settings
  api: {
    cors: {
      origin: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",")
        : ["http://localhost:3000"],
      credentials: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

  // WebSocket settings
  websocket: {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  },

  // Authentication (for future implementation)
  auth: {
    jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    jwtExpiration: "24h",
    bcryptRounds: 10,
  },

  // Default admin user (for setup)
  defaultAdmin: {
    username: "admin",
    name: "Administrator",
    password: "admin123", // Change this!
    email: "admin@cnc-management.local",
  },
};

module.exports = config;
