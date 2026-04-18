const fs = require('fs');
const c = fs.readFileSync('C:/Users/vivek/.openclaw/workspace/ai-course-gujarati/index.html', 'utf8');
const s = c.indexOf('<script>') + 8;
const e = c.indexOf('</script>');
const j = c.substring(s, e);

// Find where syntax breaks by binary search
let lo = 0, hi = j.length;
while (hi - lo > 10) {
  let mid = Math.floor((lo + hi) / 2);
  try {
    new Function(j.substring(0, mid));
    lo = mid; // still ok
  } catch(ex) {
    hi = mid; // breaks
  }
}

// Now find exact character
for (let i = Math.max(lo - 100, 0); i < hi + 100 && i < j.length; i++) {
  try {
    new Function(j.substring(0, i));
  } catch(ex) {
    const lineNum = j.substring(0, i).split('\n').length;
    const lineStart = j.lastIndexOf('\n', i - 1) + 1;
    const lineEnd = j.indexOf('\n', i);
    const lineContent = j.substring(lineStart, lineEnd > 0 ? lineEnd : i + 50);
    console.log('First breaking position: char', i, 'line', lineNum);
    console.log('Error:', ex.message);
    console.log('Line content:', lineContent.substring(0, 200));

    // Show surrounding lines
    const lines = j.substring(0, i).split('\n');
    const startLine = Math.max(0, lines.length - 5);
    for (let k = startLine; k < lines.length; k++) {
      console.log((k+1) + ': ' + lines[k].substring(0, 200));
    }
    process.exit(0);
  }
}
console.log('No syntax errors found!');