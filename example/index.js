'use strict';
const https = require('https');
const fs = require('fs');

const app = require('express')();

let sslOptions = {
  key: fs.readFileSync('./ssl/bidding.eccube.key'),
  cert: fs.readFileSync('./ssl/bidding.eccube.crt')
};

let serverHttps = https.createServer(sslOptions, app).listen(443)

const port = 3000;

module.exports = (cb) => {
  const callbackUrl = 'https://bidding.eccube.de/callback';

  app.listen(port, (err) => {
    if (err) return console.error(err);

    console.log(`Express server listening at http://localhost:${port}`);

    return cb({
      app,
      callbackUrl,
    });
  });
};
