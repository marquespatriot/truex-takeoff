const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const defaultData = () => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('truexinsulatioN@', salt);

  return {
    users: [
      {
        id: 'usr_admin_01',
        email: 'truexadmin',
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
    const parsed = JSON.parse(raw);

    // Update admin user credentials to match user request
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync('truexinsulatioN@', salt);
    
    parsed.users = [
      {
        id: 'usr_admin_01',
        email: 'truexadmin',
        name: 'TRUEX Administrator',
        passwordHash: newHash,
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      }
    ];

    fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
    return parsed;
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
