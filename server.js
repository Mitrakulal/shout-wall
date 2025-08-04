// server.js - UPDATED FOR POSITION SAVING

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dbConnectionString = 'YOUR_MONGODB_CONNECTION_STRING'; // Make sure your real connection string is here!

mongoose.connect(dbConnectionString)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((error) => console.error('❌ Error connecting to MongoDB:', error));

// --- MONGOOSE SCHEMA AND MODEL ---
// ** NEW: Added x and y coordinates to our schema **
const shoutSchema = new mongoose.Schema({
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    x: { type: Number }, // To store the left position
    y: { type: Number }  // To store the top position
});

const Shout = mongoose.model('Shout', shoutSchema);

// --- API ROUTES ---

// GET /shouts (No change here)
app.get('/shouts', async (req, res) => {
    try {
        const shouts = await Shout.find({}).sort({ createdAt: -1 });
        res.json(shouts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch shouts" });
    }
});

// POST /shouts (No change here)
app.post('/shouts', async (req, res) => {
    try {
        const message = req.body.message.trim();
        if (message) {
            const newShout = new Shout({ message: message });
            await newShout.save();
            res.status(201).json(newShout);
        } else {
            res.status(400).json({ error: "Message cannot be empty" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to create shout" });
    }
});

// ** NEW: API endpoint to UPDATE a note's position **
// It will handle requests like: PUT /shouts/12345
app.put('/shouts/:id', async (req, res) => {
    try {
        const { id } = req.params; // The note's unique ID
        const { x, y } = req.body;   // The new x and y coordinates from the frontend

        // Find the note by its ID and update its x and y fields
        const updatedShout = await Shout.findByIdAndUpdate(
            id,
            { x, y },
            { new: true } // Return the updated document
        );

        if (!updatedShout) {
            return res.status(404).json({ error: "Note not found" });
        }

        res.json(updatedShout);
    } catch (error) {
        res.status(500).json({ error: "Failed to update note position" });
    }
});


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});