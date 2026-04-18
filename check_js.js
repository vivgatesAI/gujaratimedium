const fs = require('fs');
const c = fs.readFileSync('C:/Users/vivek/.openclaw/workspace/ai-course-gujarati/index.html', 'utf8');
const s = c.indexOf('<script>') + 8;
const e = c.indexOf('</script>');
const j = c.substring(s, e);
const ls = j.split('\n');

// Check for unclosed backticks across lines
let inBacktick = false;
let backtickStart = -1;
for (let i = 0; i < ls.length; i++) {
  for (const ch of ls[i]) {
    if (ch === '`') {
      if (!inBacktick) { inBacktick = true; backtickStart = i + 1; }
      else { inBacktick = false; }
    }
  }
}
if (inBacktick) console.log('Unclosed backtick starting at line', backtickStart);

// Check for lines with 's that might be contractions inside strings
// Search for the 's pattern that might break
for (let i = 0; i < ls.length; i++) {
  const line = ls[i];
  if (line.includes("'s ") || line.includes("'s'") || line.includes("it's") || line.includes("let's")) {
    // Check if it's inside a string
    const idx = line.indexOf("'s");
    // Count quotes before to see if we're inside a string
    const before = line.substring(0, idx);
    const singleQuotes = (before.match(/'/g) || []).length;
    if (singleQuotes % 2 === 0) {
      // We're not inside a single-quoted string. This 's breaks things if it's a JS string delimiter
      // But this might be inside double-quotes or backticks
      const dblQuotes = (before.match(/"/g) || []).length;
      const bticks = (before.match(/`/g) || []).length;
      if (dblQuotes % 2 === 0 && bticks % 2 === 0) {
        console.log('Potential issue line', i+1, ':', line.substring(0, 150));
      }
    }
  }
}

// Also check for apostrophe in string literals that breaks things
console.log('\n--- Checking for unmatched quotes ---');
let inSingle = false, inDouble = false, inTick = false;
for (let i = 0; i < ls.length; i++) {
  const line = ls[i];
  for (let k = 0; k < line.length; k++) {
    const ch = line[k];
    const prev = k > 0 ? line[k-1] : '';
    if (prev === '\\') continue;
    if (ch === "'" && !inDouble && !inTick) inSingle = !inSingle;
    if (ch === '"' && !inSingle && !inTick) inDouble = !inDouble;
    if (ch === '`' && !inSingle && !inDouble) inTick = !inTick;
  }
  if (i < 5) continue;
  // At end of each line (outside of template), single quotes should be even
}

// Try slicing to find where it breaks
let cumulative = '';
let lastOkLine = 0;
for (let i = 0; i < ls.length; i++) {
  cumulative += (i > 0 ? '\n' : '') + ls[i];
  // Only check every 50 lines
  if (i % 50 === 0 || i === ls.length - 1) {
    try {
      new Function(cumulative);
      lastOkLine = i + 1;
    } catch(ex) {
      // Find exact line
      let subcum = '';
      let startCheck = Math.max(0, i - 49);
      // Rebuild from startCheck
      subcum = ls.slice(0, startCheck).join('\n');
      for (let j = startCheck; j <= i; j++) {
        subcum += '\n' + ls[j];
        try {
          new Function(subcum);
        } catch(e2) {
          console.log('Breaks at line', j+1, ':', ls[j].substring(0, 150));
          console.log('Error:', e2.message);
          process.exit(0);
        }
      }
    }
  }
}