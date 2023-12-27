const axios = require('axios');

// controllers/mainController.js
const downloadLicenseController = async (req, res) => {
    try {
        const URL = "https://kepler-backend.mersive.com:443/licensing/v1";
    const headers = {
      "Content-Type": "application/json",
      "accept": "application/json"
    };

        const response = await axios.get(url);
        const responseBody = await response.data; // Use response.data to get the response body
        console.log(responseBody);
        res.send(responseBody);
    } catch (error) {
        res.send(`Error in pushLicenseController: ${error.message}`);
    }
};

module.exports = { downloadLicenseController };
