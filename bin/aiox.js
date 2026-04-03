#!/usr/bin/env node

/**
 * AIOX Master CLI
 * Entry point para todas as operações AIOX
 *
 * Uso: node bin/aiox.js [command] [args]
 */

const path = require('path');
const fs = require('fs');

// Get the root directory of the project
const ROOT_DIR = path.resolve(__dirname, '..');
const AIOX_CORE = path.join(ROOT_DIR, '.aiox-core');

// Version
const VERSION = '2.0.0';

// Available commands
const COMMANDS = {
  doctor: 'Diagnose project health and AIOX setup',
  init: 'Initialize a new AIOX project',
  graph: 'Visualize dependency graphs',
  validate: 'Validate project structure',
  help: 'Show this help message',
  version: 'Show version',
};

const args = process.argv.slice(2);
const command = args[0] || 'help';

function showHelp() {
  console.log(`
╭─ AIOX Master CLI v${VERSION} ─────────────────────────────────╮
│                                                              │
│  Usage: aiox [command] [options]                           │
│                                                              │
│  Commands:                                                  │
│  ${Object.entries(COMMANDS).map(([cmd, desc]) => `${cmd.padEnd(15)} - ${desc}`).join('\n│  ')}
│                                                              │
│  For detailed help: aiox help [command]                   │
│                                                              │
╰──────────────────────────────────────────────────────────────╯
  `);
}

function doctor() {
  console.log('\n📋 AIOX Project Diagnosis\n');

  const checks = [
    { name: '.aiox-core structure', path: AIOX_CORE, type: 'dir' },
    { name: 'docs/ folder', path: path.join(ROOT_DIR, 'docs'), type: 'dir' },
    { name: '.claude/CLAUDE.md', path: path.join(ROOT_DIR, '.claude/CLAUDE.md'), type: 'file' },
    { name: '.env configuration', path: path.join(ROOT_DIR, '.env'), type: 'file' },
  ];

  let allGood = true;
  checks.forEach(check => {
    const exists = fs.existsSync(check.path);
    const status = exists ? '✓' : '✗';
    console.log(`  ${status} ${check.name}`);
    if (!exists) allGood = false;
  });

  console.log('\n');
  return allGood ? 0 : 1;
}

function validate() {
  console.log('\n🔍 Validating AIOX Structure\n');

  const requiredDirs = [
    '.aiox-core/development/agents',
    '.aiox-core/development/tasks',
    '.aiox-core/development/templates',
    '.aiox-core/development/workflows',
    '.aiox-core/development/checklists',
    'docs/stories',
    'docs/prd',
    'docs/architecture',
    'docs/guides',
  ];

  let allValid = true;
  requiredDirs.forEach(dir => {
    const fullPath = path.join(ROOT_DIR, dir);
    const exists = fs.existsSync(fullPath);
    const status = exists ? '✓' : '✗';
    console.log(`  ${status} ${dir}`);
    if (!exists) allValid = false;
  });

  console.log('\n');
  return allValid ? 0 : 1;
}

function init() {
  console.log('\n🚀 Initializing AIOX Project\n');

  // Create required directories
  const dirs = [
    'docs/stories',
    'docs/prd',
    'docs/architecture',
    'docs/guides',
    'packages',
    'squads',
    'tests',
    'qa',
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✓ Created ${dir}`);
    }
  });

  console.log('\n✅ AIOX Project initialized successfully\n');
  return 0;
}

// Execute command
let exitCode = 0;
switch (command) {
  case 'help':
    showHelp();
    break;
  case 'version':
    console.log(`AIOX v${VERSION}`);
    break;
  case 'doctor':
    exitCode = doctor();
    break;
  case 'validate':
    exitCode = validate();
    break;
  case 'init':
    exitCode = init();
    break;
  default:
    console.error(`\n❌ Unknown command: ${command}\n`);
    showHelp();
    exitCode = 1;
}

process.exit(exitCode);
