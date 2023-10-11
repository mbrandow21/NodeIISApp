const express = require('express');
const navigation = express.Router();

const { ensureAuthenticated } = require('../middleware/authorization.js');

//home page
navigation.get('/', (req, res) => {
    res.send('Hello World')
})
navigation.get('/login', (req, res) => {
    res.render('pages/login', { error: req.flash('error') })
})
navigation.get('/console', ensureAuthenticated, (req, res) => {
    res.render('pages/live-console')
})


// error handling
navigation.get('*', (req, res) => {
    res.status(404).send(`cannot ${req.method.toLowerCase()} ${req.path}`);
})

module.exports = navigation;