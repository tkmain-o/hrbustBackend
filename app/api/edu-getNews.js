const getDataPagination = require('../spider/mongoUtils').getDataPagination;

function getNews(page, num) {
  const promise = new Promise((resolve) => {
    try {
      getDataPagination('News', 'sortId', page || 1, num || 10).then((result) => {
        resolve({
          data: result,
        });
      });
    } catch (e) {
      console.error('mongoose error, get News', e);
      resolve({
        data: [],
      });
    }
  });
  return promise;
}

exports.getNews = getNews;
