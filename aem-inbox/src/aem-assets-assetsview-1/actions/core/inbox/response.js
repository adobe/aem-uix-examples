module.exports = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body
})
