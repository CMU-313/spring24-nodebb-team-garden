const { JSHINT } = require('jshint');
// const { fs } = require('fs');

var http = require('http');
const fs = require('fs');
const path = require('path');
var jsFiles = [];

// from https://medium.com/@fullstacktips/how-to-search-for-a-specific-file-recursively-using-node-js-a6318d31f2fc#:~:text=In%20JavaScript%2C%20you%20can%20use,the%20results%20of%20the%20function.
function searchFiles(directoryPath, fileName) {
    fs.readdir(directoryPath, (err, files) => {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
            // get the file stats
            const filePath = path.join(directoryPath, file);
            fs.stat(filePath, (err, fileStat) => {
                if (err) throw err;

                // if the file is a directory, recursively search the directory
                if (fileStat.isDirectory()) {
                searchFiles(filePath, fileName);
                } else if (file.endsWith(fileName)) {
                // if the file is a match, print it
                    jsFiles.push(filePath);
                }
            });
        });
    });
}

searchFiles('src', '.js');



function readFileToArray(filePath) {
    try {
        // Read the file synchronously
        const data = fs.readFileSync(filePath, 'utf8');
        // Split the contents of the file by newline character to get an array of lines
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


    

http.createServer(function (req, res) {
    const { url } = req;

    // Serve index.html
    fs.readFile('index.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
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
    // Rest of the code...
    res.write('<h1>JSHint - All JS Files</h1>');

    jsFiles.forEach(file => {
        splitPathName = file.split('/').length - 1;
        
    });
    
    jsFiles.forEach(file => {
        // const filePath = path.join(directoryPath, file);
        var source = readFileToArray(file);

        JSHINT(source);
        res.write(`
            <div class="dropdown">
            <button onclick="document.getElementById('myDropdown${file}').classList.toggle('show');" class="dropbtn">${file}</button>
            <div id="myDropdown${file}" class="dropdown-content">
                <pre>${JSON.stringify(JSHINT.data(), null, 4)}</pre>
            </div>
            </div>
        `)
    });
    return res.end();
    });
}).listen(8080);