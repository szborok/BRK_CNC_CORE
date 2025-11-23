// AutoRunProcessor.js
// Central automation controller for BRK CNC System
// Watches source folders and triggers backend services

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class AutoRunProcessor {
  constructor(config) {
    this.config = config;
    this.isRunning = false;
    this.watchIntervalMs = config.watchIntervalMs || 60000; // 1 minute default
    this.lastScanTime = null;
    this.watchInterval = null;
    
    // Service endpoints
    this.services = {
      jsonScanner: { url: 'http://localhost:3000', enabled: true },
      jsonAnalyzer: { url: 'http://localhost:3001', enabled: true },
      toolManager: { url: 'http://localhost:3002', enabled: true },
      clampingPlateManager: { url: 'http://localhost:3003', enabled: false } // Manual only
    };
  }

  /**
   * Start the auto-run processor
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  AutoRun processor already running');
      return;
    }

    console.log('🤖 Starting AutoRun processor...');
    console.log(`   Watch interval: ${this.watchIntervalMs / 1000}s`);
    console.log(`   Source path: ${this.config.sourcePath}`);
    
    this.isRunning = true;
    
    // Run initial scan
    this.runScanCycle().catch(err => {
      console.error('❌ Initial scan failed:', err.message);
    });
    
    // Set up interval for continuous watching
    this.watchInterval = setInterval(() => {
      this.runScanCycle().catch(err => {
        console.error('❌ Scan cycle failed:', err.message);
      });
    }, this.watchIntervalMs);
    
    console.log('✅ AutoRun processor started');
  }

  /**
   * Stop the auto-run processor
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping AutoRun processor...');
    
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    
    this.isRunning = false;
    console.log('✅ AutoRun processor stopped');
  }

  /**
   * Run a complete scan cycle
   */
  async runScanCycle() {
    const cycleStart = Date.now();
    console.log(`\n🔄 Starting scan cycle at ${new Date().toLocaleTimeString()}`);
    
    const results = {
      jsonScanner: null,
      jsonAnalyzer: null,
      toolManager: null
    };
    
    try {
      // Step 1: Check if there are new files to process
      const hasNewFiles = await this.checkForNewFiles();
      
      if (!hasNewFiles) {
        console.log('ℹ️  No new files detected, skipping cycle');
        this.lastScanTime = cycleStart;
        return;
      }
      
      console.log('📁 New files detected, starting processing pipeline...');
      
      // Step 2: Trigger JSONScanner
      if (this.services.jsonScanner.enabled) {
        console.log('1️⃣  JSONScanner: Processing files...');
        results.jsonScanner = await this.triggerService('jsonScanner', '/api/scan');
      }
      
      // Step 3: Trigger JSONAnalyzer (after scanner completes)
      if (this.services.jsonAnalyzer.enabled) {
        console.log('2️⃣  JSONAnalyzer: Running rules...');
        results.jsonAnalyzer = await this.triggerService('jsonAnalyzer', '/api/analyze');
      }
      
      // Step 4: Trigger ToolManager (after analyzer completes)
      if (this.services.toolManager.enabled) {
        console.log('3️⃣  ToolManager: Scanning tools...');
        results.toolManager = await this.triggerService('toolManager', '/api/scan');
      }
      
      this.lastScanTime = cycleStart;
      const duration = ((Date.now() - cycleStart) / 1000).toFixed(2);
      
      // Report results
      console.log(`\n📊 Scan Cycle Results (${duration}s):`);
      if (results.jsonScanner) {
        console.log(`   JSONScanner:   ${results.jsonScanner.message || 'Completed'}`);
      }
      if (results.jsonAnalyzer) {
        console.log(`   JSONAnalyzer:  ${results.jsonAnalyzer.message || 'Completed'}`);
      }
      if (results.toolManager) {
        console.log(`   ToolManager:   ${results.toolManager.message || 'Completed'}`);
      }
      console.log(`✅ Pipeline completed\n`);
      
    } catch (error) {
      console.error('❌ Scan cycle error:', error.message);
    }
  }

  /**
   * Check if there are new files since last scan
   */
  async checkForNewFiles() {
    try {
      if (!fs.existsSync(this.config.sourcePath)) {
        console.warn(`⚠️  Source path not found: ${this.config.sourcePath}`);
        return false;
      }
      
      // Get latest file modification time in source folder
      const stats = this.getLatestFileTime(this.config.sourcePath);
      
      if (!this.lastScanTime) {
        // First run - always process
        return true;
      }
      
      // Check if any files are newer than last scan
      return stats.latestTime > this.lastScanTime;
      
    } catch (error) {
      console.error('Error checking for new files:', error.message);
      return false;
    }
  }

  /**
   * Get latest file modification time in a directory (recursive)
   */
  getLatestFileTime(dirPath) {
    let latestTime = 0;
    let fileCount = 0;
    
    const scan = (dir) => {
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          
          if (item.isDirectory()) {
            scan(fullPath);
          } else if (item.isFile() && item.name.endsWith('.json')) {
            const stats = fs.statSync(fullPath);
            if (stats.mtimeMs > latestTime) {
              latestTime = stats.mtimeMs;
            }
            fileCount++;
          }
        }
      } catch (err) {
        // Ignore permission errors etc.
      }
    };
    
    scan(dirPath);
    
    return { latestTime, fileCount };
  }

  /**
   * Trigger a backend service via its API
   */
  async triggerService(serviceName, endpoint) {
    const service = this.services[serviceName];
    
    if (!service || !service.enabled) {
      console.log(`   ⏭️  ${serviceName} disabled, skipping`);
      return null;
    }
    
    try {
      const url = `${service.url}${endpoint}`;
      
      const response = await axios.post(url, {}, {
        timeout: 300000 // 5 minute timeout for long operations
      });
      
      return response.data;
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error(`   ❌ ${serviceName} not running at ${service.url}`);
      } else if (error.code === 'ETIMEDOUT') {
        console.error(`   ⏱️  ${serviceName} timeout (operation may still be running)`);
      } else {
        console.error(`   ❌ ${serviceName} error:`, error.message);
      }
      throw error;
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      running: this.isRunning,
      lastScanTime: this.lastScanTime ? new Date(this.lastScanTime).toISOString() : null,
      watchIntervalMs: this.watchIntervalMs,
      services: this.services
    };
  }

  /**
   * Trigger immediate scan (manual override)
   */
  async triggerManualScan() {
    console.log('🔧 Manual scan triggered');
    await this.runScanCycle();
  }
}

module.exports = AutoRunProcessor;
