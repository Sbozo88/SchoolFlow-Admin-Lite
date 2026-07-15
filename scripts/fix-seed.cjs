const fs = require('fs');

const path = './src/utils/seedData.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/new Date\(\)/g, 'new Date().toISOString()');
content = content.replace(/new Date\("([^"]+)"\)/g, 'new Date("$1").toISOString()');
content = content.replace(/new Date\(Date\.now\(\) ([^)]+)\)/g, 'new Date(Date.now() $1).toISOString()');

// There might be some duplicate .toISOString().toISOString()
content = content.replace(/\.toISOString\(\)\.toISOString\(\)/g, '.toISOString()');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed dates in seedData.ts');
