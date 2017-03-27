// const MongoClient = require('mongodb').MongoClient;
// // const assert = require('assert');
//
// const url = 'mongodb://localhost:27017/hrbust';
// var insertDocument = function(db, callback) {
//   // const count =
//   db.collection('restaurants').count((err, count) => {
//     // console.log(count);
//     const cursor = db.collection('restaurants').find().skip(count - 3);
//     cursor.each(function(err, doc) {
//       if (doc != null) {
//         console.log(doc);
//       } else {
//         callback();
//       }
//     });
//   });
//   // const doc = db.collection('restaurants').find().skip(db.collection('restaurants').count());
//   // console.dir(doc);
//    db.collection('restaurants').insert([{
//      id: 1,
//      title: 'jfldksjlk'
//    }, {
//      id: 2,
//      title: 'jfldksjlk'
//    },{
//      id: 3,
//      title: 'jfldksjlk'
//    }, {
//      id: 20,
//      title: 'jfldksjlk'
//    }, {
//      id: 7,
//      title: 'jfldksjlk'
//    }, {
//      id: 17,
//      title: 'jfldksjlk'
//    }, {
//      id: 15,
//      title: 'jfldksjlk'
//    }, {
//      id: 14,
//      title: 'jfldksjlk'
//    }, {
//      id: 13,
//      title: 'jfldksjlk'
//    }, {
//      id: 9,
//      title: 'jfldksjlk'
//    }], function(err, result) {
//     // assert.equal(err, null);
//     console.log("Inserted a document into the restaurants collection.");
//     callback();
//   });
// };
//
// MongoClient.connect(url, function(err, db) {
//   insertDocument(db, function() {
//     db.close();
//   });
// });
