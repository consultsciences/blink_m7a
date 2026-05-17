import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_CSS_PATH = path.resolve(__dirname, '../src/index.css');
// Fallback array to check config files mentioned across the setup
const CONFIG_PATHS = [
  path.resolve(__dirname, '../tailwind.config.cjs'),
  path.resolve(__dirname, '../tailwind.config.ts')
];

function extractVariablesFromConfig(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to look for var(--variable-name) patterns inside the config
  const varRegex = /var\((--[^)]+)\)/g;
  const variables = new Set();
  let match;
  
  while ((match = varRegex.exec(content)) !== null) {
    // Strip modifiers or fallbacks if present inside the var statement, e.g. var(--name, fallback)
    const varName = match[1].split(',')[0].trim();
    variables.add(varName);
  }
  return Array.from(variables);
}

function extractDefinedVariablesFromCSS(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Global CSS entry point not found at: ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to capture variable declarations like: --variable-name: H S% L%;
  const declRegex = /(--[a-zA-Z0-9_-]+)\s*:/g;
  const definedVars = new Set();
  let match;
  
  while ((match = declRegex.exec(content)) !== null) {
    definedVars.add(match[1].trim());
  }
  return definedVars;
}

function main() {
  console.log('🔍 Validating Tailwind Config Design System against index.css...');
  
  let referencedVars = [];
  let configFound = false;

  for (const configPath of CONFIG_PATHS) {
    if (fs.existsSync(configPath)) {
      referencedVars = referencedVars.concat(extractVariablesFromConfig(configPath));
      configFound = true;
    }
  }

  if (!configFound) {
    console.warn('⚠️ No tailwind configuration file discovered during safety compilation scanning. Skipping validation.');
    process.exit(0);
  }

  // Remove duplicates from combined configs
  referencedVars = Array.from(new Set(referencedVars));

  const definedVars = extractDefinedVariablesFromCSS(INDEX_CSS_PATH);
  const missingVars = referencedVars.filter(v => !definedVars.has(v));

  if (missingVars.length > 0) {
    console.error('\n❌ Undefined CSS variables found in your tailwind configuration:');
    missingVars.forEach(v => console.error(`   👉 ${v}`));
    console.error('\nAdd these missing layout tokens into your src/index.css structural :root rule properties to pass CI/CD pipeline verification.');
    process.exit(1);
  }

  console.log('✅ All CSS variables defined in your tailwind configuration are present in src/index.css.');
  process.exit(0);
}

main();
