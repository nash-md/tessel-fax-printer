'use-strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const express = require('express');
const sharp = require('sharp');
const twilio = require('twilio');
const request = require('request');

const client = new twilio(
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
  {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
  }
);

const app = express();

app.get('/images/:sid', function(req, res) {
  client.fax
    .faxes(req.params.sid)
    .fetch()
    .then(function(response) {
      const source = path.join(__dirname, response.sid + '.tiff');
      const stream = fs.createWriteStream(source);

      request
        .get(response.mediaUrl)
        .on('error', error => {
          res.status(500).send('could not retrieve fax image');
          console.error(error);
        })
        .pipe(stream);

      stream.on('finish', function() {
        sharp(source)
          .resize(384)
          .png()
          .toBuffer()
          .then(buffer => {
            res.set({ 'content-type': 'image/png' }).send(buffer);
          })
          .catch(error => {
            res.status(500).send('fax image conversion failed');

            console.error(error);
          });
      });
    })
    .catch(error => {
      res.status(500).send('could not retrieve fax');

      console.error(error);
    });
});

app.get('/', function(req, res) {
  const listOfFaxes = [];
  const options = {
    to: process.env.TWILIO_FAX_NUMBER,
    dateCreatedAfter: moment().subtract(1, 'hours').utc().format(),
  };

  client.fax.v1.faxes
    .list(options)
    .then(function(response) {
      response.forEach(fax => {
        if (fax.direction === 'inbound' && fax.status === 'received') {
          const imageUrl = `${req.protocol}://${req.hostname}/images/${fax.sid}`;

          listOfFaxes.push({
            sid: fax.sid,
            date: moment(fax.dateUpdated).format('hh:mm'),
            from: fax.from,
            source: imageUrl,
          });
        }
      });

      res.set({ 'content-type': 'application/json' }).send(listOfFaxes);
    })
    .catch(error => {
      res.status(500).send('could not retrieve faxes');

      console.error(error);
    });
});

const port = process.env.PORT || 5000;

app.listen(port, function() {
  console.log('magic happens on port', port);
});
