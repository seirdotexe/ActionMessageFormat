import DynBuffer from '@seirdotexe/dynbuffer';

/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 */

/** @module AMF3/Serializer */
export default class Serializer {
  /**
   * The DynBuffer instance containing AMF3 bytes for this instance
   * @private
   * @type {DynBuffer}
   */
  #dynbuf;
  /**
   * The AMF class alias holder
   * @private
   * @type {ClassAlias}
   */
  #classAlias;

  /**
   * Initialize the AMF options object holder
   * @private
   * @type {AMFOptions}
   */
  #options;

  /**
   * Creates a new AMF3 serializer
   * @param {ClassAlias} classAlias - The class alias internally coming from the AMF entrypoint class
   */
  constructor(classAlias) {
    this.#dynbuf = new DynBuffer();
    this.#classAlias = classAlias;
  }

  /**
   * Cache the specified AMF options
   * @param {AMFOptions} optionsObj - The AMF options object
   */
  set options(optionsObj) {
    this.#options = optionsObj;
  }

  /**
   * Flushes the DynBuffer instance by caching the current stream, clearing the holding stream, and returning the cached stream containing the AMF bytes
   * @returns {Buffer} The buffer containing AMF bytes
   */
  flush() {
    const { stream } = this.#dynbuf;

    this.#dynbuf.clear();

    return stream;
  }

  /**
   * Serializes an object into AMF binary data
   * @param {any} value - The value to serialize
   * @returns {Serializer} Returns the AMF serializer to perform a swift flush in AMF entrypoint class
   */
  serialize(value) {
    return this;
  }
}