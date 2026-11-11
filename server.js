const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleApiRequest } = require('./api-handler');

const PORT = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, 'public');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/markdown', '.png': 'image/png' };

function send(response, status, body, type = 'application/json') {
  response.writeHead(status, { 'Content-Type': `${type}; charset=utf-8` });
  response.end(type === 'application/json' ? JSON.stringify(body) : body);
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'POST' && (request.url === '/api/organize' || request.url === '/api/search')) {
    return handleApiRequest(request, response, request.url.endsWith('/search') ? 'search' : 'organize');
  }

  const requested = request.url === '/' ? '/index.html' : request.url;
  const file = path.join(publicDir, requested.replace(/^\/+/, ''));
  if (!file.startsWith(publicDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(response, 404, { error: 'Not found' });
  send(response, 200, fs.readFileSync(file), types[path.extname(file)] || 'application/octet-stream');
});

server.listen(PORT, () => console.log(`Club Time is running at http://localhost:${PORT}`));
