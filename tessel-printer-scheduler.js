const tessel = require('tessel');
const cron = require('node-cron');
const fetch = require('node-fetch');
const async = require('async');
const Printer = require('./printer.js');

tessel.led[0].off();
tessel.led[1].off();
tessel.led[2].off();

cron.schedule('*/60 * * * *', function() {
  tessel.led[2].toggle();
  tessel.led[1].toggle();

  tessel.led[2].on();

  fetch('<server address>')
    .then(response => {
      return response.json();
    })
    .then(faxes => {
      console.log(faxes.length + ' faxes received');

      const printer = new Printer({ heatingTime: 120, heatingInterval: 3 });

      async.eachSeries(faxes, (fax, callback) => {
        console.log(
          `${fax.sid} - start printing => header: from: ${fax.from } at ${fax.date}`
        );
        printer
          .init(tessel.port['A'])
          .then(() => {
            return printer.setBold(true);
          })
          .then(() => {
            return printer.writeLine(fax.from + ' at ' + fax.date);
          })
          .then(() => {
            return printer.lineFeed(1);
          })
          .then(() => {
            return printer.writeImage(fax.source);
          })
          .then(() => {
            return printer.lineFeed(2);
          })
          .then(() => {
            return printer.print();
          })
          .then(printer => {
            console.log(fax.sid + ' - printing done');
            callback();
          })
          .catch(error => {
            console.error(fax.sid + ' - printing failed');
            console.error(error);
          });
        },
        (error) => {
          if (error) {
            console.error('printing faxes failed');
            console.error(error);

            tessel.led[0].on();
          } else {
            console.log('printing faxes successful');

            tessel.led[2].off();
          }
        }
      );
    })
    .catch(error => {
      tessel.led[0].on();
      console.log(error);
    });
});
