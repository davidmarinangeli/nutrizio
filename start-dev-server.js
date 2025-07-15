#!/usr/bin/env node

// Simple Next.js development server launcher
const { spawn } = require('child_process');
const path = require('path');

// Path to the Next.js binary
const nextBinPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

// Start the development server
const child = spawn('node', [nextBinPath, 'dev'], {
  stdio: 'inherit',
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('Error starting development server:', error);
});

child.on('exit', (code) => {
  console.log(`Development server exited with code ${code}`);
});
