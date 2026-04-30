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
   * Returns the amount of AMF3 bytes available, needed for deserializing AMF packets where a header has leftover data
   * @returns {number} The amount of AMF3 bytes available
   */
  bytesAvailable() {
    return this.#dynbuf.bytesAvailable;
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
    if (buffer) {
      if (this.#dynbuf.length !== 0) this.#dynbuf.clear(); // Compatibility for AVM+ to clear and deserialize again (example: when a packet has the AVM+ marker twice)
      this.#dynbuf.writeBytes(buffer); this.#dynbuf.position = 0; // Read and reset to the start so we can start reading AMF binary data
    }

    const marker = this.#dynbuf.readByte();

    switch (marker) {
      case Markers.AMF3.NULL: return null;
      case Markers.AMF3.UNDEFINED: return undefined;
      case Markers.AMF3.INTEGER: case Markers.AMF3.DOUBLE: return this.#deserializeInteger(marker);
      case Markers.AMF3.TRUE: case Markers.AMF3.FALSE: return this.#deserializeBoolean(marker);
      case Markers.AMF3.STRING: return this.#deserializeString();
      case Markers.AMF3.OBJECT: return this.#deserializeObject();
      case Markers.AMF3.ARRAY: return this.#deserializeArray();
      case Markers.AMF3.DATE: return this.#deserializeDate();
      case Markers.AMF3.BYTE_ARRAY: return this.#deserializeByteArray();
      case Markers.AMF3.VECTOR_INT: case Markers.AMF3.VECTOR_UINT: case Markers.AMF3.VECTOR_DOUBLE: case Markers.AMF3.VECTOR_OBJECT: return this.#deserializeTypedArray(marker);
      case Markers.AMF3.DICTIONARY: return this.#deserializeDictionary();
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
   * Deserializes an object
   * @private
   * @returns {object} The deserialized object
   * @throws {ReferenceError} If an attempt is made to deserialize an unregistered class
   */
  #deserializeObject() {
    const ref = this.#readUint29();
    if ((ref & 1) === 0) return this.#reference.get(ref >> 1, 'objects');

    let value = {};
    let traits = { className: null, externalizable: null, dynamic: null, keys: [], count: null };

    if ((ref & 3) === 1) { // Extract the lowest 2 bits, and check if they're equal to 1 (true)
      traits = this.#reference.get(ref >> 2, 'traits'); // Then this trait is referenceable
    } else { // Else, we need to read the trait
      traits.className = this.#deserializeString();
      traits.externalizable = ((ref & 4) === 4); // Bit 2 (0x04)
      traits.dynamic = ((ref & 8) === 8); // Bit 3 (0x08)
      traits.count = (ref >> 4); // Bits 4 and above

      for (let i = 0; i < traits.count; i++) {
        traits.keys[i] = this.#deserializeString();
      }

      this.#reference.set(JSON.stringify(traits), 'traits');
    }

    const classObj = (traits.externalizable || traits.className !== '') ? this.#classAlias.getClassByAlias(traits.className) : undefined;

    // Externalizable/registered classes
    if (traits.externalizable || traits.className !== '') {
      if (!classObj) throw new ReferenceError(`Tried to deserialize an unregistered class: '${traits.className}'.`);

      value = new classObj();
      this.#reference.set(value, 'objects'); // Important reference set for typed classes as we need to save a constructed copy

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
   * Deserializes a ByteArray (DynBuffer)
   * @private
   * @returns {DynBuffer} The deserialized ByteArray
   */
  #deserializeByteArray() {
    const ref = this.#readUint29();
    if ((ref & 1) === 0) return this.#reference.get(ref >> 1, 'objects');

    const length = (ref >> 1);
    const value = new DynBuffer();

    this.#reference.set(value, 'objects');

    value.writeBytes(this.#dynbuf, this.#dynbuf.position, length); // Write 'x' in 'length' amount of bytes available to us into the new value
    value.position = 0; // Reset the position of the new DynBuffer just like AVM+ does, for convenience
    this.#dynbuf.position += length; // Increment our AMF DynBuffer with the amount of read data

    return value;
  }

  /**
   * Deserializes a Vector (typed array)
   * @private
   * @param {0x0D|0x0E|0x0F|0x10} marker - The marker indicating the type of the Vector
   * @returns {Int32Array|Uint32Array|Float64Array|any[]} The deserialized Vector
   */
  #deserializeTypedArray(marker) {
    // Todo
  }

  /**
   * Deserializes a Dictionary (Map or WeakMap)
   * @private
   * @returns {Map|WeakMap} The deserialized Dictionary
   */
  #deserializeDictionary() {
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