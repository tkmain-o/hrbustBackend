const app = require('./index');
const config = require('./config');
const mongoose = require('mongoose');
const bole = require('bole');

bole.output({ level: 'debug', stream: process.stdout });
const log = bole('server');
mongoose.Promise = global.Promise;
mongoose
  .connect(config.mongodb)
  .connection
  .on('error', log.error)
  .once('open', () => {
    app.listen(config.express.port, config.express.ip, (error) => {
      if (error) {
        log.error('Unable to listen for connections', error);
        process.exit(10);
      }
      log.info(`express is listening on http://${config.express.ip}:${config.express.port}`);
    });
    log.info('server process starting');
  });
