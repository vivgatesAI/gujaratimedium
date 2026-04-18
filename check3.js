const fs = require('fs');
const c = fs.readFileSync('C:/Users/vivek/.openclaw/workspace/ai-course-gujarati/index.html', 'utf8');
const s = c.indexOf('<script>') + 8;
const e = c.indexOf('</script>');
const j = c.substring(s, e);
const ls = j.split('\n');

// Find lines with smart/curly quotes or apostrophes inside single-quoted strings
for (let i = 0; i < ls.length; i++) {
  const l = ls[i];
  // Check for unescaped apostrophes inside single-quoted JS strings
  // Look for pattern: '...text with apostrophe...'
  // which would break JS parsing
  const apoPattern = /(?<![\\'])'(?![\\'])/g;
  
  // Count single quotes to find unbalanced ones
  let inDbl = false, inBacktick = false;
  let singleQuoteCount = 0;
  for (let k = 0; k < l.length; k++) {
    const ch = l[k];
    if (ch === '\\' && k < l.length - 1) { k++; continue; }
    if (ch === '"' && !inBacktick) inDbl = !inDbl;
    if (ch === '`') inBacktick = !inBacktick;
    if (ch === "'" && !inDbl && !inBacktick) singleQuoteCount++;
  }
  if (singleQuoteCount % 2 !== 0) {
    console.log('Unbalanced quotes at line', i+1, ':', l.substring(0, 150));
  }
}