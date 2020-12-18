const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Promotions = require('../models/promotions');

const router = express.Router();
router.use(bodyParser.json());

router.route('/')
.get((req,res,next) => {
    Promotions.find({})
    .then((promotions)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotions)
    },(err) => next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Promotions.create(req.body)
   .then((promotion)=>{
        console.log('Promotion created ',promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion)
   },(err) => next(err))
   .catch((err)=>next(err));
})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Promotions.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp)
    },(err) => next(err))
    .catch((err)=>next(err));
});

router.route('/:Id')
.get((req,res,next)=>{
    Promotions.findById(req.params.Id)
    .then((promotion)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion)
    },(err) => next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode = 403;
    res.end('POST not support it!');
})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Promotions.findByIdAndUpdate(req.params.Id,{
        $set: req.body
    },{new:true})   
    .then((promotion)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion)
    },(err) => next(err))
    .catch((err)=>next(err));
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Promotions.findByIdAndRemove(req.params.Id)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp)
    },(err) => next(err))
    .catch((err)=>next(err));
});

module.exports = router;