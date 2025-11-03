// src/models/Plate.js
/**
 * Plate data model and validation
 * Based on the original TypeScript interfaces from the React app
 */

class Plate {
  constructor(data = {}) {
    this.plateId = data.plateId || this.generatePlateId();
    this.name = data.name || null;
    this.shelf = data.shelf || "";
    this.previewImage = data.previewImage || null;
    this.xtFile = data.xtFile || null;
    this.status = {
      health: data.health || "new", // 'new', 'used', 'locked'
      occupancy: data.occupancy || "free", // 'free', 'in-use'
    };
    this.notes = data.notes || "";
    this.currentWork = data.currentWork || null; // { workName, startedAt, operator }
    this.lastModifiedBy = data.lastModifiedBy || null;
    this.lastModifiedDate = data.lastModifiedDate || new Date();
    this.history = data.history || [];
    this.toolsUsed = data.toolsUsed || []; // Array of tool usage records

    // Enhanced file management with version tracking
    this.files = {
      currentVersion: data.files?.currentVersion || 0,
      previewImage: data.files?.previewImage || null,
      xtFile: data.files?.xtFile || null,
      drawings: data.files?.drawings || [],
      versions: data.files?.versions || [], // Array of file version info
      totalVersions: data.files?.totalVersions || 0,
    };

    // Work session tracking
    this.workSessions = data.workSessions || []; // Complete work session history

    this.createdAt = data.createdAt || new Date();
    this.updatedAt = new Date();
  }

  generatePlateId() {
    // Generate plate ID like P001, P002, etc.
    const timestamp = Date.now().toString().slice(-4);
    return `P${timestamp}`;
  }

  addHistoryEntry(action, user, details = null) {
    const entry = {
      id: require("uuid").v4(),
      action: action,
      user: user,
      date: new Date(),
      details: details,
    };
    this.history.push(entry);
    this.lastModifiedBy = user;
    this.lastModifiedDate = new Date();
    this.updatedAt = new Date();
    return entry;
  }

  startWork(workName, operator) {
    if (this.status.occupancy === "in-use") {
      throw new Error(`Plate ${this.plateId} is already in use`);
    }

    if (this.status.health === "locked") {
      throw new Error(`Plate ${this.plateId} is locked and cannot be used`);
    }

    this.status.occupancy = "in-use";
    this.currentWork = {
      workName: workName,
      startedAt: new Date(),
      operator: operator,
      sessionId: require("uuid").v4(),
    };

    // Create new work session
    const workSession = {
      sessionId: this.currentWork.sessionId,
      workName: workName,
      operator: operator,
      startedAt: new Date(),
      status: "in-progress",
      filesDownloaded: [],
      filesUploaded: [],
      toolsUsed: [],
      notes: "",
    };

    this.workSessions.push(workSession);
    this.addHistoryEntry("work-started", operator, {
      workName,
      sessionId: workSession.sessionId,
    });
    return this;
  }

  finishWork(operator, toolsUsed = [], uploadedFiles = {}) {
    if (this.status.occupancy !== "in-use" || !this.currentWork) {
      throw new Error(`No active work found on plate ${this.plateId}`);
    }

    const workName = this.currentWork.workName;
    const startTime = this.currentWork.startedAt;
    const sessionId = this.currentWork.sessionId;
    const duration = new Date() - new Date(startTime);

    // Mark plate as used after work completion
    this.status.health = "used";
    this.status.occupancy = "free";

    // Add tools used to the plate record
    if (toolsUsed.length > 0) {
      this.toolsUsed.push(
        ...toolsUsed.map((tool) => ({
          ...tool,
          usedAt: new Date(),
          workName: workName,
          sessionId: sessionId,
        }))
      );
    }

    // Update work session
    const sessionIndex = this.workSessions.findIndex(
      (s) => s.sessionId === sessionId
    );
    if (sessionIndex !== -1) {
      this.workSessions[sessionIndex] = {
        ...this.workSessions[sessionIndex],
        finishedAt: new Date(),
        status: "completed",
        duration: Math.round(duration / 1000 / 60), // duration in minutes
        toolsUsed: toolsUsed,
        filesUploaded: uploadedFiles ? Object.keys(uploadedFiles) : [],
        finalVersion: this.files.currentVersion,
      };
    }

    this.addHistoryEntry("work-finished", operator, {
      workName,
      sessionId,
      duration: Math.round(duration / 1000 / 60), // duration in minutes
      toolsUsed: toolsUsed.length,
      filesUploaded: uploadedFiles ? Object.keys(uploadedFiles).length : 0,
    });

    // Clear current work
    this.currentWork = null;
    return this;
  }

  lockPlate(operator, reason = "") {
    this.status.health = "locked";
    if (this.status.occupancy === "in-use") {
      // Force finish current work if plate is being locked
      this.finishWork(operator, []);
    }
    this.addHistoryEntry("plate-locked", operator, { reason });
    return this;
  }

  unlockPlate(operator) {
    if (this.status.health !== "locked") {
      throw new Error(`Plate ${this.plateId} is not locked`);
    }

    this.status.health = "used"; // Assume it was used if it was locked
    this.addHistoryEntry("plate-unlocked", operator);
    return this;
  }

  updateFiles(files, operator, version = null) {
    // Update current file references
    if (files.previewImage) this.files.previewImage = files.previewImage;
    if (files.xtFile) this.files.xtFile = files.xtFile;
    if (files.drawings)
      this.files.drawings = [...this.files.drawings, ...files.drawings];

    // Update version info if provided
    if (version !== null) {
      this.files.currentVersion = version;
      this.files.totalVersions = Math.max(this.files.totalVersions, version);

      // Add version info to history
      this.files.versions.push({
        version: version,
        createdAt: new Date(),
        operator: operator,
        files: { ...files },
      });
    }

    this.addHistoryEntry("files-updated", operator, {
      filesUpdated: Object.keys(files).length,
      version: version,
    });
    return this;
  }

  // New method to track file downloads
  trackFileDownload(operator, files) {
    if (this.currentWork && this.currentWork.sessionId) {
      const sessionIndex = this.workSessions.findIndex(
        (s) => s.sessionId === this.currentWork.sessionId
      );
      if (sessionIndex !== -1) {
        this.workSessions[sessionIndex].filesDownloaded = files;
      }
    }

    this.addHistoryEntry("files-downloaded", operator, {
      files: files,
      version: this.files.currentVersion,
    });
    return this;
  }

  // Get current work session
  getCurrentWorkSession() {
    if (!this.currentWork || !this.currentWork.sessionId) {
      return null;
    }
    return this.workSessions.find(
      (s) => s.sessionId === this.currentWork.sessionId
    );
  }

  // Get work session history
  getWorkHistory() {
    return this.workSessions.filter((s) => s.status === "completed");
  }

  validate() {
    const errors = [];

    if (!this.plateId) errors.push("Plate ID is required");
    if (!this.shelf) errors.push("Shelf location is required");
    if (!["new", "used", "locked"].includes(this.status.health)) {
      errors.push("Invalid health status");
    }
    if (!["free", "in-use"].includes(this.status.occupancy)) {
      errors.push("Invalid occupancy status");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  toJSON() {
    return {
      plateId: this.plateId,
      name: this.name,
      shelf: this.shelf,
      status: this.status,
      notes: this.notes,
      currentWork: this.currentWork,
      lastModifiedBy: this.lastModifiedBy,
      lastModifiedDate: this.lastModifiedDate,
      history: this.history,
      toolsUsed: this.toolsUsed,
      files: this.files,
      workSessions: this.workSessions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromDatabase(doc) {
    return new Plate({
      plateId: doc.plateId,
      name: doc.name,
      shelf: doc.shelf,
      health: doc.status?.health,
      occupancy: doc.status?.occupancy,
      notes: doc.notes,
      currentWork: doc.currentWork,
      lastModifiedBy: doc.lastModifiedBy,
      lastModifiedDate: doc.lastModifiedDate,
      history: doc.history || [],
      toolsUsed: doc.toolsUsed || [],
      files: doc.files || {
        currentVersion: 0,
        previewImage: null,
        xtFile: null,
        drawings: [],
        versions: [],
        totalVersions: 0,
      },
      workSessions: doc.workSessions || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

module.exports = Plate;
