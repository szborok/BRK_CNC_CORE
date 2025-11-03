const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const FileService = require("../services/FileService");

const router = express.Router();
const fileService = new FileService();
const upload = fileService.getMulterConfig();

/**
 * Download current files for a plate when starting work
 * GET /api/files/:plateId/current
 */
router.get("/:plateId/current", async (req, res) => {
  try {
    const { plateId } = req.params;
    const currentFiles = await fileService.getCurrentFiles(plateId);

    if (
      !currentFiles.xtFile &&
      !currentFiles.previewImage &&
      currentFiles.drawings.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: `No files found for plate ${plateId}`,
        files: currentFiles,
      });
    }

    res.json({
      success: true,
      message: `Current files for plate ${plateId}`,
      files: {
        xtFile: currentFiles.xtFile
          ? {
              path: currentFiles.xtFile,
              downloadUrl: `/api/files/${plateId}/download/current/${path.basename(
                currentFiles.xtFile
              )}`,
            }
          : null,
        previewImage: currentFiles.previewImage
          ? {
              path: currentFiles.previewImage,
              downloadUrl: `/api/files/${plateId}/download/current/${path.basename(
                currentFiles.previewImage
              )}`,
            }
          : null,
        drawings: currentFiles.drawings.map((drawing) => ({
          path: drawing,
          downloadUrl: `/api/files/${plateId}/download/current/${path.basename(
            drawing
          )}`,
        })),
        version: currentFiles.version,
      },
    });
  } catch (error) {
    console.error(
      `Error getting current files for plate ${req.params.plateId}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to get current files",
      error: error.message,
    });
  }
});

/**
 * Download a specific file
 * GET /api/files/:plateId/download/current/:filename
 * GET /api/files/:plateId/download/v:version/:filename
 */
router.get("/:plateId/download/:type/:filename", async (req, res) => {
  try {
    const { plateId, type, filename } = req.params;
    let filePath;

    if (type === "current") {
      const currentFiles = await fileService.getCurrentFiles(plateId);
      filePath = path.join(currentFiles.currentPath, filename);
    } else if (type.startsWith("v")) {
      const version = type.substring(1); // Remove 'v' prefix
      filePath = path.join(
        fileService.getVersionPath(plateId, version),
        filename
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid download type. Use "current" or "v{version}"',
      });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Set appropriate headers
    const extension = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";

    if (extension === ".xt") contentType = "application/octet-stream";
    else if ([".jpg", ".jpeg"].includes(extension)) contentType = "image/jpeg";
    else if (extension === ".png") contentType = "image/png";
    else if (extension === ".gif") contentType = "image/gif";
    else if (extension === ".pdf") contentType = "application/pdf";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Stream the file
    const fileStream = require("fs").createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(`Error downloading file:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to download file",
      error: error.message,
    });
  }
});

/**
 * Upload files when work is completed
 * POST /api/files/:plateId/upload
 */
router.post("/:plateId/upload", upload.array("files", 10), async (req, res) => {
  try {
    const { plateId } = req.params;
    const { workName, operator } = req.body;

    if (!workName || !operator) {
      return res.status(400).json({
        success: false,
        message: "workName and operator are required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    // Validate file types
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
    for (const file of req.files) {
      const extension = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        return res.status(400).json({
          success: false,
          message: `File type ${extension} not allowed`,
        });
      }
    }

    const workSession = {
      workName,
      operator,
      plateId,
    };

    const result = await fileService.saveNewVersion(
      plateId,
      req.files,
      workSession
    );

    res.json({
      success: true,
      message: result.message,
      version: result.version,
      files: {
        xtFile: result.files.xtFile,
        previewImage: result.files.previewImage,
        drawings: result.files.drawings,
        uploadedFiles: req.files.map((f) => f.originalname),
      },
      metadata: result.files.metadata,
    });
  } catch (error) {
    console.error(
      `Error uploading files for plate ${req.params.plateId}:`,
      error
    );

    // Clean up uploaded files in case of error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          console.error("Error cleaning up file:", cleanupError);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload files",
      error: error.message,
    });
  }
});

/**
 * Get file history for a plate
 * GET /api/files/:plateId/history
 */
router.get("/:plateId/history", async (req, res) => {
  try {
    const { plateId } = req.params;
    const history = await fileService.getFileHistory(plateId);

    res.json({
      success: true,
      plateId,
      versions: history.length,
      history,
    });
  } catch (error) {
    console.error(
      `Error getting file history for plate ${req.params.plateId}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to get file history",
      error: error.message,
    });
  }
});

/**
 * Restore a specific version
 * POST /api/files/:plateId/restore/:version
 */
router.post("/:plateId/restore/:version", async (req, res) => {
  try {
    const { plateId, version } = req.params;
    const { operator } = req.body;

    if (!operator) {
      return res.status(400).json({
        success: false,
        message: "operator is required",
      });
    }

    const result = await fileService.restoreVersion(
      plateId,
      parseInt(version),
      operator
    );

    res.json({
      success: true,
      message: result.message,
      plateId,
      restoredVersion: version,
      restoredBy: result.restoredBy,
      restoredAt: result.restoredAt,
    });
  } catch (error) {
    console.error(
      `Error restoring version ${req.params.version} for plate ${req.params.plateId}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to restore version",
      error: error.message,
    });
  }
});

/**
 * Get file preview (for images)
 * GET /api/files/:plateId/preview/:type/:filename
 */
router.get("/:plateId/preview/:type/:filename", async (req, res) => {
  try {
    const { plateId, type, filename } = req.params;
    let filePath;

    if (type === "current") {
      const currentFiles = await fileService.getCurrentFiles(plateId);
      filePath = path.join(currentFiles.currentPath, filename);
    } else if (type.startsWith("v")) {
      const version = type.substring(1);
      filePath = path.join(
        fileService.getVersionPath(plateId, version),
        filename
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid preview type",
      });
    }

    // Check if file exists and is an image
    const extension = path.extname(filename).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".gif"].includes(extension)) {
      return res.status(400).json({
        success: false,
        message: "File is not a previewable image",
      });
    }

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "Preview image not found",
      });
    }

    // Set appropriate headers for image preview
    let contentType = "image/jpeg";
    if (extension === ".png") contentType = "image/png";
    else if (extension === ".gif") contentType = "image/gif";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour cache

    // Stream the image
    const fileStream = require("fs").createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(`Error previewing file:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to preview file",
      error: error.message,
    });
  }
});

/**
 * Delete a specific version (admin only)
 * DELETE /api/files/:plateId/version/:version
 */
router.delete("/:plateId/version/:version", async (req, res) => {
  try {
    const { plateId, version } = req.params;
    const { operator } = req.body;

    if (!operator) {
      return res.status(400).json({
        success: false,
        message: "operator is required",
      });
    }

    const versionPath = fileService.getVersionPath(plateId, version);

    // Check if version exists
    if (!(await fileService.directoryExists(versionPath))) {
      return res.status(404).json({
        success: false,
        message: `Version ${version} does not exist for plate ${plateId}`,
      });
    }

    // Don't allow deleting current version
    const currentFiles = await fileService.getCurrentFiles(plateId);
    if (currentFiles.version === parseInt(version)) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete current version. Restore a different version first.",
      });
    }

    // Remove the version directory
    await fs.rmdir(versionPath, { recursive: true });

    res.json({
      success: true,
      message: `Version ${version} deleted for plate ${plateId}`,
      deletedBy: operator,
      deletedAt: new Date(),
    });
  } catch (error) {
    console.error(
      `Error deleting version ${req.params.version} for plate ${req.params.plateId}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to delete version",
      error: error.message,
    });
  }
});

module.exports = router;
