const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const crypto = require('crypto');
const log = require('../middleware/logger.js');

const githubWeekhookAuth = (req, res, next) => {
    const payload = JSON.stringify(req.body);
    const hubSignature = req.headers['x-hub-signature'];

    log(payload);
    log(hubSignature);

    const signature = crypto
        .createHmac('sha1', process.env.GITHUB_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

    if (`sha1=${signature}` !== hubSignature) {
        return res.status(401).send('Invalid signature');
    }
    return next();
}

router.get('/logs', (req, res) => {
    const logFilePath = path.join(__dirname, '..', 'logs', 'access.log');
    
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read the log file' });
        }
        
        const logsArray = data.split('\n').filter(log => log);  // Split by newline and filter out any empty strings
        res.json(logsArray);
    });
});

router.post('/deploy', githubWeekhookAuth, (req, res) => {
    // Before executing, check for some kind of authorization here

    // Write to the trigger file
    fs.writeFile('./logs/resetTrigger.txt', new Date().toISOString(), (error) => {
        if (error) {
            console.error(`Error writing to trigger file: ${error}`);
            return res.status(500).send('Error signaling IIS reset.' + error);
        }

        res.send('Signal to reset IIS has been sent.');
    });
});

module.exports = router;
