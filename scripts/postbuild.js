const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Replace favicon.ico link with SVG
html = html.replace(
  /<link rel="icon"[^>]*favicon\.ico[^>]*\/?>/,
  '<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>'
);

// 2. Inject PWA / mobile meta tags before </head>
const pwaMeta = [
  '<meta name="mobile-web-app-capable" content="yes"/>',
  '<meta name="apple-mobile-web-app-capable" content="yes"/>',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>',
  '<meta name="apple-mobile-web-app-title" content="Eat the Frog"/>',
  '<meta name="theme-color" content="#0F0F12"/>',
].join('');

if (!html.includes('apple-mobile-web-app-capable')) {
  html = html.replace('</head>', pwaMeta + '</head>');
}

// 3. Ensure viewport includes viewport-fit=cover
html = html.replace(
  /content="width=device-width, initial-scale=1, shrink-to-fit=no"/,
  'content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"'
);

fs.writeFileSync(htmlPath, html);
console.log('postbuild: favicon + PWA meta tags patched');
