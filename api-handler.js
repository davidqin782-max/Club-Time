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

function cleanLocation(value, label, maxLength) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required.`);
  const clean = value.trim();
  if (clean.length > maxLength) throw new Error(`${label} is too long.`);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(clean)) throw new Error(`${label} contains invalid characters.`);
  return clean;
}

async function handleApiRequest(request, response, route) {
  if (request.method !== 'POST') return send(response, 405, { error: 'Method not allowed.' });

  try {
    const body = await readBody(request);
    if (route === 'organize') {
      const { description } = body;
      if (!description || description.trim().length < 10) return send(response, 400, { error: 'Please add a little more detail about the club.' });
      let school;
      let address;
      try {
        school = cleanLocation(body.school, 'School', 120);
        address = cleanLocation(body.address, 'School address', 160);
      } catch (error) {
        return send(response, 400, { error: error.message });
      }
      const club = await organizeClub(description.trim());
      if (club.blocked) return send(response, 400, { blocked: true, error: 'This club cannot be published because it asks to ignore school rules or claim approval.' });
      club.school = school;
      club.address = address;
      return send(response, 200, club);
    }

    if (route === 'search') {
      const { query, clubs } = body;
      if (!query || query.trim().length < 2 || !Array.isArray(clubs)) return send(response, 400, { error: 'Please enter an interest to search for.' });
      return send(response, 200, await findSimilarClubs(query.trim(), clubs));
    }

    return send(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(`AI ${route} failed:`, error.fix || 'No fix was provided.');
    return send(response, 502, { error: { message: error.message || 'The AI could not answer this request.', fix: error.fix || 'Check the server configuration and try again.' } });
  }
}

module.exports = { handleApiRequest };
