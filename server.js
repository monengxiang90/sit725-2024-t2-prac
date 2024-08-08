const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const mongoURI = 'mongodb+srv://monengxiang90:Kaoni1qiwa@cluster0.w2a8b.mongodb.net/';
const app = express();
const port = 4050;



mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

// Define the schema for calculation history
const Schema = mongoose.Schema;

const HistorySchema = new Schema({
    expression: String,
    result: Number,
    date: { type: Date, default: Date.now }
});

const History = mongoose.model('History', HistorySchema);

// Use following models for parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

// Endpoint to handle calculations
app.post('/calculate', async (req, res) => {
    const { expression, result } = req.body;

    // Log received data for debugging
    console.log('Received calculation:', expression, '=', result);

    // Save to MongoDB
    try {
        const newHistory = new History({ expression, result });
        await newHistory.save();
        console.log('Calculation saved to database:', newHistory);
        res.json({ result: newHistory.result });
    } catch (err) {
        console.error('Error saving to database:', err);
        res.status(500).json({ error: 'Failed to save calculation' });
    }
});

// Endpoint to fetch the last 10 calculation history
app.get('/history/last10', async (req, res) => {
    try {
        const histories = await History.find({}).sort({ date: -1 }).limit(10);
        console.log('Fetched histories:', histories); // Add this line
        res.json(histories);
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Endpoint to clear the history
app.delete('/history/clear', async (req, res) => {
    try {
        await History.deleteMany({});
        console.log('All history cleared');
        res.json({ message: 'History cleared' });
    } catch (err) {
        console.error('Error clearing history:', err);
        res.status(500).json({ error: 'Failed to clear history' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
