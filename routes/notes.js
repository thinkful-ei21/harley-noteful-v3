'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const router = express.Router();
const Note = require('../models/note');

/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {

  const { searchTerm, folderId, tagId } = req.query;

  let filter = {};

  if (searchTerm) {
    filter.$or = [{title:{ $regex: searchTerm }},{content:{ $regex: searchTerm }}];
  }
  
  if (folderId) {
    filter.folderId = folderId;
  }

  if (tagId) {
    filter.tagId = tagId;
  }

  //console.log(filter);

  Note.find(filter).populate('tags').sort({ updatedAt: 'desc' })    
    .then(results => {
      if(results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findById(id)
    .populate('tags')
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  const { title, content, folderId, tags } = req.body;
  const newItem = { title,content, tags: []};

  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId) {
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      const err = new Error('The `folderId` is not valid');
      err.status = 400;
      return next(err);
    }
    newItem.folderId = folderId;
  }

  if (tags) {
    tags.forEach(tagId => {
      if (!mongoose.Types.ObjectId.isValid(tagId)) {
        const err = new Error('A `tagId` is not valid');
        err.status = 400;
        return next(err);
      }
      newItem.tags.push(tagId);
    });
  }

  Note.create(newItem)
    .then(result => {
      if (result) {
        res.location(`${req.originalUrl}/${result._id}`).status(201).json(result);
      } else {
        next();
      } 
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  const { title, content, folderId, tags } = req.body;
  const updateObj = { title, content, tags: [] };

  if (folderId) {
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      const err = new Error('The `folderId` is not valid');
      err.status = 400;
      return next(err);
    }
    updateObj.folderId = folderId;
  }

  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (tags) {
    tags.forEach(tagId => {
      if (!mongoose.Types.ObjectId.isValid(tagId)) {
        const err = new Error('A `tagId` is not valid');
        err.status = 400;
        return next(err);
      }
      updateObj.tags.push(tagId);
    });
  }


  Note.findByIdAndUpdate(id,updateObj,{new:true}) 
    .then(result => {
      if (result) {
        res.status(200).json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findByIdAndRemove(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;