const xlsx = require('node-xlsx');
const charset = require('superagent-charset');
const superagent = require('superagent');
const cheerio = require('cheerio');
let excelName = "2016n.xls";
let list = xlsx.parse('./api/education/util/'+excelName);
let data = list[0].data;
const len = data.length-1;
function check(user){
    let id = '';
    let name = '';
    for(let i = 1;i<len;i++){
        if(data[i][2]==user){
            id = data[i][4];
            name = data[i][3];
            break;
        }
    }
    return {
      id:id,
      name:name
    }
}
const getRandomIp = () => {
  const arr = [];
  for (let i = 0; i < 4; i++) {
    arr.push(Math.floor(Math.random() * 255));
  }
  return arr.join('.');
};
const options = {
  // 直接拼会出错，使用 encodeURI 
  // 学信网查询地址示例 http://www.chsi.com.cn/cet/query?zkzh=1233243434&xm=李三
  // encodeURI 接收一个完整的 URI 作为参数，返回编码过的值
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
  encoding: 'utf8',
  headers: {
    'Referer': 'http://www.chsi.com.cn/cet/',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
    // 客户端的 IP 地址
    'X-Forwarded-For': `${getRandomIp()}`
  }
};
function getCet(username){
  let mes = check(username);
  const param = 'zkzh=' + mes.id + '&xm=' + mes.name;
  let url='http://www.chsi.com.cn/cet/query?' + encodeURI(param);
  const promise = new Promise((resolve,reject)=>{
    superagent
      .get(url)
      .charset()
      .set(options.headers)
      .end((err,response,body)=>{
        if(err){
          console.log('get index is error');
          resolve({
            error:err,
          });
        }else{
          var bod = response.text;
          const $ = cheerio.load(bod);
          const $result = $('table.cetTable td');
          const result = {};
          result.data = [];
          result.data.push({
            name:mes.name,
            school: $result.eq(1).text().trim(),
            type: $result.eq(2).text().trim(),
            id: mes.id,
            total: $result.eq(4).text().trim(),
            listen: $result.eq(6).text().trim(),
            reading: $result.eq(8).text().trim(),
            writing: $result.eq(10).text().trim()
          })
          resolve(result);
        }
      })
  });
  return promise;
}

exports.getCet = getCet;