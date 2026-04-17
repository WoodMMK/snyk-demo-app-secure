const express = require('express');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const app = express();
const port = 3000;

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

app.use(express.static('public'));

app.get('/api/ping', (req, res) => {
    const target = req.query.target || '8.8.8.8';
    
    execFile('ping', ['-c', '1', target], (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.send(stdout);
    });
});

app.get('/api/read', (req, res) => {
    const filename = req.query.file;
    
    if (!filename) {
        return res.status(400).send('Filename is required');
    }

    const safeName = path.basename(filename);
    const filePath = path.join(__dirname, safeName);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('File not found');
        }
        res.send(data);
    });
});

app.get('/api/render', (req, res) => {
    const markdownStr = req.query.text || '# Hello Snyk';
    const rawHtml = marked.parse(markdownStr);
    
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    
    res.send(cleanHtml);
});

app.listen(port, () => {
    console.log(`Secure app listening at http://localhost:${port}`);
});