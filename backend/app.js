const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

const userRoutes = require('./routes/userRoutes')
const ereportRoutes = require('./routes/ereportRoutes')
const logRoutes = require('./routes/logRoutes')
// Use the imported routes modules
app.use('/api/v1/users', userRoutes)
app.use('/api/v1', ereportRoutes)
app.use('/api/v1', logRoutes)
module.exports = app;