const express = require('express');
const router = express.Router();

const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://localhost:8000';

router.post('/ai-query', async(req, res) => {
    try {
        const { message } = req.body;

        const pythonResponse = await fetch(`${AI_AGENT_URL}/ask-agent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        })

        const data = await pythonResponse.json();
        res.status(200).send({ reply: data.answer });
    } catch (error) {
        res.status(503).json({ error: 'AI Agent is currently unavailable' });
    }
})

module.exports = router;