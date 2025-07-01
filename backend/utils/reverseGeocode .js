const axios = require('axios');

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat: latitude,
        lon: longitude,
      },
      headers: {
        'User-Agent': 'Petronix/1.0 (your@email.com)',
      },
    });

    const { address, display_name } = response.data;

    if (address) {
      const { road, suburb, city, town, village, state, postcode } = address;
      return [road, suburb, city || town || village, state, postcode]
        .filter(Boolean)
        .join(', ');
    }

    return display_name || 'Unknown location';
  } catch (error) {
    console.error('🌍 Reverse geocoding failed:', error.message);
    return null;
  }
};

module.exports = reverseGeocode;
