
// -------APPLICATION CONFIG -----------------
var express = require('express');
var app = express();
app.use(express.static('public'));
app.listen(8080);
console.log("App listening on port 8080");


// -------DB CONFIG -----------------
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = mongoose.model('User', new Schema({
    username: String,
    email: String,
    password: String
}));
mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/spendingsDB');

// -------REST requests CONFIG -----------------
var restRoutes = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/api/v1', restRoutes);
restRoutes.post('/add-user', function (req, res) {
    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    user.save(function (error) {
        if (error) throw error;

        console.log('User saved successfully.');
        res.json({success: true});
    });
});

// -------HTML requests CONFIG -----------------
app.get('/', function(req, res) {
    res.sendfile('index.html');
});
app.get('/register', function(req, res) {
    res.sendfile('register.html');
});

// -------AUTHENTICATION CONFIG -----------------
var jsonWebToken = require('jsonwebtoken');
var restrictedRoutes = express.Router();
app.use('/api/v2', restrictedRoutes);
app.set('secretKey', 'ThisIsASecret');

// Authentication endpoint
restrictedRoutes.post('/authenticate', function (req, res) {
    User.findOne({
        username: req.body.username
    }, function (error, user) {
        if (error) throw error;

        if (!user) {
            res.status(404).send({success: false, message: 'Authentication failed. User not found.'});
        } else {
            if (user) {
                if (user.password != req.body.password) {
                    res.status(500).send({success: false, message: 'Authentication failed. Wrong password.'});
                } else {
                    var token = jsonWebToken.sign(user, app.get('secretKey'), {
                        expiresIn: 60*10 // 60s x 10 = 10min
                    });

                    res.json({
                        success: true,
                        message: 'Login success!',
                        token: token
                    });
                }
            }
        }
    });
});

// Token interceptor that decodes token from request
restrictedRoutes.use(function (req, res, next) {
    // this is executed like a request interceptor before actually processing a request
    console.log("Checking token...");
    var token = req.body.token || req.query.token || req.headers['authorization'];
    if (token) {
        jsonWebToken.verify(token, app.get('secretKey'), function (error, decoded) {
            if (error) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

// Other endpoints
restrictedRoutes.get('/dashboard', function (req, res) {
    res.sendfile('dashboard.html');
});




