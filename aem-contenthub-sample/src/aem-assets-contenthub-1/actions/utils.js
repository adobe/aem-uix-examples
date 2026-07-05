/*
* <license header>
*/

function errorResponse(statusCode, message) {
  return { statusCode, body: { error: message } };
}

function getBearerToken(params) {
  const authHeader = params.__ow_headers?.authorization || params.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  throw new Error('Missing or invalid authorization header');
}

function checkMissingRequestInputs(params, requiredParams) {
  const missing = requiredParams.filter(param => !params[param]);
  if (missing.length > 0) {
    return `Missing required parameters: ${missing.join(', ')}`;
  }
  return null;
}

module.exports = { errorResponse, getBearerToken, checkMissingRequestInputs };
