/** @module AMF/Remoting/Packet */
export default class Packet {
    /**
     * Creates a new remoting Packet
     * @param {0|3} [version=3] - The AMF packet version used to serialize/deserialize header and message body values
     */
    constructor(version?: 0 | 3);
    /**
     * The AMF packet version
     * @type {0|3}
     */
    version: 0 | 3;
    /**
     * Returns all of the headers in the AMF packet
     * @returns {Set<Header>} All of the headers
     */
    get headers(): Set<Header>;
    /**
     * Returns all of the messages in the AMF packet
     * @returns {Set<Message>} All of the messages
     */
    get messages(): Set<Message>;
    /**
     * Returns the amount of headers in the AMF packet
     * @returns {number} The amount of headers
     */
    get headerCount(): number;
    /**
     * Returns the amount of messages in the AMF packet
     * @returns {number} The amount of messages
     */
    get messageCount(): number;
    /**
     * Adds a header
     * @param {string} name - Identifies the header and the ActionScript object data associated with it
     * @param {boolean} mustUnderstand - Indicates that the server must understand and process this header before it handles any of the following headers or messages
     * @param {any} data - The provided header data
     */
    addHeader(name: string, mustUnderstand: boolean | undefined, data: any): void;
    /**
     * Removes a header
     * @param {string} name - The header's name to remove
     */
    removeHeader(name: string): void;
    /**
     * Adds a message
     * @param {string} targetURI - The operation to invoke
     * @param {string} responseURI - The unique operation name to match the response to the client invoke
     * @param {...any} data - The provided message data
     */
    addMessage(targetURI: string, responseURI: string, ...data: any[]): void;
    /**
     * Removes a message
     * @param {string} targetURI - The operation URI of the message to remove
     */
    removeMessage(targetURI: string): void;
    #private;
}
import Header from './header.js';
import Message from './message.js';
