'use strict'

const appRoot = require('app-root-path');

const amqplibMocks = require('amqplib-mocks');
const proxyquire = require('proxyquire');
const crypto = require('crypto');

const mq = proxyquire(appRoot + "/index", {
    "amqplib": amqplibMocks
});

import test from 'ava';

const baseURL = "amqp://amqplib_user:amqplib_pass@HOST:5672";

const testResponse = function(t, originalMessage) {
    return function(msg) {
        let msgContent = JSON.parse(msg.content.toString());
        t.deepEqual(msgContent, originalMessage, "The message received was incorrect");
    };
};

test("Get a confirm channel from the mq connection", async (t) => {
    const url = baseURL.replace(/HOST/, crypto.randomBytes(10).toString('hex'));
    let connection = await mq.getConnection(url);
    t.truthy(connection.on, "The message queue connection has failed");
    t.deepEqual(connection.exchanges, {}, "The message queue connection has failed");
    t.deepEqual(connection.queues, {}, "The message queue connection has failed");

    let channel = await mq.getChannel(connection);

    t.truthy(channel.ack, "The message queue connection has failed");
    t.truthy(channel.nack, "The message queue connection has failed");
});

test("Get a standard channel from the mq connection", async (t) => {
    const url = baseURL.replace(/HOST/, crypto.randomBytes(10).toString('hex'));
    let connection = await mq.getConnection(url);
    t.truthy(connection.on, "The message queue connection has failed");
    t.deepEqual(connection.exchanges, {}, "The message queue connection has failed");
    t.deepEqual(connection.queues, {}, "The message queue connection has failed");

    let channel = await mq.getChannel(connection, false);

    t.truthy(channel.ack, "The message queue connection has failed");
    t.truthy(channel.nack, "The message queue connection has failed");
});

test("Fail to initialize an mq connection", async (t) => {
    let err = await t.throws(mq.getConnection());
    t.is(err.message, "You must provide a URL to initialize a new connection.", "The message queue succeeded in connecting when it should have failed.");
});

test("Initialize a message queue with valid configuration", async (t) => {
    const exchangeName = "test.exchange.valid";
    const queueName = "test.queue.valid";

    const message = "testing";

    const mqArchitecture = { 
        exchanges: {
            TEST_EXCHANGE_VALID: {
                name: exchangeName,
                type: "direct",
                options: {
                    durable: true
                }
            }
        },
        queues: {
            TEST_QUEUE_VALID: {
                name: queueName,
                bindings: [
                    {
                        destination: queueName,
                        source: exchangeName,
                        pattern: queueName 
                    }
                ],
                options: {
                    durable: true
                },
                handlers: [
                    {
                        method: testResponse(t, message),
                        options: {}
                    }
                ]
            }
        }
    };

    const url = baseURL.replace(/HOST/, crypto.randomBytes(10).toString('hex'));
    let connection = await mq.getConnection(url);

    await mq.init(connection, mqArchitecture);

    t.truthy(connection.exchanges[exchangeName], "An exchange was not created correctly");
    t.is(connection.exchanges[exchangeName].bindings[0].queueName, queueName, "An exchange was not created correctly");
    t.is(connection.exchanges[exchangeName].options, 'direct', "An exchange was not created correctly");

    t.truthy(connection.queues[queueName], "A queue was not created correctly");
    t.truthy(connection.queues[queueName].consumers, "A queue was not created correctly");
    t.true(connection.queues[queueName].options.durable, "A queue was not created correctly");
});

/**
 * This test checks sending to the message queue
 */
test("Send data to a message queue channel", async (t) => {
    const message = {
        "aoeuhtns": "aoeuhtns"
    };

    const exchangeName = "test.exchange.listen";
    const queueName = "test.queue.listen";

    const mqArchitecture = { 
        exchanges: {
            TEST_EXCHANGE_LISTEN: {
                name: exchangeName,
                type: "direct",
                options: {
                    durable: true
                }
            }
        },
        queues: {
            TEST_QUEUE_LISTEN: {
                name: queueName,
                bindings: [
                    {
                        destination: queueName,
                        source: exchangeName,
                        pattern: queueName 
                    }
                ],
                options: {
                    durable: true
                }
            }
        }
    };

    const url = baseURL.replace(/HOST/, crypto.randomBytes(10).toString('hex'));
    let connection = await mq.getConnection(url);
    let channel = await mq.init(connection, mqArchitecture);

    const options = {
        noAck: true
    };

    let success = await mq.publishObj(channel, exchangeName, queueName, message, options);

    t.true(success, "The message publish did not succeed");
    t.true(channel.trackedMessages.length == 1, "An incorrect number of messages was found in the queue");
});

test("Listen to data published to a message queue channel", async (t) => {
    const message = {
        "aoeuhtns": "aoeuhtns"
    };

    const exchangeName = "test.exchange.listen";
    const queueName = "test.queue.listen";

    const mqArchitecture = { 
        exchanges: {
            TEST_EXCHANGE_LISTEN: {
                name: exchangeName,
                type: "direct",
                options: {
                    durable: true
                }
            }
        },
        queues: {
            TEST_QUEUE_LISTEN: {
                name: queueName,
                bindings: [
                    {
                        destination: queueName,
                        source: exchangeName,
                        pattern: queueName 
                    }
                ],
                options: {
                    durable: true
                },
                handlers: [
                    {
                        method: testResponse(t, message),
                        options: {}
                    }
                ]
            }
        }
    };

    const url = baseURL.replace(/HOST/, crypto.randomBytes(10).toString('hex'));
    let connection = await mq.getConnection(url);
    let channel = await mq.init(connection, mqArchitecture);

    const options = {
        noAck: true
    };

    // the testRepsonse method above will also test the message queue response
    let success = await mq.publishObj(channel, exchangeName, queueName, message, options);

    t.true(success, "The message publish did not succeed");
    t.true(channel.trackedMessages.length == 1, "An incorrect number of messages was found in the queue");
});
