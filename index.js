const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const { writeFile } = require('fs').promises; // Import the writeFile method
const FormData = require('form-data');
const { pushLicenseController } = require('./controllers/mainController');
const JSZip = require('jszip');

const app = express();
const port = process.env.PORT | 3000

app.use(cors({ origin: "*" }));
app.use(fileUpload());
app.use(bodyParser.json()); // Parse JSON data
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data

// Define a route that uses the controller
app.get('/', pushLicenseController);

// app.post('/download-license', async (req, res) => {
//     try {
//         const { deviceIds } = req.body;
//         console.log('Received deviceIds:', deviceIds);

//         // Add quotes around each hexadecimal value
//         const correctedStr = deviceIds.replace(/([a-fA-F0-9]+)/g, '"$1"');

//         // Parse the corrected string into a JavaScript array
//         const resultArray = JSON.parse(correctedStr);

//         let zip = new JSZip();
//         const contents = [];

//         const URL = "https://kepler-backend.mersive.com:443/licensing/v1";
//         const headers = {
//             "Content-Type": "application/json",
//             "accept": "application/json"
//         };

//         for (const deviceId of resultArray) {
//             const licenseJson = { "keplerId": deviceId };

//             const response = await axios.post(`${URL}/license/license`, licenseJson, { headers });


//             const content = await response.data.text;
//             contents.push({ deviceId, content });
//         }

//         for (const { deviceId, content } of contents) {
//             zip.file(`${deviceId}.bin`, content);
//         }

//         const zipFilename = "license.zip";
//         const zipBlob = await zip.generateAsync({ type: "nodebuffer" });

//         await writeFile(zipFilename, zipBlob); // Use fs.promises.writeFile

//         res.json({ success: true, message: "License successfully downloaded", filename: zipFilename, file: zipBlob });
//     } catch (error) {
//         console.error('Error:', error.message);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });

// Handle file upload
app.post('/upload', async (req, res) => {
    try {
        const { podIp, podPassword } = req.body;

        // Access the file data using req.files
        const { files } = req;

        if (!podIp) {
            res.status(400).send("Please provide Pod IP address");
            return;
        }

        if (!files) {
            res.status(400).send("Please select a license file");
            return;
        }

        const url = `https://${podIp}/Config/service/uploadLicense`;

        const uploadedFile = files.LICENSE_pkg;

        // Create a FormData object
        const formData = new FormData();

        const auth = {
            username: 'admin',
            password: podPassword,
        };

        // Convert uploadedFile.data to a Buffer and append it to FormData
        formData.append('LICENSE_pkg', Buffer.from(uploadedFile.data), { filename: uploadedFile.name });

        // Make the Axios POST request with FormData
        const response = await axios.post(url, formData, {
            auth: auth,
            headers: {
                ...formData.getHeaders(),
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: 5000, // Set a timeout in milliseconds (5 seconds in this case)
        });

        const responseData = response.data;

        console.log(response.status);
        console.log(responseData.message);

        if (responseData.passwordRequired === true) {
            res.status(400).send({ status: 400, message: "Please provide a password" });
            return;
        }

        if (response.status === 200) {
            res.status(200).send({ status: response.status, message: responseData.message });
        }

        if (responseData.message === "timeout of 5000ms exceeded") {
            console.log(response.status)
            console.log(response)
        }

    } catch (error) {

        if (error.message && error.message === "timeout of 5000ms exceeded") {
            console.error("Error first catch:", error.message);
            res.status(400).send({ status: 400, message: "timeout of 5000ms exceeded" });
            return;
        }

        console.error("Error last catch:", error.message);
        res.status(200).send({ status: 400, message: "socket hangs up" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
