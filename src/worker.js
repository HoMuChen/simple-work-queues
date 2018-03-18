const amqp = require('amqplib');

function Worker(config) {

  const BROKER_URL = config.brokerURL;
  const noAck = config.noAck || true;
  const routes = config.routes;

  function listen(queue) { 
    return amqp.connect(BROKER_URL)
      .then(conn => conn.createChannel())
      .then(channel => {
        channel.assertQueue(queue);
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, run(queue), {noAck: noAck});
      })
  }

  function run(queue) {
    return function(msg) {
      const doc = JSON.parse(msg.content.toString());
      const fnName = doc.fnName;
      const parameters = doc.parameters;

      if(fnName !== routes[queue].name) {
        console.log(`[Error] Queue ${queue} does not have ${fnName} function to work with`);
        return ;
      }
      routes[queue](...parameters);
    }
  }

  return {
    listen,
  }

}

module.exports = Worker;
