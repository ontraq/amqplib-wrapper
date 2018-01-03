const BusinessLogic = {
    consumeCreditCheckRequest: (message) => {
        console.log(message);
    }
};

module.exports = {
    exchanges: {
        CREDIT_CHECK_REQUESTED: {
            name: "credit.check.exchange",
            type: "topic",
            options: {
                durable: true
            }
        },
        CREDIT_CHECK_PROCESSED: {
            name: "credit.validated.exchange",
            type: "topic",
            options: {
                durable: true
            }
        }
    },
    queues: {
        CREDIT_CHECK_REQUESTED: {
            name: "credit.check",
            bindings: [
                {
                    destination: "credit.check",
                    source: "credit.check.exchange",
                    pattern: "credit.check" 
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
            name: "credit.validated",
            bindings: [
                {
                    destination: "credit.validated",
                    source: "credit.validated.exchange",
                    pattern: "credit.validated"
                }
            ],
            options: {
                durable: true
            }
        }
    }
};
