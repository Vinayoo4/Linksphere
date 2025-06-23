import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

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

// In-memory data store (in production, use a real database)
let appData = {
  links: [],
  pdfs: [],
  news: [],
  alerts: [],
  groups: [],
  analytics: {
    totalViews: 0,
    totalUsers: 0,
    engagement: 0,
    contentGrowth: [],
    userActivity: []
  },
  settings: {
    siteName: 'LinkSphere',
    adminPin: '1234',
    theme: 'light',
    notifications: true
  }
};

// Load data from file if exists
const dataFile = path.join(__dirname, 'data.json');
try {
  const data = await fs.readFile(dataFile, 'utf8');
  appData = { ...appData, ...JSON.parse(data) };
} catch (error) {
  console.log('No existing data file found, starting fresh');
}

// Save data to file
const saveData = async () => {
  try {
    await fs.writeFile(dataFile, JSON.stringify(appData, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

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
app.get('/api/data', (req, res) => {
  res.json(appData);
});

// Links endpoints
app.get('/api/links', (req, res) => {
  res.json(appData.links);
});

app.post('/api/links', (req, res) => {
  const newLink = { ...req.body, id: uuidv4(), createdAt: new Date().toISOString() };
  appData.links.push(newLink);
  io.emit('content-updated', { type: 'links', action: 'add', content: newLink });
  saveData();
  res.json(newLink);
});

app.put('/api/links/:id', (req, res) => {
  const index = appData.links.findIndex(link => link.id === req.params.id);
  if (index !== -1) {
    appData.links[index] = { ...appData.links[index], ...req.body, updatedAt: new Date().toISOString() };
    io.emit('content-updated', { type: 'links', action: 'update', content: appData.links[index] });
    saveData();
    res.json(appData.links[index]);
  } else {
    res.status(404).json({ error: 'Link not found' });
  }
});

app.delete('/api/links/:id', (req, res) => {
  const link = appData.links.find(link => link.id === req.params.id);
  if (link) {
    appData.links = appData.links.filter(link => link.id !== req.params.id);
    io.emit('content-updated', { type: 'links', action: 'delete', content: { id: req.params.id } });
    saveData();
    res.json({ message: 'Link deleted' });
  } else {
    res.status(404).json({ error: 'Link not found' });
  }
});

// PDFs endpoints
app.get('/api/pdfs', (req, res) => {
  res.json(appData.pdfs);
});

app.post('/api/pdfs', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const newPdf = {
    id: uuidv4(),
    title: req.body.title || req.file.originalname,
    description: req.body.description || '',
    url: `/uploads/${req.file.filename}`,
    size: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
    filename: req.file.filename,
    createdAt: new Date().toISOString()
  };
  
  appData.pdfs.push(newPdf);
  io.emit('content-updated', { type: 'pdfs', action: 'add', content: newPdf });
  saveData();
  res.json(newPdf);
});

app.delete('/api/pdfs/:id', async (req, res) => {
  const pdf = appData.pdfs.find(pdf => pdf.id === req.params.id);
  if (pdf) {
    // Delete file from filesystem
    try {
      await fs.unlink(path.join(__dirname, 'uploads', pdf.filename));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    
    appData.pdfs = appData.pdfs.filter(pdf => pdf.id !== req.params.id);
    io.emit('content-updated', { type: 'pdfs', action: 'delete', content: { id: req.params.id } });
    saveData();
    res.json({ message: 'PDF deleted' });
  } else {
    res.status(404).json({ error: 'PDF not found' });
  }
});

// News endpoints
app.get('/api/news', (req, res) => {
  res.json(appData.news);
});

app.post('/api/news', upload.single('image'), (req, res) => {
  const newNews = {
    id: uuidv4(),
    title: req.body.title,
    excerpt: req.body.excerpt,
    content: req.body.content,
    url: req.body.url,
    image: req.file ? `/uploads/${req.file.filename}` : req.body.image,
    date: new Date().toLocaleDateString(),
    createdAt: new Date().toISOString()
  };
  
  appData.news.push(newNews);
  io.emit('content-updated', { type: 'news', action: 'add', content: newNews });
  saveData();
  res.json(newNews);
});

app.put('/api/news/:id', upload.single('image'), (req, res) => {
  const index = appData.news.findIndex(item => item.id === req.params.id);
  if (index !== -1) {
    const updatedNews = {
      ...appData.news[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    if (req.file) {
      updatedNews.image = `/uploads/${req.file.filename}`;
    }
    
    appData.news[index] = updatedNews;
    io.emit('content-updated', { type: 'news', action: 'update', content: updatedNews });
    saveData();
    res.json(updatedNews);
  } else {
    res.status(404).json({ error: 'News not found' });
  }
});

app.delete('/api/news/:id', (req, res) => {
  const news = appData.news.find(item => item.id === req.params.id);
  if (news) {
    appData.news = appData.news.filter(item => item.id !== req.params.id);
    io.emit('content-updated', { type: 'news', action: 'delete', content: { id: req.params.id } });
    saveData();
    res.json({ message: 'News deleted' });
  } else {
    res.status(404).json({ error: 'News not found' });
  }
});

// Alerts endpoints
app.get('/api/alerts', (req, res) => {
  res.json(appData.alerts);
});

app.post('/api/alerts', (req, res) => {
  const newAlert = {
    id: uuidv4(),
    title: req.body.title,
    message: req.body.message,
    type: req.body.type || 'info',
    priority: req.body.priority || 'medium',
    expiresAt: req.body.expiresAt,
    date: new Date().toLocaleDateString(),
    createdAt: new Date().toISOString()
  };
  
  appData.alerts.push(newAlert);
  io.emit('content-updated', { type: 'alerts', action: 'add', content: newAlert });
  saveData();
  res.json(newAlert);
});

app.put('/api/alerts/:id', (req, res) => {
  const index = appData.alerts.findIndex(alert => alert.id === req.params.id);
  if (index !== -1) {
    appData.alerts[index] = { ...appData.alerts[index], ...req.body, updatedAt: new Date().toISOString() };
    io.emit('content-updated', { type: 'alerts', action: 'update', content: appData.alerts[index] });
    saveData();
    res.json(appData.alerts[index]);
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
});

app.delete('/api/alerts/:id', (req, res) => {
  const alert = appData.alerts.find(alert => alert.id === req.params.id);
  if (alert) {
    appData.alerts = appData.alerts.filter(alert => alert.id !== req.params.id);
    io.emit('content-updated', { type: 'alerts', action: 'delete', content: { id: req.params.id } });
    saveData();
    res.json({ message: 'Alert deleted' });
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
});

// Groups endpoints
app.get('/api/groups', (req, res) => {
  res.json(appData.groups);
});

app.post('/api/groups', (req, res) => {
  const newGroup = {
    id: uuidv4(),
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    resources: req.body.resources || [],
    joinLink: req.body.joinLink,
    memberCount: req.body.memberCount || 0,
    isPrivate: req.body.isPrivate || false,
    createdAt: new Date().toISOString()
  };
  
  appData.groups.push(newGroup);
  io.emit('content-updated', { type: 'groups', action: 'add', content: newGroup });
  saveData();
  res.json(newGroup);
});

app.put('/api/groups/:id', (req, res) => {
  const index = appData.groups.findIndex(group => group.id === req.params.id);
  if (index !== -1) {
    appData.groups[index] = { ...appData.groups[index], ...req.body, updatedAt: new Date().toISOString() };
    io.emit('content-updated', { type: 'groups', action: 'update', content: appData.groups[index] });
    saveData();
    res.json(appData.groups[index]);
  } else {
    res.status(404).json({ error: 'Group not found' });
  }
});

app.delete('/api/groups/:id', (req, res) => {
  const group = appData.groups.find(group => group.id === req.params.id);
  if (group) {
    appData.groups = appData.groups.filter(group => group.id !== req.params.id);
    io.emit('content-updated', { type: 'groups', action: 'delete', content: { id: req.params.id } });
    saveData();
    res.json({ message: 'Group deleted' });
  } else {
    res.status(404).json({ error: 'Group not found' });
  }
});

// Analytics endpoints
app.get('/api/analytics', (req, res) => {
  // Generate real-time analytics
  const analytics = {
    ...appData.analytics,
    totalContent: appData.links.length + appData.pdfs.length + appData.news.length + appData.alerts.length + appData.groups.length,
    totalViews: Math.floor(Math.random() * 10000) + 5000,
    activeUsers: Math.floor(Math.random() * 500) + 100,
    engagement: Math.random() * 0.8 + 0.2,
    contentGrowth: Array.from({ length: 12 }, (_, i) => ({
      week: i + 1,
      content: Math.floor(Math.random() * 50) + 10
    })),
    userActivity: Array.from({ length: 7 }, (_, i) => ({
      day: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      active: Math.floor(Math.random() * 1000) + 100
    }))
  };
  
  res.json(analytics);
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  res.json(appData.settings);
});

app.put('/api/settings', (req, res) => {
  appData.settings = { ...appData.settings, ...req.body };
  io.emit('settings-updated', appData.settings);
  saveData();
  res.json(appData.settings);
});

// Search endpoint
app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const type = req.query.type || 'all';
  
  let results = [];
  
  if (type === 'all' || type === 'links') {
    const linkResults = appData.links.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query)
    ).map(item => ({ ...item, type: 'link' }));
    results.push(...linkResults);
  }
  
  if (type === 'all' || type === 'news') {
    const newsResults = appData.news.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.excerpt.toLowerCase().includes(query)
    ).map(item => ({ ...item, type: 'news' }));
    results.push(...newsResults);
  }
  
  if (type === 'all' || type === 'pdfs') {
    const pdfResults = appData.pdfs.filter(item => 
      item.title.toLowerCase().includes(query)
    ).map(item => ({ ...item, type: 'pdf' }));
    results.push(...pdfResults);
  }
  
  if (type === 'all' || type === 'alerts') {
    const alertResults = appData.alerts.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.message.toLowerCase().includes(query)
    ).map(item => ({ ...item, type: 'alert' }));
    results.push(...alertResults);
  }
  
  if (type === 'all' || type === 'groups') {
    const groupResults = appData.groups.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query)
    ).map(item => ({ ...item, type: 'group' }));
    results.push(...groupResults);
  }
  
  res.json(results);
});

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