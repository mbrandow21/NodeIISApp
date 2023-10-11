const axios = require('axios');
const qs = require('qs');

const ensureAuthenticated = async (req, res, next) => {
    const logging = 0;

    const {user, access_token, refresh_token} = req.session;

    if (!user || !access_token) {
        if (logging) console.log('no token')
        // kick em out
        return res.redirect(`/login?desiredPath=${req.path}`)
    };

    // checks if current access token is valid
    const isValid = await axios({
        method: 'post',
        url: `${process.env.ServiceAddress}/oauth/connect/accesstokenvalidation`,
        data: qs.stringify({
            'token': req.session.access_token
        })
    })
        .then(response => {
            const {exp} = response.data;
            return new Date() < new Date(exp * 1000)
        })
        .catch(err => {
            // console.log(err)
            return false;
        })

    if (isValid) {
        if (logging) console.log('valid token')
        return next()
    };
    if (logging) console.log('invalid token')
    // if token is not valid, use refresh token to get a new one

    if (!refresh_token) {
        if (logging) console.log('no refresh token')
        req.flash('error', 'Session expired');
        return res.redirect('/login');
    }
    
    const newAccessToken = await axios({
        method: 'post',
        url: `${process.env.ServiceAddress}/oauth/connect/token`,
        headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`
        },
        data: qs.stringify({
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token
        })
    })
        .then(response => response.data.access_token)
        .catch(err => {
            console.log('ensureAuthenticated')
            console.log('something went wrong: ' + err);
            return false;
        })

    if (logging) console.log('new token')

    if (newAccessToken) {
        req.session.access_token = newAccessToken;
        return next();
    } else {
        req.flash('error', 'Internal server error');
        return res.redirect('/login');
    }
}

module.exports = {
    ensureAuthenticated
}