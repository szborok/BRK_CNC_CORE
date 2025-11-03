// src/api/plateRoutes.js
/**
 * REST API routes for plate management
 * Replaces all the UI interactions from the React app
 */

const express = require("express");
const PlateService = require("../services/PlateService");

function createPlateRoutes(storage, io) {
  const router = express.Router();
  const plateService = new PlateService(storage);

  // GET /api/plates - Get all plates with optional filtering
  router.get("/", async (req, res) => {
    try {
      const filters = {
        status: req.query.status,
        shelf: req.query.shelf,
        search: req.query.search,
        workName: req.query.workName,
      };

      const plates = await plateService.getAllPlates(filters);

      res.json({
        success: true,
        data: plates,
        count: plates.length,
        filters: filters,
      });
    } catch (error) {
      console.error("Get plates error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // GET /api/plates/analytics - Get dashboard analytics
  router.get("/analytics", async (req, res) => {
    try {
      const analytics = await plateService.getAnalytics();

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // GET /api/plates/:plateId - Get specific plate
  router.get("/:plateId", async (req, res) => {
    try {
      const plate = await plateService.getPlateById(req.params.plateId);

      res.json({
        success: true,
        data: plate,
      });
    } catch (error) {
      console.error(`Get plate ${req.params.plateId} error:`, error);

      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  });

  // POST /api/plates - Create new plate
  router.post("/", async (req, res) => {
    try {
      const { plateId, name, shelf, notes } = req.body;
      const operator = req.body.operator || "API";

      if (!plateId || !shelf) {
        return res.status(400).json({
          success: false,
          error: "plateId and shelf are required",
        });
      }

      const plateData = {
        plateId,
        name,
        shelf,
        notes,
      };

      const plate = await plateService.createPlate(plateData, operator);

      // Emit real-time event
      io?.emit("plate-created", {
        plateId: plate.plateId,
        operator: operator,
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        data: plate,
      });
    } catch (error) {
      console.error("Create plate error:", error);

      if (error.message.includes("already exists")) {
        res.status(409).json({
          success: false,
          error: error.message,
        });
      } else if (error.message.includes("Validation failed")) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  });

  // PUT /api/plates/:plateId - Update plate
  router.put("/:plateId", async (req, res) => {
    try {
      const { name, shelf, notes } = req.body;
      const operator = req.body.operator || "API";

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (shelf !== undefined) updateData.shelf = shelf;
      if (notes !== undefined) updateData.notes = notes;

      const plate = await plateService.updatePlate(
        req.params.plateId,
        updateData,
        operator
      );

      // Emit real-time event
      io?.emit("plate-updated", {
        plateId: plate.plateId,
        operator: operator,
        changes: Object.keys(updateData),
        timestamp: new Date(),
      });

      res.json({
        success: true,
        data: plate,
      });
    } catch (error) {
      console.error(`Update plate ${req.params.plateId} error:`, error);

      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  });

  // POST /api/plates/:plateId/work/start - Start work on plate
  router.post("/:plateId/work/start", async (req, res) => {
    try {
      const { workName, operator } = req.body;

      if (!workName || !operator) {
        return res.status(400).json({
          success: false,
          error: "workName and operator are required",
        });
      }

      const plate = await plateService.startWork(
        req.params.plateId,
        workName,
        operator
      );

      // Emit real-time event
      io?.emit("work-started", {
        plateId: plate.plateId,
        workName: workName,
        operator: operator,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        data: plate,
        message: `Work ${workName} started on plate ${plate.plateId}`,
      });
    } catch (error) {
      console.error(`Start work on plate ${req.params.plateId} error:`, error);

      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else if (
        error.message.includes("already in use") ||
        error.message.includes("locked")
      ) {
        res.status(409).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  });

  // POST /api/plates/:plateId/work/finish - Finish work on plate
  router.post("/:plateId/work/finish", async (req, res) => {
    try {
      const { operator, toolsUsed = [] } = req.body;

      if (!operator) {
        return res.status(400).json({
          success: false,
          error: "operator is required",
        });
      }

      // Get work name before finishing (for event)
      const currentPlate = await plateService.getPlateById(req.params.plateId);
      const workName = currentPlate.currentWork?.workName;

      const plate = await plateService.finishWork(
        req.params.plateId,
        operator,
        toolsUsed
      );

      // Emit real-time event
      io?.emit("work-finished", {
        plateId: plate.plateId,
        workName: workName,
        operator: operator,
        toolsUsed: toolsUsed.length,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        data: plate,
        message: `Work ${workName} finished on plate ${plate.plateId}`,
      });
    } catch (error) {
      console.error(`Finish work on plate ${req.params.plateId} error:`, error);

      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else if (error.message.includes("No active work")) {
        res.status(409).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  });

  // POST /api/plates/:plateId/lock - Lock plate
  router.post("/:plateId/lock", async (req, res) => {
    try {
      const { operator, reason = "" } = req.body;

      if (!operator) {
        return res.status(400).json({
          success: false,
          error: "operator is required",
        });
      }

      const plate = await plateService.lockPlate(
        req.params.plateId,
        operator,
        reason
      );

      // Emit real-time event
      io?.emit("plate-locked", {
        plateId: plate.plateId,
        operator: operator,
        reason: reason,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        data: plate,
        message: `Plate ${plate.plateId} locked`,
      });
    } catch (error) {
      console.error(`Lock plate ${req.params.plateId} error:`, error);

      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  });

  // POST /api/plates/:plateId/unlock - Unlock plate
  router.post("/:plateId/unlock", async (req, res) => {
    try {
      const { operator } = req.body;

      if (!operator) {
        return res.status(400).json({
          success: false,
          error: "operator is required",
        });
      }

      const plate = await plateService.unlockPlate(
        req.params.plateId,
        operator
      );

      // Emit real-time event
      io?.emit("plate-unlocked", {
        plateId: plate.plateId,
        operator: operator,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        data: plate,
        message: `Plate ${plate.plateId} unlocked`,
      });
    } catch (error) {
      console.error(`Unlock plate ${req.params.plateId} error:`, error);

      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else if (error.message.includes("not locked")) {
        res.status(409).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  });

  // DELETE /api/plates/:plateId - Delete plate
  router.delete("/:plateId", async (req, res) => {
    try {
      const operator = req.body.operator || req.query.operator || "API";

      const result = await plateService.deletePlate(
        req.params.plateId,
        operator
      );

      // Emit real-time event
      io?.emit("plate-deleted", {
        plateId: req.params.plateId,
        operator: operator,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        data: result,
        message: `Plate ${req.params.plateId} deleted`,
      });
    } catch (error) {
      console.error(`Delete plate ${req.params.plateId} error:`, error);

      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else if (error.message.includes("work in progress")) {
        res.status(409).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  });

  return router;
}

module.exports = createPlateRoutes;
