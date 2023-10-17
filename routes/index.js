const express = require('express');
const navigation = express.Router();

const { ensureAuthenticated, ensureAdmin } = require('../middleware/authorization.js');

//home page
navigation.get('/login', (req, res) => {
    res.render('pages/login', { error: req.flash('error') })
})
navigation.get('/', ensureAuthenticated, ensureAdmin, (req, res) => {
    res.render('pages/IT-Dashboard');
})
// navigation.get('/', (req, res) => {
//     res.render('pages/IT-Dashboard');
// })
navigation.get('/console', ensureAuthenticated, ensureAdmin, (req, res) => {
    res.render('pages/live-console')
})

navigation.get('/user', (req, res) => {
    res.json(req.session.user);
})

navigation.get('/logout', (req, res) => {
    try {
        req.session.user = null;
        req.session.access_token = null;
        req.session.refresh_token = null;
        res.redirect('/')
        } catch(err) {
        res.status(500).send({error: 'internal server error'})
    }
})

// error handling
navigation.get('*', (req, res) => {
    res.status(404).send(`cannot ${req.method.toLowerCase()} ${req.path}`);
})

module.exports = navigation;