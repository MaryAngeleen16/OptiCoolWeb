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
  const iotPath = req.params[0];

  try {
    const response = await axios.post(`${IOT_BASE_URL}/${iotPath}`, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 8000  // ⏱ 8 seconds max wait
    });

    return res.status(response.status).json(response.data);

  } catch (error) {
    console.error(`❌ Proxy POST failed for /${iotPath}:`, error.message);

    // Handle known error cases
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ error: "Request timed out. IoT server may be offline." });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: "IoT device responded with error",
        details: error.response.data
      });
    }

    return res.status(500).json({
      error: "Unknown error while contacting IoT server",
      details: error.message
    });
  }
});


module.exports = router;
