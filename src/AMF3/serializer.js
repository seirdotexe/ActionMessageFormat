import DynBuffer from '@seirdotexe/dynbuffer';

/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 */

/**
 * @exports
 * @default
 * @class
 * @module AMF3
 */
export default class Serializer {
  /**
   * The DynBuffer instance containing written AMF bytes from this instance
   * @private
   * @type {DynBuffer}
   */
  #dynbuf;
  /**
   * The general class alias holder
   * @private
   * @type {ClassAlias}
   */
  #classAlias;

  /**
   * Creates a new AMF3 serializer
   * @param {ClassAlias} classAlias - The class alias internally coming from AMF entrypoint class
   */
  constructor(classAlias) {
    this.#dynbuf = new DynBuffer();
    this.#classAlias = classAlias;
  }

  /**
   * Flushes the DynBuffer instance by saving the current stream, clearing it, and returning the stream containing AMF bytes
   * @returns {Buffer} The buffer containing AMF bytes
   */
  flush() {
    const { stream } = this.#dynbuf;

    this.#dynbuf.clear();

    return stream;
  }

  /**
   * Serializes a value in AMF3 format
   * @param {any} value - The value to serialize
   * @returns {Serializer}
   */
  serialize(value) {
    return this;
  }
}