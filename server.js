const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, req.url);
  const fileStream = fs.createReadStream(filePath);

  fileStream.on('error', () => {
    res.statusCode = 404;
    res.end('File not found');
  });

  // Set Content-Type header based on file extension
  const extname = path.extname(filePath);
  let contentType = 'text/plain';
  switch (extname) {
    case '.html':
      contentType = 'text/html';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.wasm':
      contentType = 'application/wasm';
      break;
  }
  res.setHeader('Content-Type', contentType);

  fileStream.pipe(res);
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});