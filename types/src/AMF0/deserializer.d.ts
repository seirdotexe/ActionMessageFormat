/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 */
/** @module AMF0/Deserializer */
export default class Deserializer {
    /**
     * A holder for the 'length' param for each AMF packet's header/message, and important for AVM+
     * @static
     * @private
     * @type {number}
     */
    private static #AMF_PACKET_DATA_LENGTH;
    /**
     * Creates a new AMF0 deserializer
     * @param {ClassAlias} classAlias - The class alias internally coming from the AMF entrypoint class
     * @param {Function} AMF_Deserialize - The 'deserialize' function coming from the AMF entrypoint class
     */
    constructor(classAlias: ClassAlias, AMF_Deserialize: Function);
    /**
     * Deserializes AMF binary data to an object
     * @param {Buffer?} buffer - The buffer containing the AMF binary data, only applicable from base call in AMF entrypoint class
     * @returns {any} The deserialized object
     */
    deserialize(buffer: Buffer | null): any;
    /**
     * Deserializes AMF binary data to a packet
     * @param {Buffer} buffer - The buffer containing the AMF binary data
     * @param {Function} AMF3_REFERENCE_RESET - The 'reset' function coming from the AMF3 Reference class
     * @returns {Packet} The deserialized packet
     * @throws {RangeError} If the AMF binary data 'length' isn't the same amount as what we deserialized
     */
    deserializePacket(buffer: Buffer, AMF3_REFERENCE_RESET: Function, AMF3_DYNBUF_BYTESAVAILABLE: any): Packet;
    #private;
}
export type ClassAlias = import("../AMF/alias.js").default;
import Packet from '../AMF/remoting/packet.js';
