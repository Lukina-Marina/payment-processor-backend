const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const config = {
    rpcEndpoint: "",
    eventPeriod: 5000,
    eventProcessingSleepPeriod: MINUTE,
    
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