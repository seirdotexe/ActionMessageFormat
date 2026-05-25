/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 */
/** @module AMF3/Deserializer */
export default class Deserializer {
    /**
     * Creates a new AMF3 deserializer
     * @param {ClassAlias} classAlias - The class alias internally coming from the AMF entrypoint class
     */
    constructor(classAlias: ClassAlias);
    /**
     * Returns the AMF3 reference reset method, needed for serializing and deserializing AMF packets in AMF0 base
     * @returns {Function} The 'reset' function coming from the AMF3 Reference class
     */
    get reset(): Function;
    /**
     * Returns the amount of AMF3 bytes available, needed for deserializing AMF packets where a header has leftover data
     * @returns {number} The amount of AMF3 bytes available
     */
    bytesAvailable(): number;
    /**
     * Deserializes AMF binary data to an object
     * @param {Buffer?} buffer - The buffer containing the AMF binary data, only applicable from base call in AMF entrypoint class
     * @returns {any} The deserialized object
     */
    deserialize(buffer: Buffer | null): any;
    #private;
}
export type ClassAlias = import("../AMF/alias.js").default;
