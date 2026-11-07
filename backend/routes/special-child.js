const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const multer = require('multer');
const authenticateToken = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dotenv.config();

const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://localhost:8000';

// 1. Configure Cloudinary credentials from process.env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configure Cloudinary storage engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pather-sathi-images', // folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});

const specialChildSchema = new mongoose.Schema({
    altText: { type: String, default: 'Special Child Photo' },
    contentType: { type: String, requied: true },
    diseaseName: { type: String, requied: true },
    fileName: { type: String, requied: true },
    descriptionEn: { type: String, required: true },
    descriptionBn: { type: String, required: true },
    phoneNumber: { type: String, requied: true },
    image: { type: String, requied: true },
    path: { type: String, requied: true },
})

const upload = multer({ storage })

const SpecialChild = mongoose.model('SpecialChild', specialChildSchema);

router.post('/upload', authenticateToken, upload.array('image', 50), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'Please Upload an image file'
            })
        }

        const { description } = req.body;

        if (description) {
            const pythonResponse = await fetch(`${AI_AGENT_URL}/create-desc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });

            const data = await pythonResponse.json();
            let rawText = data[0].text;
            rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            
            const parsedResponse = JSON.parse(rawText);
            const awswerEng = parsedResponse.english;
            const answerBen = parsedResponse.bengali;
            
            if (awswerEng === 'All AI models are currently experiencing high traffic. Please try again later.') {
                return res.status(400).json({ message: awswer });
            }

            if (awswerEng === 'The description is not correct for the special child. Please rewrite it and submit again.') {
                return res.status(400).json({ message: awswer });
            }
            if(awswerEng && answerBen) {
                const imagePromises = req.files.map(file => {
                    const newImage = new SpecialChild({
                        altText: 'Special Child Photo',
                        contentType: file.mimetype,
                        fileName: file.filename,
                        path: file.path,
                        descriptionEn: awswerEng,
                        descriptionBn: answerBen,
                        diseaseName: req.body.diseaseName,
                        phoneNumber: req.body.phoneNumber
                    });
                    return newImage.save();
                })
                await Promise.all(imagePromises);
    
                res.status(201).json({
                    message: 'Image Uploads successfull'
                })
            } else {
                return res.status(400).json({
                    message: 'Bengali & English descriptions are not generated properly.'
                })
            }
        }
        return res.status(400).json({
            message: 'Please write the description'
        })

    } catch (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'One or more files exceed the 2MB limit' });
        }
        res.status(500).json({
            message: err.message
        });
    }
})

router.get('/get', async (req, res) => {
    try {
        const specialChild = await SpecialChild.find();
        res.status(200).json(specialChild);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/fetch/:id', async (req, res) => {
    try {
        const childDetails = await SpecialChild.findById(req.params.id);
        if (!childDetails) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(childDetails);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

module.exports = router;