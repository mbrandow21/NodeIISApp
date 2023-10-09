const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

module.exports = (app) => {
    const logDirectory = path.join(__dirname, '..', 'logs', 'access.log');
    const accessLogStream = fs.createWriteStream(logDirectory, { flags: 'a' });
    
    const customFormat = '[:date] [router]: method=:method, path=":url", status=:status, remote-addr=:remote-addr, response-time=:response-time ms';
    
    app.use(morgan(customFormat, { stream: accessLogStream }));
};