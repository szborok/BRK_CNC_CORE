/**
 * Rule Configuration - Defines which rules run under what conditions
 * Used by JSONAnalyzer to determine rule execution
 */

module.exports = {
  rules: {
    GunDrill60MinLimit: {
      description: "Gundrill tools should not exceed 60 minutes per NC file",
      failureType: "ncfile",
      enabled: true,
      logic: (project) => {
        // Always run for all projects
        return true;
      },
    },

    SingleToolInNC: {
      description: "Each NC file should use only one tool",
      failureType: "ncfile",
      enabled: true,
      logic: (project) => {
        // Always run except for AutoCorrection compound jobs
        return true; // Rule will internally skip AutoCorrection jobs
      },
    },

    M110Helical: {
      description: "M110 command required for helical drilling operations",
      failureType: "ncfile",
      enabled: true,
      logic: (project) => {
        // Run if project uses endmill finish, xfeed, or tgt tools with helical drilling
        return (
          (project.hasToolCategory("endmill_finish") ||
            project.hasToolCategory("xfeed") ||
            project.hasToolCategory("tgt")) &&
          project.hasOperationType("helical drilling")
        );
      },
    },

    M110Contour: {
      description: "M110 contour operations must have RL compensation",
      failureType: "ncfile",
      enabled: true,
      logic: (project) => {
        // Run if project has 2D contour operations
        return (
          project.hasOperationType("2d contour") ||
          project.hasOperationType("contour milling")
        );
      },
    },

    ReconditionedTool: {
      description: "Validate reconditioned tool usage",
      failureType: "tool",
      enabled: true,
      logic: (project) => {
        // Only run on specific machines that don't allow reconditioned tools
        const toolDefs = require('./tool-definitions');
        const restrictedMachines = toolDefs.machineRestrictions.noReconditionedTools;
        return restrictedMachines.some(machine => 
          project.machine?.toLowerCase().includes(machine.toLowerCase())
        );
      },
    },

    AutoCorrectionPlane: {
      description: "AutoCorrection plane operations validation",
      failureType: "operation",
      enabled: true,
      logic: (project) => {
        // Run only for plane grinding AutoCorrection projects
        // Check compoundJobs for plane autocorrection operations
        for (const [fileName, compoundJob] of project.compoundJobs) {
          for (const job of compoundJob.jobs) {
            const type = (job.featureName || job.type || '').toLowerCase();
            if (type.includes("plane") && type.includes("autocorrection")) {
              return true;
            }
          }
        }
        return false;
      },
    },

    AutoCorrectionContour: {
      description: "AutoCorrection contour operations validation",
      failureType: "operation",
      enabled: true,
      logic: (project) => {
        // Run only for contour AutoCorrection projects
        // Check compoundJobs for contour autocorrection operations
        for (const [fileName, compoundJob] of project.compoundJobs) {
          for (const job of compoundJob.jobs) {
            const type = (job.featureName || job.type || '').toLowerCase();
            if (type.includes("contour") && type.includes("autocorrection")) {
              return true;
            }
          }
        }
        return false;
      },
    },
  },
};
