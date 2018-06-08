'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');

const seedFolders = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Folders API resource', function() {

  before(function () {
    //console.log('before');
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
    
  beforeEach(function () {
    //console.log('beforeEach');
    return Promise.all([
      Folder.insertMany(seedFolders),
      Folder.createIndexes(),
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

  describe('GET /api/folders', function () {

    it('should return all existing folders', function() {
      // 1) Call the database **and** the API
      // 2) Wait for both promises to resolve using `Promise.all`
      return Promise.all([
        Folder.find(),
        chai.request(app).get('/api/folders')
      ])
      // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return folders with right fields', function() {
      let resFolder;
      return chai.request(app)
        .get('/api/folders')
        .then(function(res) {
          res.body.forEach(function(folder) {
            expect(folder).to.be.a('object');
            expect(folder).to.include.keys(
              'id','name','createdAt','updatedAt');
          });
          resFolder = res.body[0];
          return Folder.findById(resFolder.id);
        })
        .then(function(folder) {
          expect(resFolder.id).to.equal(folder.id);
          expect(resFolder.name).to.equal(folder.name);
          expect(new Date(resFolder.createdAt)).to.eql(folder.createdAt);
          expect(new Date(resFolder.updatedAt)).to.eql(folder.updatedAt);
        });
    });
    
  });

  describe('GET /api/folders/:id', function () {
    it('should return correct folder', function () {
      let data;
      // 1) First, call the database
      return Folder.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/folders/${data.id}`);
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
        .get('/api/folders/0')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('POST /api/folders', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'name': 'Best Folder'
      };

      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/folders')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Folder.findById(res.body.id);
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
        .post('/api/folders')
        .send(newItem)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should respond with 400 if duplicate key', () => {
      const { name } = Folder.findOne();
      
      const newItem = {
        'name': name
      };
  
      return chai.request(app)
        .post('/api/folders')
        .send(newItem)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

  });

  describe('PUT /api/folders', function () {
    it('should update fields you send over', function () {
      const updateData = {
        'name': 'best folder',
      };

      let res;
      
      return Folder.findOne()
        .then(function(folder) {
          updateData.id = folder.id;
          return chai.request(app)
            .put(`/api/folders/${folder.id}`)
            .send(updateData);
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          return Folder.findById(res.body.id);
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
      return Folder.findOne()
        .then(function(folder) {
          updateData.id = folder.id;
          return chai.request(app)
            .put(`/api/folders/${folder.id}`)
            .send(updateData);
        })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should return an error when given a duplicate name', function () {
      return Folder.find().limit(2)
        .then(results => {
          const [item1, item2] = results;
          item1.name = item2.name;
          return chai.request(app)
            .put(`/api/folders/${item1.id}`)
            .send(item1);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The folder name already exists');
        });
    });

    it('should respond with 400 if id is bad', () => {
      const updateData = {
        'name': 'best folder',
      };
    
      
      return chai.request(app)
        .put('/api/folders/0')
        .send(updateData)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

  });

  describe('DELETE /api/folders', function() {
    
    it('should delete a folder by id', function() {

      let folder;

      return Folder
        .findOne()
        .then(function(_folder) {
          folder = _folder;
          return chai.request(app).delete(`/api/folders/${folder.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Folder.findById(folder.id);
        })
        .then(function(_folder) {
          expect(_folder).to.be.null;
        });
    });
  });
    
});