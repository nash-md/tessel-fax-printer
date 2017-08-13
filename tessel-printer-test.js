const tessel = require('tessel');
const Printer = require('./printer.js');

const printer = new Printer({ heatingTime: 120, heatingInterval: 3 });

printer
  .init(tessel.port['A'])
  .then(function() {
    return printer.writeLine('Printed with Tessel');
  })
  .then(function() {
    return printer.print();
  })
  .then(printer => {
    console.log('printing done');
  })
  .catch(error => {
    console.error(error);
  });
