# HealthFirst amqplib wrapper

This is a basic wrapper that provides some syntactic sugar around the amqplib library. It also allows you to define a message queue architecture using JSON and will automatically instantiate everything.

Usage:
```
//set the environment variables below to create a valid connection string
const mqURL = "amqp://" + process.env.MQ_USER + ":" + process.env.MQ_PASSWORD + "@" + process.env.MQ_HOST + ":" + process.env.MQ_PORT;

const mq = require('message-queue');
const BusinessLogic = require("./business-logic");

const mqArchitecture = {
    exchanges: {
        TEST_EXCHANGE: {
            name: "test.exchange",
            type: "topic",
            options: {
                durable: true
            }
        },
        TEST_EXCHANGE_2: {
            name: "test.exchange2",
            type: "topic",
            options: {
                durable: true
            }
        }
    },
    queues: {
        TEST_QUEUE: {
            name: "test.queue",
            bindings: [
                {
                    destination: "test.queue",
                    source: "test.exchange",
                    pattern: "test.queue" 
                }
            ],
            options: {
                durable: true
            },
            handlers: [
                {
                    method: BusinessLogic.consumptionMethod, //see note below
                    options: {}
                }
            ]
        },
        TEST_QUEUE2: {
            name: "test.queue2",
            bindings: [
                {
                    destination: "test.queue2",
                    source: "test.exchange2",
                    pattern: "test.queue2" 
                }
            ],
            options: {
                durable: true
            }
        }
    }
};

(async function(){
    try{
        let connection = await mq.getConnection(mqURL);
        mq.init(connection, mqArchitecture);
    } catch(err){
        console.log(err);
    }
})();
```

Note: Handlers can be attached to each queue via the handlers property. A consumption method takes only the received message as a parameter. 
```
//In ./business-logic.js
module.exports = {
    consumptionMethod: (message) => {
        console.log(message);
    }
}
```
