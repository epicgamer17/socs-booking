const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

/**
 * Creates a signed JWT for a user.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, is_owner: user.is_owner },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Express middleware — rejects requests without a valid Bearer token.
 * Attaches req.user = { id, email, is_owner }.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  try {
    const payload = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Express middleware — requires req.user.is_owner === true.
 * Must be used after requireAuth.
 */
function requireOwner(req, res, next) {
  if (!req.user?.is_owner) {
    return res.status(403).json({ error: 'Owner access required' });
  }
  next();
}

module.exports = { signToken, requireAuth, requireOwner, JWT_SECRET };
