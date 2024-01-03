'use strict';
var request = require('request');
const { createMollieClient } = require('@mollie/api-client');
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
    scope: ['payments.write', 'refunds.write', 'orders.write', 'orders.read'],
    state: '3(#0/!~',
  });

  // Initial page redirecting to Github
  app.get('/auth', (req, res) => {
    console.log(authorizationUri);
    res.redirect(authorizationUri);
  });

  app.get('/', async (req, res) => {
    res.status(200).json(res)
  });

  // Callback service parsing the authorization token and asking for the access token
  app.get('/callback', async (req, res) => {
    const { code } = req.query;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const dataString = `grant_type=authorization_code&code=${code}&redirect_uri=${callbackUrl}`;

    const options = {
      url: 'https://api.mollie.com/oauth2/tokens',
      method: 'POST',
      headers: headers,
      body: dataString,
      auth: {
        'user': 'app_2BFd4oZAHMXQ3dWNSHnXn3gv',
        'password': '8WGjVTgbuNpVBJCEcSdpRbv6Bxyz4tadzyMpT3He'
      }
    };



    const { access_token } = await new Promise(res => {
      request(options, function callback(error, response, body) {
        res(JSON.parse(body));
      })
    })

    const mollieClient = createMollieClient({ apiKey: access_token });

    const order = await mollieClient.orders.create({
      profileId: 'pfl_WU9mjR6SEG',
      amount: {
        value: '1027.99',
        currency: 'EUR'
      },
      billingAddress: {
        organizationName: 'Mollie B.V.',
        streetAndNumber: 'Keizersgracht 126',
        city: 'Amsterdam',
        region: 'Noord-Holland',
        postalCode: '1234AB',
        country: 'NL',
        title: 'Dhr.',
        givenName: 'Piet',
        familyName: 'Mondriaan',
        email: 'piet@mondriaan.com',
        phone: '+31309202070'
      },
      shippingAddress: {
        organizationName: 'Mollie B.V.',
        streetAndNumber: 'Prinsengracht 126',
        streetAdditional: '4th floor',
        city: 'Haarlem',
        region: 'Noord-Holland',
        postalCode: '5678AB',
        country: 'NL',
        title: 'Mr.',
        givenName: 'Chuck',
        familyName: 'Norris',
        email: 'norris@chucknorrisfacts.net'
      },
      metadata: {
        order_id: '1338',
        description: 'Lego cars'
      },
      locale: 'nl_NL',
      orderNumber: '1338',
      redirectUrl: 'https://bidding.eccube.de/redirect_order',
      webhookUrl: 'https://bidding.eccube.de/webhooks',
      method: 'klarnapaylater',
      lines: [
        {
          type: 'physical',
          sku: '5702016116977',
          name: 'LEGO 42083 Bugatti Chiron',
          productUrl: 'https://shop.lego.com/nl-NL/Bugatti-Chiron-42083',
          imageUrl: 'https://sh-s7-live-s.legocdn.com/is/image//LEGO/42083_alt1?$main$',
          quantity: 2,
          vatRate: '21.00',
          unitPrice: {
            currency: 'EUR',
            value: '399.00'
          },
          totalAmount: {
            currency: 'EUR',
            value: '698.00'
          },
          discountAmount: {
            currency: 'EUR',
            value: '100.00'
          },
          vatAmount: {
            currency: 'EUR',
            value: '121.14'
          }
        },
        {
          type: 'physical',
          sku: '5702015594028',
          name: 'LEGO 42056 Porsche 911 GT3 RS',
          productUrl: 'https://shop.lego.com/nl-NL/Porsche-911-GT3-RS-42056',
          imageUrl: 'https://sh-s7-live-s.legocdn.com/is/image/LEGO/42056?$PDPDefault$',
          quantity: 1,
          vatRate: '21.00',
          unitPrice: {
            currency: 'EUR',
            value: '329.99'
          },
          totalAmount: {
            currency: 'EUR',
            value: '329.99'
          },
          vatAmount: {
            currency: 'EUR',
            value: '57.27'
          }
        }
      ]
    });

    console.log('order::', order)

    return res.status(200).json(code);
  });

  app.get('/login', (req, res) => {
    res.send('Hello<br><a href="/auth">Log in with Mollie</a>');
  });
});
