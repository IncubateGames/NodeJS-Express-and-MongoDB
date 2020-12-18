const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const router = express.Router();

router.use(bodyParser.json());

router.route('/')
.get((req,res,next) => {
    Dishes.find({})
    .populate('comments.author')
    .then((dishes)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes)
    },(err) => next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
   Dishes.create(req.body)
   .then((dish)=>{
        console.log('Dish created ',dish);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish)
   },(err) => next(err))
   .catch((err)=>next(err));
})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Dishes.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp)
    },(err) => next(err))
    .catch((err)=>next(err));
});

router.route('/:Id')
.get((req,res,next)=>{
    Dishes.findById(req.params.Id)
    .populate('comments.author')
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish)
    },(err) => next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode = 403;
    res.end('POST not support it!');
})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Dishes.findByIdAndUpdate(req.params.Id,{
        $set: req.body
    },{new:true})   
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish)
    },(err) => next(err))
    .catch((err)=>next(err));
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Dishes.findByIdAndRemove(req.params.Id)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp)
    },(err) => next(err))
    .catch((err)=>next(err));
});
//Comments
router.route('/:Id/comments')
.get((req,res,next) => {
    Dishes.findById(req.params.Id)
    .populate('comments.author')
    .then((dish)=>{
        if (dish){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments)
        }   
        else {
            err = new Error('Dish ' + req.params.Id + ' not existing');
            err.statusCode = 404;
            return next(err);
        }     
    },(err) => next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser,(req, res, next) => {
   Dishes.findById(req.params.Id)   
   .then((dish)=>{
        if (dish){  
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish)=>{
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish)
                });                
            },(err) => next(err));        
        }   
        else {
            err = new Error('Dish ' + req.params.Id + ' not existing');
            err.statusCode = 404;
            return next(err);
        }             
   },(err) => next(err))
   .catch((err)=>next(err));
})
.put(authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/ ' + req.params.Id + '/comments');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Dishes.findById(req.params.Id)    
    .then((dish)=>{
        if (dish){
            for (var i= (dish.comments.length - 1);i>=0;i--){
                dish.comments.id(dish.comments[i]._id).remove();                 
            }
            dish.save()
            .then((dish)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(dish)
            },(err) => next(err));                    
        }   
        else {
            err = new Error('Dish ' + req.params.Id + ' not existing');
            err.statusCode = 404;
            return next(err);
        }    
    },(err) => next(err))
    .catch((err)=>next(err));
});

router.route('/:Id/comments/:commentId')
.get((req,res,next)=>{
    Dishes.findById(req.params.Id)
    .populate('comments.author')
    .then((dish)=>{
        if (dish && dish.comments.id(req.params.commentId)){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments.id(req.params.commentId));
        }   
        else if (!dish){
            err = new Error('Dish ' + req.params.Id + ' not existing');
            err.statusCode = 404;
            return next(err);
        } 
        else{
            err = new Error('Comment ' + req.params.commentId + ' not existing');
            err.statusCode = 404;
            return next(err);
        }      
    },(err) => next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end('POST not support it on /dishes/'+ req.params.Id +'/comments/'+req.params.commentId);
})
.put(authenticate.verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.Id)
    .then((dish)=>{
        if (dish && dish.comments.id(req.params.commentId)){       
            if(String(dish.comments.id(req.params.commentId).author._id) ===  String(req.user._id)){               
                if(req.body.rating){
                    dish.comments.id(req.params.commentId).rating= req.body.rating;
                }
                if(req.body.comment){
                    dish.comments.id(req.params.commentId).comment= req.body.comment;
                }
                dish.save()
                .then((dish)=>{
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(dish)
                    });
                },(err) => next(err));    
            }
            else{
                err = new Error('Comment ' + req.params.Id + ' can only be modified by creator');
                err.statusCode = 403;
                return next(err);
            }
        }   
        else if (!dish){
            err = new Error('Dish ' + req.params.Id + ' not existing');
            err.statusCode = 404;
            return next(err);
        } 
        else{
            err = new Error('Comment ' + req.params.commentId + ' not existing');
            err.statusCode = 404;
            return next(err);
        }      
    },(err) => next(err))
})
.delete(authenticate.verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.Id)    
    .then((dish)=>{
        if (dish && dish.comments.id(req.params.commentId)){            
           if(String(dish.comments.id(req.params.commentId).author._id)  ===  String(req.user._id)){
                dish.comments.id(req.params.commentId).remove();                
                dish.save()
                .then((dish)=>{
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(dish)
                    });
                },(err) => next(err));                    
           }
           else{
                err = new Error('Comment ' + req.params.Id + ' can only be deleted by creator');
                err.statusCode = 403;
                return next(err);
           }
        }   
        else if (!dish){
            err = new Error('Dish ' + req.params.Id + ' not existing');
            err.statusCode = 404;
            return next(err);
        } 
        else{
            err = new Error('Comment ' + req.params.commentId + ' not existing');
            err.statusCode = 404;
            return next(err);
        }    
    },(err) => next(err))
    .catch((err)=>next(err));
});

module.exports = router;