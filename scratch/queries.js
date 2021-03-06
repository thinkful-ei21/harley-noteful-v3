'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const searchTerm = 'Posuere';
//     let filter = {};

//     if (searchTerm) {
//       filter = {$or:[{title:{ $regex: searchTerm }},{content:{ $regex: searchTerm }}]};
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })    
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     return Note.find()
//       .then(results => {
//         return Note.findById(results[0]._id);
//       });
//     //return Note.findById(1);
//   })   
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     return Note.create({
//       title: 'New Note',
//       content: 'New Content'
//     });
//     //return Note.findById(1);
//   })   
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     return Note.find()
//       .then(results => {
//         return Note.findByIdAndUpdate(results[0]._id,
//           {$set: {
//             title: 'Updated Note',
//             content: 'Updated Content'
//           }}); 
//       });
//     //return Note.findById(1);
//   })   
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

mongoose.connect(MONGODB_URI)
  .then(() => {
    return Note.find()
      .then(results => {
        return Note.findByIdAndRemove(results[0]._id); 
      });
    //return Note.findById(1);
  })   
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     return Note.find();
//     //return Note.findById(1);
//   })   
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });