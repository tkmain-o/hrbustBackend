const getDataPagination = require('../spider/mongoUtils').getDataPagination;

function getJob(page, num) {
  const promise = new Promise((resolve) => {
    try {
      getDataPagination('Job', 'id', page || 1, num || 10).then((result) => {
        resolve({
          data: result,
        });
      });
    } catch (e) {
      console.error('mongoose error, get Job', e);
      resolve({
        data: [],
      });
    }
  });
  return promise;
}

exports.getJob = getJob;
