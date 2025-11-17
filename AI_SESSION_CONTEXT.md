# AI Agent Session Context - BRK CNC System

**Last Updated**: 2025-11-17 22:13
**Production Deadline**: THIS WEEK (Nov 2025)

## Critical System Facts

### Architecture
- **4 Backend Services**: JSONScanner (3001), ToolManager (3002), ClampingPlateManager (3003), Dashboard (3000)
- **Node.js**: v22.21.1
- **Platform**: Cross-platform (macOS, Windows, Linux)
- **Storage**: Read-only source data → working_data temp results

### Current State
✅ **63 tests passing** (18 JSONScanner, 13 ToolManager, 10 ClampingPlate, 22 Dashboard)
✅ **18 projects** loading from API
✅ **Config scanner** finds filesystem config in 11-15+ platform-specific locations
✅ **Error prevention** layers: jsconfig.json, ESLint, JSDoc, input validation, integration tests
✅ **Git protection**: working_data/ and brk-cnc-system.config.json excluded

### Critical Bugs Fixed
1. ❌ **project.getProjectPath()** → ✅ `project.projectPath` (property, not method)
2. ❌ **Path duplication** → ✅ DataManager reads correct `{base}/JSONScanner/results`
3. ❌ **Scan endpoint stub** → ✅ Real processing via Executor
4. ❌ **Writing to read-only source** → ✅ TempFileManager for all writes

### Config System Architecture
- **OLD**: localStorage only (browser, backends can't access)
- **NEW**: Filesystem-first with localStorage fallback
  - Dashboard checks `GET /api/config` FIRST
  - Falls back to localStorage if 404
  - Config scanner searches platform-specific paths:
    - **Windows**: AppData, ProgramData, Program Files
    - **macOS**: Application Support, iCloud, /Applications, /Library
    - **Linux**: ~/.config, ~/.local/share, /etc, /opt, /usr/local/share

## Key File Locations

### Modified Files (Latest Session)
```
BRK_CNC_JSONScanner/
  server/index.js - Added GET /api/config endpoint (line 74-98)
  src/DataManager.js - Fixed project.projectPath, path duplication, validation
  src/Results.js - Added input validation
  src/Project.js - Fixed == to ===, property not method
  config.js - Integrated configScanner

BRK_CNC_Dashboard/
  src/hooks/useSetupConfig.ts - Filesystem-first config loading
  package.json - Removed duplicate "prepare" script

BRK_CNC_CORE/
  utils/configScanner.js - Cross-platform config file discovery
  test-data/.gitignore - Exclude all working_data/
  .gitignore - Exclude brk-cnc-system.config.json
```

### Critical Code Patterns
```javascript
// WRONG - Don't call non-existent methods
project.getProjectPath()  // ❌

// RIGHT - Use properties directly
project.projectPath  // ✅

// WRONG - Path duplication
path.join(basePath, 'BRK CNC Management Dashboard', 'JSONScanner')  // ❌

// RIGHT - TempFileManager already includes base path
path.join(basePath, 'JSONScanner')  // ✅

// WRONG - Write to source_data
fs.writeFileSync(path.join(sourceDataPath, 'result.json'))  // ❌

// RIGHT - Use TempFileManager
TempFileManager.saveToTemp(data, 'result.json')  // ✅
```

## Error Prevention Stack

1. **jsconfig.json** with `checkJs: true` → VS Code real-time type checking
2. **ESLint** with recommended rules → Catches undefined vars, unused code
3. **JSDoc** type annotations → `@param {import('./Project')}` for IntelliSense
4. **Input validation** at API entry points → Fail fast with context
5. **Integration tests** (no mocks) → Real data flows
6. **Pre-commit hooks** (Husky + lint-staged) → Can't commit broken code

## Production Deployment Checklist

### Must Have Before Production
- [ ] Complete setup wizard flow (filesystem config)
- [ ] Verify Dashboard shows 18 projects
- [ ] Test all 3 backend modules with real data
- [ ] Verify config scanner on Windows/Linux (not just macOS)
- [ ] End-to-end test: fresh install → setup → login → see data
- [ ] Clear all test data from git
- [ ] Document where to place brk-cnc-system.config.json

### Known Issues to Address
- Setup wizard still saves to localStorage (should only use filesystem)
- Dashboard needs to clear localStorage after migrating to filesystem
- Need production build testing (currently only dev mode tested)

## Key Commands

```bash
# Start all services
cd BRK_CNC_CORE && node start-all.js

# Run all tests
cd BRK_CNC_JSONScanner && npm test
cd BRK_CNC_ToolManager && npm test  
cd BRK_CNC_ClampingPlateManager && npm test
cd BRK_CNC_Dashboard && npm test

# Test config scanner
node -e "const s = require('./BRK_CNC_CORE/utils/configScanner'); console.log(s.findConfigFile());"

# API health checks
curl http://localhost:3001/api/status  # JSONScanner
curl http://localhost:3002/api/status  # ToolManager
curl http://localhost:3003/api/health  # ClampingPlate
curl http://localhost:3001/api/config  # Filesystem config

# Clear localStorage (browser console)
localStorage.removeItem('cncDashboardConfig'); location.reload();
```

## Next Steps (Priority Order)

1. **Finish localStorage migration** - Remove all localStorage saves after filesystem config works
2. **Test complete setup flow** - Fresh browser → wizard → save → verify backends load config
3. **Verify 18 projects in Dashboard UI** - Not just API, full end-to-end
4. **Cross-platform testing** - Windows/Linux config scanner verification
5. **Production build** - Test with `npm run build` not just dev mode
6. **Documentation** - User guide for placing config file on deployment

## Working Principles

- **Production mode is default** - testMode: false unless --test flag
- **Never modify source files** - Always use temp/working directories
- **Real test data only** - No mocks, use CNC_TestData
- **Run full test suite** - Projects small enough, no partial tests
- **Structured logging** - Context in all logs
- **Fail fast** - Input validation at entry points
- **One approach at a time** - Revert fully before switching
- **No documentation files** - Code comments, git commits, README only
- **Working code over perfect code** - Ship incrementally

## Contact Points

- **Git Repo**: szborok/BRK_CNC_CORE (main branch)
- **Production Deploy**: Company deployment THIS WEEK
- **User Platform**: Currently macOS, must support Windows/Linux
