const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path')
const imgRoutes = require('./routes/image');
const authRoutes = require('./routes/auth');
const contactRoute = require('./routes/contact');

dotenv.config();

const app = express();

app.use(cors({ origin: ['https://pather-sathi.pages.dev', 'http://localhost:4200'] }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected")
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

connectDb();

app.use('/image', imgRoutes);
app.use('/auth', authRoutes);
app.use('/api', contactRoute);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));