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
  JSON_SCANNER: 3001,
  TOOL_MANAGER: 3002,
  CLAMPING_PLATE: 3003
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

function startProcess(name, cmd, args, cwd, color = 'white') {
  return new Promise((resolve, reject) => {
    log(`🚀 Starting ${name}...`, 'cyan');
    
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
      output.split('\n').forEach(line => {
        if (line.trim()) {
          console.log(`${c[color]}[${name}]${c.reset} ${line}`);
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
    
    // Dashboard Backend (port 3000) - Config API
    const dashboardBackend = await startProcess(
      'Dashboard-Backend',
      NODE_PATH,
      ['server/index.cjs'],
      path.join(root, 'BRK_CNC_Dashboard'),
      'magenta'
    );
    processes.push(dashboardBackend);
    await new Promise(r => setTimeout(r, 1500));
    
    // JSONScanner (port 3001) - Start API server only (idle until configured by Dashboard)
    const jsonScanner = await startProcess(
      'JSONScanner',
      NODE_PATH,
      ['server/index.js'],
      path.join(root, 'BRK_CNC_JSONScanner'),
      'green'
    );
    processes.push(jsonScanner);
    await new Promise(r => setTimeout(r, 1500));
    
    // ToolManager (port 3002) - Start API server only (idle until configured by Dashboard)
    const toolManager = await startProcess(
      'ToolManager',
      NODE_PATH,
      ['server/index.js'],
      path.join(root, 'BRK_CNC_ToolManager'),
      'yellow'
    );
    processes.push(toolManager);
    await new Promise(r => setTimeout(r, 1500));
    
    // ClampingPlateManager (port 3003) - Start API server only
    const clampingPlate = await startProcess(
      'ClampingPlateManager',
      NODE_PATH,
      ['main.js', '--serve'],
      path.join(root, 'BRK_CNC_ClampingPlateManager'),
      'blue'
    );
    processes.push(clampingPlate);
    await new Promise(r => setTimeout(r, 1500));
    
    logBox('BACKENDS READY', 'green');
    log(`✅ JSONScanner:          http://localhost:${PORTS.JSON_SCANNER}/api/status`, 'green');
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
    // Start backends (they always run normally)
    await startBackends();
    
    // Wait for backends to initialize
    log('⏳ Waiting for backend initialization (5s)...', 'cyan');
    await new Promise(r => setTimeout(r, 5000));
    
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
    
    log('🔄 BACKEND AUTO-PROCESSING:', 'cyan');
    log('   • JSONScanner: Scans every 60s for new CNC JSON files', 'dim');
    log('   • ToolManager: Processes Excel files every 60s', 'dim');
    log('   • ClampingPlateManager: Web service (plates.json)', 'dim');
    console.log('');
    
    log('⚠️  To shutdown: Press Ctrl+Shift+Q three times', 'yellow');
    console.log('');
    
    // Setup graceful shutdown with triple Ctrl+Shift+Q
    let shutdownKeyPressCount = 0;
    let shutdownTimeout = null;
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (key) => {
      // Ctrl+Shift+Q = byte 17 (0x11)
      if (key[0] === 17) {
        shutdownKeyPressCount++;
        
        if (shutdownTimeout) clearTimeout(shutdownTimeout);
        
        if (shutdownKeyPressCount === 1) {
          log('⚠️  Shutdown initiated (press 2 more times to confirm)', 'yellow');
        } else if (shutdownKeyPressCount === 2) {
          log('⚠️  Press one more time to confirm shutdown', 'red');
        } else if (shutdownKeyPressCount >= 3) {
          cleanup();
        }
        
        // Reset counter after 3 seconds
        shutdownTimeout = setTimeout(() => {
          if (shutdownKeyPressCount < 3) {
            log('✅ Shutdown cancelled', 'green');
          }
          shutdownKeyPressCount = 0;
        }, 3000);
      } else {
        // Any other key resets the counter
        shutdownKeyPressCount = 0;
        if (shutdownTimeout) clearTimeout(shutdownTimeout);
      }
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
