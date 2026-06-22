// Tiny dependency-free static server with caching disabled, so a browser refresh
// always picks up the latest build (no stale bundle.js).
//   node serve.js <port> <directory>
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = parseInt(process.argv[2] || '8091', 10);
const dir = path.resolve(process.argv[3] || '.');

const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.join(dir, urlPath);

    // prevent path traversal outside the served directory
    if (!filePath.startsWith(dir)) {
        res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, {
            'Content-Type': types[path.extname(filePath)] || 'application/octet-stream',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.end(data);
    });
}).listen(port, () => {
    console.log(`serving ${dir} at http://localhost:${port}/ (no-cache)`);
});
