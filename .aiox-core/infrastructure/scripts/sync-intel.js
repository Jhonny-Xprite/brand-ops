const path = require('path');
const { RegistrySyncer } = require('../../core/code-intel/registry-syncer');

async function syncIntel() {
  console.log("Initializing Registry Syncer (Intel Enrichment)...");
  try {
    const syncer = new RegistrySyncer();
    const stats = await syncer.sync({ full: true });
    console.log("\nSync Complete:");
    console.log(JSON.stringify(stats, null, 2));
  } catch (err) {
    console.error("Intel Sync failed:", err.message);
  }
}

syncIntel().catch(console.error);
