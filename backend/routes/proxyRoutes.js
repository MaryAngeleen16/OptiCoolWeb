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

// Generic POST proxy (optional, for temperature adjustment etc.)
router.post('/proxy/*', async (req, res) => {
  const iotPath = req.params[0];
  try {
    const response = await axios.post(`${IOT_BASE_URL}/${iotPath}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Proxy POST Error:', error.message);
    res.status(500).json({ error: 'Proxy failed to post data.' });
  }
});

// Proxy endpoint
router.get('/iot/inside_humidity_data', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Use IOT_BASE_URL instead of IOT_URL (fix variable name)
    const response = await axios.get(`${IOT_BASE_URL}/inside_humidity_data`, {
      params: { start_date, end_date },
      headers: { Accept: 'application/json' },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(500).json({ error: 'Failed to fetch data from IoT server' });
  }
});

module.exports = router;
