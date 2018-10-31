const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const cors = require('./cors');

var authenticate = require('../authenticate');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    console.log(req.user._id);
    Favorites.findOne({user: req.user._id })
    
    .then((favorite) => {
        //console.log(favorite);
    //.populate('favorite.user')
    //.populate('favorite.dishes')
   // .then((favorite) => {
        console.log("f " + favorite);
           res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    /*req.body.user = req.user._id;
    req.body.dishId = req.dish._id;

    Favorites.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
        }
    });

    Favorites.create(req.body)
    .then((favorite) => {
        console.log('Favorite Created ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));*/
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    /*Favorites.findByIdAndUpdate(req.params.favoriteId, {
        $set: req.body
    }, { new: true })
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));*/
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    /*Favorites.findByIdAndRemove(req.params.favoriteId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));*/
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    /*Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));*/
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    //req.body.user = req.user._id;
    req.body.dishId = req.params.dishId;
//console.log(req.user._id + ' ' + req.params.dishId);
    Favorites.findOne({user: req.user._id })
    
    .then((favorite) => {
        console.log(favorite);
        if (favorite != null) {   
        
            
            favorite.dishes.push(req.params.dishId);

            console.log(favorite.dishes);
            //res.end('POST operation not supported on /dishes/'+ req.params.dishId);

            favorite.save()
                .then((favorite) => {
                    Favorites.findOne({user: req.user._id })
                    .populate('favorite.user')
                    .populate('favorite.dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);    
                    })                           
                }, (err) => next(err));
        }
        else{
             req.body.user = req.user._id;
             req.body.dishId = req.params.dishId;
            Favorites.create(req.body)
            .populate('favorite.user')
            .populate('favorite.dishes')
            .then((favorite) => {
                console.log('Favorite Created ', favorite);
               
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
            console.log(req.user._id + ' not found');
        }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    /*Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true })
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));*/
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    /*Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));*/
});

module.exports = favoriteRouter;