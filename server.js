const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // You need to install this library

const app = express();
const PORT = process.env.PORT || 3000;
const TMDb_API_KEY = 'ba3885a53bc2c4f3c4b5bdc1237e69a0';
const TMDb_BASE_URL = 'https://api.themoviedb.org/3';
const VIDEO_PLAYER_BASE_URL = 'https://player.videasy.net';

app.use(cors()); // This allows your frontend to make requests to this API

// Endpoint for fetching trending movies
app.get('/api/trending', async (req, res) => {
    try {
        const url = `${TMDb_BASE_URL}/trending/all/week?api_key=${TMDb_API_KEY}&language=en-US`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data.results);
    } catch (error) {
        console.error("Error fetching trending movies:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// Endpoint for getting a movie's player URL
app.get('/api/movie/:id', (req, res) => {
    const { id } = req.params;
    const playerUrl = `${VIDEO_PLAYER_BASE_URL}/movie/${id}`;
    res.json({ playerUrl });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
