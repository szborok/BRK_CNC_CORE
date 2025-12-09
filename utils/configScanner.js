/**
 * Config File Scanner
 * Searches common locations for brk-cnc-system.config.json
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_FILENAME = 'BRK_SETUP_WIZARD_CONFIG.json';

/**
 * Get the canonical config path
 * Always stores in BRK_CNC_CORE/config directory
 */
function getConfigPath() {
  return path.join(__dirname, '..', 'config', CONFIG_FILENAME);
}

/**
 * Find config file - always check BRK_CNC_CORE/config first
 * @returns {string|null} Path to config file or null if not found
 */
function findConfigFile() {
  const configPath = getConfigPath();
  return fs.existsSync(configPath) ? configPath : null;
}

/**
 * Load configuration from file
 * @returns {Object|null} Parsed config or null if not found/invalid
 */
function loadConfig() {
  const configPath = findConfigFile();
  
  if (!configPath) {
    return { success: false, error: 'Config file not found', configPath: null, config: null };
  }
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    if (!config.isConfigured) {
      return { 
        success: false, 
        error: 'Setup not completed', 
        configPath, 
        config: null 
      };
    }
    
    return { success: true, configPath, config, error: null };
  } catch (error) {
    const err = /** @type {Error} */ (error);
    return { 
      success: false, 
      error: `Failed to parse config: ${err.message}`, 
      configPath, 
      config: null 
    };
  }
}

/**
 * Save config to filesystem
 * Always saves to BRK_CNC_CORE/config directory
 * @param {Object} config - Configuration object
 * @returns {Object} Result with success, configPath, error
 */
function saveConfig(config) {
  try {
    const configPath = getConfigPath();
    
    // Ensure directory exists
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return { success: true, configPath, error: null };
  } catch (error) {
    const err = /** @type {Error} */ (error);
    return { 
      success: false, 
      configPath: getConfigPath(), 
      error: `Failed to save config: ${err.message}` 
    };
  }
}

module.exports = {
  CONFIG_FILENAME,
  getConfigPath,
  findConfigFile,
  loadConfig,
  saveConfig
};
