export interface RequestInfo {
    requestType: RequestType;
    args: any[]
}

export enum RequestType {
    Call, // view functions
    Send, // not view functions
    GetBalance
}