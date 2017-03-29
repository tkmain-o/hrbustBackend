const getDataPagination = require('../spider/mongoUtils').getDataPagination;

function getJob(page, num) {
  const promise = new Promise((resolve) => {
    getDataPagination('Job', 'id', page || 1, num || 10).then((result) => {
      resolve({
        data: result,
      });
    });
  });
  return promise;
}

exports.getJob = getJob;
