let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: "*",  // Allow all origins or specify the ones you want
        methods: ["GET", "POST"]
      }
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};