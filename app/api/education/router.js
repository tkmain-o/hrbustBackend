var course = require('./edu-course');
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
  console.log(req.query.cookie);
  var username = req.query.username;
  var password = req.query.password;
  var yourCookie = req.query.cookie;
  // course.simulateLogin("1305010420", "232331199301180823");
  var simulateIp = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  // console.log(req.headers['user-agent'],111);
  var agent = req.headers['user-agent'];
  var getCourseParmas = {
    username,
    password,
    callback: function(result) {
      // console.log(result);
      if (result.error) {
        log.error(error, 'error get course');
        res.status(500).send(error);
        return;
      }
      res.json(result);
    },
    simulateIp,
    // yourCookie
    yourCookie: "JSESSIONID=DE7C8BE40BF5655DF19C52B43F7514F4.LB01"
  }
  course.getCourse(getCourseParmas);
}


function createCourse(req, res) {
  res.status(201).send();
}

function home(req, res) {
  res.render('api/education/home');
}
router.get('/', home);
// router.post('/course', getCourse);
router.get('/course', getCourse);

module.exports = router;
