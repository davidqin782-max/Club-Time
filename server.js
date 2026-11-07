const http = require('http');
const fs = require('fs');
const path = require('path');
const { organizeClub } = require('./ai');

const PORT = 3000;
const publicDir = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/markdown' };

function send(response, status, body, type = 'application/json') {
  response.writeHead(status, { 'Content-Type': `${type}; charset=utf-8` });
  response.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let data = '';
    request.on('data', chunk => { data += chunk; if (data.length > 100000) reject(new Error('Description is too long.')); });
    request.on('end', () => resolve(JSON.parse(data || '{}')));
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/organize') {
    try {
      const { description } = await readBody(request);
      if (!description || description.trim().length < 10) return send(response, 400, { error: 'Please add a little more detail about the club.' });
      const club = await organizeClub(description.trim());
      return send(response, 200, club);
    } catch (error) {
      console.error('AI request failed:', error.message);
      return send(response, 502, { error: 'I could not organize that club right now. Please check the key and your internet connection, then try again.' });
    }
  }

  const requested = request.url === '/' ? '/index.html' : request.url;
  const file = path.join(publicDir, requested.replace(/^\/+/, ''));
  if (!file.startsWith(publicDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(response, 404, { error: 'Not found' });
  send(response, 200, fs.readFileSync(file), types[path.extname(file)] || 'application/octet-stream');
});

server.listen(PORT, () => console.log(`Club Time is running at http://localhost:${PORT}`));
