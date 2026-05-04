const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(f, 'utf8');
h = h.replace(/<link rel="icon" href="data:image\/svg\+xml,[^"]*"/, '<link rel="icon" href="data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>&#x1F3D7;&#xFE0F;</text></svg>"');
fs.writeFileSync(f, h, 'utf8');
console.log('Fixed favicon');