'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const seedNotes = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Notes API resource', function() {

  before(function () {
    console.log('before');
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
    
  beforeEach(function () {
    console.log('beforeEach');
    return Note.insertMany(seedNotes);
  });
    
  afterEach(function () {
    console.log('afterEach');
    return mongoose.connection.db.dropDatabase();
  });
    
  after(function () {
    console.log('after');
    return mongoose.disconnect();
  });

  describe('GET /api/notes', function () {

    it('should return all existing notes', function() {
      // 1) Call the database **and** the API
      // 2) Wait for both promises to resolve using `Promise.all`
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
      // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    
    
  });
    
});

