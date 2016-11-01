// var course = require('./edu-course');
var log = require('bole')('customers/router');
var express = require('express');
var router = new express.Router();

// function getCourse(req, res) {
//   course.getCourse(function(error, course) {
//     if (error) {
//       log.error(error, 'error get course');
//       res.status(500).send(error);
//       return;
//     }
//     res.json(course);
//   });
// }

function getCourse(req, res) {
  console.log(req.query.username);
  console.log(req.query.password);
  course.simulateLogin("1305010420", "232331199301180823");
}


function createCourse (req, res) {
  res.status(201).send();
}

function api (req, res) {
  res.render('api/api');
}
router.use('/education', require('./education/router'));
router.get('/', api);
// router.post('api/education', getCourse);
// router.get('api/education', getCourse);

module.exports = router;
