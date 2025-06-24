import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from './db.js';
import Link from './models/Link.js';
import Pdf from './models/Pdf.js';
import News from './models/News.js';
import Alert from './models/Alert.js';
import Group from './models/Group.js';
import Settings from './models/Settings.js';
import Analytics from './models/Analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
try {
  await fs.access(uploadsDir);
} catch {
  await fs.mkdir(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|json|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Connect to MongoDB
await connectDB();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send initial data to connected client
  socket.emit('initial-data', appData);
  
  // Handle real-time updates
  socket.on('update-content', (data) => {
    const { type, action, content } = data;
    
    switch (action) {
      case 'add':
        if (appData[type]) {
          const newItem = { ...content, id: uuidv4(), createdAt: new Date().toISOString() };
          appData[type].push(newItem);
          io.emit('content-updated', { type, action, content: newItem });
        }
        break;
        
      case 'update':
        if (appData[type]) {
          const index = appData[type].findIndex(item => item.id === content.id);
          if (index !== -1) {
            appData[type][index] = { ...appData[type][index], ...content, updatedAt: new Date().toISOString() };
            io.emit('content-updated', { type, action, content: appData[type][index] });
          }
        }
        break;
        
      case 'delete':
        if (appData[type]) {
          appData[type] = appData[type].filter(item => item.id !== content.id);
          io.emit('content-updated', { type, action, content });
        }
        break;
    }
    
    saveData();
  });
  
  // Handle analytics updates
  socket.on('update-analytics', (data) => {
    appData.analytics = { ...appData.analytics, ...data };
    io.emit('analytics-updated', appData.analytics);
    saveData();
  });
  
  // Handle settings updates
  socket.on('update-settings', (data) => {
    appData.settings = { ...appData.settings, ...data };
    io.emit('settings-updated', appData.settings);
    saveData();
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// REST API Routes

// Get all data
app.get('/api/data', async (req, res) => {
  try {
    const [links, pdfs, news, alerts, groups, analytics, settings] = await Promise.all([
      Link.find().sort({ createdAt: -1 }),
      Pdf.find().sort({ createdAt: -1 }),
      News.find().sort({ createdAt: -1 }),
      Alert.find().sort({ createdAt: -1 }),
      Group.find().sort({ createdAt: -1 }),
      Analytics.findOne(),
      Settings.findOne()
    ]);
    res.json({
      links,
      pdfs,
      news,
      alerts,
      groups,
      analytics,
      settings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// Links endpoints
app.get('/api/links', async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch links', details: error.message });
  }
});

app.post('/api/links', async (req, res) => {
  try {
    const { title, url, description, icon } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }
    const newLink = await Link.create({ title, url, description, icon });
    io.emit('content-updated', { type: 'links', action: 'add', content: newLink });
    res.status(201).json(newLink);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create link', details: error.message });
  }
});

app.put('/api/links/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    const updatedLink = await Link.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updatedLink) {
      return res.status(404).json({ error: 'Link not found' });
    }
    io.emit('content-updated', { type: 'links', action: 'update', content: updatedLink });
    res.json(updatedLink);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update link', details: error.message });
  }
});

app.delete('/api/links/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLink = await Link.findByIdAndDelete(id);
    if (!deletedLink) {
      return res.status(404).json({ error: 'Link not found' });
    }
    io.emit('content-updated', { type: 'links', action: 'delete', content: { id } });
    res.json({ message: 'Link deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete link', details: error.message });
  }
});

// PDFs endpoints
app.get('/api/pdfs', async (req, res) => {
  try {
    const pdfs = await Pdf.find().sort({ createdAt: -1 });
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch PDFs', details: error.message });
  }
});

app.post('/api/pdfs', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { title, description } = req.body;
    const newPdf = await Pdf.create({
      title: title || req.file.originalname,
      description,
      url: `/uploads/${req.file.filename}`,
      size: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
      filename: req.file.filename
    });
    io.emit('content-updated', { type: 'pdfs', action: 'add', content: newPdf });
    res.status(201).json(newPdf);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload PDF', details: error.message });
  }
});

app.delete('/api/pdfs/:id', async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    // Delete file from filesystem
    try {
      await fs.unlink(path.join(__dirname, 'uploads', pdf.filename));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    await Pdf.findByIdAndDelete(req.params.id);
    io.emit('content-updated', { type: 'pdfs', action: 'delete', content: { id: req.params.id } });
    res.json({ message: 'PDF deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete PDF', details: error.message });
  }
});

// News endpoints
app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news', details: error.message });
  }
});

app.post('/api/news', upload.single('image'), async (req, res) => {
  try {
    const { title, excerpt, content, url } = req.body;
    if (!title || !excerpt) {
      return res.status(400).json({ error: 'Title and excerpt are required' });
    }
    const newsData = {
      title,
      excerpt,
      content,
      url,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image,
      date: new Date().toLocaleDateString()
    };
    const newNews = await News.create(newsData);
    io.emit('content-updated', { type: 'news', action: 'add', content: newNews });
    res.status(201).json(newNews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create news', details: error.message });
  }
});

app.put('/api/news/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const update = {
      ...req.body,
      updatedAt: new Date()
    };
    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }
    const updatedNews = await News.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updatedNews) {
      return res.status(404).json({ error: 'News not found' });
    }
    io.emit('content-updated', { type: 'news', action: 'update', content: updatedNews });
    res.json(updatedNews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update news', details: error.message });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNews = await News.findByIdAndDelete(id);
    if (!deletedNews) {
      return res.status(404).json({ error: 'News not found' });
    }
    io.emit('content-updated', { type: 'news', action: 'delete', content: { id } });
    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news', details: error.message });
  }
});

// Alerts endpoints
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts', details: error.message });
  }
});

app.post('/api/alerts', async (req, res) => {
  try {
    const { title, message, type, priority, expiresAt } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    const newAlert = await Alert.create({
      title,
      message,
      type: type || 'info',
      priority: priority || 'medium',
      expiresAt,
      date: new Date().toLocaleDateString()
    });
    io.emit('content-updated', { type: 'alerts', action: 'add', content: newAlert });
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create alert', details: error.message });
  }
});

app.put('/api/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    const updatedAlert = await Alert.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updatedAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    io.emit('content-updated', { type: 'alerts', action: 'update', content: updatedAlert });
    res.json(updatedAlert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert', details: error.message });
  }
});

app.delete('/api/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAlert = await Alert.findByIdAndDelete(id);
    if (!deletedAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    io.emit('content-updated', { type: 'alerts', action: 'delete', content: { id } });
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete alert', details: error.message });
  }
});

// Groups endpoints
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups', details: error.message });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const { name, description, category, resources, joinLink, memberCount, isPrivate } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const newGroup = await Group.create({
      name,
      description,
      category,
      resources,
      joinLink,
      memberCount,
      isPrivate
    });
    io.emit('content-updated', { type: 'groups', action: 'add', content: newGroup });
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group', details: error.message });
  }
});

app.put('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    const updatedGroup = await Group.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updatedGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }
    io.emit('content-updated', { type: 'groups', action: 'update', content: updatedGroup });
    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update group', details: error.message });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGroup = await Group.findByIdAndDelete(id);
    if (!deletedGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }
    io.emit('content-updated', { type: 'groups', action: 'delete', content: { id } });
    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete group', details: error.message });
  }
});

// Settings endpoints
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ adminPin: '1234' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings', details: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ adminPin: '1234' });
    }
    Object.assign(settings, req.body);
    await settings.save();
    io.emit('settings-updated', settings);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings', details: error.message });
  }
});

// Analytics endpoints
app.get('/api/analytics', async (req, res) => {
  try {
    let analytics = await Analytics.findOne();
    if (!analytics) {
      analytics = await Analytics.create({});
    }
    // Optionally, add real-time stats here
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    const type = req.query.type || 'all';
    let results = [];
    if (!query) {
      return res.json([]);
    }
    if (type === 'all' || type === 'links') {
      const linkResults = await Link.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      });
      results.push(...linkResults.map(item => ({ ...item.toObject(), type: 'link' })));
    }
    if (type === 'all' || type === 'news') {
      const newsResults = await News.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { excerpt: { $regex: query, $options: 'i' } }
        ]
      });
      results.push(...newsResults.map(item => ({ ...item.toObject(), type: 'news' })));
    }
    if (type === 'all' || type === 'pdfs') {
      const pdfResults = await Pdf.find({
        title: { $regex: query, $options: 'i' }
      });
      results.push(...pdfResults.map(item => ({ ...item.toObject(), type: 'pdf' })));
    }
    if (type === 'all' || type === 'alerts') {
      const alertResults = await Alert.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { message: { $regex: query, $options: 'i' } }
        ]
      });
      results.push(...alertResults.map(item => ({ ...item.toObject(), type: 'alert' })));
    }
    if (type === 'all' || type === 'groups') {
      const groupResults = await Group.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      });
      results.push(...groupResults.map(item => ({ ...item.toObject(), type: 'group' })));
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search', details: error.message });
  }
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time connections`);
});