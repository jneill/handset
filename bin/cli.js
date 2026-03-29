#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
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
