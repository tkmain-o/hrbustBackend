const http = require('http');
var decoder = require('ling-cet-decoder');
var request = require('request');

var name = "毛宇顺",
  school = "海南大学",
 cetType = 1; //1 for CET4, 2 for CET6
const server = http.createServer((req, res) => {
    var tik = '';
    request.post({
    url: 'http://find.cet.99sushe.com/search',
    encoding: null,
    body: decoder.getEncryptReqBody(cetType, school, name)
    }, function (err, req, bodyBuf) {
    if (err) {
        throw new Error(err);
    }
    var ticket = decoder.decryptResBody(bodyBuf);
    tik = ticket;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World'+ticket+'');
    console.log("我的准考证号是:", ticket);
    });
});

server.listen(3000, () => {
    console.log(`node server is now running/`);
});