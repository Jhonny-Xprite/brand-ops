const path = require('path');
const { RegistryHealer } = require('../../core/ids/registry-healer');
const { RegistryLoader } = require('../../core/ids/registry-loader');

async function fixRegistry() {
  console.log("Starting IDS Self-Healing...");
  const healer = new RegistryHealer();
  
  // 1. Run Health Check
  const health = await healer.runHealthCheck();
  console.log(`Detected ${health.issues.length} issues.`);

  // 2. Apply Auto-Heal
  if (health.summary.autoHealable > 0) {
    console.log(`Healing ${health.summary.autoHealable} issues...`);
    const result = await healer.heal(health.issues, { autoOnly: true });
    console.log(`Successfully healed ${result.healed.length} items.`);
  }

  // 3. Trigger Intelligence Sync (NOG-2)
  console.log("\nTriggering Registry Intelligence Sync...");
  try {
    // We'll use the existing populate-entity-registry script if available
    const populatePath = path.resolve(__dirname, '../scripts/populate-entity-registry.js');
    if (require('fs').existsSync(populatePath)) {
      console.log("Running populate-entity-registry.js...");
      const { main } = require(populatePath);
      await main();
    } else {
      console.log("Warning: populate-entity-registry.js not found at standard path.");
    }
  } catch (err) {
    console.error("Sync failed:", err.message);
  }

  console.log("\nIDS Recovery Complete.");
}

fixRegistry().catch(console.error);
