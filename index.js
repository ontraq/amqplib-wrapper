'use strict'  

const amqp = require('amqplib');    

let connection = null;

const getChannel = async function(cxn, useConfirm = true) {
    let channel = useConfirm ? await cxn.createConfirmChannel() : await cxn.createChannel();
        
    /* This is unfortunate. Apparently, when you run checkQueue below, the protocol mandates that the channel be closed and throw an error. 
     * Unfortunately, this is not catchable like I'd like. You have to have an error handler on the channel object. 
     * Currently, the process is to log the channel closed error to the console and catch checkQueue's bluebird.OperationalError in the application as the primary means of error handling.
     */

    channel.on("error", (err) => {        
        console.error(err);
    }); 

    return channel;
};

//Add error handling for when exchange/queue setup does not go as planned. This generally means that we've attempted to assert an exchange/queue that already exists and is using different options than the ones being passed here.
const initExchanges = async function(channel, exchanges) {
    //assert all exchanges into existence BEFORE creating bindings
    await Object.keys(exchanges).forEach(async (key) => {
        const exchange = exchanges[key];
        await channel.assertExchange(exchange.name, exchange.type, exchange.options);

    });

    await Object.keys(exchanges).forEach(async (key) => {
        const exchange = exchanges[key];
        if (exchange.bindings) {
            initBindings(channel, "bindExchange", exchange.bindings);
        }
    });
};

const initQueues = async function(channel, queues) {
    await Object.keys(queues).forEach(async (key) => {
        const queue = queues[key];

        await channel.assertQueue(queue.name, queue.options);

        if (queue.bindings) {
            initBindings(channel, "bindQueue", queue.bindings);
        }

        if (queue.handlers) {
            initHandlers(channel, queue.name, queue.handlers);
        }
    });
};

const initBindings = async function(channel, bindMethod, bindings) {
    bindings.forEach(async (binding) => {
        const options = binding.options ? binding.options : {};
        await channel[bindMethod](binding.destination, binding.source, binding.pattern, options);
    });
};

const initHandlers = function(channel, queue, handlers) {
    handlers.forEach((handler) => {
        channel.consume(queue, handler.method, handler.options);
    });
};

const init = async function(cxn, mqArchitecture) {
    let channel = await getChannel(cxn);

    if (mqArchitecture.exchanges) {
        await initExchanges(channel, mqArchitecture.exchanges);
    }

    if (mqArchitecture.queues) {
        await initQueues(channel, mqArchitecture.queues);
    }

    return channel;
};

// convenience method to remove the need to create a buffer and stringify an object when you want to publish a message
const publishObj = async function(channel, exchangeName, routingKey, message, options = {}) {
    let content = Buffer.from(JSON.stringify(message));
    return await channel.publish(exchangeName, routingKey, content, options);
};

const getConnection = async function(url = null) {
    if (!connection && !url) {
        throw new Error("You must provide a URL to initialize a new connection.");
    }

    if (!connection) {
        connection = await amqp.connect(url);        
        process.once('SIGINT', () => { 
            connection.close();
        });
    }
 
    return connection;
}

module.exports = {
    getConnection: getConnection,
    getChannel: getChannel,
    init: init,
    publishObj: publishObj
};
