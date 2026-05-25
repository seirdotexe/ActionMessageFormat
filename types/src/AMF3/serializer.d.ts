/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 */
/** @module AMF3/Serializer */
export default class Serializer {
    /**
     * Creates a new AMF3 serializer
     * @param {ClassAlias} classAlias - The class alias internally coming from the AMF entrypoint class
     */
    constructor(classAlias: ClassAlias);
    /**
     * Cache the method of a Dynamic Property Writer to the AMF0 serializer class
     * @param {Function} method - The Dynamic Property Writer method
     */
    set dynamicPropertyWriter(method: Function);
    /**
     * Returns the AMF3 reference reset method, needed for serializing and deserializing AMF packets in AMF0 base
     * @returns {Function} The 'reset' function coming from the AMF3 Reference class
     */
    get reset(): Function;
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
    #private;
}
export type ClassAlias = import("../AMF/alias.js").default;
