const { organizeClub, findSimilarClubs } = require('./ai');

function send(response, status, body) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function readBody(request) {
  if (request.body && typeof request.body === 'object') return Promise.resolve(request.body);
  return new Promise((resolve, reject) => {
    let data = '';
    request.on('data', chunk => {
      data += chunk;
      if (data.length > 100000) reject(new Error('Description is too long.'));
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        reject(new Error('Invalid request.'));
      }
    });
    request.on('error', reject);
  });
}

async function handleApiRequest(request, response, route) {
  if (request.method !== 'POST') return send(response, 405, { error: 'Method not allowed.' });

  try {
    const body = await readBody(request);
    if (route === 'organize') {
      const { description } = body;
      if (!description || description.trim().length < 10) return send(response, 400, { error: 'Please add a little more detail about the club.' });
      const club = await organizeClub(description.trim());
      if (club.blocked) return send(response, 400, { blocked: true, error: 'This club cannot be published because it asks to ignore school rules or claim approval.' });
      return send(response, 200, club);
    }

    if (route === 'search') {
      const { query, clubs } = body;
      if (!query || query.trim().length < 2 || !Array.isArray(clubs)) return send(response, 400, { error: 'Please enter an interest to search for.' });
      return send(response, 200, await findSimilarClubs(query.trim(), clubs));
    }

    return send(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(`AI ${route} failed:`, error.message);
    const message = route === 'search'
      ? 'I could not run the AI search right now. Please check the key and your internet connection, then try again.'
      : 'I could not organize that club right now. Please check the key and your internet connection, then try again.';
    return send(response, 502, { error: message });
  }
}

module.exports = { handleApiRequest };
