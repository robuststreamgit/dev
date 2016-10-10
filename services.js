var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var twilio = require('twilio');
var config = require("./config.json");
var client = new twilio.RestClient(config.twilio.accountSid, config.twilio.authToken);
var MongoWatch = require('mongo-watch');
var request = require("request");
app.use(bodyParser.urlencoded({extended: true}));

app.post('/api/sms', function(req, res) {
    var arr = req.body.numbers.split(",");
	for(var i=0;i<arr.length;i++){
        console.log(arr[i]);
	client.sendSms({
        to: arr[i],
        from: '+17328239340',
        body: req.body.message
    }, function (error, message) {
        if (!error) {
        } else {
            console.log('Oops! There was an error.');
        }
    });
	}
	res.send(201);
});

app.post('/api/reply', function (req, res) {
    var twiml = new twilio.TwimlResponse();
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
                    });
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
app.post('/api/push/', function(req, res) {
    var arr = req.body.message;
    res.send(200);
});

app.post('/api/doctor/', function(req, res) {
        request({
            url: "https://api.betterdoctor.com/2016-03-01/doctors?first_name=" + req.body.firstName + "&last_name=" + req.body.lastName+ "&gender=" +req.body.gender + "&skip=0&limit=20&user_key=22438b6cb6acbd55816b46049fa342f5",
            method: "GET" // GET/POST
           // contains data (login/password) which you sent from client side
        }, function(error, resp, body) {
            //console.log(body);
            res.send(body);
        });
});

app.post('/api/location/', function(req, res) {
        request({
            url: "https://api.betterdoctor.com/2016-03-01/doctors?location="+req.body.location+"&skip=0&limit=20&user_key=22438b6cb6acbd55816b46049fa342f5",
            method: "GET" // GET/POST
        }, function(error, resp, body) {
            //console.log(body);
            res.send(body);
        });
});

app.listen(3030, function () {
    console.log("Working on port 3030");
});