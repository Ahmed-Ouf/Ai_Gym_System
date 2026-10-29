---
name: reverse-engineer-anything
description: >-
  Reverse engineer applications, packaged artifacts, Electron/JavaScript bundles,
  managed assemblies, browser targets, and native binaries using evidence-based
  inspection workflows (from morluto/rea). Use this skill when the user asks to
  inspect, decompile, reconstruct, or reverse engineer shipped artifacts or runtime
  behavior without original source code.
---

# Reverse Engineer Anything (REA)

Source: [`morluto/rea`](https://github.com/morluto/rea)

Use shipped-artifact and runtime evidence to explain features, audit behavior, or reconstruct functionality from compiled binaries, bundles, or packaged applications.

## When to Use vs. Skip

- **Use** when a claim or task depends on shipped binaries, packaged apps (Electron/ASAR, APK, IPA, .NET assemblies), minified/bundled JavaScript, firmware, or live runtime behavior.
- **Skip** for ordinary source-repository architecture reviews where full unminified source code is already present in the workspace.

## Core Workflow

1. **Identify the Target Artifact**
   - Classify the input target:
     - **Native binary** (ELF, PE/EXE/DLL, Mach-O)
     - **Managed binary** (.NET assembly, JVM bytecode / JAR / DEX)
     - **Packaged desktop/web bundle** (Electron `.asar`, Webpack/Vite/Rollup bundle, source maps)
     - **Mobile package** (Android `.apk`/`.aab`, iOS `.ipa`)
     - **Live runtime / browser target** (network traces, DOM/state inspection, IPC channels)

2. **Extract Structural Metadata First**
   - Inspect file headers, entry points, exported/imported symbols, embedded strings, manifest files (`package.json`, `AndroidManifest.xml`, `Info.plist`), and resource tables before deep decompilation.
   - Locate high-signal anchors: URLs, API route patterns, IPC channel names, cryptographic constants, error strings, and configuration keys.

3. **Trace Control and Data Flow**
   - **JavaScript / Electron Bundles**:
     - Check for embedded or adjacent `.map` source maps first.
     - Identify module boundaries, IPC handlers (`ipcMain.handle`, `ipcRenderer.invoke`), preload scripts, and network client wrappers.
   - **Native & Managed Binaries**:
     - Cross-reference string literals and symbol imports to locate the target subsystem functions.
     - Reconstruct call graphs around target entry points and decompile only the relevant functions rather than dumping entire binaries.

4. **Evidence-Driven Reporting & Reconstruction**
   - Back every architectural or behavioral claim with concrete artifact evidence (e.g., symbol name, offset/module path, string reference, or IPC message signature).
   - Explicitly distinguish between **verified facts** (directly observed in instructions/bundles) and **inferences** (hypotheses about stripped symbol names or external server behavior).
   - When reconstructing a feature into clean source code, preserve exact protocol contracts, payload schemas, and edge-case guards observed in the artifact.

