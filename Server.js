var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var twilio = require('twilio');
var User = require("./assets/js/model.js");
var config = require("./config.json");
var client = new twilio.RestClient(config.twilio.accountSid, config.twilio.authToken);
var obj = {};
var obj1 = {};
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get('/patientdata', function (req, res) {
    // console.log('I received a GET request');
    User.find({}, '-_id', function (err, docs) {
        if (!err) {
            res.json(docs);
        } else {
            throw err;
        }
    });
});

app.post('/data', function (req, res) {
    obj.data = [];
    for (var i = 0; i < req.body.json.length; i++) {
        var data = JSON.parse(req.body.json[i]);
        obj.data.push(data);
    }
    res.sendStatus(200);
});

app.post('/sms1', function (req, res) {
    var d = new Date();
    console.log("sms sent");
    for (var i = 0; i < obj.data.length; i++) {
        obj.data[i].CONFIRMED = "SMS sent";
        obj.data[i].TIMESTAMP = d;
        obj.data[i].FLAG = 0;
        post_sms(obj.data[i].MOBILE, obj.data[i].DOCTOR, obj.data[i].DATE, obj.data[i].TIME);
    }
    User.collection.insert(obj.data, function (err, docs) {
        if (err)return console.error();
    })
    res.sendStatus(204);
});

app.post('/reply', function (req, res) {
    var twiml = new twilio.TwimlResponse();
    // console.log(req.body.Body);
    //  console.log(req.body.From);
    var flag = 0;
    var number = req.body.From.substring(2);
    User.find({'MOBILE': number}, '-_id', function (err, docs) {
        if (!err) {
            obj1 = docs;
        } else {
            throw err;
        }
    });
    for (var i = 0; i < obj1.data.length; i++) {
        if (obj1.data[i].MOBILE == number) {
            if ((obj1.data[i].FLAG == 0)) {
                if ((req.body.Body == "Y") || (req.body.Body == "N")) {
                    obj1.data[i].CONFIRMED = req.body.Body;
                    var d = new Date();
                    obj1.data[i].TIMESTAMP = d;
                    obj1.data[i].FLAG = 1;
                    User.collection.update(obj1.data, function (err, docs) {
                        if (err)return console.error();
                    })
                    if (req.body.Body == 'Y') {
                        twiml.message('Thank you for the confirmation. Please contact the front desk on +17323258868 for any assistance.');
                    } else if (req.body.Body == 'N') {
                        twiml.message('Thank you for the response. Please contact the front desk on +17323258868 for appointment reschedule.');
                    }
                }
                else {
                    twiml.message('Please reply Y or N for confirmation. Please contact the front desk on +17323258868 for any assistance.');
                }
            }
            else if ((req.body.Body == "Y") || (req.body.Body == "N")) {
                flag++;
            }

        }
    }
    if (flag != 0) {
        twiml.message('Please contact the front desk on +17323258868 for any assistance.');
    }
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});

var post_sms = function (tonum, doctor, date, time) {
    client.sendSms({
        to: tonum,
        from: '+17328239340',
        body: "You have an appointment with Dr." + doctor + " on " + date + " at " + time + " Please reply Y to confirm or N to Cancel"
    }, function (error, message) {
        if (!error) {
        } else {
            console.log('Oops! There was an error.');
        }
    });
};

app.listen(3030, function () {
    console.log("Working on port 3030");
});