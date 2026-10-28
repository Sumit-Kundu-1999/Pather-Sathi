const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authenticateToken = require('../middleware/auth');

dotenv.config();

const donorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: {type: Number, required: true},
    year: { type: Number, required: true},
    adminName: {type: String, required: true},
    address: {type: String, default: ''},
    phone: { type: String, default: '' },
}, { timestamps: true }); // timestamps automatically adds createdAt and updatedAt

const Donors = mongoose.model('Donor', donorSchema);

router.get('/records', async(req, res) => {
    try {
        const donors = await Donors.find({});
        return res.status(200).json({ donors });
    } catch (error) {
        console.log('Fetch Donor record ', error);
        res.status(500).json({ message: 'Donor record not found' });
    }
})

router.post('/donor/details', authenticateToken, async(req, res) => {
    const { name, amount, year, adminName, phone, address } = req.body;
    try {
        const donor =  new Donors({name, amount, year, adminName, address, phone });
        donor.save();
        return res.status(200).json({
            message: 'Donor Record submitted successfully'
        });
    } catch(error) {
        console.log('Donor submission error ', error);
        return res.status(200).json({
            msg: 'Something went wrong. Please try again later'
        });
    }
})

module.exports = router;