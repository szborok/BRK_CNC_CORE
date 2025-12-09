# Configuration Contradictions & Redundancies

## Critical Issues

### 1. Module enabled vs mode (CONTRADICTION)
**Location:** Setup wizard config, all modules
```json
{
  "modules": {
    "jsonAnalyzer": {
      "enabled": true,    // Can be disabled
      "mode": "auto"      // But still set to auto mode
    }
  }
}
```
**Problem:** Can have `enabled: false` with `mode: "auto"` - logically impossible. If disabled, mode is irrelevant.

**Used in:** 
- `src/components/SetupWizard.tsx.backup` - checks enabled
- `src/components/AdminSettings.tsx` - checks mode
- `src/services/SetupProcessor.ts` - checks mode, ignores enabled

**Fix:** Remove `enabled` flag. Use `mode: "auto" | "manual" | "disabled"`

---

### 2. Central config redundant mode (REDUNDANCY)
**Location:** `BRK_CNC_CORE/config/index.js` lines 32-34
```javascript
app: {
  mode: autoMode ? 'auto' : 'manual',  // Derived from autoMode
  autoMode,                             // Already have this boolean
  testMode,
}
```
**Problem:** `mode` string is redundant - derived from `autoMode` boolean. Everything checks `autoMode`, not `mode`.

**Fix:** Remove `mode` property, keep only `autoMode`

---

### 3. testMode vs demoMode (CONFUSION)
**Location:** `BRK_CNC_CORE/config/index.js` line 24
```javascript
const testMode = options.testMode ?? userConfig?.demoMode ?? true;
```
**Problem:** Mixing two concepts:
- `testMode` = using test data paths
- `demoMode` = customer hasn't configured production yet

These are different. Demo mode should default to test paths, but they're not the same thing.

**Used in:**
- Setup wizard config has `demoMode`
- Backend services use `testMode`
- They're treated as equivalent but mean different things

**Fix:** Keep separate:
- `demoMode`: User hasn't completed production setup
- `testMode`: Explicitly use test data (for development/testing)

---

### 4. AutoScan nested enabled flags (REDUNDANCY)
**Location:** Setup wizard config
```json
{
  "features": {
    "autoScan": {
      "enabled": true,              // Master switch
      "jsonScannerEnabled": true,   // Per-service switch
      "toolManagerEnabled": true    // Per-service switch
    }
  }
}
```
**Problem:** If `autoScan.enabled: false`, why have per-service flags? If master is off, all are off.

**Fix:** Either:
- Option A: Remove master `enabled`, keep per-service flags
- Option B: Keep master `enabled`, remove per-service (enable all or nothing)

**Recommendation:** Keep per-service flags (more granular control)

---

### 5. enableDetailedLogging hardcoded (CONFIGURATION)
**Location:** `BRK_CNC_CORE/config/index.js` line 37
```javascript
app: {
  enableDetailedLogging: true,  // Always true, never configurable
}
```
**Problem:** Hardcoded to true, but should be configurable per environment (verbose in dev, quiet in production)

**Fix:** Read from user config advanced settings or environment variable

---

## Summary

| Issue | Type | Impact | Fix Priority |
|-------|------|--------|--------------|
| Module enabled vs mode | CONTRADICTION | High - can create invalid states | 🔴 High |
| Redundant mode string | REDUNDANCY | Low - just extra code | 🟡 Medium |
| testMode vs demoMode mixing | CONFUSION | Medium - unclear intent | 🟡 Medium |
| AutoScan nested flags | REDUNDANCY | Low - over-engineered | 🟢 Low |
| Hardcoded logging | CONFIGURATION | Low - works but inflexible | 🟢 Low |

## Recommended Fixes

1. **Module configuration** - Use single mode property:
```javascript
mode: "enabled" | "disabled" | "auto"
// enabled = manual mode, runs when triggered
// disabled = off completely
// auto = automatic processing
```

2. **Central config** - Remove redundant mode string:
```javascript
app: {
  autoMode: boolean,  // Keep only this
  testMode: boolean,  // Keep only this
  // Remove: mode string
}
```

3. **Separate concerns** - Don't mix testMode and demoMode:
```javascript
demoMode: boolean,  // From wizard - "customer hasn't configured production"
testMode: boolean,  // From code - "using test data for development"
```

4. **AutoScan** - Keep only per-service flags:
```javascript
autoScan: {
  interval: 60,
  runOnStartup: true,
  services: {
    jsonScanner: boolean,
    toolManager: boolean,
    analyzer: boolean
  }
}
```

5. **Logging** - Make configurable:
```javascript
enableDetailedLogging: userConfig?.advanced?.detailedLogging ?? (testMode ? true : false)
```
