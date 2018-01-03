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


Copyright 2017 @HealthFirst 

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
