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
        const reply = Array.isArray(data.answer)
            ? data.answer
            : [{ type: 'text', text: typeof data.answer === 'string' ? data.answer : JSON.stringify(data.answer) }];
        res.status(200).send({ reply });
    } catch (error) {
        res.status(503).json({ error: 'The AI is currently experiencing high demand. Please try again in 30 seconds.' });
    }
})

module.exports = router;