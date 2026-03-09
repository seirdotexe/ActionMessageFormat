import DynBuffer from '@seirdotexe/dynbuffer';
import Markers from '../AMF/markers.js';
import Reference from './reference.js';

/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 */

/** @module AMF0/Deserializer */
export default class Deserializer {
  /**
   * The DynBuffer instance containing AMF0 bytes for this instance
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
   * Initialize the AMF0 reference holder
   * @private
   * @type {Reference}
   */
  #reference;

  /**
   * Creates a new AMF0 deserializer
   * @param {ClassAlias} classAlias - The class alias internally coming from the AMF entrypoint class
   */
  constructor(classAlias) {
    this.#dynbuf = new DynBuffer();
    this.#classAlias = classAlias;
    this.#reference = new Reference();
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