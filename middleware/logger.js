const fs = require('fs');

// The custom log function
function log(message) {
    // Displaying the message on console
    console.log(message);
    
    // Appending the message to the access.log file
    fs.appendFile('logs/access.log', 'CONSOLE: ' + message + '\n', (err) => {
        if (err) {
            console.error("Failed to write to log file:", err);
        }
    });
}

module.exports = log;