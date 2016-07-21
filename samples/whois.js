#!/usr/bin/node

var TelitModem = require('telit-modem');

var modem = new TelitModem.TelitModem();

modem.open('COM4').catch((err) => {
    console.error("Failed to open serial port", err);
}).then(() => {
    console.log("Opened serial port");

    process.on('SIGINT', function () {
        modem.disablePDP();
        modem.closeGracefully(function(){
            process.exit(0);
        });
    });


    modem.startProcessing();

    modem.on('discarding', function(buf){
       console.log("discarding", buf.toString());
    });


    modem.disablePDP().then(function () {
        console.log("deinitialized PDP");

        modem.setAPN("\"myAPN\"");

        setTimeout(function () { // wait 2 seconds before enabling PDP (again)
            modem.enablePDP().then((ip) => {
                console.log('connected with IP', ip);

                var sock = modem.getSocket();
                sock.connect({
                    host: "whois.internic.com",
                    port: 43,
                    transportProtocol: TelitModem.Protocols.TCP
                }, function () {
                    console.log("Connected..");

                    sock.on('data', (data) => {
                        console.log("Response", data.toString());
                        modem.close();
                    });

                    console.log("Querying for the registrar of godzilla.com");
                    sock.write("godzilla.com\r\n");
                });
            });
        }, 2000);
    });
});