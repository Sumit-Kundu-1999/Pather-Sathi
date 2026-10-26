const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

router.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // e.g., 'yourngo@gmail.com'
                pass: process.env.EMAIL_PASS  // This MUST be an App Password, not your normal password
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send it to yourself
            // replyTo: email,             // If you hit 'Reply', it replies to the user
            subject: `NGO Website Contact: ${subject}`,
            text: `
        You have received a new message from the Pather Sathi website.
        
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        
        Message:
        ${message}
      `
        };

        // 3. Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
});

module.exports = router;
