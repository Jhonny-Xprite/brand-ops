const path = require('path');
const { RegistryLoader } = require('../../core/ids/registry-loader');
const { IncrementalDecisionEngine } = require('../../core/ids/incremental-decision-engine');
const { RegistryUpdater } = require('../../core/ids/registry-updater');
const { FrameworkGovernor } = require('../../core/ids/framework-governor');
const { RegistryHealer } = require('../../core/ids/registry-healer');

async function run() {
  console.log("Initializing Framework Governor...");
  const loader = new RegistryLoader();
  const engine = new IncrementalDecisionEngine(loader);
  const updater = new RegistryUpdater();
  const healer = new RegistryHealer();
  const governor = new FrameworkGovernor(loader, engine, updater, healer);

  console.log("\n=================================");
  console.log("Step 2: *ids health");
  console.log("=================================");
  const health = await governor.healthCheck();
  console.log(JSON.stringify(health, null, 2));

  console.log("\n=================================");
  console.log("Step 3: *ids stats");
  console.log("=================================");
  const stats = await governor.getStats();
  console.log(FrameworkGovernor.formatStatsOutput(stats));

  console.log("\n=================================");
  console.log("Step 4: *ids query {intent}");
  console.log("Intent: 'Create a new PRD template'");
  console.log("=================================");
  const query = await governor.preCheck("Create a new PRD template", "template");
  console.log(FrameworkGovernor.formatPreCheckOutput(query));

  console.log("\n=================================");
  console.log("Step 5: *ids impact {entity-id}");
  console.log("Entity: 'create-doc'");
  console.log("=================================");
  const impact = await governor.impactAnalysis("create-doc");
  console.log(FrameworkGovernor.formatImpactOutput(impact));
  
  console.log("\nEntity: 'aiox-master'");
  const impact2 = await governor.impactAnalysis("aiox-master");
  console.log(FrameworkGovernor.formatImpactOutput(impact2));
}

run().catch(console.error);
