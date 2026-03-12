import DynBuffer from '@seirdotexe/dynbuffer';
import Markers from '../AMF/markers.js';

/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 * @typedef {import('../AMF/options.js').AMFDeserializerOptions} AMFOptions
 */

/** @module AMF0/Deserializer */
export default class Deserializer {
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
   * Creates a new AMF3 deserializer
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
   * Reads a variable length unsigned 29-bit integer
   * @private
   * @returns {number} The decoded integer
   */
  #readUint29() {
    let byte = this.#dynbuf.readUnsignedByte();
    let value = byte & 0x7F;
    if (!(byte & 0x80)) return value;

    byte = this.#dynbuf.readUnsignedByte();
    value = (value << 7) | (byte & 0x7F);
    if (!(byte & 0x80)) return value;

    byte = this.#dynbuf.readUnsignedByte();
    value = (value << 7) | (byte & 0x7F);
    if (!(byte & 0x80)) return value;

    byte = this.#dynbuf.readUnsignedByte();
    return (value << 8) | byte;
  }

  /**
   * Deserializes AMF binary data to an object
   * @param {buffer?} buffer - The buffer containing the AMF binary data, only applicable from base call in AMF entrypoint class
   * @returns {any} The deserialized object
   */
  deserialize(buffer) {
    // Copy over the buffer to the (empty!) DynBuffer instance when passed
    if (buffer && (this.#dynbuf.length === 0)) {
      this.#dynbuf.writeBytes(buffer);
      this.#dynbuf.position = 0; // Reset so we can start reading data
    }
  }
}