/**
 * Central Configuration System
 * All services load config from here - single source of truth
 */

const path = require('path');
const { loadConfig: loadUserConfig } = require('../utils/configScanner');
const toolDefinitions = require('./tool-definitions');
const ruleConfig = require('./rule-config');
const pathsConfig = require('./paths');

/**
 * Get configuration for a specific service
 * @param {string} serviceName - Service name (jsonScanner, toolManager, jsonAnalyzer, clampingPlateManager)
 * @param {Object} options - Override options
 * @returns {Object} Service-specific configuration
 */
function getServiceConfig(serviceName, options = {}) {
  // Load user config from setup wizard
  const userConfigResult = loadUserConfig();
  const userConfig = userConfigResult.success ? userConfigResult.config : null;
  
  // Environment: which data paths to use
  // 'test' = Use test-data folder for development/testing
  // 'production' = Use real production paths (C:\Production\...)
  const environment = options.environment ?? (userConfig?.setupWizardDemoMode ?? true ? 'test' : 'production');
  
  // Service execution mode:
  // 'auto' = Run continuously on timer (JSONScanner only)
  // 'trigger' = Wait for API triggers (JSONAnalyzer, ToolManager, ClampingPlateManager)
  // 'manual' = Requires explicit manual execution via API
  let mode;
  if (serviceName === 'jsonScanner') {
    // JSONScanner can be auto or manual (from user config)
    const userAutoMode = userConfig?.modules?.[serviceName]?.autoMode ?? false;
    mode = options.mode ?? (userAutoMode ? 'auto' : 'manual');
  } else {
    // All other services are trigger-only
    mode = 'trigger';
  }
  
  // Get paths based on environment
  const paths = pathsConfig.getPaths(environment === 'test', userConfig?.storage || {});
  
  // Base configuration (common to all services)
  const baseConfig = {
    app: {
      // Configuration flags:
      // environment: 'test' (test-data) or 'production' (real paths)
      // mode: 'auto' (timer), 'trigger' (wait for calls), or 'manual' (explicit API calls)
      // setupWizardDemoMode: Customer hasn't configured production setup yet (from setup wizard)
      environment,
      mode,
      setupWizardDemoMode: userConfig?.setupWizardDemoMode ?? false,
      logLevel: userConfig?.advanced?.logLevel || 'info',
      enableDetailedLogging: environment === 'test', // Verbose in test, quiet in production
      usePersistentTempFolder: true,
      tempBaseName: pathsConfig.workingStructure.baseName,
      userDefinedWorkingFolder: paths.workingData,
    },

    paths: {
      sourceData: paths.sourceData,
      jsonFiles: paths.jsonFiles,
      workingData: paths.workingData,
      employees: paths.employees,
      serviceWorkingDir: pathsConfig.getServiceWorkingDir(paths.workingData, serviceName),
    },

    storage: {
      type: 'auto', // 'auto', 'local', 'mongodb'
      retentionPolicy: {
        backupDays: 7,
        cleanupOldData: true,
      },
    },

    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      database: `cnc_${serviceName}`,
      options: {
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      },
    },

    // Tool definitions (shared across all services)
    toolCategories: toolDefinitions.toolCategories,
    machineRestrictions: toolDefinitions.machineRestrictions,
    toolValidation: toolDefinitions.validation,
  };

  // Service-specific configurations
  const serviceConfigs = {
    jsonScanner: {
      ...baseConfig,
      webApp: {
        port: 3001,
        enableCors: true,
        allowedOrigins: ['http://localhost:3000', 'http://localhost:5173'],
      },
      processing: {
        scanIntervalMs: 60000, // Check every 1 minute in auto mode
        forceReprocess: true,
        enableProgressReporting: true,
        progressReportInterval: 10,
      },
      files: {
        jsonExtension: '.json',
        fixedSuffix: 'fixed',
        resultSuffix: 'result',
        essentialExtensions: ['.json', '.nc', '.h', '.tls'],
        skipExtensions: ['.gif', '.png', '.jpg', '.html', '.stl', '.vcproject'],
      },
      // Expose rules for Scanner/Analyzer compatibility
      rules: ruleConfig.rules,
    },

    jsonAnalyzer: {
      ...baseConfig,
      webApp: {
        port: 3005,
        enableCors: true,
        allowedOrigins: ['http://localhost:3000', 'http://localhost:5173'],
      },
      // Flatten rules to match old config structure (config.rules.RuleName)
      rules: ruleConfig.rules,
      processing: {
        scanIntervalMs: 60000, // Check every 1 minute in auto mode
        enableRuleValidation: true,
      },
      files: {
        jsonExtension: '.json',
        fixedSuffix: 'fixed',
        resultSuffix: 'result',
      },
    },

    toolManager: {
      ...baseConfig,
      webApp: {
        port: 3002,
        enableCors: true,
        allowedOrigins: ['http://localhost:3000', 'http://localhost:5173'],
      },
      processing: {
        scanIntervalMs: 60000, // Check every 1 minute in auto mode
        preventReprocessing: true,
        enableToolValidation: true,
      },
      toolImagePath: path.join(__dirname, '..', 'assets', 'tool_images_new', 'FRA'),
    },

    clampingPlateManager: {
      ...baseConfig,
      webApp: {
        port: 3003,
        enableCors: true,
        allowedOrigins: ['http://localhost:3000', 'http://localhost:5173'],
      },
      storage: {
        type: 'local', // Force local storage only
        local: {
          dataDirectory: path.join(__dirname, '..', '..', 'BRK_CNC_ClampingPlateManager', 'data'),
        },
      },
    },
  };

  const config = serviceConfigs[serviceName];
  if (!config) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  return config;
}

module.exports = {
  getServiceConfig,
  toolDefinitions,
  ruleConfig,
  pathsConfig,
};
