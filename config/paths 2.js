/**
 * Path Configuration - User-configurable paths for data sources and outputs
 * This is what users interact with in the setup wizard
 */

const path = require('path');

module.exports = {
  // Test mode paths (development/testing)
  test: {
    sourceData: path.join(__dirname, '..', 'test-data', 'source_data'),
    jsonFiles: path.join(__dirname, '..', 'test-data', 'source_data', 'json_files'),
    workingData: path.join(__dirname, '..', 'test-data', 'working_data'),
    employees: path.join(__dirname, '..', 'test-data', 'source_data', 'employees.json'),
  },

  // Production mode paths (configured by user)
  production: {
    // Windows production path
    windowsDefault: 'C:\\Production\\CNC_Data',
    
    // User will configure these via setup wizard
    sourceData: null, // e.g., 'C:\\Production\\CNC_Data'
    jsonFiles: null,  // e.g., 'C:\\Production\\CNC_Data\\json_files'
    workingData: null, // e.g., 'C:\\Production\\CNC_Data\\working_data'
    employees: null,   // e.g., 'C:\\Production\\employees.json'
  },

  // Working folder structure (relative to base working path)
  workingStructure: {
    baseName: 'BRK CNC Management Dashboard',
    jsonScanner: 'JSONScanner',
    jsonAnalyzer: 'JSONAnalyzer',
    toolManager: 'ToolManager',
    clampingPlateManager: 'ClampingPlateManager',
    results: 'results',
    inputs: 'inputs',
  },

  /**
   * Get paths based on mode
   * @param {boolean} testMode - Whether in test mode
   * @param {Object} userConfig - User-configured paths from wizard
   * @returns {Object} Resolved paths
   */
  getPaths(testMode = true, userConfig = {}) {
    if (testMode) {
      return this.test;
    }

    // In production, use user-configured paths or defaults
    return {
      sourceData: userConfig.sourceData || this.production.windowsDefault,
      jsonFiles: userConfig.jsonFiles || path.join(userConfig.sourceData || this.production.windowsDefault, 'json_files'),
      workingData: userConfig.workingData || path.join(userConfig.sourceData || this.production.windowsDefault, 'working_data'),
      employees: userConfig.employees || path.join(userConfig.sourceData || this.production.windowsDefault, 'employees.json'),
    };
  },

  /**
   * Get service working directory
   * @param {string} basePath - Base working data path
   * @param {string} serviceName - Service name (jsonScanner, toolManager, etc.)
   * @returns {string} Service working directory path
   */
  getServiceWorkingDir(basePath, serviceName) {
    return path.join(basePath, this.workingStructure.baseName, this.workingStructure[serviceName]);
  },
};
