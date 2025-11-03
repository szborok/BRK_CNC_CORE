const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

class FileService {
  constructor(basePath = "./uploads") {
    this.basePath = basePath;
    this.ensureDirectoriesExist();
  }

  async ensureDirectoriesExist() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
      await fs.mkdir(path.join(this.basePath, "plates"), { recursive: true });
      await fs.mkdir(path.join(this.basePath, "temp"), { recursive: true });
    } catch (error) {
      console.error("Error creating directories:", error);
    }
  }

  /**
   * Get the storage path for a specific plate
   */
  getPlatePath(plateId) {
    return path.join(this.basePath, "plates", plateId);
  }

  /**
   * Get the version path for a specific plate and version
   */
  getVersionPath(plateId, version) {
    return path.join(this.getPlatePath(plateId), `v${version}`);
  }

  /**
   * Get current (latest) files for a plate
   */
  async getCurrentFiles(plateId) {
    try {
      const platePath = this.getPlatePath(plateId);
      const currentPath = path.join(platePath, "current");

      if (!(await this.directoryExists(currentPath))) {
        return {
          xtFile: null,
          previewImage: null,
          drawings: [],
          version: 0,
        };
      }

      const files = await fs.readdir(currentPath);
      const fileTypes = {
        xtFile: files.find((f) => f.toLowerCase().endsWith(".xt")),
        previewImage: files.find((f) => /\.(jpg|jpeg|png|gif)$/i.test(f)),
        drawings: files.filter((f) => /\.(pdf|dwg|dxf)$/i.test(f)),
      };

      // Get version info
      const versionInfoPath = path.join(currentPath, "version.json");
      let version = 0;
      if (await this.fileExists(versionInfoPath)) {
        const versionInfo = JSON.parse(
          await fs.readFile(versionInfoPath, "utf8")
        );
        version = versionInfo.version;
      }

      return {
        xtFile: fileTypes.xtFile
          ? path.join(currentPath, fileTypes.xtFile)
          : null,
        previewImage: fileTypes.previewImage
          ? path.join(currentPath, fileTypes.previewImage)
          : null,
        drawings: fileTypes.drawings.map((f) => path.join(currentPath, f)),
        version,
        currentPath,
      };
    } catch (error) {
      console.error(`Error getting current files for plate ${plateId}:`, error);
      return {
        xtFile: null,
        previewImage: null,
        drawings: [],
        version: 0,
      };
    }
  }

  /**
   * Save new version of files when work is completed
   */
  async saveNewVersion(plateId, files, workSession) {
    try {
      const platePath = this.getPlatePath(plateId);
      await fs.mkdir(platePath, { recursive: true });

      // Get current version number
      const currentFiles = await this.getCurrentFiles(plateId);
      const newVersion = currentFiles.version + 1;

      const versionPath = this.getVersionPath(plateId, newVersion);
      const currentPath = path.join(platePath, "current");

      // Create version directory
      await fs.mkdir(versionPath, { recursive: true });
      await fs.mkdir(currentPath, { recursive: true });

      const savedFiles = {
        xtFile: null,
        previewImage: null,
        drawings: [],
        version: newVersion,
        metadata: {
          workSession: workSession.workName,
          operator: workSession.operator,
          uploadedAt: new Date(),
          fileHashes: {},
          previousVersion: currentFiles.version,
        },
      };

      // Process each file
      for (const file of files) {
        const fileHash = await this.calculateFileHash(file.path);
        const sanitizedName = this.sanitizeFileName(file.originalname);

        // Save to version directory
        const versionFilePath = path.join(versionPath, sanitizedName);
        await fs.copyFile(file.path, versionFilePath);

        // Save to current directory (overwrite existing)
        const currentFilePath = path.join(currentPath, sanitizedName);
        await fs.copyFile(file.path, currentFilePath);

        // Categorize file
        const extension = path.extname(sanitizedName).toLowerCase();
        savedFiles.metadata.fileHashes[sanitizedName] = fileHash;

        if (extension === ".xt") {
          savedFiles.xtFile = currentFilePath;
        } else if ([".jpg", ".jpeg", ".png", ".gif"].includes(extension)) {
          savedFiles.previewImage = currentFilePath;
        } else if ([".pdf", ".dwg", ".dxf"].includes(extension)) {
          savedFiles.drawings.push(currentFilePath);
        }

        // Clean up temp file
        await fs.unlink(file.path);
      }

      // Save version metadata
      const versionMetadataPath = path.join(versionPath, "version.json");
      await fs.writeFile(
        versionMetadataPath,
        JSON.stringify(savedFiles.metadata, null, 2)
      );

      // Update current version info
      const currentVersionPath = path.join(currentPath, "version.json");
      await fs.writeFile(
        currentVersionPath,
        JSON.stringify(
          {
            version: newVersion,
            createdAt: new Date(),
            workSession: workSession.workName,
            operator: workSession.operator,
          },
          null,
          2
        )
      );

      return {
        success: true,
        version: newVersion,
        files: savedFiles,
        message: `Successfully saved version ${newVersion} for plate ${plateId}`,
      };
    } catch (error) {
      console.error(`Error saving new version for plate ${plateId}:`, error);
      throw new Error(`Failed to save files: ${error.message}`);
    }
  }

  /**
   * Get file history for a plate
   */
  async getFileHistory(plateId) {
    try {
      const platePath = this.getPlatePath(plateId);

      if (!(await this.directoryExists(platePath))) {
        return [];
      }

      const entries = await fs.readdir(platePath);
      const versions = entries
        .filter((entry) => entry.startsWith("v") && entry.match(/^v\d+$/))
        .map((v) => parseInt(v.substring(1)))
        .sort((a, b) => b - a); // Newest first

      const history = [];
      for (const version of versions) {
        const versionPath = this.getVersionPath(plateId, version);
        const metadataPath = path.join(versionPath, "version.json");

        if (await this.fileExists(metadataPath)) {
          const metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
          const files = await fs.readdir(versionPath);

          history.push({
            version,
            ...metadata,
            files: files.filter((f) => f !== "version.json"),
            path: versionPath,
          });
        }
      }

      return history;
    } catch (error) {
      console.error(`Error getting file history for plate ${plateId}:`, error);
      return [];
    }
  }

  /**
   * Restore a specific version as current
   */
  async restoreVersion(plateId, version, operator) {
    try {
      const versionPath = this.getVersionPath(plateId, version);
      const currentPath = path.join(this.getPlatePath(plateId), "current");

      if (!(await this.directoryExists(versionPath))) {
        throw new Error(
          `Version ${version} does not exist for plate ${plateId}`
        );
      }

      // Backup current version first
      const currentFiles = await this.getCurrentFiles(plateId);
      if (currentFiles.version > 0) {
        const backupVersion = currentFiles.version + 0.1; // e.g., 5.1 for backup of v5
        const backupPath = path.join(
          this.getPlatePath(plateId),
          `v${backupVersion}-backup`
        );
        await fs.mkdir(backupPath, { recursive: true });

        const currentFilesInDir = await fs.readdir(currentPath);
        for (const file of currentFilesInDir) {
          await fs.copyFile(
            path.join(currentPath, file),
            path.join(backupPath, file)
          );
        }
      }

      // Clear current directory
      if (await this.directoryExists(currentPath)) {
        const currentFilesInDir = await fs.readdir(currentPath);
        for (const file of currentFilesInDir) {
          await fs.unlink(path.join(currentPath, file));
        }
      }

      // Copy version files to current
      const versionFiles = await fs.readdir(versionPath);
      for (const file of versionFiles) {
        if (file !== "version.json") {
          await fs.copyFile(
            path.join(versionPath, file),
            path.join(currentPath, file)
          );
        }
      }

      // Update current version info
      const currentVersionPath = path.join(currentPath, "version.json");
      await fs.writeFile(
        currentVersionPath,
        JSON.stringify(
          {
            version: version,
            restoredAt: new Date(),
            restoredBy: operator,
            restoredFrom: `v${version}`,
          },
          null,
          2
        )
      );

      return {
        success: true,
        message: `Successfully restored plate ${plateId} to version ${version}`,
        restoredBy: operator,
        restoredAt: new Date(),
      };
    } catch (error) {
      console.error(
        `Error restoring version ${version} for plate ${plateId}:`,
        error
      );
      throw new Error(`Failed to restore version: ${error.message}`);
    }
  }

  /**
   * Configure multer for file uploads
   */
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const tempPath = path.join(this.basePath, "temp");
        cb(null, tempPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${this.sanitizeFileName(
          file.originalname
        )}`;
        cb(null, uniqueName);
      },
    });

    const fileFilter = (req, file, cb) => {
      // Allow XT files, images, and drawing files
      const allowedExtensions = [
        ".xt",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".pdf",
        ".dwg",
        ".dxf",
      ];
      const extension = path.extname(file.originalname).toLowerCase();

      if (allowedExtensions.includes(extension)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${extension} not allowed`), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    });
  }

  /**
   * Utility functions
   */
  async directoryExists(dirPath) {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async fileExists(filePath) {
    try {
      const stat = await fs.stat(filePath);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  sanitizeFileName(filename) {
    return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  async calculateFileHash(filePath) {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash("md5").update(fileBuffer).digest("hex");
  }

  /**
   * Clean up old temp files
   */
  async cleanupTempFiles(olderThanHours = 24) {
    try {
      const tempPath = path.join(this.basePath, "temp");
      const files = await fs.readdir(tempPath);
      const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(tempPath, file);
        const stat = await fs.stat(filePath);

        if (stat.mtime.getTime() < cutoffTime) {
          await fs.unlink(filePath);
          console.log(`Cleaned up temp file: ${file}`);
        }
      }
    } catch (error) {
      console.error("Error cleaning up temp files:", error);
    }
  }
}

module.exports = FileService;
