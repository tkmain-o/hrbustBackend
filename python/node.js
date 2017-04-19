/*
  distBranch: The branch you need dist. Default: master
  distToBranch: The branch you want dist to. Default: dist-branch

  example: node dist.js
  or: node dist.js --distBranch=master --distToBranch=dist-branch

  -s or --server only push server code, don't run dist.
*/
const argv = require('yargs')
  .alias('s', 'server')
  .default('s', false)
  .argv;
const fs = require('fs');

const a = argv.a;
const arr = String(a).split('');
const len = arr.length;

function random() {
  return Math.random().toString(36).substr(2);
}
// [6723]
for (let i = 1; i <= len; i++) {
  fs.rename(`./test_sample/${i}.bmp`, `./test_sample/${arr[i - 1]}_${random()}.bmp`, (err) => {
    if (err) throw err;
    console.log('renamed complete');
  });
}


random();
