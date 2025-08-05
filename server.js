// server.js - FINAL CORRECT VERSION

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// IMPORTANT: Make sure your real connection string is here!
const dbConnectionString = 'mongodb+srv://kulalmitra:mitra@cluster0.demksbe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbConnectionString)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((error) => console.error('❌ Error connecting to MongoDB:', error));

// --- MONGOOSE SCHEMA AND MODEL ---
// ** CORRECTED: Added the 'name' field back into the schema **
const shoutSchema = new mongoose.Schema({
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    color: { type: String },
    name: { type: String, default: 'Anonymous' } // This line was missing
});

const Shout = mongoose.model('Shout', shoutSchema);

// --- API ROUTES ---

app.get('/shouts', async (req, res) => {
    try {
        const shouts = await Shout.find({}).sort({ createdAt: -1 });
        res.json(shouts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch shouts" });
    }
});

app.post('/shouts', async (req, res) => {
    try {
        let { message, color, name } = req.body;
        const trimmedMessage = message.trim();
        let authorName = name.trim();

        if (!authorName) {
            authorName = 'Anonymous';
        }

        if (trimmedMessage) {
            const newShout = new Shout({ 
                message: trimmedMessage, 
                color: color,
                name: authorName 
            });
            await newShout.save();
            res.status(201).json(newShout);
        } else {
            res.status(400).json({ error: "Message cannot be empty" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to create shout" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});