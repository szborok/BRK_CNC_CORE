#!/usr/bin/env node
/**
 * CNC Management Dashboard - Unified Startup Script
 * 
 * Starts all backends and dashboard. Backends always run normally.
 * Dashboard handles first-time setup vs restart automatically via localStorage.
 * 
 * Usage:
 *   node start-all.js           # Start everything
 *   node start-all.js --reset   # Clear localStorage and force setup wizard
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const IS_WINDOWS = process.platform === 'win32';

// Port assignments
const PORTS = {
  DASHBOARD: 3000,      // Vite dev server
  JSON_SCANNER: 3001,   // File search/collection service
  TOOL_MANAGER: 3002,
  CLAMPING_PLATE: 3003,
  JSON_ANALYZER: 3005   // Quality control analysis service
};

// Kill any existing processes on our ports
function killPortProcesses() {
  const ports = Object.values(PORTS);
  ports.forEach(port => {
    try {
      // Kill any process using this port
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore' });
      log(`🔪 Killed existing process on port ${port}`, 'yellow');
    } catch (e) {
      // Port was free, no process to kill
    }
  });
}

// Detect Node binary path (prefer nvm if available)
function getNodePath() {
  try {
    // Check for nvm
    const nvmDir = process.env.NVM_DIR || path.join(require('os').homedir(), '.nvm');
    const nvmSh = path.join(nvmDir, 'nvm.sh');
    
    if (fs.existsSync(nvmSh)) {
      // Source nvm and get node path
      const nodePath = execSync(
        `. "${nvmSh}" && nvm which default || which node`,
        { shell: '/bin/bash', encoding: 'utf8' }
      ).trim();
      if (nodePath && fs.existsSync(nodePath)) {
        return nodePath;
      }
    }
  } catch (e) {
    // Fall back to system node
  }
  return 'node';
}

const NODE_PATH = getNodePath();

// Terminal colors
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(msg, color = 'white') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

function logBox(title, color = 'cyan') {
  const line = '═'.repeat(62);
  console.log('');
  log(`╔${line}╗`, color);
  log(`║ ${title.padEnd(60)} ║`, color);
  log(`╚${line}╝`, color);
  console.log('');
}

// Track all running processes
const processes = [];

// Setup demo data - copy employees from source_data to Dashboard public folder
function setupDemoData() {
  try {
    const sourceFile = path.join(__dirname, 'test-data', 'source_data', 'employees.json');
    const publicFolder = path.join(__dirname, '..', 'BRK_CNC_Dashboard', 'public', 'test-data', 'source_data');
    const targetFile = path.join(publicFolder, 'employees.json');
    
    if (fs.existsSync(sourceFile)) {
      // Ensure public folder exists
      if (!fs.existsSync(publicFolder)) {
        fs.mkdirSync(publicFolder, { recursive: true });
      }
      
      // Copy employee data to public folder so it can be served
      fs.copyFileSync(sourceFile, targetFile);
      // Silent copy - no need to log
    }
  } catch (error) {
    log(`⚠️  Failed to copy demo data: ${error.message}`, 'yellow');
  }
}

function startProcess(name, cmd, args, cwd, color = 'white') {
  return new Promise((resolve, reject) => {
    // Don't log "Starting..." here - parent already logged "waiting for ready"
    
    // Create log file stream
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, `${name.replace(/\s+/g, '_')}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    logStream.write(`\n\n=== Started at ${new Date().toISOString()} ===\n`);
    
    const proc = spawn(cmd, args, {
      cwd,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let started = false;
    let startupError = '';

    // Capture stdout - SHOW ALL OUTPUT
    proc.stdout.on('data', (data) => {
      const output = data.toString();
      logStream.write(output); // Write raw output to log file
      
      output.split('\n').forEach(line => {
        if (line.trim()) {
          // Color-code log level tags in the message
          let coloredLine = line
            .replace(/\[ERROR\]/g, `${c.red}[ERROR]${c.reset}`)
            .replace(/\[WARN\]/g, `${c.yellow}[WARN]${c.reset}`)
            .replace(/\[WARNING\]/g, `${c.yellow}[WARNING]${c.reset}`)
            .replace(/\[INFO\]/g, `${c.cyan}[INFO]${c.reset}`)
            .replace(/\[DEBUG\]/g, `${c.dim}[DEBUG]${c.reset}`);
          
          console.log(`${c[color]}[${name}]${c.reset} ${coloredLine}`);
        }
      });

      // Detect successful startup (case-insensitive)
      const outputLower = output.toLowerCase();
      if (!started && (
        outputLower.includes('running on') ||
        outputLower.includes('server running') ||
        outputLower.includes('api server running') ||
        outputLower.includes('started successfully') ||
        outputLower.includes('local:') ||
        outputLower.includes('vite') && outputLower.includes('ready')
      )) {
        started = true;
        log(`✅ ${name} is ready`, 'green');
        resolve({ name, proc, color });
      }
    });

    // Capture stderr - SHOW ALL OUTPUT
    proc.stderr.on('data', (data) => {
      const output = data.toString();
      logStream.write(output); // Write raw output to log file
      
      output.split('\n').forEach(line => {
        if (line.trim()) {
          // Show all stderr, but highlight actual errors in red
          if (line.includes('Error') || line.includes('ERROR')) {
            console.log(`${c.red}[${name} ERROR]${c.reset} ${line}`);
            startupError += line + '\n';
          } else {
            console.log(`${c[color]}[${name}]${c.reset} ${line}`);
          }
        }
      });
    });

    // Handle process errors
    proc.on('error', (err) => {
      log(`❌ ${name} failed to start: ${err.message}`, 'red');
      if (!started) reject(new Error(`${name}: ${err.message}`));
    });

    proc.on('exit', (code) => {
      logStream.end();
      if (code !== 0 && !started) {
        const msg = startupError || `Exited with code ${code}`;
        log(`❌ ${name} startup failed: ${msg}`, 'red');
        reject(new Error(`${name}: ${msg}`));
      }
    });

    // Timeout fallback (15s per service)
    setTimeout(() => {
      if (!started) {
        log(`⚠️  ${name} timeout - assuming started`, 'yellow');
        resolve({ name, proc, color });
      }
    }, 15000);
  });
}

async function startBackends() {
  logBox('BACKEND SERVICES', 'cyan');
  
  try {
    // Note: __dirname is BRK_CNC_CORE, so services are at path.join(__dirname, '..', 'ServiceName')
    const root = path.join(__dirname, '..');
    
    // Dashboard Backend (port 3004) - Config API - MUST START FIRST
    log('⏳ Dashboard Backend...', 'cyan');
    const dashboardBackend = await startProcess(
      'Dashboard-Backend',
      NODE_PATH,
      ['server/index.cjs'],
      path.join(root, 'BRK_CNC_Dashboard'),
      'magenta'
    );
    processes.push(dashboardBackend);
    
    // JSONScanner (port 3001) - WAIT for it to be fully ready
    log('⏳ JSONScanner...', 'cyan');
    const jsonScanner = await startProcess(
      'JSONScanner',
      NODE_PATH,
      ['server/index.js'],
      path.join(root, 'BRK_CNC_JSONScanner'),
      'cyan'
    );
    processes.push(jsonScanner);
    
    // JSONAnalyzer (port 3005) - MUST be ready before Scanner triggers it
    log('⏳ JSONAnalyzer...', 'cyan');
    const jsonAnalyzer = await startProcess(
      'JSONAnalyzer',
      NODE_PATH,
      ['server/index.js'],
      path.join(root, 'BRK_CNC_JSONAnalyzer'),
      'white'
    );
    processes.push(jsonAnalyzer);
    
    // ToolManager (port 3002) - WAIT for full startup
    log('⏳ ToolManager...', 'cyan');
    const toolManager = await startProcess(
      'ToolManager',
      NODE_PATH,
      ['server/index.js'],
      path.join(root, 'BRK_CNC_ToolManager'),
      'magenta'
    );
    processes.push(toolManager);
    
    // ClampingPlateManager (port 3003) - Only initializes on FIRST run
    log('⏳ ClampingPlateManager...', 'cyan');
    const clampingPlate = await startProcess(
      'ClampingPlateManager',
      NODE_PATH,
      ['main.js', '--serve'],
      path.join(root, 'BRK_CNC_ClampingPlateManager'),
      'dim'
    );
    processes.push(clampingPlate);
    
    logBox('BACKENDS READY', 'green');
    log(`✅ JSONScanner:          http://localhost:${PORTS.JSON_SCANNER}/api/status`, 'green');
    log(`✅ JSONAnalyzer:         http://localhost:${PORTS.JSON_ANALYZER}/api/status`, 'green');
    log(`✅ ToolManager:          http://localhost:${PORTS.TOOL_MANAGER}/api/status`, 'green');
    log(`✅ ClampingPlateManager: http://localhost:${PORTS.CLAMPING_PLATE}/api/health`, 'green');
    console.log('');
    
  } catch (error) {
    throw new Error(`Backend startup failed: ${error.message}`);
  }
}

async function startDashboard() {
  logBox('DASHBOARD FRONTEND', 'cyan');
  
  const root = path.join(__dirname, '..');
  const dashboard = await startProcess(
    'Dashboard-UI',
    IS_WINDOWS ? 'npm.cmd' : 'npm',
    ['run', 'dev'],
    path.join(root, 'BRK_CNC_Dashboard'),
    'cyan'
  );
  processes.push(dashboard);
  
  return dashboard;
}

function cleanup() {
  console.log('');
  logBox('SHUTTING DOWN', 'yellow');
  
  processes.forEach(({ name, proc }) => {
    log(`🛑 Stopping ${name}...`, 'yellow');
    proc.kill();
  });
  
  log('✅ All services stopped', 'green');
  console.log('');
  process.exit(0);
}

async function main() {
  const startTime = Date.now();
  const resetMode = process.argv.includes('--reset');
  
  logBox('CNC MANAGEMENT DASHBOARD', 'bright');
  log(`📅 ${new Date().toLocaleString()}`, 'dim');
  
  // Kill any existing processes on our ports
  killPortProcesses();
  log(`💻 Platform: ${process.platform}`, 'dim');
  log(`⚙️  Node: ${process.version}`, 'dim');
  console.log('');
  
  // Show reset mode info and clean working data
  if (resetMode) {
    log('🔄 RESET MODE: Complete clean start', 'yellow');
    log('   • localStorage will be cleared in browser', 'yellow');
    log('   • Working data folder will be cleaned', 'yellow');
    console.log('');
    
    // Clean working data folder
    const workingDataPath = path.join(__dirname, 'test-data', 'working_data', 'BRK CNC Management Dashboard');
    if (fs.existsSync(workingDataPath)) {
      try {
        fs.rmSync(workingDataPath, { recursive: true, force: true });
        log('   ✅ Cleaned working data folder', 'green');
      } catch (e) {
        log(`   ⚠️  Could not clean working data: ${e.message}`, 'yellow');
      }
    }
    console.log('');
  }
  
  try {
    // Setup demo data (copy employee file to public folder)
    setupDemoData();
    
    // Start backends (they always run normally)
    await startBackends();
    
    // All backends are now ready - no additional wait needed
    log('✅ All backends fully initialized and ready', 'green');
    
    // Start dashboard (handles first-time vs restart automatically)
    await startDashboard();
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    logBox('🎉 SYSTEM READY', 'green');
    log(`⏱️  Started in ${elapsed}s`, 'green');
    console.log('');
    
    const dashboardUrl = resetMode 
      ? `http://localhost:${PORTS.DASHBOARD}/?reset=true` 
      : `http://localhost:${PORTS.DASHBOARD}`;
    
    log(`🌐 Dashboard:  ${dashboardUrl}`, 'bright');
    if (resetMode) {
      log('   (will clear localStorage and show setup wizard)', 'dim');
      
      // Auto-open browser in reset mode
      try {
        const openCmd = IS_WINDOWS ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
        execSync(`${openCmd} "${dashboardUrl}"`, { stdio: 'ignore' });
        log('   ✅ Browser opened automatically', 'dim');
      } catch (e) {
        log('   ⚠️  Could not auto-open browser', 'dim');
      }
    }
    console.log('');
    
    log('📋 HOW IT WORKS:', 'cyan');
    log('', 'dim');
    log('   FIRST TIME (no setup config file):', 'yellow');
    log('   → All backends start in IDLE mode', 'dim');
    log('   → Dashboard shows setup wizard', 'dim');
    log('   → Complete wizard → configures backends automatically', 'dim');
    log('   → Config saved to localStorage → shows login page', 'dim');
    log('', 'dim');
    log('   RESTART (setup config exists):', 'yellow');
    log('   → Backends start in IDLE mode', 'dim');
    log('   → Dashboard detects existing config', 'dim');
    log('   → Automatically configures backends → shows login page', 'dim');
    log('   → No wizard needed - direct to login', 'dim');
    console.log('');
    
    // Start AutoRun processor if enabled and config exists
    const configPath = path.join(__dirname, 'unified.config.json');
    if (fs.existsSync(configPath)) {
      const AutoRunProcessor = require('./AutoRunProcessor');
      const config = require('./unified.config.json');
      
      if (config.features?.autoScan?.enabled) {
        log('🤖 Starting AutoRun processor...', 'cyan');
        const autoRun = new AutoRunProcessor({
          watchIntervalMs: (config.features.autoScan.interval || 60) * 1000,
          sourcePath: path.join(__dirname, 'test-data', 'source_data', 'json_files')
        });
        autoRun.start();
        console.log('');
      }
      
      log('🔄 AUTOMATION:', 'cyan');
      if (config.features?.autoScan?.enabled) {
        log('   • AutoRun watches source folder every 60s', 'dim');
        log('   • Triggers: JSONScanner → JSONAnalyzer → ToolManager', 'dim');
        log('   • All services run in MANUAL mode (no auto-scan)', 'dim');
      } else {
        log('   • AutoRun disabled - all services manual trigger only', 'dim');
      }
    } else {
      log('🔄 AUTOMATION:', 'cyan');
      log('   • AutoRun disabled - awaiting first-time setup', 'dim');
    }
    log('   • ClampingPlateManager: Web service only', 'dim');
    console.log('');
    
    log('⚠️  To shutdown: Press Ctrl+C', 'yellow');
    console.log('');
    
    // Setup graceful shutdown with Ctrl+C
    process.on('SIGINT', () => {
      log('\n⚠️  Shutting down gracefully...', 'yellow');
      cleanup();
    });
    
    process.on('SIGTERM', () => {
      log('\n⚠️  Received SIGTERM, shutting down...', 'yellow');
      cleanup();
    });
    
    // Also keep standard SIGTERM handler for external signals
    process.on('SIGTERM', cleanup);
    
    // Keep alive
    await new Promise(() => {});
    
  } catch (error) {
    console.log('');
    log(`❌ STARTUP FAILED: ${error.message}`, 'red');
    console.log('');
    log('Cleaning up...', 'yellow');
    cleanup();
    process.exit(1);
  }
}

// Run
main().catch(err => {
  log(`❌ Fatal error: ${err.message}`, 'red');
  process.exit(1);
});
