const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, saveDb } = require('./db');
const { requireAuth, JWT_SECRET } = require('./middleware/requireAuth');

const router = express.Router();

// Track failed login attempts in memory
const failedAttempts = {};

// Clean old lockout records periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(failedAttempts).forEach(key => {
    if (now - failedAttempts[key].lastAttempt > 15 * 60 * 1000) {
      delete failedAttempts[key];
    }
  });
}, 5 * 60 * 1000);

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password, rememberMe } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const key = `${ip}_${(email || '').toLowerCase().trim()}`;

  const now = Date.now();
  const attemptRecord = failedAttempts[key] || { count: 0, lastAttempt: 0 };

  // Lockout check: if failed >= 5 times in 15 minutes
  if (attemptRecord.count >= 5 && (now - attemptRecord.lastAttempt < 15 * 60 * 1000)) {
    const minutesLeft = Math.ceil((15 * 60 * 1000 - (now - attemptRecord.lastAttempt)) / 60000);
    return res.status(429).json({ 
      error: `Too many failed attempts. Please try again in ${minutesLeft} minute(s).` 
    });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  const db = getDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    failedAttempts[key] = { count: attemptRecord.count + 1, lastAttempt: now };
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const passwordValid = bcrypt.compareSync(password, user.passwordHash);

  if (!passwordValid) {
    failedAttempts[key] = { count: attemptRecord.count + 1, lastAttempt: now };
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Clear failed attempt counter on success
  delete failedAttempts[key];

  // Expiration: 30 days if rememberMe is checked, 24 hours otherwise
  const expiresIn = rememberMe ? '30d' : '24h';
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role || 'ADMIN' 
    },
    JWT_SECRET,
    { expiresIn }
  );

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'ADMIN'
    }
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  
  // Generic success message to prevent user enumeration
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const db = getDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (user) {
    const resetToken = jwt.sign({ id: user.id, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '1h' });
    db.resetTokens = [...(db.resetTokens || []), { userId: user.id, token: resetToken, createdAt: new Date().toISOString() }];
    saveDb(db);
  }

  return res.json({
    message: 'If an authorized account matches that email address, a secure password reset link has been dispatched.'
  });
});

module.exports = router;
