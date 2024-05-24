const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const config = {
    signerPrivateKey: "",

    rpcEndpoint: "",
    eventPeriod: 5000,
    eventProcessingSleepPeriod: MINUTE,
    txProcessingSleepPeriod: 5 * MINUTE,
    waitConfirmations: 2,
    
    contracts: {
        subscriptionManager: {
            address: "",
            deployBlockNumber: 0
        },

        userManager: {
            address: "",
            deployBlockNumber: 0 
        }
    }
}