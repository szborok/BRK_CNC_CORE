# BRK CNC Management Dashboard

A comprehensive suite of CNC manufacturing management tools designed for professional quality control, tool management, and operational efficiency.

## 🎯 Overview

The BRK CNC Management Dashboard is an integrated ecosystem of specialized applications that streamline CNC manufacturing operations through intelligent data processing, organized file management, and real-time monitoring capabilities.

### Core Applications

#### 🔍 JSONScanner
Advanced CNC data analysis tool with organized temp structure for quality control and rule-based scanning.

**Key Features:**
- Cross-platform temp file management with organized hierarchy
- Enterprise-ready structure for dashboard integration
- Professional organization with unique session directories
- Rule-based analysis with customizable validation
- MongoDB integration for persistent data storage
- Automatic cleanup and maintenance routines

#### 🔧 ToolManager
Excel-based tool management system with sophisticated processing capabilities and organized temp structure.

**Key Features:**
- Excel file processing with organized temp management
- Cross-platform compatibility with automatic OS temp detection
- Intelligent file monitoring and archival system
- Integration with BRK CNC Management Dashboard ecosystem
- Professional organization for enterprise deployment
- Automated workflow with background processing

#### 📊 ClampingPlateManager
Web-based React application for managing clamping plates in CNC operations.

**Key Features:**
- Modern React/TypeScript interface
- Real-time plate status tracking
- Work order management system
- Vite-powered development environment

#### 🎛️ CNCManagementDashboard
Central control dashboard for comprehensive CNC operation management.

**Key Features:**
- Unified management interface
- Employee and tool tracking
- Integration with all core applications
- Real-time operational monitoring

## 🏗️ Architecture

### Organized Temp Structure
All applications utilize a unified temp structure for professional organization:

```
{OS_TEMP}/BRK CNC Management Dashboard/
├── JSONScanner/
│   └── Session_{timestamp}/
│       ├── projects/
│       ├── results/
│       ├── rules/
│       └── logs/
└── ToolManager/
    └── Session_{timestamp}/
        ├── excel/
        ├── processed/
        ├── archived/
        └── logs/
```

### Cross-Platform Compatibility
- **macOS**: `/var/folders/.../T/BRK CNC Management Dashboard/`
- **Windows**: `C:\Users\[Username]\AppData\Local\Temp\BRK CNC Management Dashboard\`
- **Linux**: `/tmp/BRK CNC Management Dashboard/`

## 🚀 Quick Start

### Prerequisites
- Node.js 14.0.0 or higher
- npm or yarn package manager
- Git for version control

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Projects
```

2. Install dependencies for each application:
```bash
# JSONScanner
cd JSONScanner
npm install

# ToolManager
cd ../ToolManager
npm install

# ClampingPlateManager
cd ../ClampingPlateManager
npm install

# CNCManagementDashboard
cd ../CNCManagementDashboard
npm install
```

### Running Applications

#### JSONScanner
```bash
cd JSONScanner
npm start          # Start main application
npm run demo-temp-only  # Demo organized temp structure
npm run cleanup    # Clean up temp files
```

#### ToolManager
```bash
cd ToolManager
npm start          # Start main application
npm run demo       # Demo organized temp processing
npm run unified-demo  # Show unified temp structure
npm run monitor    # Start file monitoring
```

#### ClampingPlateManager
```bash
cd ClampingPlateManager
npm run dev        # Start development server
npm run build      # Build for production
```

#### CNCManagementDashboard
```bash
cd CNCManagementDashboard
npm run dev        # Start development server
npm run build      # Build for production
```

## 📁 Project Structure

```
Projects/
├── JSONScanner/           # CNC data analysis and quality control
├── ToolManager/           # Excel-based tool management
├── ClampingPlateManager/  # Web-based plate management
├── CNCManagementDashboard/ # Central control dashboard
├── AI_AGENT_INSTRUCTIONS.md  # Comprehensive AI agent guidelines
└── README.md             # This file
```

## 🔧 Configuration

Each application includes configuration files and detailed documentation:

- **JSONScanner**: See `JSONScanner/README.md` and `JSONScanner/docs/`
- **ToolManager**: See `ToolManager/README.md` and `ToolManager/docs/`
- **ClampingPlateManager**: See `ClampingPlateManager/README.md`
- **CNCManagementDashboard**: See `CNCManagementDashboard/README.md`

## 🤖 AI Agent Integration

This project includes comprehensive AI agent instructions in `AI_AGENT_INSTRUCTIONS.md` covering:

- System architecture and design principles
- Temp structure organization and best practices
- Code patterns and implementation guidelines
- Cross-platform compatibility requirements
- Integration strategies between applications

## 🧪 Demo Scripts

### Unified Temp Structure Demo
```bash
node unified-temp-demo.js
```
Demonstrates the complete organized temp hierarchy across all applications.

### Individual Application Demos
```bash
# JSONScanner temp structure
cd JSONScanner && npm run demo-temp-only

# ToolManager organized processing
cd ToolManager && npm run demo
```

## 📊 Key Features

### Professional Organization
- **Enterprise-Ready**: Structured for professional CNC manufacturing environments
- **Scalable Architecture**: Modular design supports growth and integration
- **Cross-Platform**: Consistent behavior across Windows, macOS, and Linux
- **Automated Management**: Self-cleaning temp structures with session isolation

### Integration Capabilities
- **Unified Ecosystem**: All applications work together seamlessly
- **Data Consistency**: Shared data formats and processing standards
- **Centralized Control**: Dashboard provides unified management interface
- **Flexible Deployment**: Individual applications or complete suite

### Quality Assurance
- **Comprehensive Testing**: Test data and validation routines included
- **Error Handling**: Robust error management with detailed logging
- **Documentation**: Extensive documentation for users and developers
- **Maintenance**: Automated cleanup and maintenance routines

## 🔄 Development Workflow

1. **Setup**: Use individual setup scripts for each application
2. **Development**: Each application includes dev scripts with hot reloading
3. **Testing**: Comprehensive test suites with sample data
4. **Deployment**: Production builds with optimized assets
5. **Maintenance**: Automated cleanup and monitoring capabilities

## 🛠️ Technology Stack

- **Backend**: Node.js, MongoDB
- **Frontend**: React, TypeScript, Vite
- **File Processing**: ExcelJS, XLSX
- **Development**: Nodemon, PostCSS, Tailwind CSS
- **Utilities**: Chalk, UUID, Chokidar

## 📈 Version History

- **v2.0.0**: Organized temp structure implementation, enhanced documentation, unified ecosystem
- **v1.0.0**: Initial release with basic functionality

## 🤝 Contributing

1. Review `AI_AGENT_INSTRUCTIONS.md` for development guidelines
2. Follow the organized temp structure principles
3. Maintain cross-platform compatibility
4. Update documentation for any changes
5. Test across all supported platforms

## 📄 License

MIT License - see individual application LICENSE files for details.

## 🆘 Support

For technical support or questions:
1. Check individual application README files
2. Review the comprehensive documentation in each `/docs` folder
3. Consult `AI_AGENT_INSTRUCTIONS.md` for development guidance
4. Check demo scripts for usage examples

---

**BRK CNC Management Dashboard** - Professional CNC Manufacturing Management Suite