const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace Expo's generated favicon.ico link with our frog SVG
html = html.replace(
  '<link rel="icon" href="/favicon.ico"/>',
  '<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>'
);
// Also handle with space before />
html = html.replace(
  '<link rel="icon" href="/favicon.ico" />',
  '<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>'
);

fs.writeFileSync(htmlPath, html);
console.log('postbuild: favicon patched to /favicon.svg');
