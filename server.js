const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Make sure your real connection string is here!
const dbConnectionString = 'YOUR_MONGODB_CONNECTION_STRING'; 

mongoose.connect(dbConnectionString)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((error) => console.error('❌ Error connecting to MongoDB:', error));

const shoutSchema = new mongoose.Schema({
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Shout = mongoose.model('Shout', shoutSchema);

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

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});