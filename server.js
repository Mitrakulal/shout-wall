// server.js - UPDATED TO SAVE NOTE COLOR

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Make sure your real connection string is here!
const dbConnectionString = 'mongodb+srv://kulalmitra:mitra@cluster0.demksbe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; 

mongoose.connect(dbConnectionString)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((error) => console.error('❌ Error connecting to MongoDB:', error));

// --- MONGOOSE SCHEMA AND MODEL ---
// ** NEW: Added 'color' to our schema **
const shoutSchema = new mongoose.Schema({
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    color: { type: String } // To store the hex code of the note color
});

const Shout = mongoose.model('Shout', shoutSchema);

// --- API ROUTES ---

// GET /shouts (No change here, it will automatically return the new color field)
app.get('/shouts', async (req, res) => {
    try {
        const shouts = await Shout.find({}).sort({ createdAt: -1 });
        res.json(shouts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch shouts" });
    }
});

// ** UPDATED: The POST route now accepts and saves the color **
app.post('/shouts', async (req, res) => {
    try {
        const { message, color } = req.body; // Destructure message and color from the request
        const trimmedMessage = message.trim();

        if (trimmedMessage) {
            // Create the new note with the message and color
            const newShout = new Shout({ message: trimmedMessage, color: color });
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