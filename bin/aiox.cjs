#!/usr/bin/env node

/**
 * AIOX Master CLI v2.1.0
 * Entry point for all AIOX operations.
 *
 * Dynamically loads command modules from .aiox-core/cli/commands/
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Get the root directory of the project
const ROOT_DIR = path.resolve(__dirname, '..');
const AIOX_CORE = path.join(ROOT_DIR, '.aiox-core');
const COMMANDS_DIR = path.join(AIOX_CORE, 'cli', 'commands');

// Load commander from .aiox-core to ensure compatibility (v12.x)
const { Command } = require(path.join(AIOX_CORE, 'node_modules', 'commander'));

const program = new Command();
const VERSION = '2.1.0';

program
  .name('aiox')
  .description('AIOX Master Orchestrator CLI')
  .version(VERSION);

// --- Built-in Core Commands ---

program
  .command('doctor')
  .description('Diagnose project health and AIOX setup')
  .action(() => {
    console.log('\n📋 AIOX Project Diagnosis\n');

    const checks = [
      { name: '.aiox-core structure', path: AIOX_CORE, type: 'dir' },
      { name: 'docs/ folder', path: path.join(ROOT_DIR, 'docs'), type: 'dir' },
      { name: '.claude/CLAUDE.md', path: path.join(ROOT_DIR, '.claude', 'CLAUDE.md'), type: 'file' },
      { name: '.env configuration', path: path.join(ROOT_DIR, '.env'), type: 'file' },
    ];

    let allGood = true;
    checks.forEach(check => {
      const exists = fs.existsSync(check.path);
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${check.name}`);
      if (!exists) allGood = false;
    });

    console.log('');
    process.exit(allGood ? 0 : 1);
  });

program
  .command('init')
  .description('Initialize a new AIOX project structure')
  .action(() => {
    console.log('\n🚀 Initializing AIOX Project\n');

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
        console.log(`  ✅ Created ${dir}`);
      }
    });

    console.log('\n✨ AIOX Project initialized successfully\n');
  });

program
  .command('validate')
  .description('Validate AIOX project structure')
  .action(() => {
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
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${dir}`);
      if (!exists) allValid = false;
    });

    console.log('');
    process.exit(allValid ? 0 : 1);
  });

// --- Dynamic Command Loading ---

function loadDynamicCommands() {
  if (!fs.existsSync(COMMANDS_DIR)) return;

  const commandDirs = fs.readdirSync(COMMANDS_DIR).filter(file => {
    return fs.statSync(path.join(COMMANDS_DIR, file)).isDirectory();
  });

  for (const dir of commandDirs) {
    try {
      const cmdPath = path.join(COMMANDS_DIR, dir, 'index.js');
      if (fs.existsSync(cmdPath)) {
        const cmdModule = require(cmdPath);
        
        // Match the pattern: find a function that returns a Command (create...Command)
        const factoryKey = Object.keys(cmdModule).find(key => 
          key.startsWith('create') && key.endsWith('Command')
        );

        if (factoryKey && typeof cmdModule[factoryKey] === 'function') {
          const subcommand = cmdModule[factoryKey]();
          program.addCommand(subcommand);
        }
      }
    } catch (err) {
      // Metrics often fails due to missing dependencies, so let's log only on verbose or skip
      if (process.env.VERBOSE) {
        console.warn(`⚠️  Failed to load command group "${dir}": ${err.message}`);
      }
    }
  }
}

// Load external commands
loadDynamicCommands();

// Execute
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
