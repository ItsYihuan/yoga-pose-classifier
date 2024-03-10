const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

http.createServer(function (request, response) {
    let filePath = '.' + request.url;
    if (filePath === './') {
        filePath = './view.html'; // 將根路徑設置為 view.html
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        // 添加其他可能的 MIME 類型
    };

    const contentTypeHeader = contentType[extname] || 'text/plain';

    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code === 'ENOENT') {
                fs.readFile('./404.html', function (error, content) {
                    response.writeHead(404, { 'Content-Type': 'text/html' });
                    response.end(content, 'utf-8');
                });
            } else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                response.end();
            }
        } else {
            response.writeHead(200, { 'Content-Type': contentTypeHeader });
            response.end(content, 'utf-8');
        }
    });

}).listen(PORT);

console.log('Server running at http://localhost:8080/');