// utils/Database.js
/**
 * MongoDB connection and setup utility
 */

const { MongoClient } = require("mongodb");
const config = require("../config");

class Database {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      console.log("🔌 Connecting to MongoDB...");

      this.client = new MongoClient(config.mongodb.uri, config.mongodb.options);
      await this.client.connect();

      this.db = this.client.db(config.mongodb.database);
      this.isConnected = true;

      console.log(
        `✅ Connected to MongoDB database: ${config.mongodb.database}`
      );

      // Setup collections and indexes
      await this.setupCollections();

      return this.db;
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  async setupCollections() {
    try {
      console.log("⚙️ Setting up collections and indexes...");

      // Main collections
      const collections = ["plates", "users", "works", "activity_log"];

      // Backup collections with TTL
      const backupCollections = [
        "plates_backup",
        "works_backup",
        "activity_backup",
      ];

      // Create collections if they don't exist
      const existingCollections = await this.db.listCollections().toArray();
      const existingNames = existingCollections.map((c) => c.name);

      for (const collectionName of [...collections, ...backupCollections]) {
        if (!existingNames.includes(collectionName)) {
          await this.db.createCollection(collectionName);
          console.log(`📁 Created collection: ${collectionName}`);
        }
      }

      // Setup indexes for main collections
      await this.setupMainIndexes();

      // Setup TTL indexes for backup collections
      await this.setupTTLIndexes();

      console.log("✅ Collections and indexes setup complete");
    } catch (error) {
      console.error("❌ Failed to setup collections:", error);
      throw error;
    }
  }

  async setupMainIndexes() {
    // Plates collection indexes
    await this.db
      .collection("plates")
      .createIndex({ plateId: 1 }, { unique: true });
    await this.db.collection("plates").createIndex({ "status.occupancy": 1 });
    await this.db.collection("plates").createIndex({ "status.health": 1 });
    await this.db.collection("plates").createIndex({ shelf: 1 });
    await this.db
      .collection("plates")
      .createIndex({ "currentWork.workName": 1 });
    await this.db.collection("plates").createIndex({ createdAt: 1 });

    // Users collection indexes
    await this.db
      .collection("users")
      .createIndex({ username: 1 }, { unique: true });
    await this.db
      .collection("users")
      .createIndex({ userId: 1 }, { unique: true });

    // Works collection indexes
    await this.db
      .collection("works")
      .createIndex({ workName: 1 }, { unique: true });
    await this.db.collection("works").createIndex({ plateId: 1 });
    await this.db.collection("works").createIndex({ startedAt: 1 });

    // Activity log indexes
    await this.db.collection("activity_log").createIndex({ timestamp: 1 });
    await this.db.collection("activity_log").createIndex({ plateId: 1 });
    await this.db.collection("activity_log").createIndex({ action: 1 });

    console.log("📊 Main collection indexes created");
  }

  async setupTTLIndexes() {
    // Setup TTL (Time To Live) indexes for automatic cleanup
    const ttlSeconds = config.dataRetention.backupCollections;

    for (const [collectionName, ttl] of Object.entries(ttlSeconds)) {
      await this.db
        .collection(collectionName)
        .createIndex({ createdAt: 1 }, { expireAfterSeconds: ttl });
      console.log(
        `⏰ TTL index created for ${collectionName}: ${ttl / 86400} days`
      );
    }
  }

  async createBackup() {
    try {
      console.log("💾 Creating daily backup...");

      const today = new Date();

      // Backup plates
      const plates = await this.db.collection("plates").find({}).toArray();
      const plateBackups = plates.map((plate) => ({
        ...plate,
        originalId: plate._id,
        backupDate: today,
        createdAt: today, // For TTL index
      }));

      if (plateBackups.length > 0) {
        await this.db.collection("plates_backup").insertMany(plateBackups);
      }

      // Backup recent activity (last 24 hours)
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const recentActivity = await this.db
        .collection("activity_log")
        .find({ timestamp: { $gte: yesterday } })
        .toArray();

      if (recentActivity.length > 0) {
        const activityBackups = recentActivity.map((activity) => ({
          ...activity,
          originalId: activity._id,
          backupDate: today,
          createdAt: today, // For TTL index
        }));

        await this.db.collection("activity_backup").insertMany(activityBackups);
      }

      console.log(
        `✅ Backup completed: ${plateBackups.length} plates, ${recentActivity.length} activities`
      );

      return {
        success: true,
        platesBackedUp: plateBackups.length,
        activitiesBackedUp: recentActivity.length,
        backupDate: today,
      };
    } catch (error) {
      console.error("❌ Backup failed:", error);
      throw error;
    }
  }

  async getDatabase() {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log("🔌 Disconnected from MongoDB");
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: "disconnected", error: "Not connected to database" };
      }

      // Ping the database
      await this.db.admin().ping();

      // Get collection stats
      const plateCount = await this.db.collection("plates").countDocuments();
      const userCount = await this.db.collection("users").countDocuments();

      return {
        status: "healthy",
        database: config.mongodb.database,
        collections: {
          plates: plateCount,
          users: userCount,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: "error",
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}

// Singleton instance
const database = new Database();

module.exports = database;
