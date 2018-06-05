# simple-work-queues

Delay your functions to queues backed by RabbitMQ

## Install

    $ npm install simple-work-queues

## Usage

For example,

worker.js
```javascript
const { Worker } = require('simple-work-queues');
const { fn1, fn2 } = require('./tasks'); // import functions from whereever you want

const config = {
  brokerURL: 'your-rabbitmq-broker-url',
  noAck: false, //boolean
  prefetch: 1, //concurrency for every worker, default 1, only useful when noAck is false
  routes: {
    queue1: fn1,
    queue2: fn2,
  }
}

const worker = Worker(config);

worker.listen('queue1');
worker.listen('queue2', (err, data) => {console.log(data)}); //add callback function(optional), data is what returned by your function

```

dispatcher.js
```javascript
const { Producer } = require('simple-work-queues');
const { fn1, fn2 } = require('./tasks'); // import functions from whereever you want

const producer = Producer(config); // config is the same with the one in worker.js

producer.delay(fn1)(); //wrap your function and call it whenever u want
producer.delay(fn2)();

```

## Author

HoMuchen
