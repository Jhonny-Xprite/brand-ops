const fs = require('fs');
const path = require('path');

const agentsDir = path.join(process.cwd(), '.aiox-core', 'development', 'agents');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Pattern to find the yaml block
  const yamlRegex = /```yaml([\s\S]*?)```/;
  const match = content.match(yamlRegex);
  
  if (!match) return;

  let yamlContent = match[1];
  let newYaml = yamlContent;

  // 1. Fix dependency paths (remove tasks/, checklists/, workflows/ from path field)
  newYaml = newYaml.replace(/path:\s*["']?(?:tasks\/|checklists\/|workflows\/|tasks\/tasks\/|checklists\/checklists\/)([a-zA-Z0-9.\-_]+\.(?:md|yaml|yml))["']?/g, 'path: "$1"');

  // 2. Fix command format (string to object)
  // Matches: - "*command - Description"
  const commandListRegex = /commands:\s*\n((?:\s*- ["'].*["']\n?)+)/;
  const commandMatch = newYaml.match(commandListRegex);
  if (commandMatch) {
    let oldCommandsBlock = commandMatch[1];
    let lines = oldCommandsBlock.split('\n');
    let newCommandsBlock = '';
    
    for (let line of lines) {
      if (!line.trim()) continue;
      
      // Extract command and description
      // Matches - "*cmd - desc" or - "*cmd: desc"
      const cmdParts = line.match(/- ["']\*([a-zA-Z0-9.\-_]+)\s*[:\-]\s*(.*)["']/);
      if (cmdParts) {
        const name = cmdParts[1];
        const desc = cmdParts[2].replace(/"/g, '\\"');
        const indent = line.match(/^(\s*)/)[1];
        newCommandsBlock += `${indent}- name: ${name}\n${indent}  description: "${desc}"\n`;
      } else {
        newCommandsBlock += line + '\n';
      }
    }
    
    if (newCommandsBlock !== oldCommandsBlock) {
      newYaml = newYaml.replace(oldCommandsBlock, newCommandsBlock);
    }
  }

  // 3. Add autoClaude if missing (v2 to v3 improvement)
  if (!newYaml.includes('autoClaude:')) {
    newYaml += '\nautoClaude:\n  version: "3.0"\n  migratedAt: "' + new Date().toISOString() + '"\n';
  }

  if (newYaml !== yamlContent) {
    content = content.replace(yamlContent, newYaml);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${path.basename(filePath)}`);
  }
}

const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
files.forEach(f => {
  try {
    processFile(path.join(agentsDir, f));
  } catch (e) {
    console.error(`Error processing ${f}: ${e.message}`);
  }
});

console.log('Final fix complete.');
