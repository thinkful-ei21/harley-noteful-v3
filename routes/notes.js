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

  console.log('Get a Note');
  res.json({ id: 1, title: 'Temp 1' });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  console.log('Create a Note');
  res.location('path/to/new/document').status(201).json({ id: 2, title: 'Temp 2' });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({ id: 1, title: 'Updated Temp 1' });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.status(204).end();
});

module.exports = router;