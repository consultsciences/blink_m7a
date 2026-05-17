import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');

// Strictly derived from the engineering design-system rule manual
const FORBIDDEN_PATTERNS = [
  { regex: /\b(bg|text)-white\b/, label: 'Direct White Utility (Use bg-background / text-foreground tokens instead)' },
  { regex: /\b(bg|text)-black\b/, label: 'Direct Black Utility (Use tokenized neutral values instead)' },
  { regex: /\bfrom-purple-\d+\s+to-blue-\d+\b/, label: 'Generic AI Purple-to-Blue Palette Gradient' },
  { regex: /\b(bg|text)-(blue|purple|green)-500\b/, label: 'AI Aesthetic Default Solid Primary Utilities' }
];

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      // Avoid tracking dependency artifacts if nested
      if (file !== 'node_modules' && file !== 'dist') {
        walkDirectory(filepath, callback);
      }
    } else if (/\.(ts|tsx|js|jsx|css)$/.test(file)) {
      callback(filepath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const infractions = [];

  lines.forEach((line, index) => {
    // Skip rule enforcement checks inside systemic agent configuration file definitions
    if (filePath.includes('agent.ts')) return;

    FORBIDDEN_PATTERNS.forEach(pattern => {
      if (pattern.regex.test(line)) {
        infractions.push({
          lineNum: index + 1,
          lineText: line.trim(),
          violation: pattern.label
        });
      }
    });
  });

  return infractions;
}

function main() {
  console.log('🔍 Auditing component structural patterns against Design System rules...');
  let totalViolations = 0;

  if (!fs.existsSync(SRC_DIR)) {
    console.error(`❌ Source directory path missing at ${SRC_DIR}`);
    process.exit(1);
  }

  walkDirectory(SRC_DIR, (filePath) => {
    const violations = scanFile(filePath);
    if (violations.length > 0) {
      const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);
      console.error(`\n⚠️ Structural rule infractions found in [${relativePath}]:`);
      violations.forEach(v => {
        console.error(`   Line ${v.lineNum}: "${v.lineText}"`);
        console.error(`   Rule break: ${v.violation}`);
      });
      totalViolations += violations.length;
    }
  });

  if (totalViolations > 0) {
    console.warn(`\n⚠️ Total Design system infractions detected: ${totalViolations}.`);
    console.log('💡 Note: Clean these rules up to align with your semantic token system layout.');
    // Keep exit code 0 if you want warnings, switch to 1 if you want strict enforcement in your pipeline
    process.exit(0);
  }

  console.log('✅ Design system verification complete. No forbidden static colors discovered.');
  process.exit(0);
}

main();
