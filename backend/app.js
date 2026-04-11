const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_PATH || './uploads')));

// Routes
app.use('/api/settings', require('./routes/settings'));
app.use('/api/membership', require('./routes/membership'));
app.use('/api/donation', require('./routes/donation'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/events', require('./routes/events'));
app.use('/api/contact', require('./routes/contact'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'RKS Backend API is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
