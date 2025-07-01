const axios = require('axios');

const geocode = async (location) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Store API key securely
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const { results } = response.data;

        if (results && results.length > 0) {
            const { lat, lng } = results[0].geometry.location;
            return { latitude: lat, longitude: lng };
        } else {
            throw new Error('Geocoding failed');
        }
    } catch (error) {
        throw new Error('Geocoding failed');
    }
};

module.exports = geocode;