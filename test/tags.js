'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Tag = require('../models/tag');

const seedTags = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Tags API resource', function() {

  before(function () {
    //console.log('before');
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
    
  beforeEach(function () {
    //console.log('beforeEach');
    return Promise.all([
      Tag.insertMany(seedTags),
      Tag.createIndexes(),
    ]);
  });
    
  afterEach(function () {
    //console.log('afterEach');
    return mongoose.connection.db.dropDatabase();
  });
    
  after(function () {
    //console.log('after');
    return mongoose.disconnect();
  });

  describe('GET /api/tags', function () {

    it('should return all existing tags', function() {
      // 1) Call the database **and** the API
      // 2) Wait for both promises to resolve using `Promise.all`
      return Promise.all([
        Tag.find(),
        chai.request(app).get('/api/tags')
      ])
      // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return tags with right fields', function() {
      let resTag;
      return chai.request(app)
        .get('/api/tags')
        .then(function(res) {
          res.body.forEach(function(tag) {
            expect(tag).to.be.a('object');
            expect(tag).to.include.keys(
              'id','name','createdAt','updatedAt');
          });
          resTag = res.body[0];
          return Tag.findById(resTag.id);
        })
        .then(function(tag) {
          expect(resTag.id).to.equal(tag.id);
          expect(resTag.name).to.equal(tag.name);
          expect(new Date(resTag.createdAt)).to.eql(tag.createdAt);
          expect(new Date(resTag.updatedAt)).to.eql(tag.updatedAt);
        });
    });
    
  });

  describe('GET /api/tags/:id', function () {
    it('should return correct tag', function () {
      let data;
      // 1) First, call the database
      return Tag.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with 400 if id is bad', () => {
      
      return chai.request(app)
        .get('/api/tags/0')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('POST /api/tags', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'name': 'Best Tag'
      };

      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/tags')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Tag.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with 400 if name missing', () => {
      const newItem = {
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };

      return chai.request(app)
        .post('/api/tags')
        .send(newItem)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should respond with 400 if duplicate key', () => {
      const { name } = Tag.findOne();
      
      const newItem = {
        'name': name
      };
  
      return chai.request(app)
        .post('/api/tags')
        .send(newItem)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

  });

  describe('PUT /api/tags', function () {
    it('should update fields you send over', function () {
      const updateData = {
        'name': 'best tag',
      };

      let res;
      
      return Tag.findOne()
        .then(function(tag) {
          updateData.id = tag.id;
          return chai.request(app)
            .put(`/api/tags/${tag.id}`)
            .send(updateData);
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          return Tag.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });

        
    });


    it('should respond with 400 if name missing', () => {
      const updateData = {
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };
      //push again
      return Tag.findOne()
        .then(function(tag) {
          updateData.id = tag.id;
          return chai.request(app)
            .put(`/api/tags/${tag.id}`)
            .send(updateData);
        })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should return an error when given a duplicate name', function () {
      return Tag.find().limit(2)
        .then(results => {
          const [item1, item2] = results;
          item1.name = item2.name;
          return chai.request(app)
            .put(`/api/tags/${item1.id}`)
            .send(item1);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The tag name already exists');
        });
    });

    it('should respond with 400 if id is bad', () => {
      const updateData = {
        'name': 'best tag',
      };
    
      
      return chai.request(app)
        .put('/api/tags/0')
        .send(updateData)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

  });

  describe('DELETE /api/tags', function() {
    
    it('should delete a tag by id', function() {

      let tag;

      return Tag
        .findOne()
        .then(function(_tag) {
          tag = _tag;
          return chai.request(app).delete(`/api/tags/${tag.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          return Tag.findById(tag.id);
        })
        .then(function(_tag) {
          expect(_tag).to.be.null;
        });
    });
  });
    
});