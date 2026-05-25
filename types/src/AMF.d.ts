/**
 * @typedef {import('./AMF/remoting/packet.js').default} Packet
 */
/**
 * @author SeirDotExe
 * @license BSD-3-Clause
 */
export class AMF {
    /**
     * Initialize the class alias holder
     * @static
     * @type {ClassAlias}
     */
    static classAlias: ClassAlias;
    /**
     * Initialize the serializers
     * @static
     * @type {{ 0: Serializer0, 3: Serializer3}}
     */
    static #serializers: {
        0: Serializer0;
        3: Serializer3;
    };
    /**
     * Initialize the deserializers
     * @static
     * @type {{ 0: Deserializer0, 3: Deserializer3}}
     */
    static #deserializers: {
        0: Deserializer0;
        3: Deserializer3;
    };
    /**
     * Registers a Dynamic Property Writer to dynamically modify an object before it's serialized
     * @param {Function} method - The Dynamic Property Writer method
     * @param {0|3} [version=3] - The AMF version
     * @throws {ReferenceError} There must be 1 argument in the given method
     */
    static registerDynamicPropertyWriter(method: Function, version?: 0 | 3): void;
    /**
     * Serializes an object into AMF binary data
     * @static
     * @param {any} value - Any supported value to serialize
     * @param {0|3} [version=3] - The AMF version
     * @returns {Buffer} Returns the AMF data in a buffer
     */
    static serialize(value: any, version?: 0 | 3): Buffer;
    /**
     * Deserializes AMF binary data to an object
     * @static
     * @param {Buffer} buffer - The AMF binary data
     * @param {0|3} [version=3] - The AMF version
     * @returns {any} The deserialized object
     */
    static deserialize(buffer: Buffer, version?: 0 | 3): any;
    /**
     * Serializes a packet into AMF binary data
     * @static
     * @param {Packet} packet - The AMF packet to serialize
     * @returns {Buffer} Returns the AMF packet data in a buffer
     */
    static serializePacket(packet: Packet): Buffer;
    /**
     * Deserializes AMF binary data to a packet
     * @static
     * @param {Buffer} buffer - The AMF binary data
     * @returns {Packet} The deserialized packet
     */
    static deserializePacket(buffer: Buffer): Packet;
}
export type Packet = import("./AMF/remoting/packet.js").default;
import ClassAlias from './AMF/alias.js';
import { default as Serializer0 } from './AMF0/serializer.js';
import { default as Serializer3 } from './AMF3/serializer.js';
import { default as Deserializer0 } from './AMF0/deserializer.js';
import { default as Deserializer3 } from './AMF3/deserializer.js';
