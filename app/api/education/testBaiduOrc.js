var fs = require("fs");
var express = require("express");
var cheerio = require("cheerio");
var iconv = require("iconv-lite");
var charset = require('superagent-charset');
var superagent = charset(require('superagent'));
var http = require('http');
var Tesseract = require('tesseract.js');
var crypto = require('crypto');

var ak = 'f19700b5f9dc4039a208195f576e7ec0';
var sk = 'd6c2a6f2afe54913b430308042589ad9';
var ocr = require('baidu-ocr-api').create(ak,sk);

var url = {
  login_url: "http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp",
  captcha_url: "http://jwzx.hrbust.edu.cn/academic/getCaptcha.do",
  check_url: "http://jwzx.hrbust.edu.cn/academic/j_acegi_security_check?"
};
// var count = 750;
// var obj = {};

// function getImage() {
//   var ip = Math.random(1 , 254)
//     + "." + Math.random(1 , 254)
//     + "." + Math.random(1 , 254)
//     + "." + Math.random(1 , 254);
//   superagent
//     .get(url.captcha_url)
//     .buffer(true)
//     .set("X-Forwarded-For" , ip)
//     .end((err, response, body) => {
//       if (err) {
//         console.log(err);
//       } else {
//         var dataBuffer = new Buffer(response.body, 'base64');
//         var imgPath = 'image/image' + (count) + '.jpg';
//         fs.writeFile(imgPath, response.body);

//         var fsHash = crypto.createHash('md5');
//         fsHash.update(response.body);
//         var md5 = fsHash.digest('hex');
//         console.log("文件的MD5是：%s", md5, count);
//         if (obj[md5]) {
//           console('重复的');
//           return;
//         }
//         count ++;
//         obj[md5] = 0;
//         if (count >= 1000) {
//           return;
//         }
//         setTimeout(function() {
//           getImage();
//         }, 5000)
//         // var imgPath = 'image/image' + (count++) + '.jpg';
//         // console.log(imgPath);
//         // fs.writeFile(imgPath, response.body);
//         // getImage();
//         // 外部图片
//         // ocr.scan({
//         //   url: imgPath, // 支持本地路径
//         //   type:'text',
//         // }).then(function (result) {
//         //   return console.log(result)
//         // }).catch(function (err) {
//         //   console.log('err');
//         // })
//       }
//     });
// }
// getImage();

// var Tesseract = require('tesseract.js');
// // Tesseract.recognize = "numxy";
// var count = 750;
// function tesseract() {
//   Tesseract.recognize('image/image'+ (count++) +'.jpg', { lang: 'myTest' })
//     .then((result) => {
//       var text = result.text;
//       text = text.replace(/\s/g, "");
//       // var ex = (/^[0-9]*$/.test(text));
//       // if (!ex) {
//       //   simulateLogin(username, password);
//       //   return;
//       // }
//       console.log(text, '---'+(count-1));
//       if (count <= 1000) {
//         tesseract();
//       }
//     })
// }
// tesseract();