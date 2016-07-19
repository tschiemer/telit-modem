#!/usr/bin/node

var TelitModem = require('telit-modem');

var CREG = TelitModem.NetworkRegistrationStates;

var modem = new TelitModem.TelitModem();

modem.open('COM4').catch((err) => {
    console.error("Failed to open serial port", err);
}).then(() => {
    console.log("Opened serial port");

    process.on('SIGINT', function () {
        modem.unsubscribeFromNetworkRegistrationState();
        modem.close();
        process.exit(0);
    });


    modem.startProcessing();

    modem.on('discarding', function(buf){
       console.log("discarding", buf.toString());
    });

    modem.subscribeToNetworkRegistrationState((state) => {
        switch(state){
            case CREG.NotRegisteredNotSearching:
                console.log("Network registration state: Not registered, not searching");
                break;

            case CREG.RegisteredHome:
                console.log('Network registration state: Registered (home network)');
                break;

            case CREG.NotRegisteredButSearching:
                console.log('Network registration state: Not registered, but searching');
                break;

            case CREG.RegistrationDenied:
                console.log('Network registration state: Registration denied');
                break;

            case CREG.Unknown:
                console.log('Network registration state: unknown');
                break;

            case CREG.RegisteredRoaming:
                console.log('Network registration state: Registered (roaming)');
                break;

        }
    });


    modem.enableSMS((pdu, destinationNumber, pduLen) => {
        console.log("Received SMS", destinationNumber, pduLen);
        console.log("Text", pdu.text.toString());
    });

});