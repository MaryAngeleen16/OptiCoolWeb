const express = require('express');
const axios = require('axios');
const router = express.Router();

const IOT_BASE_URL = 'https://notable-complete-garfish.ngrok-free.app';

// === Helper: Clean and sanitize path ===
const buildCleanUrl = (iotPath) => {
  const cleanPath = iotPath.replace(/\/+$/, ''); // remove trailing slashes
  return `${IOT_BASE_URL}/${cleanPath}`.replace(/([^:]\/)\/+/g, '$1'); // remove double slashes
};

// === Generic GET Proxy ===
router.get('/proxy/*', async (req, res) => {
  const iotPath = req.params[0]; // Get everything after /proxy/
  const url = buildCleanUrl(iotPath);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'insomnia/11.2.0', // Force Insomnia's user agent
        'Referer': req.headers['referer'] || '',
        'Accept': req.headers['accept'] || 'application/json',
        'Origin': req.headers['origin'] || ''
      },
      timeout: 10000
    });

    res.status(response.status).json(response.data);

  } catch (error) {
    console.error(`❌ Proxy GET failed for /${iotPath}:`, error.message);

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

// === Generic POST Proxy ===
router.post('/proxy/*', async (req, res) => {
  const iotPath = req.params[0];
  const url = buildCleanUrl(iotPath);

  try {
    const response = await axios.post(url, req.body, {
      headers: {
        'User-Agent': 'insomnia/11.2.0', // Force Insomnia's user agent
        'Referer': req.headers['referer'] || '',
        'Accept': req.headers['accept'] || 'application/json',
        'Origin': req.headers['origin'] || ''
      },
      timeout: 10000
    });

    return res.status(response.status).json(response.data);

  } catch (error) {
    console.error(`❌ Proxy POST failed for /${iotPath}:`, error.message);

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
