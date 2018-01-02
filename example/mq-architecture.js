const appRoot = require('app-root-path');
const BusinessLogic = require(appRoot + "/businessLogic/credit-manager");

const mqNames = require(appRoot + "/mq-names");

module.exports = {
    exchanges: {
        CREDIT_CHECK_REQUESTED: {
            name: mqNames.CREDIT_CHECK_EXCHANGE,
            type: "topic",
            options: {
                durable: true
            }
        },
        CREDIT_CHECK_PROCESSED: {
            name: mqNames.CREDIT_VALIDATED_EXCHANGE,
            type: "topic",
            options: {
                durable: true
            }
        }
    },
    queues: {
        CREDIT_CHECK_REQUESTED: {
            name: mqNames.CREDIT_CHECK_QUEUE,
            bindings: [
                {
                    destination: mqNames.CREDIT_CHECK_QUEUE,
                    source: mqNames.CREDIT_CHECK_EXCHANGE,
                    pattern: mqNames.CREDIT_CHECK_QUEUE 
                }
            ],
            options: {
                durable: true
            },
            handlers: [
                {
                    method: BusinessLogic.consumeCreditCheckRequest,
                    options: {}
                }
            ]
        },
        CREDIT_VALIDATED: {
            name: mqNames.CREDIT_VALIDATED_QUEUE,
            bindings: [
                {
                    destination: mqNames.CREDIT_VALIDATED_QUEUE,
                    source: mqNames.CREDIT_VALIDATED_EXCHANGE,
                    pattern: mqNames.CREDIT_VALIDATED_QUEUE 
                }
            ],
            options: {
                durable: true
            },

        }
    }
};
