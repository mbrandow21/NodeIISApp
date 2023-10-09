const express = require('express');
const navigation = express.Router();

//home page
navigation.get('/', (req, res) => {
    res.send('This is a test1324556789')
})
navigation.get('/console', (req, res) => {
    res.render('pages/live-console')
})


// error handling
navigation.get('*', (req, res) => {
    res.status(404).send(`cannot ${req.method.toLowerCase()} ${req.path}`);
})

module.exports = navigation;