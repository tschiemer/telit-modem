var TelitModem = require('telit-modem').TelitModem;

var modem = new TelitModem();

modem.open('COM4').catch((err) => {
    console.error("Failed to open serial port", err);
}).then(() => {

    process.on('SIGINT',function(){
        modem.disablePDP();
        modem.closeGracefully(function(){
            process.exit(0);
        });
    });


    modem.startProcessing();

    modem.on('discarding', function(buf){
        console.log("discarding", buf.toString());
    });

    modem.disablePDP().then(function() {
        console.log("deinitialized PDP");

        modem.setAPN("\"myAPN\"");

        setTimeout(function(){ // wait 2 seconds before enabling PDP (again)
            modem.enablePDP().then((ip) => {
                console.log('connected with IP', ip);

            var url = 'http://google.ch/robots.txt';
            console.log("GET "+url);
            modem.http().get(url, (res) => {
                console.log('Response:');

                res.on('data', (ch) => console.log('ch', ch.toString("ascii")));

                res.socket.close();

                modem.close();
                });
            });
        }, 2000);
    });

});