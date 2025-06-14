// routes/proxyRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const IOT_BASE_URL = 'https://notable-complete-garfish.ngrok-free.app';

// Generic GET proxy
router.get('/proxy/*', async (req, res) => {
  const iotPath = req.params[0]; // get the part after /proxy/
  try {
    const response = await axios.get(`${IOT_BASE_URL}/${iotPath}`);
    res.json(response.data);
  } catch (error) {
    console.error('Proxy GET Error:', error.message);
    res.status(500).json({ error: 'Proxy failed to fetch data.' });
  }
});




// Generic POST proxy
router.post('/proxy/*', async (req, res) => {
  const iotPath = req.params[0]; // get the part after /proxy/
  try {
    const response = await axios.post(`${IOT_BASE_URL}/${iotPath}`, req.body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy POST Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Proxy POST failed',
      details: error.response?.data || error.message,
    });
  }
});


module.exports = router;
