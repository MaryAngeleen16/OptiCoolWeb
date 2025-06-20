const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();


const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://notable-complete-garfish.ngrok-free.app',
  'https://opticoolweb-backend.onrender.com',
  'https://opticoolweb-backend.onrender.com/api/v1',
  'https://opticoolprediction.onrender.com'
];

// Middleware setup
app.use(express.json());


app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

const userRoutes = require('./routes/userRoutes')
const ereportRoutes = require('./routes/ereportRoutes')
const logRoutes = require('./routes/logRoutes')
const powerConsumptionRoutes = require('./routes/powerConsumptionRoutes')
const humidityRoutes = require('./routes/humidityRoutes')
const temperatureRoutes = require('./routes/temperatureRoutes')
// Use the imported routes modules
app.use('/api/v1/users', userRoutes)
app.use('/api/v1', ereportRoutes)
app.use('/api/v1', logRoutes)
app.use('/api/v1', powerConsumptionRoutes)
app.use('/api/v1', humidityRoutes)
app.use('/api/v1', temperatureRoutes) 

const proxyRoutes = require('./routes/proxyRoutes');
app.use('/api/v1', proxyRoutes);


const outsideTemperatureRoutes = require('./routes/outsideTemperatureRoutes');
app.use('/api/v1', outsideTemperatureRoutes);


const insideTemperatureRoutes = require('./routes/insideTemperatureRoutes');
app.use('/api/v1', insideTemperatureRoutes);


const insideHumidityRoutes = require('./routes/insideHumidityRoutes');
const outsideHumidityRoutes = require('./routes/outsideHumidityRoutes');
app.use('/api/v1', insideHumidityRoutes);
app.use('/api/v1', outsideHumidityRoutes);


module.exports = app;