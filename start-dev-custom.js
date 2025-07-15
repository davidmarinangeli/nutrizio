#!/usr/bin/env node
// Custom dev server script to bypass permission issues
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Next.js development server...');
console.log('Project directory:', __dirname);

const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
console.log('Next.js binary path:', nextBin);

const child = spawn('node', [nextBin, 'dev'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'development' }
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
});

child.on('exit', (code) => {
  console.log('Server exited with code:', code);
  process.exit(code);
});
