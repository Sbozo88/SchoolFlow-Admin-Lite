const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { search: /SchoolFlow Admin LITE/g, replace: 'SchoolFlow Admin Lite' },
  { search: /SchoolFlow Lite/g, replace: 'SchoolFlow Admin Lite' },
  { search: /SchoolFlow Admin(?!\sLite)/g, replace: 'SchoolFlow Admin Lite' },
  { search: /Loading SchoolFlow(?!\sAdmin Lite)/g, replace: 'Loading SchoolFlow Admin Lite' },
  { search: /Opening SchoolFlow(?!\sAdmin Lite)/g, replace: 'Opening SchoolFlow Admin Lite' },
  { search: /SchoolFlow Setup Sprint/g, replace: 'SchoolFlow Admin Lite Setup Sprint' },
  { search: /Closing your SchoolFlow admin session/g, replace: 'Closing your SchoolFlow Admin Lite session' },
  { search: /Securing your SchoolFlow session/g, replace: 'Securing your SchoolFlow Admin Lite session' }
];

function walkDir(dir) {
  let files = fs.readdirSync(dir);
  for (let file of files) {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.svg')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      for (let r of replacements) {
        newContent = newContent.replace(r.search, r.replace);
      }
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(srcDir);
console.log('Done.');
