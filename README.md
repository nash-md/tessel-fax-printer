# Twilio Tessel Fax

A project to print Twilio faxes with Tessel and a thermal printer.

## Installation

This project requires [Node.js](http://nodejs.org/) 6 or greater.

### Twilio Setup

You don't have a Twilio Account yet? Sign up on https://www.twilio.com/try-twilio and create one. To receive faxes you need a Twilio number with fax capability. Configure the number to handle incoming calls with `receive-fax.xml` that you find in the root folder of this project. One option is to host the TwiML file on Twilio, another option is to host it on your own server.

### Install the Server

Navigate to the project directory in your terminal and run:

```bash
npm install
```
In order to run it you will need to set the following environment variables:

- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`
- `TWILIO_FAX_NUMBER`

You can create your Twilio API Keys [here](https://www.twilio.com/console/voice/dev-tools/api-keys/). 

Start the server

```bash
node app.js
```

### Setup Tessel

Setup your Tessel, open `tessel-printer-scheduler.js` change the url and point it to `http://<your_server>/`  

Store and run the Tessel code with

```bash
t2 push tessel-printer-scheduler.js
```

**Note:**
Please check if Tessel can access your network and can request data from the server script.

This project supports the serial A2 micro panel thermal printer. The printer requires a seperate 5v - 9V, 2A power supply, Tessel can't power it. It should be easy to get other serial printers working with the project but this repository supports this printer only. 

The module is based on the [tessel-thermalprinter](https://www.npmjs.com/package/tessel-thermalprinter) npm. The library was modified to support printing of images, if you consider printing barcodes or you want to use all available features of the printer please go with the original version, the included library was stripped-down in some aspects.

## Questions?

Message [mdamm@twilio.com](mailto:mdamm@twilio.com) 

## License

MIT
	
## Contributors
	
- Matthias Damm <mdamm@twilio.com>
