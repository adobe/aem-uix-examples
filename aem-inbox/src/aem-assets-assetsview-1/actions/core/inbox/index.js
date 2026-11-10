const validateRequest = require('./validation')
const requestWorkflow = require('./workflow')

async function main (params = {}) {
  const request = validateRequest(params)
  if (request.statusCode) return request
  return requestWorkflow(request)
}

exports.main = main
