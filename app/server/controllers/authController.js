const bcrypt = require('bcrypt');
const db = require('../db/db');
const { signToken } = require('../middleware/auth');

const MCGILL_REGEX = /^[^@]+@(mcgill\.ca|mail\.mcgill\.ca)$/i;
const OWNER_REGEX = /^[^@]+@mcgill\.ca$/i;

async function register(req, res) {
  const { email, password, display_name } = req.body;

  if (!email || !password || !display_name) {
    return res.status(400).json({ error: 'email, password, and display_name are required' });
  }
  if (!MCGILL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Only McGill emails can register' });
  }

  const is_owner = OWNER_REGEX.test(email);
  const password_hash = await bcrypt.hash(password, 10);

  try {
    const [result] = await db.execute(
      'INSERT INTO users (email, password_hash, display_name, is_owner) VALUES (?, ?, ?, ?)',
      [email.toLowerCase(), password_hash, display_name, is_owner]
    );
    const user = { id: result.insertId, email: email.toLowerCase(), is_owner };
    return res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw err;
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.json({
    token: signToken(user),
    user: { id: user.id, email: user.email, display_name: user.display_name, is_owner: user.is_owner },
  });
}

async function me(req, res) {
  const [rows] = await db.execute(
    'SELECT id, email, display_name, is_owner, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
  return res.json(rows[0]);
}

module.exports = { register, login, me };
