const amqp = require('amqplib');

function Producer(config) {

  const BROKER_URL = config.brokerURL;
  const noAck = config.noAck || true;
  const routes = config.routes;

  function delay(fn) {
    const queue = getQueue(fn.name);

    return function() {
      if(queue) {
        return send(queue, JSON.stringify({ fnName: fn.name,  parameters: [...arguments]}))
      }else {
        console.log(`[Error] No matched queue for function ${fn.name}`);
        return Promise.reject('No matched queue');
      }
    }
  }

  function getQueue(fnName) {
    const queue = Object.entries(routes).filter(entry => entry[1].name === fnName);

    return queue.length === 1? queue[0][0]: undefined;
  }

  function send(queue, message) { 
    return amqp.connect(BROKER_URL)
      .then(conn => Promise.all([conn.createChannel(), Promise.resolve(conn)]))
      .then(([channel, conn]) => {
        channel.assertQueue(queue);
        channel.prefetch(1);
        
        setTimeout(() => conn.close(), 500);
        return channel.sendToQueue(queue, new Buffer(message))
      })
  }

  return {
    delay: delay,
  };

}

module.exports = Producer;
