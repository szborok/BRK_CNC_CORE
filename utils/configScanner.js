/**
 * Config File Scanner
 * Searches common locations for brk-cnc-system.config.json
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_FILENAME = 'brk-cnc-system.config.json';

/**
 * Search locations (in priority order)
 */
function getSearchPaths() {
  const homeDir = os.homedir();
  const platform = process.platform;
  
  const paths = [
    // 1. Current working directory
    process.cwd(),
    
    // 2. Parent directory (BRK_CNC_CORE level)
    path.join(process.cwd(), '..'),
    path.join(process.cwd(), '..', 'BRK_CNC_CORE'),
    
    // 3. User's home directory
    homeDir,
    
    // 4. User's Documents
    path.join(homeDir, 'Documents'),
    path.join(homeDir, 'Documents', 'BRK CNC System'),
  ];
  
  // Platform-specific paths
  if (platform === 'win32') {
    // Windows
    paths.push(
      path.join(process.env.APPDATA || '', 'BRK_CNC_System'),
      path.join(process.env.LOCALAPPDATA || '', 'BRK_CNC_System'),
      path.join(process.env.ProgramData || 'C:\\ProgramData', 'BRK_CNC_System'),
      'C:\\Program Files\\BRK CNC System',
      'C:\\Program Files (x86)\\BRK CNC System'
    );
  } else if (platform === 'darwin') {
    // macOS
    paths.push(
      path.join(homeDir, 'Library', 'Application Support', 'BRK_CNC_System'),
      path.join(homeDir, 'Library', 'Mobile Documents', 'com~apple~CloudDocs'),
      path.join(homeDir, 'Library', 'Mobile Documents', 'com~apple~CloudDocs', 'Documents'),
      '/Applications/BRK CNC System',
      '/Library/Application Support/BRK_CNC_System'
    );
  } else {
    // Linux/Unix
    paths.push(
      path.join(homeDir, '.config', 'brk-cnc-system'),
      path.join(homeDir, '.local', 'share', 'brk-cnc-system'),
      '/etc/brk-cnc-system',
      '/opt/brk-cnc-system',
      '/usr/local/share/brk-cnc-system'
    );
  }
  
  // Filter out non-existent base paths (but keep them for potential creation)
  return paths;
}

/**
 * Find config file by searching common locations
 * @returns {string|null} Path to config file or null if not found
 */
function findConfigFile() {
  const searchPaths = getSearchPaths();
  
  for (const searchPath of searchPaths) {
    const configPath = path.join(searchPath, CONFIG_FILENAME);
    
    if (fs.existsSync(configPath)) {
      console.log(`✅ Found config at: ${configPath}`);
      return configPath;
    }
  }
  
  console.warn(`⚠️ Config file not found in ${searchPaths.length} locations`);
  return null;
}

/**
 * Load configuration from file
 * @returns {Object|null} Parsed config or null if not found/invalid
 */
function loadConfig() {
  const configPath = findConfigFile();
  
  if (!configPath) {
    return null;
  }
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    if (!config.isConfigured) {
      console.warn('⚠️ Config file exists but setup not completed');
      return null;
    }
    
    console.log(`✅ Loaded config for: ${config.company?.name || 'Unknown Company'}`);
    return config;
  } catch (error) {
    const err = /** @type {Error} */ (error);
    console.error(`❌ Failed to load config: ${err.message}`);
    return null;
  }
}

/**
 * Save config to filesystem
 * @param {Object} config - Configuration object
 * @param {string} [targetPath] - Optional target path (defaults to first search path)
 * @returns {boolean} Success
 */
function saveConfig(config, targetPath) {
  try {
    const configPath = targetPath || path.join(getSearchPaths()[0], CONFIG_FILENAME);
    
    // Ensure directory exists
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`✅ Config saved to: ${configPath}`);
    return true;
  } catch (error) {
    const err = /** @type {Error} */ (error);
    console.error(`❌ Failed to save config: ${err.message}`);
    return false;
  }
}

module.exports = {
  CONFIG_FILENAME,
  findConfigFile,
  loadConfig,
  saveConfig,
  getSearchPaths
};
