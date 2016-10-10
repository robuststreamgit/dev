var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test1', function (error) {
    if (error) {
        console.log(error);
    }
});
var UserSchema = new mongoose.Schema({
    DATE: 'string',
    PATIENT: 'string',
    ID: 'string',
    DOCTOR: 'string',
    MOBILE: 'string',
    TIME: 'string',
    CONFIRMED: 'string',
    TIMESTAMP: 'string',
    FLAG: 'string'
});
module.exports = mongoose.model('users', UserSchema);