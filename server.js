require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');

const { initDb, saveDb, getDb } = require('./src/database');
const usersRoutes = require('./src/routes/users');
const postsRoutes = require('./src/routes/posts');
const adminRoutes = require('./src/routes/admin');
const activateRoutes = require('./src/routes/activate');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet());
app.use(cors());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime().toFixed(2) + 's'
  });
});

app.get('/api/v1/status', (req, res) => {
  res.json({
    app: 'Express API',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/admin', adminRoutes);
app.use('/api/v1/activate', activateRoutes);
app.get('/admin', (req, res) => res.sendFile(path. join(__dirname, 'public', 'admin.html')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${NODE_ENV})`);
  });
}

start();

module.exports = app;