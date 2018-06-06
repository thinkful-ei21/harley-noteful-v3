'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const router = express.Router();
const Note = require('../models/note');

/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {

  const { searchTerm } = req.query;

  mongoose.connect(MONGODB_URI)
    .then(() => {
      let filter = {};

      if (searchTerm) {
        filter = {$or:[{title:{ $regex: searchTerm }},{content:{ $regex: searchTerm }}]};
      }

      return Note.find(filter).sort({ updatedAt: 'desc' });
    })    
    .then(results => {
      if(results) {
        res.json(results);
      } else {
        next();
      }
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  mongoose.connect(MONGODB_URI)
    .then(() => {
      return Note.findById(id);
    //return Note.findById(1);
    })   
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  const { title, content } = req.body;
  const newItem = { title,content };

  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  mongoose.connect(MONGODB_URI)
    .then(() => {
      return Note.create(newItem);
    //return Note.findById(1);
    })   
    .then(result => {
      if (result) {
        res.location(`${req.originalUrl}/${result._id}`).status(201).json(result);
      } else {
        next();
      } 
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  const { title, content } = req.body;
  const updateObj = { title, content };

  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  mongoose.connect(MONGODB_URI)
    .then(() => {
      return Note.findByIdAndUpdate(id,{$set: updateObj}); 
    })   
    .then(result => {
      if (result) {
        res.status(200).json(result);
      } else {
        next();
      }
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.status(204).end();
});

module.exports = router;