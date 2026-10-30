const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://localhost:8000';

router.get('/db', async (req, res) => {
    try {
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const state = mongoose.connection.readyState;

        if (state === 1) {
            res.status(200).json({ status: 'healthy', database: 'connected' });
        } else {
            res.status(503).json({ status: 'unhealthy', database: 'disconnected or connecting', stateCode: state });
        }
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', message: 'Failed to check database health' });
    }
});

router.get('/agent', async (req, res) => {
    const response = await fetch(`${AI_AGENT_URL}/health`);
    try {
        if (response.ok) {
            const data = await response.json();
            res.status(200).json({ status: 'healthy', agent: data });
        } else {
            res.status(503).json({ status: 'unhealthy', message: 'Agent responded with an error' });
        }
    } catch (error) {
        // This catches network errors (e.g., if the FastAPI server is not running)
        res.status(503).json({ status: 'unhealthy', message: 'Could not connect to AI Agent' });
    }
});

router.get('/resend', (req, res) => {
  // Check if the API key environment variable is present and not empty
  const hasResendKey = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 0;

  if (hasResendKey) {
    res.status(200).json({ 
      status: 'healthy', 
      message: 'API key configured' 
    });
  } else {
    res.status(503).json({ 
      status: 'unhealthy', 
      message: 'Missing API key configuration' 
    });
  }
});

module.exports = router;