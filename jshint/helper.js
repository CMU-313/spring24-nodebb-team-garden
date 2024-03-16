'use strict';

const { JSHINT } = require('jshint');
const http = require('http');
const fs = require('fs');
const path = require('path');

const jsFiles = [];

function searchFiles(directoryPath, fileName) {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return console.log(`Unable to scan directory: ${err}`);
        }

        files.forEach(async (file) => {
            const filePath = path.join(directoryPath, file);
            fs.stat(filePath, (err, fileStat) => {
                if (err) throw err;

                if (fileStat.isDirectory()) {
                    searchFiles(filePath, fileName);
                } else if (file.endsWith(fileName)) {
                    jsFiles.push(filePath);
                }
            });
        });
    });
}

searchFiles('src', '.js');

function readFileToArray(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n').map(line => line.trim());
        return lines;
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(`File '${filePath}' not found.`);
        } else {
            console.error('Error reading file:', err);
        }
        return [];
    }
}

http.createServer(async (req, res) => {
    fs.readFile('index.html', async (err) => {
        if (err) {
            console.error('Error reading HTML file:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<head>');
        res.write('<style>');
        res.write(`
            h1 {
                color:red
            }
            .dropbtn {
                background-color: #3498DB;
                color: white;
                padding: 16px;
                font-size: 16px;
                border: none;
                cursor: pointer;
                margin: 10px
            }
            .dropdown-content {
                display: none;
                position: absolute;
                background-color: #f1f1f1;
                min-width: 160px;
                box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
                z-index: 1;
            }
            .show {display:block;}
        `);
        res.write('</style>');
        res.write('</head>');
        res.write('<h1>JSHint - All JS Files</h1>');

        jsFiles.forEach((file) => {
            const source = readFileToArray(file);
            JSHINT(source);
            res.write(`
                <div class="dropdown">
                    <button onclick="document.getElementById('myDropdown${file}').classList.toggle('show');" class="dropbtn">${file}</button>
                    <div id="myDropdown${file}" class="dropdown-content">
                        <pre>${JSON.stringify(JSHINT.data(), null, 4)}</pre>
                    </div>
                </div>
            `);
        });
        return res.end();
    });
}).listen(8080);
