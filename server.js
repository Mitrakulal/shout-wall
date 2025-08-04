// server.js (Final Version)

// 1. Import necessary packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Import Mongoose

// 2. Initialize the Express app
const app = express();
const PORT = 3000;

// --- IMPORTANT: DATABASE CONNECTION ---
// Paste your MongoDB Atlas connection string here.
// Make sure to replace <password> with your actual database user password.
const dbConnectionString = 'mongodb+srv://kulalmitra:mitra123@cluster0.demksbe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbConnectionString)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((error) => console.error('❌ Error connecting to MongoDB:', error));

// --- MONGOOSE SCHEMA AND MODEL ---
// This defines the structure of the data we'll store in MongoDB.
const shoutSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// The "Shout" model is our tool to interact with the "shouts" collection in the database.
const Shout = mongoose.model('Shout', shoutSchema);

// 3. Set up middleware
app.use(cors());
app.use(express.json());

// 4. Define the API Routes (Endpoints)

// GET /shouts - Fetches all shouts from the MongoDB database
app.get('/shouts', async (req, res) => {
    try {
        // Find all documents in the Shout collection, sort by newest first
        const shouts = await Shout.find({}).sort({ createdAt: -1 });
        res.json(shouts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch shouts" });
    }
});

// POST /shouts - Creates a new shout and saves it to the MongoDB database
app.post('/shouts', async (req, res) => {
    try {
        const message = req.body.message.trim();

        if (message) {
            // Create a new shout document using the Shout model
            const newShout = new Shout({ message: message });
            // Save it to the database
            await newShout.save();
            res.status(201).json(newShout);
        } else {
            res.status(400).json({ error: "Message cannot be empty" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to create shout" });
    }
});

// 5. Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});