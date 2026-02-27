const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const before = html;

// Replace any <link rel="icon" ...favicon.ico...> with SVG version
html = html.replace(
  /<link rel="icon"[^>]*favicon\.ico[^>]*\/?>/,
  '<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>'
);

if (html === before) {
  console.warn('postbuild WARNING: favicon link not found in HTML — no replacement made');
  console.warn('HTML head snippet:', html.slice(html.indexOf('<head>'), html.indexOf('</head>') + 7));
} else {
  console.log('postbuild: favicon patched to /favicon.svg');
}

fs.writeFileSync(htmlPath, html);
