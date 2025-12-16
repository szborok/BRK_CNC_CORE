/**
 * Tool Definitions - Central tool category definitions
 * Used by all services for tool identification and validation
 */

module.exports = {
  toolCategories: {
    gundrill: [
      "GUH-1865",
      "GUH-3032",
      "GUH-3033",
      "GUH-3035",
      "GUH-5639",
      "GUH-5640",
      "GUH-5641",
      "GUH-5688",
      "GUH-5691",
      "GUH-49298",
      "TUN-AF",
      "TOO-AF",
    ],
    endmill_finish: [
      "FRA-P15250", 
      "FRA-P15251", 
      "FRA-P15254", 
      "FRA-P8521"
    ],
    endmill_roughing: [
      "GUH-6736", 
      "GUH-6961", 
      "FRA-P8420"
    ],
    jjtools: ["JJ"],
    tgt: ["TGT"],
    xfeed: [
      "FRA-X7600", 
      "FRA-X7604", 
      "FRA-X7620", 
      "FRA-X7624"
    ],
    cleaning: ["G12R6-tisztito_H63Z12L120X"],
    touchprobe: [
      "DMG-TAP75_H63-Renishaw-taszter-HSC75",
      "DMG-TAP85_H63TASZTER-DMU85",
      "DMG-TAP100P_H63TASZTER-DMU100P",
      "DMG-TAP100P4_H63-Renishaw-taszter-DMU100P4",
    ],
  },

  // Machine-specific restrictions
  machineRestrictions: {
    noReconditionedTools: [
      "DMU 100P duoblock Minus",
      "DMU 85 monoblock MINUS",
    ],
  },

  // Tool validation rules
  validation: {
    gundrillMaxMinutesPerNC: 60, // Max minutes per NC file for gundrill operations
  },
};
