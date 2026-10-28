const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authenticateToken = require('../middleware/auth');

dotenv.config();

const volunteerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    approvalPending: { type: Boolean, default: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    bloodGroup: { type: String, default: '' },
    profession: { type: String, default: '' },
    skills: { type: String, default: '' },
}, { timestamps: true }); // timestamps automatically adds createdAt and updatedAt

const Volunteers = mongoose.model('Volunteer', volunteerSchema);

router.get('/info', authenticateToken, async (req, res) => {
    try {
        const volunteers = await Volunteers.find({});
        return res.status(200).json({ volunteers });
    } catch (error) {
        console.log('Fetch volunteers record ', error);
        res.status(500).json({ message: 'No Volunteers record found' });
    }
});

router.post('/create', async (req, res) => {
    const { name, email, phone, dateOfBirth, address, bloodGroup, profession, skills } = req.body;
    try {
        let volunteer = await Volunteers.findOne({ email });
        if (volunteer) {
            return res.status(500).json({
                message: "An application using this email already exists. If you haven't heard back from us, please reach out via the Contact Us page."
            });
        }
        volunteer = new Volunteers({ name, email, phone, dateOfBirth, address, bloodGroup, profession, skills });
        volunteer.save();
        return res.status(200).json({
            message: 'Form submitted successfully'
        });
    } catch (error) {
        console.log("Error on submitting form ", form);
        return res.status(500).json({
            msg: "Something went wrong. Please try again later"
        })
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deletedVolunteer = await Volunteers.findByIdAndDelete(req.params.id);
        if (!deletedVolunteer) return res.status(404).json({ msg: 'Volunteer not found' });
        res.json({ msg: 'Volunteer removed successfully' });
    }
    catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.put('/:id/approve', async (req, res) => {
  try {
    // Finds the exact volunteer by _id and updates the flag
    const updatedVolunteer = await Volunteers.findByIdAndUpdate(
      req.params.id, 
      { approvalPending: false }, 
      { new: true } // Returns the updated document
    );
    
    if (!updatedVolunteer) return res.status(404).json({ msg: 'Volunteer not found' });
    res.json(updatedVolunteer);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 
