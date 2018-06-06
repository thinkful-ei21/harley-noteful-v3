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
    //console.log('before');
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
    
  beforeEach(function () {
    //console.log('beforeEach');
    return Note.insertMany(seedNotes);
  });
    
  afterEach(function () {
    //console.log('afterEach');
    return mongoose.connection.db.dropDatabase();
  });
    
  after(function () {
    //console.log('after');
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

    it('should return notes with right fields', function() {
      let resNote;
      return chai.request(app)
        .get('/api/notes')
        .then(function(res) {
          res.body.forEach(function(note) {
            expect(note).to.be.a('object');
            expect(note).to.include.keys(
              'id','title','content','createdAt','updatedAt');
          });
          resNote = res.body[0];
          return Note.findById(resNote.id);
        })
        .then(function(note) {
          expect(resNote.id).to.equal(note.id);
          expect(resNote.title).to.equal(note.title);
          expect(resNote.content).to.equal(note.content);
          expect(new Date(resNote.createdAt)).to.eql(note.createdAt);
          expect(new Date(resNote.updatedAt)).to.eql(note.updatedAt);
        });
    });
    
  });

  describe('GET /api/notes/:id', function () {
    it('should return correct note', function () {
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };

      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Note.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });
    
});

