const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./auth');
const { requireAuth } = require('./middleware/requireAuth');
const { getDb, saveDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads folder exists for cloud photo storage
const UPLOADS_DIR = path.join(__dirname, 'data/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Security & CORS
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:5173', 'http://localhost:5174', 'https://measure.truexinsulation.net'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow domain fallback
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving for Cloud Photo Storage
app.use('/uploads', express.static(UPLOADS_DIR));

// Auth Routes
app.use('/api/auth', authRoutes);

// --- PROTECTED CLOUD DATABASE ENDPOINTS ---

// GET /api/projects -> Fetch all user projects from Cloud DB
app.get('/api/projects', requireAuth, (req, res) => {
  const db = getDb();
  res.json({ 
    projects: db.projects || [],
    serverTime: new Date().toISOString()
  });
});

// POST /api/projects/sync -> Sync / Batch Update Cloud DB
app.post('/api/projects/sync', requireAuth, (req, res) => {
  const db = getDb();
  const clientProjects = req.body.projects || [];
  
  // Merge client projects with server database using timestamp conflict resolution
  const serverProjectsMap = new Map((db.projects || []).map(p => [p.id, p]));

  clientProjects.forEach(clientProj => {
    const existing = serverProjectsMap.get(clientProj.id);
    if (!existing) {
      serverProjectsMap.set(clientProj.id, clientProj);
    } else {
      // Keep newer update timestamp
      const clientTime = new Date(clientProj.info?.updatedAt || clientProj.updatedAt || 0).getTime();
      const serverTime = new Date(existing.info?.updatedAt || existing.updatedAt || 0).getTime();

      if (clientTime >= serverTime) {
        serverProjectsMap.set(clientProj.id, clientProj);
      }
    }
  });

  const mergedProjects = Array.from(serverProjectsMap.values());
  db.projects = mergedProjects;
  saveDb(db);

  res.json({
    message: 'Cloud database synced successfully',
    projects: mergedProjects,
    syncedCount: mergedProjects.length,
    serverTime: new Date().toISOString()
  });
});

// POST /api/photos/upload -> Cloud Photo Upload Endpoint
app.post('/api/photos/upload', requireAuth, (req, res) => {
  try {
    const { imageBase64, caption } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image string' });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const filepath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filepath, buffer);

    const hostUrl = req.protocol + '://' + req.get('host');
    const cloudPhotoUrl = `${hostUrl}/uploads/${filename}`;

    res.json({
      id: `photo_${Date.now()}`,
      url: cloudPhotoUrl,
      caption: caption || 'Site Photo',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error uploading photo to cloud:', err);
    res.status(500).json({ error: 'Cloud photo upload failed' });
  }
});

// Serve frontend build in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.use((req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 TRUEX Production Cloud Backend running on port ${PORT}`);
  console.log(`🌐 Ready for custom domain: https://measure.truexinsulation.net`);
});
