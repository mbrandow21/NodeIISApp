const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { exec } = require('child_process');

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

router.get('/resetIIS', (req, res) => {
    // Before executing, check for some kind of authorization here

    const triggerFilePath = path.join(__dirname, '..', 'logs', 'resetTrigger.txt');

    // Write to the trigger file
    fs.writeFile(triggerFilePath, new Date().toISOString(), (error) => {
        if (error) {
            console.error(`Error writing to trigger file: ${error}`);
            return res.status(500).send('Error signaling IIS reset.');
        }

        res.send('Signal to reset IIS has been sent.');
    });
});

module.exports = router;
