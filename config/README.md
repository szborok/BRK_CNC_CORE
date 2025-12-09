# Centralized Configuration System

All configuration is now centralized in `BRK_CNC_CORE/config/`. Each service loads its config from here.

## Configuration Files

### `BRK_CNC_CORE/config/`

- **`index.js`** - Main config loader, exports `getServiceConfig(serviceName)`
- **`tool-definitions.js`** - Tool categories, machine restrictions, validation rules
- **`rule-config.js`** - Rule execution logic (when rules run, failure types)
- **`paths.js`** - Path configuration for test/production modes

## How It Works

Each service has a minimal `config.js` that loads from central config:

```javascript
const { getServiceConfig } = require('../BRK_CNC_CORE/config');
const config = getServiceConfig('jsonScanner'); // or 'toolManager', 'jsonAnalyzer', 'clampingPlateManager'
module.exports = config;
```

## User-Configurable Settings

User settings come from `BRK_SETUP_WIZARD_CONFIG.json` (located via `configScanner.js`):

- **Paths** - Source data location, working folder
- **Demo Mode** - Test data vs production data
- **Log Level** - debug, info, warn, error
- **Auto Scan** - Enable/disable automatic scanning

## Tool Definitions

Edit `BRK_CNC_CORE/config/tool-definitions.js`:

```javascript
toolCategories: {
  gundrill: ["GUH-1865", "GUH-3032", ...],
  endmill_finish: ["FRA-P15250", ...],
  ...
}
```

## Rule Configuration

Edit `BRK_CNC_CORE/config/rule-config.js`:

```javascript
rules: {
  GunDrill60MinLimit: {
    description: "...",
    failureType: "ncfile",
    enabled: true,
    logic: (project) => { ... }
  }
}
```

## Path Configuration

Edit `BRK_CNC_CORE/config/paths.js`:

- Test mode paths (development)
- Production paths (configured by user)
- Working folder structure

## Service-Specific Settings

Each service gets:
- **Common settings**: app mode, paths, storage, MongoDB, tool definitions
- **Service-specific**: web port, processing rules, file filters

See `BRK_CNC_CORE/config/index.js` for all service configurations.

## Benefits

✅ **Single Source of Truth** - All config in one place  
✅ **Easy Updates** - Change tool definitions once, affects all services  
✅ **User Settings Separate** - User config via setup wizard, technical config in code  
✅ **Backward Compatible** - Services use same config interface as before  

## Migrating Old Config

Old service configs backed up as `config.js.backup` in each service folder.
