const axios = require('axios');

// controllers/mainController.js
const pushLicenseController = async (req, res) => {
    try {
        let url = "http://192.168.8.119/test/ip";

        const response = await axios.get(url);
        const responseBody = await response.data; // Use response.data to get the response body
        console.log(responseBody);
        res.send(responseBody);
    } catch (error) {
        res.send(`Error in pushLicenseController: ${error.message}`);
    }
};

module.exports = { pushLicenseController };
