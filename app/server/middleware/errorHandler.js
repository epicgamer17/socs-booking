/**
 * Global async error handler.
 * Wrap route handlers with this so thrown errors return 500 instead of crashing.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function errorHandler(err, req, res, _next) {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { asyncHandler, errorHandler };
