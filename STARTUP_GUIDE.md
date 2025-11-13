# CNC Management Dashboard - Startup Guide

## Quick Start

### Normal Startup
```bash
node start-all.js
```

This command:
1. Starts all 3 backend services (JSONScanner, ToolManager, ClampingPlateManager)
2. Starts the dashboard frontend
3. Opens on `http://localhost:5173`

**First Time:**
- Dashboard shows setup wizard
- Complete wizard → triggers one-time backend initialization
- Config saved to browser localStorage
- Backends continue running normally

**Restart:**
- Backends start and run normally (AUTO mode, 60s scan interval)
- Dashboard loads with saved config
- No setup wizard - just works

### Reset Mode
```bash
node start-all.js --reset
```

Clears localStorage and forces setup wizard to run again.
Use this when you want to reconfigure or troubleshoot.

## Backend Services

All backends start automatically and run independently:

- **JSONScanner** (port 3001) - Scans BRK_CNC_CORE/test-data for JSON files every 60s
- **ToolManager** (port 3002) - Processes Excel matrix files every 60s
- **ClampingPlateManager** (port 3003) - Web service for plate inventory

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    node start-all.js                         │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ JSONScanner │  │ ToolManager │  │ ClampingPlate   │   │
│  │  port 3001  │  │  port 3002  │  │ Manager 3003     │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│         │                 │                   │             │
│         └─────────────────┴───────────────────┘             │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │   Dashboard     │                        │
│                  │  localhost:5173 │                        │
│                  └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### First-Time Flow

1. `node start-all.js` → Starts all services
2. Open `http://localhost:5173` → Setup wizard appears
3. Complete wizard steps (company info, paths, features)
4. **Validation step** → Triggers ONE-TIME backend init:
   - Checks all backends are responding
   - Processes test data from BRK_CNC_CORE/test-data
   - Validates data flow
   - If successful → saves config to localStorage
5. Dashboard loads normally
6. Backends continue AUTO mode processing

### Restart Flow

1. `node start-all.js` → Starts all services
2. Backends immediately start AUTO mode (60s scan interval)
3. Dashboard loads → Checks localStorage
4. Config exists → Dashboard loads normally
5. No wizard, no init - everything just works

### Configuration Storage

**Dashboard Config:** Saved to browser `localStorage` with key `cncDashboardConfig`
- Company info
- Module settings (JSONScanner, ToolManager, ClampingPlateManager)
- Feature flags
- Paths
- Admin settings

**Admin Changes:** Modify localStorage config (no file system writes)

**Backend Configs:** Each backend has its own `config.js` file
- JSONScanner: `JSONScanner/config.js` (testMode, autorun, paths)
- ToolManager: `ToolManager/config.js` (testMode, autoMode, paths)
- ClampingPlateManager: `ClampingPlateManager/config.js` (autoMode, port, storage)

## Troubleshooting

### Dashboard shows zeros/no data
- Wait 5-10 seconds after backend startup for first processing cycle
- Check backends are responding:
  ```bash
  curl http://localhost:3001/api/status
  curl http://localhost:3002/api/status
  curl http://localhost:3003/api/health
  ```
- Check BRK_CNC_CORE/test-data has source files:
  - `BRK_CNC_CORE/test-data/source_data/json_files/` (for JSONScanner)
  - `BRK_CNC_CORE/test-data/source_data/matrix_excel_files/` (for ToolManager)

### Setup wizard validation fails
- Ensure all backends are running before starting validation
- Check terminal output for backend errors (red text)
- Backend services need 5-10 seconds to initialize after startup

### Port conflicts
- JSONScanner: 3001
- ToolManager: 3002
- ClampingPlateManager: 3003
- Dashboard: 5173

If ports are in use, kill existing processes or change ports in backend configs.

### Reset not working
- Clear browser cache
- Manually clear localStorage in browser DevTools:
  ```javascript
  localStorage.removeItem('cncDashboardConfig');
  localStorage.removeItem('setupWizardStep');
  localStorage.removeItem('setupWizardProgress');
  ```
- Or use `node start-all.js --reset`

## Stopping Services

Press `Ctrl+C` in the terminal running `start-all.js`

All services will shut down gracefully.

## Development

### Individual Backend Testing
```bash
# JSONScanner only
cd JSONScanner
node main.js --test

# ToolManager only
cd ToolManager
node main.js --test

# ClampingPlateManager only
cd ClampingPlateManager
node main.js --serve

# Dashboard only
cd CNCManagementDashboard
npm run dev
```

### Backend Modes
- `--test` flag: Use BRK_CNC_CORE/test-data paths
- Without flag: Use production paths from config

### Logs
- JSONScanner: `JSONScanner/logs/`
- ToolManager: `ToolManager/logs/`
- ClampingPlateManager: `ClampingPlateManager/logs/`

---

**Last Updated:** November 13, 2025
