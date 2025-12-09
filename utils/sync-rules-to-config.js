/**
 * Sync validation rules from rule files to company-config.json
 * Reads appliesTo metadata from each rule file and updates company-config.json
 */

const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(__dirname, '../..', 'BRK_CNC_JSONAnalyzer/rules');
const CONFIG_PATH = path.join(__dirname, '..', 'test-data/source_data/company-config.json');

// Map rule IDs to rule file names
const ID_TO_FILENAME = {
  'gundrill-60min': 'GunDrill60MinLimit.js',
  'auto-correct-contour': 'AutoCorrectionContour.js',
  'auto-correct-plane': 'AutoCorrectionPlane.js',
  'spindle-speed-limit': 'SpindleSpeedLimit.js',
  'm110-contour': 'M110Contour.js',
  'm110-helical': 'M110Helical.js',
  'reconditioned-tool': 'ReconditionedTool.js',
  'single-tool-in-nc': 'SingleToolInNC.js'
};

console.log('🔄 Syncing rules from rule files to company-config.json...');

// Read company config
const configData = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

// Get all rule files
const ruleFiles = fs.readdirSync(RULES_DIR).filter(f => f.endsWith('.js'));

console.log(`📁 Found ${ruleFiles.length} rule files`);

// Update each rule in config with appliesTo from rule file
configData.validationRules.forEach(rule => {
  // Find corresponding rule file using map
  const ruleFileName = ID_TO_FILENAME[rule.id];

  if (ruleFileName) {
    const ruleFilePath = path.join(RULES_DIR, ruleFileName);
    
    // Load the rule module
    delete require.cache[require.resolve(ruleFilePath)];
    const ruleFunction = require(ruleFilePath);
    
    if (ruleFunction.appliesTo) {
      console.log(`✓ ${rule.id}: machines=${ruleFunction.appliesTo.machines}, cycles=${ruleFunction.appliesTo.cycles}, tools=${ruleFunction.appliesTo.tools}`);
      rule.appliesTo = ruleFunction.appliesTo;
    } else {
      console.log(`⚠ ${rule.id}: No appliesTo metadata in ${ruleFileName}`);
    }
  } else {
    console.log(`⚠ ${rule.id}: No matching rule file found`);
  }
});

// Save updated config
fs.writeFileSync(CONFIG_PATH, JSON.stringify(configData, null, 2), 'utf8');
console.log('✅ company-config.json updated with appliesTo metadata from rule files');
