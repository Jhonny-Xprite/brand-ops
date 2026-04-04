const path = require('path');
const { RegistryLoader } = require('../../core/ids/registry-loader');
const { IncrementalDecisionEngine } = require('../../core/ids/incremental-decision-engine');

async function testQuery() {
  console.log("Testing IDS Query Logic...");
  const loader = new RegistryLoader();
  const engine = new IncrementalDecisionEngine(loader);
  
  const testIntents = [
    "prd",
    "PRD",
    "prd template",
    "template de PRD",
    "Create a new PRD template"
  ];

  for (const intent of testIntents) {
    const result = engine.analyze(intent, { type: 'template' });
    console.log(`\nIntent: "${intent}"`);
    console.log(`Decision: ${result.summary.decision}`);
    console.log(`Matches Found: ${result.summary.matchesFound}`);
    if (result.recommendations.length > 0) {
      result.recommendations.slice(0, 2).forEach(r => {
        console.log(`  - Match: ${r.entityId} (${(r.relevanceScore * 100).toFixed(1)}%) -> ${r.decision}`);
      });
    }
  }
}

testQuery().catch(console.error);
