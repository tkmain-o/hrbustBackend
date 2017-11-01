const app = require('./index');
const config = require('./config');
const mongoose = require('mongoose');
const debug = require('debug')('server');

// const bole = require('bole');

// bole.output({ level: 'debug', stream: process.stdout });
// const log = bole('server');
mongoose.Promise = global.Promise;
mongoose
  .connect(config.mongodb)
  .connection
  .on('error', debug)
  .once('open', () => {
    app.listen(config.express.port, config.express.ip, (error) => {
      if (error) {
        debug('Unable to listen for connections', error);
        process.exit(10);
      }
      debug(`express is listening on http://${config.express.ip}:${config.express.port}`);
    });
    debug('server process starting');
  });
