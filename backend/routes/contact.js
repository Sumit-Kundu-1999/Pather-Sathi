const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const { data, error } = await resend.emails.send({
            // FROM MUST BE THIS EXACT STRING until you buy and verify your own custom domain
            from: 'Pather Sathi Contact Form <onboarding@resend.dev>',

            // TO is where the email is delivered (your personal email)
            to: [process.env.EMAIL_USER],

            // REPLY_TO is the email of the person who filled out the form. 
            // When you open the email in Gmail and click "Reply", it will reply to them!
            reply_to: email,

            subject: `NGO Website Contact: ${subject}`,
            text: `
                You have received a new message from the Pather Sathi website.

                Name: ${name}
                Email: ${email}
                Subject: ${subject}

                Message:
                ${message}
                `
        });

        if (error) {
            return res.status(500).json({ message: 'Failed to send email. Please try again later.', error });
        }

        res.status(200).json({ message: 'Email sent successfully!', data });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
});

module.exports = router;
