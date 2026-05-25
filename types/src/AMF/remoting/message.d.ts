/** @module AMF/Remoting/Message */
export default class Message {
    /**
     * Creates a new remoting Message
     * @param {string} targetURI - The operation to invoke
     * @param {string} responseURI - The unique operation name to match the response to the client invoke
     * @param {any[]} data - The provided message data
     */
    constructor(targetURI: string, responseURI: string, data: any[]);
    /**
     * The operation to invoke
     * @type {string}
     */
    targetURI: string;
    /**
     * The unique operation name to match the response to the client invoke
     * @type {string}
     */
    responseURI: string;
    /**
     * The provided message data
     * @type {any[]}
     */
    data: any[];
}
