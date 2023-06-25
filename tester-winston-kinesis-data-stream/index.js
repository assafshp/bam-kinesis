const { createLogger, format, transports } = require('winston');
const KinesisTransport = require('@pod-point/winston-kinesis');

try {
  // register the transport
  const logger = createLogger({
    transports: [
      new KinesisTransport({
        'streamName': 'lambda-stream',
        'environment': 'production',
        'kinesisOptions': {
          'region': 'eu-west-1'
        }
      })
    ]
  });

  // log away!!
  // with just a string
  logger.info('This is the log message!');

  // or with meta info
  logger.info('This is the log message!', { snakes: 'delicious' });

  console.log('done');  
} catch (error) {
  console.error(error);
}
