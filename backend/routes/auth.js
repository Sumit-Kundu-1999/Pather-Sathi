const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowerCase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    },
    name: {
        type: String,
        required: true
    }
});

const configSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);


const Configs = mongoose.model('configs', configSchema);

// @route POST /auth/register
// @desc Register user

router.post('/register', async (req, res) => {
    const { name, email, password, admin } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                msg: 'User Already Exists'
            });
        }
        const adminRow =await Configs.findOne({ admin: { $exists: true } }).lean();
        const adminPassword = adminRow?  adminRow.admin : null;
        
        if(adminPassword != admin) {
            return res.status(400).json({
                msg: 'Please Check Admin Password'
            });
        }

        user = new User({ name, email, password });
        // hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(
            payload,
            process.env.JW_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: user.name })
            }
        )
    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route POST /auth/login
// @desc Authenticate user and get token

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        // Create JWT payoad
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };
        jwt.sign(
            payload,
            process.env.JW_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) {
                    console.error('JWT Signing Error:', err);
                    // Return a 500 status instead of throwing so the client gets a response
                    return res.status(500).json({ error: 'Error generating token' });
                }
                if (err) throw err;
                res.json({ token, user: user.name })
            }
        )
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;