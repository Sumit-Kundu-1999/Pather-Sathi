const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const authenticateToken = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dotenv.config();


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

const imageSchema = new mongoose.Schema({
    altText: { type: String, default: 'Our Event Photo' },
    contentType: { type: String, requied: true },
    createdAt: { type: Date, default: Date.now },
    eventName: { type: String, required: true },
    fileName: { type: String, requied: true },
    path: { type: String, requied: true },
})

const Image = mongoose.model('Image', imageSchema);

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const dir = 'uploads/';
//         if (!fs.existsSync(dir)) {
//             fs.mkdirSync(dir, { recursive: true });
//         }
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// })

const upload = multer({ storage })

router.post('/upload', authenticateToken, upload.array('images', 50), async (req, res) => {
    try {
        if(!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'Please Upload an image file'
            })
        }

        const imagePromises = req.files.map(file => {
            const newImage = new Image({
                altText: req.body.altText,
                contentType: file.mimetype,
                eventName: req.body.eventName,
                fileName: file.filename, 
                path: file.path
            });
            return newImage.save();
        })

        const savedImages = await Promise.all(imagePromises);
        res.status(201).json({
            message: 'Image Uploads successfull',
            images: savedImages
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

router.get('/getPhotos', async (req, res) => {
    try {
        const images = await Image.find();
        res.status(200).json(images);
    } catch(err) {
        res.status(500).json({error: err.message})
    }

})

module.exports = router;
