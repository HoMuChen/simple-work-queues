const amqp = require('amqplib');

function Worker(config) {

  const BROKER_URL = config.brokerURL;
  const noAck = config.noAck;
  const prefetch = config.prefetch || 1;
  const routes = config.routes;

  function listen(queue, callback) { 
    return amqp.connect(BROKER_URL)
      .then(conn => conn.createChannel())
      .then(channel => {
        channel.assertQueue(queue);
        channel.prefetch(prefetch);
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, run(channel, queue, callback), {noAck: noAck});
      })
  }

  function run(channel, queue, callback) {
    return function(msg) {
      const doc = JSON.parse(msg.content.toString());
      const fnName = doc.fnName;
      const parameters = doc.parameters;

      if(fnName !== routes[queue].name) {
        console.log(`[Error] Queue ${queue} does not have ${fnName} function to work with`);
        return ;
      }
      try {
        const result = await routes[queue](...parameters);
        if(!noAck) { channel.ack(msg); }
        if(typeof(callback) === 'function') { callback(null, result); }
      }catch(e) {
        if(typeof(callback) === 'function') { callback(e); }
      }
    }
  }

  return {
    listen,
  }

}

module.exports = Worker;
