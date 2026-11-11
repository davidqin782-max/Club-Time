const { handleApiRequest } = require('../api-handler');

module.exports = (request, response) => handleApiRequest(request, response, 'organize');
