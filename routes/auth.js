const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const crypto = require('crypto');
const log = require('../middleware/logger.js');
const axios = require('axios');
const qs = require('qs');

const getAccessToken = async () => {
  const data = await axios({
      method: 'post',
      url: 'https://my.pureheart.org/ministryplatformapi/oauth/connect/token',
      data: qs.stringify({
          grant_type: "client_credentials",
          scope: "http://www.thinkministry.com/dataplatform/scopes/all",
          client_id: process.env.OAuthClientID,
          client_secret: process.env.OAuthClientSecret
      })
  })
      .then(response => response.data)
  const {access_token, expires_in} = data;
  const expiresDate = new Date(new Date().getTime() + (expires_in * 1000)).toISOString()
  return access_token;
}

router.post('/login', async (req, res) => {
  //this video explains this axios request
  //https://youtu.be/r5N8MrQedcg?t=155
  //heres the docs for ministry platform oauth info
  //https://mpweb.azureedge.net/libraries/docs/default-source/kb/get_ready_ministryplatform_new_oauth3b8b080b-04b5-459c-ae7f-0a610de0a5fa.pdf?sfvrsn=db969991_3
  
  const {username, password, remember, desiredPath} = req.body;
  
  try {
      const login = await axios({
          method: 'post',
          url: `${process.env.ServiceAddress}/oauth/connect/token`,
          data: qs.stringify({
              grant_type: "password",
              scope: "http://www.thinkministry.com/dataplatform/scopes/all openid offline_access",
              client_id: process.env.OAuthClientID,
              username: username,
              password: password
          }),
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${process.env.OAuthClientID}:${process.env.OAuthClientSecret}`).toString('base64')}`
          }
      })
          .then(response => response.data);
      
      const {access_token, token_type, refresh_token, expires_in} = login;

      const user = await axios({
          method: 'get',
          url: `${process.env.ServiceAddress}/oauth/connect/userinfo`,
          headers: {
              'Authorization': `${token_type} ${access_token}`
          }
      })
          .then(response => response.data);

      const usersUserGroups = await axios({
          method: 'get',
          url: `https://my.pureheart.org/ministryplatformapi/tables/dp_User_User_Groups?$filter=User_ID=${user.userid}`,
          headers: {
              'Authorization': `bearer ${await getAccessToken()}`,
              'Content-Type': 'application/json'
          }
      })
          .then(response => response.data);

      user.user_groups = usersUserGroups.map(group => group.User_Group_ID);

      req.session.user = user;
      req.session.access_token = access_token;
      // if user selected keep me logged in, set refresh token, otherwise set in to null
      req.session.refresh_token = remember ? refresh_token : null;
      
      // res.status(200).send(desiredPath).end();
      res.redirect(desiredPath);
  } catch (err) {
    if (err.response.data.error == 'invalid_grant') {
      req.flash('error', 'Incorrect username or password');
      res.redirect('/login');
    } else {
      req.flash('error', 'Unknown Error');
      res.redirect('/login');
    }
  }
});

router.post('/authorize', async (req, res) => {
    let errorMessage = 'An unknown error occurred. Please try again later.';
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).send({msg: 'Missing username or password.'});

        
        const credentials = await axios({
            method: 'post',
            url: `${process.env.ServiceAddress}/oauth/connect/token`,
            data: qs.stringify({
                grant_type: "password",
                scope: "http://www.thinkministry.com/dataplatform/scopes/all openid offline_access",
                client_id: process.env.OAuthClientID,
                username: username,
                password: password
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.OAuthClientID}:${process.env.OAuthClientSecret}`).toString('base64')}`
            }
        })
            .then(response => response.data);

        if (!credentials.access_token) return res.status(401).send({msg: errorMessage});
        
        res.status(200).send(credentials);
    } catch (error) {
        let statusCode = 500;

        if (error.response) {
            statusCode = error.response.status ?? 500;

            if (error.response.data && error.response.data.error) {
                if (error.response.data.error === 'invalid_grant') {
                errorMessage = 'Invalid Credentials'; 
                }
            }
        }

        res.status(statusCode).send({ msg: errorMessage });
    }
});

router.post('/refresh', async (req, res) => {
    let errorMessage = 'An unknown error occurred. Please try again later.';
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) return res.status(400).send({msg: 'Missing refresh_token'});

        const newTokenData = await axios({
            method: 'post',
            url: `${process.env.ServiceAddress}/oauth/connect/token`,
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.OAuthClientID}:${process.env.OAuthClientSecret}`).toString('base64')}`
            },
            data: qs.stringify({
                'grant_type': 'refresh_token',
                'refresh_token': refresh_token
            })
        })
            .then(response => response.data);
            
        if (!newTokenData.access_token) return res.status(500).send({msg: errorMessage});
        
        res.status(200).send(newTokenData);
    } catch (error) {
        let statusCode = 500;
        console.log(error)

        if (error.response) {
            statusCode = error.response.status ?? 500;
        }

        res.status(statusCode).send({ msg: errorMessage })
    }
})

router.post('/revoke', async (req, res) => {
    let errorMessage = 'An unknown error occurred. Please try again later.';
    try {
        const { token, token_hint } = req.body;
        if (!token || !token_hint) return res.status(400).send({msg: 'Missing token or token_hint'});

        await axios({
            method: 'post',
            url: `${process.env.ServiceAddress}/oauth/connect/revocation`,
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.OAuthClientID}:${process.env.OAuthClientSecret}`).toString('base64')}`
            },
            data: qs.stringify({
                'token': token,
                'token_type_hint': token_hint
            })
        })
        
        res.sendStatus(200);
    } catch (error) {
        let statusCode = 500;
        console.log(error)

        if (error.response) {
            statusCode = error.response.status ?? 500;
        }

        res.status(statusCode).send({ msg: errorMessage })
    }
})

module.exports = router;
