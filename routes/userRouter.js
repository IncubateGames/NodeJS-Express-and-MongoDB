const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const User = require('../models/users');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();
router.use(bodyParser.json());

router.route('/')
.get(authenticate.verifyUser,authenticate.verifyAdmin,(req,res) => {
    User.find({})
    .then((users)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(users)
    },(err) => next(err))
    .catch((err)=>next(err));
});


router.route('/signup')
.post((req,res)=>{
    User.register(new User({username: req.body.username}),
        req.body.password,(err,user) => {    
        if(err){
            res.statusCode = 500;
            res.setHeader('Content-Type','application/json');
            res.json({err:err});
        }
        else{
            if(req.body.firstname){
                user.firstname = req.body.firstname;
            }
            if(req.body.lastname){
                user.lastname = req.body.lastname;
            }
            user.save((err,user)=>{
                if(err){
                    res.statusCode = 500;
                    res.setHeader('Content-Type','application/json');
                    res.json({err:err});
                    return;
                }
                passport.authenticate('local')(req,res,() => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json({sucess: true, status: 'Registration Succesful'});
                });
            });            
        }
    });    
});

router.route('/login')
.post(passport.authenticate('local'),(req,res)=>{        
    console.log(req.session);
    let token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({sucess: true, token: token,status: 'You are Succesfully loggin!'});
});

router.route('/logout')
.get((req,res,next)=>{  
    console.log(req.session);  
    if(req.session){
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    }
    else {
        var err = new Error('You are not logged in!');
        err.status = 403;
        next(err);
    }
}); 

module.exports = router;