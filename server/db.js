const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Default initial data
const defaultData = () => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('TruexAdmin2026!', salt);

  return {
    users: [
      {
        id: 'usr_admin_01',
        email: 'admin@truexinsulation.com',
        name: 'TRUEX Administrator',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      }
    ],
    projects: [],
    failedAttempts: {},
    resetTokens: []
  };
};

const getDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = defaultData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return defaultData();
  }
};

const saveDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
};

module.exports = {
  getDb,
  saveDb
};
