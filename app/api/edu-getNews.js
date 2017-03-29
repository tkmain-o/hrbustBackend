const getDataPagination = require('../spider/mongoUtils').getDataPagination;

function getNews(page, num) {
  const promise = new Promise((resolve) => {
    getDataPagination('News', 'sortId', page || 1, num || 10).then((result) => {
      resolve({
        data: result,
      });
    });
  });
  return promise;
}

exports.getNews = getNews;
