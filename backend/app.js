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

// Use the imported routes modules
app.use('/api/v1/users', userRoutes)
// app.use('/api', forum);
// app.use('/api', event);
// app.use('/api', venue);
// app.use('/api', categories);
// app.use('/api', auth);
// app.use('/api', post);
// app.use('/api', video);
// app.use('/api', vent);
module.exports = app;