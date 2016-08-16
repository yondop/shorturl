const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const validator = require('validator');


const port = process.env.PORT || 3000;
const DB_URL = 'mongodb://admin:admin@ds161475.mlab.com:61475/shorturl-yo';

MongoClient.connect(DB_URL, (err, db) => {
  if (err) throw err;
  const urls = db.collection('urls');

  app.get('/', (req, res) => {
    res.send('/new/:url to create');
  });

  app.get('/new/:url*', (req, res) => {
    const fullUrl = req.url.slice(5);
    if (!validator.isURL(fullUrl)) return res.json({ error: 'Not valud URL' });
    urls.count({}, (err, count) => {
      let newUrl = {
        full: fullUrl,
        _id: count
      };
      urls.insertOne(newUrl);
      res.json({
        short: req.protocol + '://' + req.get('host') + '/' + newUrl._id
      });
    });
  });

  app.get('/:id', (req, res) => {
    const {id} = req.params;
    urls.findOne({_id: +id}, (err, url) => {
      if (!url) return res.json({ error: 'Not found' });
      res.redirect(url.full);
    });
  });

  app.listen(port);
});
