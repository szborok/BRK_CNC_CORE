# BRK CNC Management System - Session Notes
**Date:** November 13, 2025

## Current Status: IDLE BACKEND ARCHITECTURE IMPLEMENTATION

### What We Accomplished Today

#### 1. **Idle Backend Architecture - Core Implementation**
- **Problem:** Dashboard wizard was activating backends but they were still processing nothing
- **Root Cause:** GET /api/projects creating new TempFileManager instances with new session IDs, couldn't find existing processed data
- **Solution Implemented:**
  - Modified TempFileManager to use persistent folder structure (no sessions when `usePersistentTempFolder: true`)
  - Added `getBasePath()` method to TempFileManager for DataManager to read processed results
  - TempFileManager now respects config priority: `userDefinedWorkingFolder` > `testProcessedDataPath` > system temp
  - Backends use configured working folder instead of creating random sessions in D:\TEMP

#### 2. **Backend Configuration Flow**
All three backends now accept POST /api/config with:
```javascript
{
  testMode: boolean,
  workingFolder: string,  // NEW - sets config.app.userDefinedWorkingFolder
  scanPaths: { ... },
  platesPath: string
}
```

**Modified Files:**
- `BRK_CNC_JSONScanner/server/index.js` - POST /api/config accepts workingFolder
- `BRK_CNC_ToolManager/server/index.js` - POST /api/config accepts workingFolder
- `BRK_CNC_ClampingPlateManager/src/WebService.js` - handleConfig accepts workingFolder

#### 3. **Dashboard Setup Wizard - Backend Activation**
- **File:** `BRK_CNC_Dashboard/src/components/SetupWizard_New.tsx`
- **Changes:**
  - runFeatureTest() completely rewritten for all backends
  - Now sends POST /api/config to activate backends (not just GET /api/status)
  - Sends workingFolder: config.storage.basePath to all backends
  - Waits 5 seconds for processing before checking results
  - Proper error handling and detailed logging

**ValidationStep API Calls:**
- JSONScanner: `POST /api/config` with {testMode, workingFolder, scanPaths: {jsonFiles}}
- ToolManager: `POST /api/config` with {testMode, workingFolder, scanPaths: {jsonFiles, excelFiles}}
- ClampingPlateManager: `POST /api/config` with {testMode, workingFolder, platesPath}

#### 4. **Startup Detection Fix**
- **File:** `BRK_CNC_CORE/start-all.js`
- **Issue:** ClampingPlateManager output "API server running" (lowercase) but detection looked for exact case
- **Fix:** Case-insensitive pattern matching: `outputLower.includes('api server running')`
- **Result:** No more timeout warnings for ClampingPlateManager

#### 5. **Path Structure - Organized Hierarchy**
All backends now use:
```
working_data/
  BRK CNC Management Dashboard/
    JSONScanner/
      input_files/
      results/
    ToolManager/
      input_excel_files/
      input_json_files/
      processed_files/
      results/
    ClampingPlateManager/
      plates.json
```

#### 6. **TempFileManager Fixes (Critical)**
**JSONScanner/utils/TempFileManager.js:**
- Added `config` require
- Constructor now checks: customTempBasePath > userDefinedWorkingFolder > testProcessedDataPath > system temp
- Added `usePersistentFolder` flag to skip session creation
- `appPath` now includes "BRK CNC Management Dashboard" parent
- Added `getBasePath()` method returning root temp path
- `ensureSessionDirectory()` skips session dir creation in persistent mode

**ToolManager/utils/TempFileManager.js:**
- Already had proper config support
- Uses same path priority logic

### Current Architecture State

**Backend Lifecycle:**
1. **Startup:** All backends start IDLE (testMode: false, autorun: false)
2. **Dashboard Detection:** Setup wizard checks GET /api/status for all backends
3. **Configuration:** Wizard sends POST /api/config with workingFolder and paths
4. **Activation:** Backends set userDefinedWorkingFolder, activate autorun/autoMode
5. **Processing:** Backends scan source_data, process to working_data
6. **Results:** Dashboard reads from working_data/{AppName}/results/

**Working Flow:**
✅ Backends start idle
✅ Dashboard wizard detects backends
✅ Dashboard sends POST /api/config with workingFolder
✅ Backends activate and process test data
✅ Results saved to working_data/BRK CNC Management Dashboard/{AppName}/results/
⚠️ **BLOCKER:** GET /api/projects still creating temp sessions (fixed but not tested)

### What Still Needs Testing

1. **Hard Refresh Dashboard:** Browser cached old wizard code
   - User needs: Ctrl+Shift+R in browser
   - Then: localStorage.clear() → Refresh → Setup wizard → Demo mode → Initialize

2. **Verify GET /api/projects:** Should read from persistent folders, not create sessions
   - Check terminal logs - should NOT see "Created session directory: D:\TEMP\..."
   - Should see "Found 9 projects" instead of "Found 0 projects"

3. **End-to-End Test:**
   - Clean working_data folder
   - Restart all services
   - Complete wizard in demo mode
   - Click "Initialize Backend Services"
   - Wait 5+ seconds
   - Dashboard should show processed data

### Files Modified This Session

**Backend Services:**
- BRK_CNC_JSONScanner/config.js
- BRK_CNC_JSONScanner/server/index.js
- BRK_CNC_JSONScanner/utils/TempFileManager.js
- BRK_CNC_ToolManager/config.js
- BRK_CNC_ToolManager/server/index.js
- BRK_CNC_ClampingPlateManager/config.js
- BRK_CNC_ClampingPlateManager/src/WebService.js

**Dashboard:**
- BRK_CNC_Dashboard/src/components/SetupWizard_New.tsx (lines 2217-3350)
- BRK_CNC_Dashboard/src/components/PlatesTable.tsx (removed mock data)

**Infrastructure:**
- BRK_CNC_CORE/start-all.js (case-insensitive detection)

### Known Issues

1. **Browser Cache:** Vite dev server caches compiled wizard code
   - Symptom: Terminal shows GET requests but code has POST requests
   - Solution: Hard refresh (Ctrl+Shift+R)

2. **DataManager Session Creation:** TempFileManager constructor always calls ensureSessionDirectory()
   - Fixed: Added usePersistentFolder check to skip session creation
   - Needs testing to verify fix works

3. **Test Data Processing:** Backends process correctly but wizard shows 0 results
   - Cause: GET /api/projects was creating new sessions
   - Fixed: Added getBasePath() method, TempFileManager respects persistent mode
   - Needs testing

### Next Steps

1. **Test the TempFileManager fixes:**
   - Restart services
   - Clear browser cache (hard refresh)
   - Run through wizard
   - Verify GET /api/projects finds 9 projects

2. **If still broken:**
   - DataManager needs to NOT instantiate TempFileManager for read operations
   - Or: Create static method `TempFileManager.getWorkingPath()` that doesn't create sessions

3. **Commit Strategy:**
   - Commit per backend module
   - Clear commit messages explaining idle architecture implementation
   - Reference: "Idle backend architecture - backends wait for Dashboard config"

### Terminal Evidence of Success

**From latest run (16:51:48):**
```
[JSONScanner] Configuration updated from Dashboard
[JSONScanner] Starting Executor after config update
[JSONScanner] 🔄 Auto Scan #1 - Found 9 JSON files
[JSONScanner] ✅ Auto Scan #1 - Completed (took 406ms)
[JSONScanner] 📊 Processing 9 project(s)
[JSONScanner] Project completed: W5270NS01001A - Status: passed
... (8 more projects) ...

[ToolManager] Configuration updated from Dashboard
[ToolManager] 📊 Processing Excel file: E-Cut,MFC,XF,XFeed készlet.xlsx
[ToolManager] Extracted 213 unique tool codes
[ToolManager] 🔍 Found 9 JSON file(s) for tool usage analysis
[ToolManager] Successfully processed 9 JSON file(s)

[ClampingPlateManager] Configuration updated from Dashboard
[ClampingPlateManager] GET /api/plates
```

**All backends processed successfully!**

**But wizard showed:**
```
✅ Found 0 analyzed projects  ← WRONG
✅ Found 0 tool records        ← WRONG
✅ Found 0 clamping plates     ← WRONG (expected for demo mode)
```

**Reason:** GET /api/projects creating new session `D:\TEMP\...\session_1763049113856_tb0u6x`

### Verification Commands

```powershell
# Check processed data exists
Get-ChildItem "../BRK_CNC_CORE/test-data/working_data/BRK CNC Management Dashboard/JSONScanner/results"
# Should show: 9 *_BRK_result.json files

Get-ChildItem "../BRK_CNC_CORE/test-data/working_data/BRK CNC Management Dashboard/ToolManager/results"
# Should show: ToolManager_Result.json, excel_processing_result.json

# After fix - restart and test
cd BRK_CNC_CORE
node start-all.js
# Then browser: localhost:5173 → Ctrl+Shift+R → localStorage.clear() → wizard
```

---

## System Architecture Summary

**Idle Backend Pattern:**
- Backends start dormant, don't process until Dashboard configures them
- Dashboard sends config via POST /api/config during wizard initialization
- Backends activate and process immediately after receiving config
- Results saved to persistent working folder structure
- Dashboard reads results via GET /api/projects, GET /api/tools, GET /api/plates

**Path Resolution Priority:**
1. customTempBasePath (passed to constructor)
2. config.app.userDefinedWorkingFolder (from Dashboard)
3. config.app.testProcessedDataPath (BRK_CNC_CORE/test-data/working_data)
4. os.tmpdir() (system temp - fallback)

**Success Criteria:**
✅ Backends start idle
✅ Dashboard detects backends
✅ Wizard sends config
✅ Backends activate and process
✅ Results saved to working_data
⏳ Dashboard reads results (needs browser cache clear)
