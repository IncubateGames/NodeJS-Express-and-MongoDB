const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Leaders = require('../models/leaders');

const router = express.Router();

router.use(bodyParser.json());

router.route('/')
.get((req,res,next) => {
    Leaders.find({})
    .then((leaders)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leaders)
    },(err) => next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Leaders.create(req.body)
   .then((leader)=>{
        console.log('Leader created ',leader);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leader)
   },(err) => next(err))
   .catch((err)=>next(err));
})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Leaders.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp)
    },(err) => next(err))
    .catch((err)=>next(err));
});

router.route('/:Id')
.get((req,res,next)=>{
    Leaders.findById(req.params.Id)
    .then((leader)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leader)
    },(err) => next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode = 403;
    res.end('POST not support it!');
})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Leaders.findByIdAndUpdate(req.params.Id,{
        $set: req.body
    },{new:true})   
    .then((leader)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leader)
    },(err) => next(err))
    .catch((err)=>next(err));
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Leaders.findByIdAndRemove(req.params.Id)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp)
    },(err) => next(err))
    .catch((err)=>next(err));
});

module.exports = router;