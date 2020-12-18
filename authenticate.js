const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Users = require('./models/users');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

var config = require('./config');

passport.use(Users.createStrategy());
passport.serializeUser(Users.serializeUser()); 
passport.deserializeUser(Users.deserializeUser()); 

exports.getToken = function(user){
    return jwt.sign(user,config.secretKey, {
        expiresIn: 3600
    });
};

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,(jwt_payload, done)=>{
        console.log("JWT payload: ", jwt_payload);
        Users.findOne({_id: jwt_payload._id},(err,user)=>{
            if(err){
                return done(err, false);
            }
            else if(user){
                return done(null, user);
            }
            else{
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt',{session: false});
exports.verifyAdmin = function(req, res, next) {       
        if(!req.user){
            var err = new Error('You are not logged in!');
            err.status = 403;
            next(err);
        }
        if (!req.user.admin) { 
            var err = new Error('You are not admin!');
            err.status = 403;
            next(err);
        }
        else {
            next();
        }
    };

