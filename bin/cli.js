#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Find the electron module directory regardless of hoisting
const electronMod = path.dirname(require.resolve('electron/package.json'));

// On macOS, rename Electron.app to Handset.app and patch Info.plist
// so the dock and menu bar both show "Handset"
if (process.platform === 'darwin') {
  const distDir = path.join(electronMod, 'dist');
  const electronApp = path.join(distDir, 'Electron.app');
  const handsetApp = path.join(distDir, 'Handset.app');

  try {
    // Rename the .app bundle (no-op if already renamed)
    if (fs.existsSync(electronApp)) {
      fs.renameSync(electronApp, handsetApp);
      fs.writeFileSync(path.join(electronMod, 'path.txt'), 'Handset.app/Contents/MacOS/Electron');
    }

    // Copy our icon into the app bundle
    const icnsSource = path.join(__dirname, '..', 'assets', 'icon.icns');
    const resourcesDir = path.join(handsetApp, 'Contents', 'Resources');
    if (fs.existsSync(icnsSource)) {
      fs.copyFileSync(icnsSource, path.join(resourcesDir, 'handset.icns'));
    }

    // Patch Info.plist — name + icon
    const plistPath = path.join(handsetApp, 'Contents', 'Info.plist');
    execSync(`plutil -replace CFBundleName -string "Handset" "${plistPath}"`, { stdio: 'ignore' });
    execSync(`plutil -replace CFBundleDisplayName -string "Handset" "${plistPath}"`, { stdio: 'ignore' });
    execSync(`plutil -replace CFBundleIconFile -string "handset.icns" "${plistPath}"`, { stdio: 'ignore' });
  } catch (_) {
    // Non-fatal — app still works, just shows "Electron" in dock
  }
}

const electron = require('electron');
const mainPath = path.join(__dirname, '..', 'src', 'main.js');

// Pass optional URL argument to Electron via environment variable
const url = process.argv[2];
const env = { ...process.env };
if (url) {
  env.HANDSET_URL = url;
}

const child = spawn(electron, [mainPath], {
  stdio: 'inherit',
  windowsHide: false,
  env
});

child.on('close', (code) => {
  process.exit(code);
});
