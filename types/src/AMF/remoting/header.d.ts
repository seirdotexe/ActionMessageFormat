/** @module AMF/Remoting/Header */
export default class Header {
    /**
     * Creates a new remoting Header
     * @param {string} name - Identifies the header and the ActionScript object data associated with it
     * @param {boolean} mustUnderstand - Indicates that the server must understand and process this header before it handles any of the following headers or messages
     * @param {any} data - The provided header data
     */
    constructor(name: string, mustUnderstand: boolean, data: any);
    /**
     * Identifies the header and the ActionScript object data associated with it
     * @type {string}
     */
    name: string;
    /**
     * Indicates that the server must understand and process this header before it handles any of the following headers or messages
     * @type {boolean}
     */
    mustUnderstand: boolean;
    /**
     * The provided header data
     * @type {any}
     */
    data: any;
}
