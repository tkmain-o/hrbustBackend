const xlsx = require('node-xlsx');

const excelName = 'n.xlsx';
const list = xlsx.parse(`${__dirname}/util/${excelName}`);

const infos = list[0].data.reduce((obj, info) => {
  const result = obj;
  if (!result[info[0]]) {
    result[info[0]] = [];
  }
  result[info[0]].push(info);
  return obj;
}, {});
function getNewStudentInfo(req, res) {
  res.send({
    status: 200,
    data: infos[req.query.name] || {},
  });
}

module.exports = getNewStudentInfo;
