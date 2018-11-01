const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
var authenticate = require('../authenticate');
const Favorites = require('../models/favorite');
const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {    
    Favorites.findOne({user: req.user._id })   
    .populate('user')
    .populate('dishes')                  
    .then((favorite) => {         
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})    
    .then((favorite) => {  
        if (!favorite) {
            Favorites.create({user: req.user._id, dishes: req.body})
            .then((favorite) => {     
                for (i = 0; i < req.body.length; i++ )
                    if (favorite.dishes.indexOf(req.body[i]._id) < 0)                                          
                        favorite.dishes.push(req.body[i]);                
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)    
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })                                         
                })
            })            
        }
        else {         
            for (i = 0; i < req.body.length; i++ )
                if (favorite.dishes.indexOf(req.body[i]._id) < 0)                                          
                    favorite.dishes.push(req.body[i]);          
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                     res.json(favorite);
                })                                           
            })  
        }        
    },(err) => next(err))
    .catch((err) => next(err));    
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var userID = mongoose.Types.ObjectId(req.user.id); 
    Favorites.remove({user: userID})
    .then((resp) => {      
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (!favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorite": favorite});
        }
        else {
            if (favorite.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorite": favorite});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorite": favorite});
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    Favorites.findOne({user: req.user._id})    
    .then((favorite) => {  
        if (!favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorite": favorite});
        }
        else {        
            if (favorite.dishes.indexOf(req.params.dishId) < 0)    
            {                                             
                favorite.dishes.push(req.params.dishId);  
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })                                           
                })
            }
            else {               
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })      
            }
        } 
    }, (err) => next(err))
    .catch((err) => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on favorites/dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorites.findOne({user: req.user._id})    
    .then((favorite) => {
        if (!favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorite": favorite});
        }  
       else {    
            if (favorite.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorite": favorite});
            }
            else {
                var dishIndex = favorite.dishes.indexOf(req.params.dishId);               
                favorite.dishes.splice(dishIndex, 1);               
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })                                          
                })
            }          
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;