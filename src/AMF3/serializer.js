import DynBuffer from '@seirdotexe/dynbuffer';
import Markers from '../AMF/markers.js';
import Reference from './reference.js';

/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 * @typedef {import('../AMF/options.js').AMFSerializerOptions} AMFOptions
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
   * Initialize the AMF3 reference holder
   * @private
   * @type {Reference}
   */
  #reference;
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
    this.#reference = new Reference();
  }

  /**
   * Cache the specified AMF options
   * @param {AMFOptions} optionsObj - The AMF options object
   */
  set options(optionsObj) {
    this.#options = optionsObj;
  }

  /**
   * Writes a variable length unsigned 29-bit integer
   * @private
   * @param {number} value - The value to encode
   * @throws {RangeError} If the given value is greater than 2^29 - 1
   */
  #writeUint29(value) {
    if (value < 0x80) {
      this.#dynbuf.writeByte(value);
    } else if (value < 0x4000) {
      this.#dynbuf.writeByte(((value >> 7) & 0x7F) | 0x80);
      this.#dynbuf.writeByte(value & 0x7F);
    } else if (value < 0x200000) {
      this.#dynbuf.writeByte(((value >> 14) & 0x7F) | 0x80);
      this.#dynbuf.writeByte(((value >> 7) & 0x7F) | 0x80);
      this.#dynbuf.writeByte(value & 0x7F);
    } else if (value < 0x40000000) {
      this.#dynbuf.writeByte(((value >> 22) & 0x7F) | 0x80);
      this.#dynbuf.writeByte(((value >> 15) & 0x7F) | 0x80);
      this.#dynbuf.writeByte(((value >> 8) & 0x7F) | 0x80);
      this.#dynbuf.writeByte(value & 0xFF);
    } else {
      throw new RangeError(`The value '${value}' is out of range for AMF3 U29.`);
    }
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
    if (value === null) {
      this.#serializeNull();
    } else if (value === undefined) {
      this.#serializeUndefined();
    } else {
      const type = value?.constructor?.name;

      switch (type) {
        case 'Number': this.#serializeInteger(value); break;
        case 'Boolean': this.#serializeBoolean(value); break;
        case 'String': this.#serializeString(value); break;
      }
    }

    return this;
  }

  /**
   * Serializes a null
   * @private
   */
  #serializeNull() {
    this.#dynbuf.writeByte(Markers.AMF3.NULL);
  }

  /**
   * Serializes an undefined
   * @private
   */
  #serializeUndefined() {
    this.#dynbuf.writeByte(Markers.AMF3.UNDEFINED);
  }

  /**
   * Serializes an integer
   * @private
   * @param {number} value - The integer to serialize
   */
  #serializeInteger(value) {
    if ((value << 3 >> 3) === value) { // Does the value fit into 29 bits?
      this.#dynbuf.writeByte(Markers.AMF3.INTEGER);
      this.#dynbuf.writeByte(value & 0x1FFFFFFF); // Signed conversion
    } else {
      this.#dynbuf.writeByte(Markers.AMF3.DOUBLE);
      this.#dynbuf.writeByte(value);
    }
  }

  /**
   * Serializes a boolean
   * @private
   * @param {boolean} value - The boolean to serialize
   */
  #serializeBoolean(value) {
    this.#dynbuf.writeByte(value ? Markers.AMF3.TRUE : Markers.AMF3.FALSE);
  }

  /**
   * Serializes a string
   * @private
   * @param {string} value - The string to serialize
   * @param {boolean} [marker=true] - If the marker should be included or not
   */
  #serializeString(value, marker = true) {
    if (marker) this.#dynbuf.writeByte(Markers.AMF3.STRING);

    const length = Buffer.byteLength(value);
    if (length === 0) return this.#writeUint29(1);

    const cache = this.#reference.has(value, 'strings');
    if (cache.referenced) return this.#writeUint29(cache.index << 1);

    this.#writeUint29((length << 1) | 1);
    this.#dynbuf.writeUTFBytes(value);
  }
}