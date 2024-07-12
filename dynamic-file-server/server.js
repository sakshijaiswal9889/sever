// server.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 3000;

const server = http.createServer((req, res) => {
    // Normalize the URL to get the file path
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    // Handle directory listing
    fs.stat(filePath, (err, stats) => {
        if (err) {
            // Handle 404 errors
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.end('<h1>404 Not Found</h1>');
            return;
        }

        if (stats.isDirectory()) {
            // Serve directory listing
            fs.readdir(filePath, (err, files) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'text/html');
                    res.end('<h1>500 Internal Server Error</h1>');
                    return;
                }

                // Generate HTML for directory listing
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(generateDirectoryListing(files, req.url));
            });
        } else {
            // Serve file contents
            res.statusCode = 200;
            res.setHeader('Content-Type', getContentType(filePath));
            fs.createReadStream(filePath).pipe(res);
        }
    });
});

// Helper function to generate directory listing HTML
function generateDirectoryListing(files, currentUrl) {
    let html = `<html><head><title>Directory Listing</title></head><body><h1>Directory Listing</h1><ul>`;
    for (const file of files) {
        const filePath = path.join(currentUrl, file);
        const icon = fs.statSync(path.join(__dirname, filePath)).isDirectory() ? '📁' : '📄';
        html += `<li><a href="${filePath}">${icon} ${file}</a></li>`;
    }
    html += `</ul></body></html>`;
    return html;
}

// Helper function to get the MIME type of the file
function getContentType(filePath) {
    const extname = path.extname(filePath);
    switch (extname) {
        case '.html': return 'text/html';
        case '.js': return 'application/javascript';
        case '.css': return 'text/css';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpg': return 'image/jpeg';
        case '.gif': return 'image/gif';
        default: return 'application/octet-stream';
    }
}

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
