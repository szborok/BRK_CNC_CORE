# AI Agent Instructions - BRK CNC Management Dashboard

## 🏭 System Overview

The BRK CNC Management Dashboard is a comprehensive manufacturing management system consisting of multiple integrated applications that use an organized temporary file structure for safe, cross-platform operations.

## 📂 Project Structure

```
BRK CNC Management Dashboard/
├── JSONScanner/             # Quality control and JSON analysis
├── ToolManager/             # Tool inventory and usage analysis
├── CNCManagementDashboard/  # Main dashboard application
└── ClampingPlateManager/    # Clamping plate management (excluded from temp structure)
```

## 🔐 Organized Temp Structure

**CRITICAL**: All applications use the organized temporary file structure:

```
[OS Temp Directory]/BRK CNC Management Dashboard/
├── JSONScanner/
│   └── session_[timestamp]_[id]/
│       ├── input_files/     # Original files copied here
│       ├── collected_jsons/ # Found JSON files organized
│       ├── fixed_jsons/     # Sanitized/fixed JSON files
│       └── results/         # Analysis results & reports
└── ToolManager/
    └── session_[timestamp]_[id]/
        ├── input_files/     # Original JSON files copied here
        ├── processed_files/ # Sanitized JSON files
        ├── results/         # Analysis results & reports
        └── excel_files/     # Excel inventory files
```

### Key Principles

1. **🛡️ Complete Data Safety**: Original files are NEVER modified - all processing uses temp copies
2. **🌍 Cross-Platform**: Uses `os.tmpdir()` for automatic OS temp directory detection
3. **🗂️ Professional Organization**: "BRK CNC Management Dashboard" main folder with app-specific subfolders
4. **🔄 Session Isolation**: Each run gets unique session directory with organized subdirectories
5. **🧹 Auto Cleanup**: Organized temp sessions are automatically cleaned on completion

## 📋 Application Details

### JSONScanner

- **Purpose**: Quality control and JSON file analysis for manufacturing projects
- **Key Files**: `TempFileManager.js`, `Results.js`, `Scanner.js`, `demo-temp-only.js`
- **Temp Structure**: input_files, collected_jsons, fixed_jsons, results
- **Integration**: Provides tool usage data to ToolManager

### ToolManager

- **Purpose**: Tool inventory management and usage analysis
- **Key Files**: `TempFileManager.js`, `Results.js`, `Scanner.js`, `demo-temp-organized.js`
- **Temp Structure**: input_files, processed_files, results, excel_files
- **Integration**: Processes JSONScanner output and Excel inventory files

### ClampingPlateManager

- **Status**: Excluded from organized temp structure (per user request)
- **Location**: Separate application with its own file management

## 🔧 Technical Implementation

### TempFileManager Class

```javascript
class TempFileManager {
  constructor(appName) {
    this.tempBasePath = path.join(os.tmpdir(), "BRK CNC Management Dashboard");
    this.appName = appName;
    this.sessionPath = path.join(this.appPath, this.sessionId);
    // Creates organized subdirectories for file types
  }
}
```

### Key Methods

- `copyToTemp(sourcePath, fileType)` - Copy files to organized temp structure
- `saveToTemp(filename, content, fileType)` - Save results to organized temp structure
- `cleanup()` - Clean organized temp session

## 🎯 AI Agent Guidelines

### When Working on These Projects:

1. **ALWAYS preserve the organized temp structure**
2. **NEVER suggest writing to original file locations**
3. **Use TempFileManager for all file operations**
4. **Maintain cross-platform compatibility with os.tmpdir()**
5. **Keep the "BRK CNC Management Dashboard" folder naming**
6. **Ensure session isolation and proper cleanup**

### File Operations:

- ✅ Use `tempManager.copyToTemp()` for input files
- ✅ Use `tempManager.saveToTemp()` for results
- ✅ Use organized subdirectories (input_files, results, etc.)
- ❌ Never write directly to original locations
- ❌ Never bypass the organized temp structure

### Code Patterns:

```javascript
// ✅ Correct approach
const tempManager = new TempFileManager("AppName");
const tempPath = await tempManager.copyToTemp(originalPath, "input_files");
await tempManager.saveToTemp("result.json", data, "results");

// ❌ Incorrect approach
fs.copyFileSync(originalPath, "./temp/file.json");
fs.writeFileSync(originalPath, data);
```

## 📊 Testing and Validation

### Demo Scripts

- **JSONScanner**: `node demo-temp-only.js`
- **ToolManager**: `node demo-temp-organized.js`
- **Unified Demo**: `node unified-temp-demo.js`

### Validation Points

1. Temp structure created under OS temp directory
2. "BRK CNC Management Dashboard" main folder exists
3. App-specific subfolders (JSONScanner, ToolManager)
4. Session-specific directories with organized subdirectories
5. Original files remain completely untouched
6. Automatic cleanup on completion

## 🔄 Integration Workflow

1. **JSONScanner** processes manufacturing JSON files → organized temp results
2. **ToolManager** processes Excel inventory + JSONScanner results → organized temp analysis
3. **Dashboard** integrates both for comprehensive manufacturing management
4. All applications use same organized temp structure for consistency

## 🚨 Critical Notes

- **Clamping Plate Manager is EXCLUDED** from organized temp structure
- **All file paths must use organized temp structure**
- **Cross-platform compatibility is mandatory**
- **Session cleanup is automatic and required**
- **"BRK CNC Management Dashboard" folder naming is fixed**

## 📝 Documentation Updates

When updating documentation:

1. Emphasize organized temp structure benefits
2. Include cross-platform compatibility notes
3. Show temp hierarchy examples
4. Reference demo scripts for testing
5. Update version dates and feature lists

This organized temp structure ensures enterprise-level data safety, professional organization, and seamless cross-platform operation for the entire BRK CNC Management Dashboard ecosystem.
