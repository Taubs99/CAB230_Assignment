var express = require('express');
var mysql = require('mysql');
var router = express.Router();

router.get('/offences', function(req, res) {
  req.db.pluck('pretty').from('offence_columns').select("pretty")
    .then((offences) => {
      res.json({"offences": offences})
    })
    .catch((err) => {
      console.log(err);
      res.json({"Error": true, "Message": "Error in MySQL query"})
    })
})

router.get('/areas', function(req, res) {
  req.db.pluck('area').from('areas').select("area")
    .then((areas) => {
      res.json({"areas": areas})
    })
    .catch((err) => {
      console.log(err);
      res.json({"Error": true, "Message": "Error in MySQL query"})
    })
})

router.get('/ages', function(req, res) {
  req.db.distinct().pluck('age').from('offences').select("age")
    .then((ages) => {
      res.json({"ages": ages})
    })
    .catch((err) => {
      console.log(err);
      res.json({"Error": true, "Message": "Error in MySQL query"})
    })
})

router.get('/genders', function(req, res) {
  req.db.distinct().pluck('gender').from('offences').select("gender")
    .then((genders) => {
      res.json({"genders": genders})
    })
    .catch((err) => {
      console.log(err);
      res.json({"Error": true, "Message": "Error in MySQL query"})
    })
})

router.get('/years', function(req, res) {
  req.db.distinct().pluck('year').from('offences').select("year")
    .then((years) => {
      res.json({"years": years})
    })
    .catch((err) => {
      console.log(err);
      res.json({"Error": true, "Message": "Error in MySQL query"})
    })
})

router.get('/search', function(req, res) {
  req.db.select('offences.area as LGA')
    .from('offences')
    .modify(function(queryBuilder) {
      if(req.query.area) {
        queryBuilder.whereIn('offences.area', req.query.area.split(','));
      }
      if(req.query.age) {
        queryBuilder.whereIn('offences.age', req.query.age.split(','));
      }
      if(req.query.gender) {
        queryBuilder.whereIn('offences.gender', req.query.gender.split(','));
      }
      if(req.query.year) {
        queryBuilder.whereIn('offences.year', req.query.year.split(','));
      }
      if(req.query.month) {
        queryBuilder.whereIn('offences.month', req.query.month.split(','));
      }
    })
    .sum({total: req.query.offence.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()})
    .select('areas.lat', 'areas.lng')
    .join('areas', 'offences.area', 'areas.area')
    .groupBy('offences.area')
    .then((searchesTotal) => {
      res.json({"query": req.query, "result": searchesTotal})
    })
    .catch((err) => {
      console.log(err);
      res.json({"Error": true, "Message": "error in MySQL query"})
    })
})

module.exports = router;
