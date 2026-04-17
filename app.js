const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const marked = require('marked');

const app = express();
const port = 3000;

// Serve static files from 'public' directory
app.use(express.static('public'));

// Vulnerability 1: Command Injection
// Snyk will flag the use of 'exec' with unsanitized user input
app.get('/api/ping', (req, res) => {
    const target = req.query.target || '8.8.8.8';
    
    exec('ping -c 1 ' + target, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.send(stdout);
    });
});

// Vulnerability 2: Directory / Path Traversal
// Snyk will flag the direct use of user input in 'fs.readFile'
app.get('/api/read', (req, res) => {
    const filename = req.query.file;
    
    fs.readFile('./' + filename, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('File not found');
        }
        res.send(data);
    });
});

// Vulnerability 3: XSS via vulnerable dependency
// Snyk will flag the 'marked' package in package.json
app.get('/api/render', (req, res) => {
    const markdownStr = req.query.text || '# Hello Snyk';
    const html = marked(markdownStr);
    res.send(html);
});

app.listen(port, () => {
    console.log(`Vulnerable app listening at http://localhost:${port}`);
});