// server.js - FINAL ROBUST VERSION

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

const shoutSchema = new mongoose.Schema({
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    color: { type: String },
    name: { type: String, default: 'Anonymous' }
});

const Shout = mongoose.model('Shout', shoutSchema);

// --- API ROUTES ---

app.get('/shouts', async (req, res) => {
    try {
        const shouts = await Shout.find({}).sort({ createdAt: -1 });
        res.json(shouts);
    } catch (error) {
        console.error("Error fetching shouts:", error); // Added for better logging
        res.status(500).json({ error: "Failed to fetch shouts" });
    }
});

// ** UPDATED: This route is now safer and won't crash **
app.post('/shouts', async (req, res) => {
    try {
        const { message, color, name } = req.body;
        
        // This is a much safer way to handle potentially missing data
        const trimmedMessage = (message || '').trim();
        const authorName = (name || '').trim() || 'Anonymous';

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
        console.error("Error creating shout:", error); // Added for better logging
        res.status(500).json({ error: "Failed to create shout" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});