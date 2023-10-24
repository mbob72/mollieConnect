'use strict';
const axios = require('axios');
var request = require('request');
var headers = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

const createApplication = require('./');
const { AuthorizationCode } = require('./../');

createApplication(({ app, callbackUrl }) => {
  const client = new AuthorizationCode({
    client: {
      id: 'app_2BFd4oZAHMXQ3dWNSHnXn3gv',
      secret: '8WGjVTgbuNpVBJCEcSdpRbv6Bxyz4tadzyMpT3He',
    },
    auth: {
      tokenHost: 'https://my.mollie.com/',
      tokenPath: '/oauth2/tokens',
      authorizePath: '/oauth2/authorize',
    },
  });

  // Authorization uri definition
  const authorizationUri = client.authorizeURL({
    redirect_uri: callbackUrl,
    scope: ['payments.write', 'refunds.write'],
    state: '3(#0/!~',
  });

  // Initial page redirecting to Github
  app.get('/auth', (req, res) => {
    console.log(authorizationUri);
    res.redirect(authorizationUri);
  });

  // Callback service parsing the authorization token and asking for the access token
  app.get('/', async (req, res) => {
    const { code } = req.query;

    console.log('have client::', client, code);

    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    var dataString = `grant_type=authorization_code&code=${code}`;

    var options = {
      url: 'https://api.mollie.com/oauth2/tokens',
      method: 'POST',
      headers: headers,
      body: dataString,
      auth: {
        'user': 'app_2BFd4oZAHMXQ3dWNSHnXn3gv',
        'password': '8WGjVTgbuNpVBJCEcSdpRbv6Bxyz4tadzyMpT3He'
      }
    };

    function callback(error, response, body) {

      console.log("have response::", error, response);

    }

    request(options, callback);


    return res.status(200).json(code);
  });

  app.get('/login', (req, res) => {
    res.send('Hello<br><a href="/auth">Log in with Mollie</a>');
  });
});
