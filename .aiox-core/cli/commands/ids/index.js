'use strict';

/**
 * IDS Command Module
 *
 * CLI commands for the Incremental Development System (IDS).
 *
 * @module cli/commands/ids
 * @version 1.0.0
 * @story IDS-7 - aiox-master IDS Governor Integration
 */

const { Command } = require('commander');
const path = require('path');

// Lazy load IDS components
let FrameworkGovernor = null;
let RegistryLoader = null;
let IncrementalDecisionEngine = null;
let RegistryUpdater = null;
let RegistryHealer = null;

function getGovernor() {
  if (!FrameworkGovernor) {
    const coreIdsPath = path.join(__dirname, '..', '..', '..', 'core', 'ids');
    RegistryLoader = require(path.join(coreIdsPath, 'registry-loader')).RegistryLoader;
    IncrementalDecisionEngine = require(path.join(coreIdsPath, 'incremental-decision-engine')).IncrementalDecisionEngine;
    RegistryUpdater = require(path.join(coreIdsPath, 'registry-updater')).RegistryUpdater;
    FrameworkGovernor = require(path.join(coreIdsPath, 'framework-governor')).FrameworkGovernor;

    try {
      RegistryHealer = require(path.join(coreIdsPath, 'registry-healer')).RegistryHealer;
    } catch (err) {
      // Healer optional
    }

    const loader = new RegistryLoader();
    const engine = new IncrementalDecisionEngine(loader);
    const updater = new RegistryUpdater();
    const healer = RegistryHealer ? new RegistryHealer() : null;
    
    return new FrameworkGovernor(loader, engine, updater, healer);
  }
  return FrameworkGovernor;
}

/**
 * Create the IDS command
 * @returns {Command} Commander command instance
 */
function createIdsCommand() {
  const ids = new Command('ids')
    .description('Incremental Development System (IDS) Governor commands');

  ids.command('check <intent>')
    .description('Query registry for REUSE/ADAPT/CREATE recommendations')
    .option('--type <type>', 'Filter by entity type (agent, task, workflow, template, checklist)')
    .action(async (intent, options) => {
      const governor = getGovernor();
      const result = await governor.preCheck(intent, options.type);
      const { FrameworkGovernor: GovClass } = require('../../../core/ids/framework-governor');
      console.log(GovClass.formatPreCheckOutput(result));
    });

  ids.command('impact <entity-id>')
    .description('Show impact analysis for an entity')
    .action(async (entityId) => {
      const governor = getGovernor();
      const result = await governor.impactAnalysis(entityId);
      const { FrameworkGovernor: GovClass } = require('../../../core/ids/framework-governor');
      console.log(GovClass.formatImpactOutput(result));
    });

  ids.command('health')
    .description('Run registry health check')
    .option('--fix', 'Auto-heal repairable issues')
    .action(async (options) => {
      const governor = getGovernor();
      const health = await governor.healthCheck();
      
      console.log('\n📊 IDS Registry Health Check\n');
      console.log(`   Status: ${health.available ? '✅ Active' : '⚠️ Degraded'}`);
      console.log(`   Message: ${health.message || 'Ready'}`);
      
      if (health.basicStats) {
        console.log(`   Entities: ${health.basicStats.entityCount}`);
      }
      
      if (health.summary) {
        console.log(`   Total Issues: ${health.summary.total}`);
        console.log(`   Critical: ${health.summary.bySeverity.critical}`);
        console.log(`   High: ${health.summary.bySeverity.high}`);
        console.log(`   Medium: ${health.summary.bySeverity.medium}`);
        console.log(`   Low: ${health.summary.bySeverity.low}`);
        
        if (options.fix && health.summary.autoHealable > 0) {
          console.log(`\n🔧 Healing ${health.summary.autoHealable} issues...`);
          const healer = governor._healer;
          const result = healer.heal(health.issues, { autoOnly: true });
          console.log(`   Successfully healed ${result.healed.length} items.`);
        } else if (health.summary.autoHealable > 0) {
          console.log(`\n💡 ${health.summary.autoHealable} issues are auto-healable. Run with --fix to repair.`);
        }
      }
      console.log('');
    });

  ids.command('stats')
    .description('Show registry statistics')
    .action(async () => {
      const governor = getGovernor();
      const stats = await governor.getStats();
      const { FrameworkGovernor: GovClass } = require('../../../core/ids/framework-governor');
      console.log(GovClass.formatStatsOutput(stats));
    });

  return ids;
}

module.exports = {
  createIdsCommand
};
