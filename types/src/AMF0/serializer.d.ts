/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 *
 * @typedef {import('../AMF/remoting/header.js').default} Header
 * @typedef {import('../AMF/remoting/message.js').default} Message
 * @typedef {import('../AMF/remoting/packet.js').default} Packet
 */
/** @module AMF0/Serializer */
export default class Serializer {
    /**
     * A list of types (along null and undefined) to serialize with AMF0 when facing possible AVM+ challenges
     * @static
     * @private
     * @type {string[]}
     */
    private static #AVM_AMF0_ALLOWED;
    /**
     * Creates a new AMF0 serializer
     * @param {ClassAlias} classAlias - The class alias internally coming from the AMF entrypoint class
     * @param {Function} AMF_Serialize - The 'serialize' function coming from the AMF entrypoint class
     */
    constructor(classAlias: ClassAlias, AMF_Serialize: Function);
    /**
     * Cache the method of a Dynamic Property Writer to the AMF0 serializer class
     * @param {Function} method - The Dynamic Property Writer method
     */
    set dynamicPropertyWriter(method: Function);
    /**
     * Flushes the DynBuffer instance by caching the current stream, clearing the holding stream, and returning the cached stream containing the AMF bytes
     * @returns {Buffer} The buffer containing AMF bytes
     */
    flush(): Buffer;
    /**
     * Serializes an object into AMF binary data
     * @param {any} value - The value to serialize
     * @returns {Serializer} Returns the AMF serializer to perform a swift flush in AMF entrypoint class
     */
    serialize(value: any): Serializer;
    /**
     * Serializes a packet into AMF binary data
     * @param {Packet} packet - The AMF packet to serialize
     * @param {Function} AMF3_REFERENCE_RESET - The 'reset' function coming from the AMF3 Reference class
     * @returns {Serializer} Returns the AMF serializer to perform a swift flush in AMF entrypoint class
     */
    serializePacket(packet: Packet, AMF3_REFERENCE_RESET: Function): Serializer;
    #private;
}
export type ClassAlias = import("../AMF/alias.js").default;
export type Header = import("../AMF/remoting/header.js").default;
export type Message = import("../AMF/remoting/message.js").default;
export type Packet = import("../AMF/remoting/packet.js").default;
