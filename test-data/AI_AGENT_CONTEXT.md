# AI Agent Context - CNC Management Ecosystem

**Last Updated**: 2025-01-XX  
**Purpose**: Complete context for AI agents to seamlessly continue development on any machine

---

## 🎯 Project Ecosystem Overview

This is a **multi-repository CNC manufacturing management system** consisting of:

1. **BRK_CNC_CORE/test-data** (THIS REPO) - Centralized test data repository
2. **JSONScanner** - CNC project quality control and rule engine
3. **ToolManager** - CNC tool inventory and tracking system
4. **ClampingPlateManager** - Clamping plate inventory and work order management
5. **CNCManagementDashboard** - Unified React/TypeScript frontend (integrates all backends)

### Repository URLs

- BRK_CNC_CORE: https://github.com/szborok/BRK_CNC_CORE.git (public)
- JSONScanner: [URL TBD]
- ToolManager: [URL TBD]
- ClampingPlateManager: [URL TBD]
- CNCManagementDashboard: [URL TBD]

---

## 🏗️ Critical Architecture Decisions

### 1. **Centralized Test Data Pattern**

**Decision**: All test data consolidated in `BRK_CNC_CORE/test-data` repository, NOT duplicated in backend repos.

**Why**:

- Eliminates ~90MB of duplicate data per backend repo
- Single source of truth for test data
- Easier to update/maintain test datasets
- Consistent test data across all projects

**Implementation**:

```
Expected Directory Structure (sibling folders):
.../Projects/
├── BRK_CNC_CORE/          ← Centralized test data (auto-cloned)
│   └── test-data/         ← Test data subdirectory
├── JSONScanner/           ← Backend, reads ../BRK_CNC_CORE/test-data
├── ToolManager/           ← Backend, reads ../BRK_CNC_CORE/test-data
├── ClampingPlateManager/  ← Backend, reads ../BRK_CNC_CORE/test-data
└── CNCManagementDashboard/ ← Frontend, integrates all
```

**Backend Config Pattern**:

```javascript
// All backends use relative paths to sibling BRK_CNC_CORE/test-data folder
const testDataPath = path.join(
  __dirname,
  "..",
  "BRK_CNC_CORE",
  "test-data",
  "source_data",
  "..."
);
const workingDataPath = path.join(
  __dirname,
  "..",
  "BRK_CNC_CORE",
  "test-data",
  "working_data",
  "..."
);
```

### 2. **Automatic Test Data Setup**

**Decision**: Use `postinstall` npm hook to automatically clone/update `BRK_CNC_CORE/test-data`.

**Why**:

- New developers get test data automatically on `npm install`
- No manual setup steps required
- Always pulls latest test data on `npm test`

**Implementation**:
All 3 backends have:

- `scripts/setup-test-data.js` - Auto-clones or updates BRK_CNC_CORE
- `package.json` hooks:
  ```json
  {
    "scripts": {
      "postinstall": "node scripts/setup-test-data.js",
      "pretest": "node scripts/setup-test-data.js",
      "setup-test-data": "node scripts/setup-test-data.js"
    }
  }
  ```

### 3. **Working Data Structure** (USER'S PREFERENCE)

**Critical**: User manually restructured to **single top-level "BRK CNC Management Dashboard" folder**.

**Structure**:

```
BRK_CNC_CORE/test-data/working_data/
└── BRK CNC Management Dashboard/    ← SINGLE folder for ALL services
    ├── jsonscanner/
    │   └── session_demo/
    ├── toolmanager/
    │   └── session_demo/
    ├── clampingplatemanager/
    │   └── session_demo/
    └── dashboard/
        └── session_demo/
```

**NOT** the original design:

```
❌ working_data/
   ├── jsonscanner/BRK CNC Management Dashboard/
   ├── toolmanager/BRK CNC Management Dashboard/
   └── clampingplatemanager/BRK CNC Management Dashboard/
```

**Implications**:

- Backend `TempFileManager` logic may need adjustment
- All backends must write to: `../BRK_CNC_CORE/test-data/working_data/BRK CNC Management Dashboard/{service}/`
- Dashboard reads from: `../BRK_CNC_CORE/test-data/working_data/BRK CNC Management Dashboard/dashboard/`

### 4. **Read-Only Source Data Pattern**

**Decision**: All backends operate in **read-only mode** on source data.

**Why**:

- Protects original test data from accidental modification
- Professional temp folder organization
- Allows safe experimentation

**Pattern**:

1. Source data in `BRK_CNC_CORE/test-data/source_data/` - READ ONLY
2. Backends copy to `working_data/BRK CNC Management Dashboard/{service}/session_xxx/input_files/`
3. Processing happens in temp structure
4. Results written to `working_data/BRK CNC Management Dashboard/{service}/session_xxx/results/`

### 5. **MongoDB Removal**

**Decision**: Removed ALL MongoDB code from all backends. Use **local JSON files only**.

**Why**:

- Simpler deployment (no MongoDB server required)
- Easier testing and development
- Sufficient for current scale
- Easier to inspect/debug data

**Status**: ✅ Complete - All MongoDB code removed from JSONScanner, ToolManager, ClampingPlateManager

---

## 📊 BRK_CNC_CORE/test-data Repository Structure

### Source Data (`source_data/`)

**Read-only test data for all backends:**

```
source_data/
├── json_files/              ← For JSONScanner
│   ├── W5270NS01001/        (CNC project data)
│   ├── W5270NS01003/
│   ├── W5270NS01060/
│   └── W5270NS01061/
├── matrix_excel_files/      ← For ToolManager
│   └── [Tool matrix Excel files]
└── clamping_plates/         ← For ClampingPlateManager
    ├── info/
    │   └── Készülékek.xlsx  (Main inventory file)
    └── models/              (3D model folders)
        ├── 1_alap/
        ├── 10/, 11/, 12/, ... 23/, 24/, 25/
        └── [35+ total folders]
```

### Working Data (`working_data/`)

**Generated output from backend processing:**

```
working_data/
└── BRK CNC Management Dashboard/    ← User's preferred structure
    ├── jsonscanner/
    │   └── session_demo/
    │       ├── input_files/
    │       ├── processed_files/
    │       └── results/
    ├── toolmanager/
    │   └── session_demo/
    │       ├── input_files/
    │       ├── processed_files/
    │       ├── results/
    │       └── excel_files/
    ├── clampingplatemanager/
    │   └── session_demo/
    │       ├── input_files/
    │       ├── processed_files/
    │       └── results/
    └── dashboard/
        └── session_demo/
            └── demo-data/           ← For frontend demo mode
```

---

## 🔧 Backend Configuration Summary

### JSONScanner (`config.js`)

```javascript
testDataPathAuto: path.join(__dirname, "..", "BRK_CNC_CORE", "test-data", "source_data", "json_files"),
testProcessedDataPath: path.join(__dirname, "..", "BRK_CNC_CORE", "test-data", "working_data", "jsonscanner"),
app: {
  testMode: true,  // Toggle between test/production
  usePersistentTempFolder: true,
  tempBaseName: "BRK CNC Management Dashboard"
}
```

### ToolManager (`config.js`)

```javascript
jsonScanPath: path.join(__dirname, "..", "BRK_CNC_CORE", "test-data", "source_data", "json_files"),
excelScanPath: path.join(__dirname, "..", "BRK_CNC_CORE", "test-data", "source_data", "matrix_excel_files"),
testProcessedDataPath: path.join(__dirname, "..", "BRK_CNC_CORE", "test-data", "working_data", "toolmanager"),
app: {
  testMode: true,
  usePersistentTempFolder: true,
  tempBaseName: "BRK CNC Management Dashboard"
}
```

### ClampingPlateManager (`config.js`)

```javascript
permanentDataDir: path.join(__dirname, "..", "BRK_CNC_CORE", "test-data", "working_data", "clampingplatemanager"),
testSourceDataDir: path.join(__dirname, "..", "BRK_CNC_CORE", "test-data", "source_data", "clamping_plates"),
modelsDir: path.join(__dirname, "..", "BRK_CNC_CORE", "test-data", "source_data", "clamping_plates", "models"),
app: {
  testMode: true,
  usePersistentTempFolder: true,
  tempBaseName: "BRK CNC Management Dashboard"
}
```

**⚠️ IMPORTANT**: User's working_data structure has **single BRK folder at parent level**. Backend TempManager logic may need verification to ensure correct path construction.

---

## 🚀 Setup Instructions for New Machine

### Prerequisites

- Node.js 18+ installed
- Git installed
- VS Code (recommended)

### Initial Setup

```bash
# 1. Clone all repositories as sibling folders
cd ~/Projects  # Or your preferred location

git clone https://github.com/szborok/BRK_CNC_CORE.git
git clone [JSONScanner URL]
git clone [ToolManager URL]
git clone [ClampingPlateManager URL]
git clone [CNCManagementDashboard URL]

# 2. Install backend dependencies (auto-clones BRK_CNC_CORE if missing)
cd JSONScanner
npm install  # Runs postinstall → setup-test-data.js

cd ../ToolManager
npm install  # Auto-clones/updates BRK_CNC_CORE

cd ../ClampingPlateManager
npm install  # Auto-clones/updates BRK_CNC_CORE

cd ../CNCManagementDashboard
npm install

# 3. Verify structure
ls -la ../  # Should see all 5 repos as siblings
```

### Running Tests

```bash
# Each backend auto-updates BRK_CNC_CORE/test-data before tests
cd JSONScanner
npm test  # Runs pretest → setup-test-data.js → tests

cd ../ToolManager
npm test

cd ../ClampingPlateManager
npm test
```

### Development Workflow

```bash
# JSONScanner
cd JSONScanner
npm run dev:scanner      # Auto mode with logging
npm run manual           # Process specific project
node main.js --help      # See all CLI options

# ToolManager
cd ToolManager
npm run auto             # Continuous scanning
npm run manual           # Single project processing

# ClampingPlateManager
cd ClampingPlateManager
npm start                # Start web service
npm run interactive      # CLI mode

# CNCManagementDashboard (Frontend)
cd CNCManagementDashboard
npm run dev              # Development server
npm run dev:all          # Start all modules + dashboard
```

---

## 📁 Key Files by Project

### BRK_CNC_CORE/test-data

- `README.md` - Repository overview and usage
- `source_data/README.md` - Source data documentation
- `working_data/README.md` - Working data structure (reflects user's preference)
- `.gitignore` - Excludes generated session folders

### JSONScanner

- `main.js` - Entry point (CLI args, mode selection)
- `config.js` - All settings (test/prod paths, rules)
- `src/Executor.js` - Main orchestrator
- `src/RuleEngine.js` - Auto-discovers rules from `/rules/`
- `scripts/setup-test-data.js` - Auto-clone/update BRK_CNC_CORE
- `TEST_DATA_SETUP.md` - Test data documentation
- `.github/copilot-instructions.md` - AI assistant context

### ToolManager

- `main.js` - Entry point (CLI with extensive options)
- `config.js` - Test/prod paths, tool categories
- `src/Executor.js` - Main orchestrator
- `src/Matrix.js` - Excel parsing (ECUT/MFC/XF/XFEED categorization)
- `scripts/setup-test-data.js` - Auto-clone/update BRK_CNC_CORE
- `TEST_DATA_SETUP.md` - Test data documentation
- `.github/copilot-instructions.md` - AI assistant context

### ClampingPlateManager

- `main.js` - Entry point (web/interactive modes)
- `config.js` - Paths, Excel integration settings
- `src/PlateService.js` - Core plate management logic
- `src/ExcelProcessor.js` - Excel file handling
- `scripts/setup-test-data.js` - Auto-clone/update BRK_CNC_CORE
- `TEST_DATA_SETUP.md` - Test data documentation
- `.github/copilot-instructions.md` - AI assistant context

### CNCManagementDashboard

- `src/main.tsx` - React app entry point
- `src/App.tsx` - Main component with routing
- `config/unified.config.ts` - Centralized module coordination
- `src/services/` - API communication with backends
- `.github/copilot-instructions.md` - AI assistant context

---

## 🔍 Common Development Scenarios

### Scenario 1: Adding New Test Data

```bash
cd BRK_CNC_CORE/test-data

# Add new files to source_data/
cp /path/to/new/project source_data/json_files/W5270NS01999/

# Commit and push
git add source_data/
git commit -m "Add test project W5270NS01999"
git push

# Other developers get update automatically on next npm install or npm test
```

### Scenario 2: Modifying Backend Config

```bash
cd JSONScanner  # Or ToolManager, ClampingPlateManager

# Edit config.js
vim config.js

# Test changes
npm test  # Auto-updates BRK_CNC_CORE/test-data before running

# Commit changes
git add config.js
git commit -m "Update test data paths"
git push
```

### Scenario 3: Debugging Backend Processing

```bash
cd JSONScanner

# View recent logs
node debug.js

# Clear logs
node debug.js --clear

# Run single project
node main.js --manual --project "W5270NS01001"

# Check results
ls -la ../BRK_CNC_CORE/test-data/working_data/BRK\ CNC\ Management\ Dashboard/jsonscanner/session_demo/results/
```

### Scenario 4: Verifying Working Data Structure

```bash
cd BRK_CNC_CORE/test-data

# Check actual structure
tree -L 4 -a working_data/

# Should show:
# working_data/
# └── BRK CNC Management Dashboard/
#     ├── jsonscanner/
#     ├── toolmanager/
#     ├── clampingplatemanager/
#     └── dashboard/

# If structure is wrong, user preference is single BRK folder at parent
```

---

## ⚠️ Critical Notes for AI Agents

### 1. **NEVER Suggest Creating Test Data in Backend Repos**

- Test data belongs ONLY in `BRK_CNC_CORE/test-data` repository
- Backend `.gitignore` prevents accidental re-addition
- Always reference `../BRK_CNC_CORE/test-data/source_data/`

### 2. **Respect User's Working Data Structure**

- User prefers **single "BRK CNC Management Dashboard" folder**
- All services as subdirectories: `BRK CNC Management Dashboard/{service}/`
- NOT separate BRK folders per service

### 3. **Automatic Setup is Critical**

- `setup-test-data.js` must work correctly
- `postinstall` hook ensures BRK_CNC_CORE is always available
- Never remove these scripts or hooks

### 4. **Read-Only Source Data**

- Backends MUST NOT modify `source_data/`
- All processing in `working_data/BRK CNC Management Dashboard/{service}/`
- Use temp file managers for organized structure

### 5. **Test Mode vs Production Mode**

- All backends have `config.app.testMode` flag
- Test: Uses `../BRK_CNC_CORE/test-data/` paths
- Production: Uses `C:\Production\` or configured production paths
- Always verify mode before operations

### 6. **MongoDB is REMOVED**

- Do NOT suggest MongoDB solutions
- All data persistence uses local JSON files
- DataManager handles file operations

### 7. **Sibling Folder Requirement**

- All repos MUST be cloned as siblings
- Relative path `../BRK_CNC_CORE/test-data/` is critical
- Automatic setup script enforces this

---

## 🐛 Troubleshooting Common Issues

### Issue: "BRK_CNC_CORE/test-data not found"

**Solution**: Run `npm run setup-test-data` manually in backend repo

### Issue: "Test data paths incorrect"

**Solution**: Verify all repos are sibling folders, check `config.js` paths

### Issue: "Working data structure wrong"

**Solution**: User prefers single BRK folder - check `working_data/README.md`

### Issue: "Original files modified"

**Solution**: Check TempFileManager - should only write to `working_data/`

### Issue: "Git hooks not running"

**Solution**: Ensure `scripts/setup-test-data.js` exists and is executable

### Issue: "Backend can't find modules"

**Solution**: Run `npm install` in each backend (triggers postinstall)

---

## 📋 Development Checklist for AI Agents

When continuing work on this project, verify:

- [ ] All 5 repos cloned as sibling folders
- [ ] `BRK_CNC_CORE` repository is up to date (`git pull`)
- [ ] Backend `node_modules` installed (`npm install` ran)
- [ ] `working_data/` structure matches user's preference (single BRK folder)
- [ ] Backend configs point to `../BRK_CNC_CORE/test-data/`
- [ ] `.gitignore` excludes `data/test_*` in backends
- [ ] `TEST_DATA_SETUP.md` exists in all backends
- [ ] No MongoDB code present
- [ ] Read `.github/copilot-instructions.md` in each project for specific patterns

---

## 🎓 Understanding the Business Domain

### CNC Manufacturing Workflow

1. **Project Planning**: Work orders created (e.g., "W5270NS01001")
2. **Tool Selection**: ToolManager tracks required tools and inventory
3. **Clamping Plates**: ClampingPlateManager assigns plates to projects
4. **CNC Programming**: NC files contain G/M codes for operations
5. **Quality Control**: JSONScanner validates programs against business rules
6. **Dashboard**: Unified view of all operations

### Business Rules (JSONScanner)

- Auto-discovered from `/rules/` directory
- Examples: M110Contour, GunDrill60MinLimit, ReconditionedTool
- Each rule checks project data and returns violations
- Severity levels: error, warning, info

### Tool Categories (ToolManager)

- **ECUT**: Cutting operations (8400xxx, 8410xxx, 8420xxx)
- **MFC**: Manufacturing center (8201xxx)
- **XF/XFEED**: Cross-feed operations (15250xxx, X7620xxx, X7624xxx)

### Plate Lifecycle (ClampingPlateManager)

- **Health**: new, used, locked
- **Occupancy**: free, in-use
- **Work Orders**: Tracks which plate is used for which project
- **History**: Full audit trail of plate usage

---

## 🔮 Future Considerations

### Potential Enhancements

1. **Database Migration**: If scale increases, consider PostgreSQL (NOT MongoDB)
2. **API Layer**: RESTful APIs for backend communication
3. **Real-time Updates**: WebSocket integration for live dashboard updates
4. **Cloud Deployment**: Docker containers for all services
5. **Multi-tenant**: Support for multiple manufacturing facilities

### Technical Debt

- Backend TempManager path construction (verify with user's BRK structure)
- Dashboard module coordination (still in development)
- Test coverage (add comprehensive test suites)
- Error handling standardization across backends

---

## 📝 Change Log

### 2025-01-XX - Initial Context Document

- Documented centralized test data architecture
- Explained automatic setup system
- Clarified user's working_data structure preference
- Removed MongoDB from all backends
- Created comprehensive setup instructions

---

## 📞 Contact & Support

**Repository Owner**: szborok (GitHub)
**Primary Repository**: https://github.com/szborok/BRK_CNC_CORE.git

For AI agents: This document should be sufficient to continue development. If additional context is needed, refer to:

1. `.github/copilot-instructions.md` in each project
2. `README.md` files in each repository
3. `docs/` directories in backend projects

---

**END OF CONTEXT DOCUMENT**
