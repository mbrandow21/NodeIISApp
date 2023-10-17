const fs = require('fs');
const path = require('path');

module.exports = (io) => {
    const logDirectory = path.join(__dirname, '..', 'logs', 'access.log');

    // Existing logs namespace
    const logsNamespace = io.of('/logs');

    logsNamespace.on('connection', (socket) => {
        // Emitting existing logs to newly connected client
        fs.readFile(logDirectory, 'utf-8', (err, data) => {
            if (err) throw err;
            const logs = data.split('\n');
            socket.emit('logs', logs);
        });

        // Watch for changes in the access.log file
        fs.watchFile(logDirectory, { interval: 500 }, (curr, prev) => {
            fs.readFile(logDirectory, 'utf-8', (err, data) => {
                if (err) throw err;
                const logs = data.split('\n');
                socket.emit('logs', logs);  // Emit the updated logs
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            // Clean up watch on disconnect to avoid memory leaks
            fs.unwatchFile(logDirectory);
        });
    });

    // New namespace for tickets
    // const ticketsNamespace = io.of('/tickets');

    // ticketsNamespace.on('connection', (socket) => {
    //     socket.on('ticketUpdate', () => {
    //         console.log('new ticket update');
    //     })
    //     // socket.on('requestUpdate', () => {
    //     //     // Send updates when requested
    //     //     socket.emit('ticketUpdate', { message: 'New ticket data here' });
    //     // });
    //     console.log('new client connected')
    //     // Add any other events or logic related to tickets here
    // });
};
