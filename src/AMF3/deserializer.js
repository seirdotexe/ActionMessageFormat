import DynBuffer from '@seirdotexe/dynbuffer';
import Markers from '../AMF/markers.js';
import Reference from './reference.js';

/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 */

/** @module AMF0/Deserializer */
export default class Deserializer {
  /**
   * The AMF class alias holder
   * @private
   * @type {ClassAlias}
   */
  #classAlias;
  /**
   * The DynBuffer instance containing AMF3 bytes for this instance
   * @private
   * @type {DynBuffer}
   */
  #dynbuf;
  /**
   * The AMF0 reference holder
   * @private
   * @type {Reference}
   */
  #reference;

  /**
   * Creates a new AMF3 deserializer
   * @param {ClassAlias} classAlias - The class alias internally coming from the AMF entrypoint class
   */
  constructor(classAlias) {
    this.#classAlias = classAlias;
    this.#dynbuf = new DynBuffer();
    this.#reference = new Reference();
  }

  /**
   * Returns the AMF3 reference reset method, needed for serializing and deserializing AMF packets in AMF0 base
   * @returns {Function} The 'reset' function coming from the AMF3 Reference class
   */
  get reset() {
    return this.#reference.reset;
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
   * @param {Buffer?} buffer - The buffer containing the AMF binary data, only applicable from base call in AMF entrypoint class
   * @returns {any} The deserialized object
   */
  deserialize(buffer) {
    // Copy over the buffer to the (empty) DynBuffer instance when passed
    if (buffer && (this.#dynbuf.length === 0)) {
      this.#dynbuf.writeBytes(buffer);
      this.#dynbuf.position = 0; // Reset so we can start reading AMF data
    }

    const marker = this.#dynbuf.readByte();

    switch (marker) {
      case Markers.AMF3.NULL: return null;
      case Markers.AMF3.UNDEFINED: return undefined;
      case Markers.AMF3.TRUE: case Markers.AMF3.FALSE: return this.#deserializeBoolean(marker);
      case Markers.AMF3.INTEGER: case Markers.AMF3.DOUBLE: return this.#deserializeInteger(marker);
      case Markers.AMF3.STRING: return this.#deserializeString();
      case Markers.AMF3.DATE: return this.#deserializeDate();
      case Markers.AMF3.OBJECT: return this.#deserializeObject();
      case Markers.AMF3.ARRAY: return this.#deserializeArray();
      default: return this.#deserializeUnidentifiedObject(marker);
    }
  }

  /**
   * Deserializes a boolean
   * @private
   * @param {2|3} marker - The marker representing one of the two boolean markers, true or false
   * @returns {boolean} The deserialized boolean
   */
  #deserializeBoolean(marker) {
    return (marker === Markers.AMF3.TRUE);
  }

  /**
   * Deserializes an integer
   * @private
   * @param {4|5} marker - The marker representing one of the two 'number' markers, integer or double
   * @returns {number} The deserialized integer
   */
  #deserializeInteger(marker) {
    if (marker === Markers.AMF3.INTEGER) {
      return (this.#readUint29() << 3 >> 3);
    } else {
      return this.#dynbuf.readDouble();
    }
  }

  /**
   * Deserializes a string
   * @private
   * @returns {string} The deserialized string
   */
  #deserializeString() {
    const ref = this.#readUint29();
    if ((ref & 1) === 0) return this.#reference.get(ref >> 1, 'strings');

    const length = (ref >> 1);
    const value = this.#dynbuf.readUTFBytes(length);

    if (length > 0) this.#reference.set(value, 'strings');

    return value;
  }


  /**
   * Deserializes a date
   * @private
   * @returns {Date} The deserialized date
   */
  #deserializeDate() {
    const ref = this.#readUint29();
    if ((ref & 1) === 0) return this.#reference.get(ref >> 1, 'objects');

    const value = new Date(this.#dynbuf.readDouble());

    this.#reference.set(value, 'objects');

    return value;
  }

  /**
   * Deserializes an object
   * @private
   * @returns {object} The deserialized object
   * @throws {ReferenceError} If an attempt is made to deserialize an unregistered class
   */
  #deserializeObject() {
    const ref = this.#readUint29();
    if ((ref & 1) === 0) return this.#reference.get(ref >> 1, 'objects');

    let value = {};
    let traits = { className: null, externalizable: null, dynamic: null, keys: [], count: null }; // Initialize for jsdoc

    if ((ref & 3) === 1) { // Extract the lowest 2 bits, and if they equal to 1 (true), then this trait is referenceable, else we need to read it
      traits = this.#reference.get(ref >> 2, 'traits');
    } else {
      traits.className = this.#deserializeString();
      traits.externalizable = ((ref & 4) === 4); // Bit 2 (0x04)
      traits.dynamic = ((ref & 8) === 8); // Bit 3 (0x08)
      traits.count = (ref >> 4); // Bits 4 and above

      for (let i = 0; i < traits.count; i++) {
        traits.keys[i] = this.#deserializeString();
      }

      this.#reference.set(traits, 'traits');
    }

    // Handle externalizable classes or registered classes
    const classObj = (traits.externalizable || traits.className !== '') ? this.#classAlias.getClassByAlias(traits.className) : undefined;
    if (traits.externalizable || traits.className !== '') {
      if (!classObj) throw new ReferenceError(`Tried to deserialize an unregistered class: '${traits.className}'.`);

      value = new classObj();
      this.#reference.set(value, 'objects'); // Important reference set for registered classes!

      if (traits.externalizable) {
        value.readExternal(this.#dynbuf);

        return value;
      }
    }

    if (traits.dynamic && traits.className === '') { // Regular objects
      for (let key = this.#deserializeString(); key !== ''; key = this.#deserializeString()) { // Read until uint29 terminator
        value[key] = this.deserialize();
      }

      this.#reference.set(value, 'objects');

      return value;
    } else { // Registered class where we already know the keys
      for (let i = 0; i < traits.count; i++) {
        value[traits.keys[i]] = this.deserialize();
      }

      // Seal the class when the 'dynamic' getter is explicitly set to false to disallow adding properties to the class
      if (Object.getOwnPropertyDescriptor(Object.getPrototypeOf(value), 'dynamic')?.get && !traits.dynamic) {
        Object.seal(value);
      }

      return value;
    }
  }

  /**
   * Deserializes an array
   * @private
   * @returns {any[]} The deserialized array
   */
  #deserializeArray() {
    // Todo
  }

  /**
   * Catch an unidentifiable object
   * @private
   * @param {number} marker - The unknown AMF3 marker
   * @throws {ReferenceError} If an unknown AMF3 marker has been found
   */
  #deserializeUnidentifiedObject(marker) {
    throw new ReferenceError(`Unknown or unsupported AMF3 marker found: '${marker}'.`);
  }
}