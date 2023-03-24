var express = require('express');
var passport = require('passport');
var session = require('express-session');
var passportSteam = require('passport-steam');
var request = require('request');
const axios = require('axios');
var cors = require('cors')
const { response } = require('express');
var SteamStrategy = passportSteam.Strategy;
var app = express();

var port = 3080;
var userID = -1;

app.use(cors())

// Required to get data from user for sessions
passport.serializeUser((user, done) => {
    done(null, user);
   });
   passport.deserializeUser((user, done) => {
    done(null, user);
   });
   // Initiate Strategy
   passport.use(new SteamStrategy({
    returnURL: 'http://localhost:' + port + '/api/auth/steam/return',
    realm: 'http://localhost:' + port + '/',
    apiKey: 'E3ECE458BA26350EAF264840A63BF51E'
    }, function (identifier, profile, done) {
     process.nextTick(function () {
      profile.identifier = identifier;
      return done(null, profile);
     });
    }
));

app.use(session({
    secret: 'Whatever_You_Want',
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: 3600000
    }
}))

app.use(passport.initialize());

app.use(passport.session());

// Spin up the server
app.listen(port, () => {
    console.log('Listening, port ' + port);
});

// Routes
app.get('/', (req, res) => {
    userID = req.user['_json']['steamid'];

    //Redirect back to front end
    res.writeHead(302, {
        Location: 'http://localhost:3000'
    });
    res.end(); 
});

app.get('/user', function(req, res) { 
    async function getData(){
        //TODO add exception handing here 
        if(userID == -1) return {};

        const fullURL = 'https://gamesothis.herokuapp.com/user/' + userID;
        const res = await axios.get(fullURL);
        
        //const res = await axios.get('https://gamesothis.herokuapp.com/user/76561198345197403')
        const data = res.data;
        //console.log(data);
        return data;
    }

    getData().then(data => {
            res.status(200).send(data);
        }
    );
    
    //-------------------This also works------------------------------------------------------------------
    // request('https://gamesothis.herokuapp.com/user/76561198345197403', function(error, response, body){
    //     if(!error && response.statusCode == 200){
    //         console.log(body)
    //     }
    // });
});

app.get('/api/auth/steam', passport.authenticate('steam', {failureRedirect: '/'}), function (req, res) {
    //var redirectionUrl = req.session.redirectionUrl || '/';
    //res.redirect(redirectionUrl);

    res.redirect('/')
});

app.get('/api/auth/steam/return', passport.authenticate('steam', {failureRedirect: '/'}), function (req, res) {
    //var redirectionUrl = req.session.redirectionUrl || '/';
    //res.redirect(redirectionUrl);

    res.redirect('/')
});
   