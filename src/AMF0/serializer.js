import DynBuffer from '@seirdotexe/dynbuffer';
import { isBoxedPrimitive } from 'node:util/types';
import Markers from '../AMF/markers.js';
import { determineArray, isNativeObject } from '../AMF/utils.js';
import Reference from './reference.js';

/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 */

/** @module AMF0/Serializer */
export default class Serializer {
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
   * Creates a new AMF0 serializer
   * @param {ClassAlias} classAlias - The class alias internally coming from the AMF entrypoint class
   */
  constructor(classAlias) {
    this.#dynbuf = new DynBuffer();
    this.#classAlias = classAlias;
    this.#reference = new Reference();
  }

  /**
   * Flushes the DynBuffer instance by caching the current stream, clearing the holding stream, and returning the cached stream containing the AMF bytes
   * @returns {Buffer} The buffer containing AMF bytes
   */
  flush() {
    // Todo - Do we need to reset the references?

    const { stream } = this.#dynbuf;

    this.#dynbuf.clear();

    return stream;
  }

  /**
   * Serializes an object into AMF0 binary data
   * @param {any} value - The value to serialize
   * @returns {Serializer}
   */
  serialize(value) {
    if (isBoxedPrimitive(value)) {
      return this.serialize(value.valueOf());
    } else if (value === null) {
      this.#serializeNull();
    } else if (value === undefined) {
      this.#serializeUndefined();
    } else {
      const type = value?.constructor?.name;

      switch (type) {
        case 'Function': this.#serializeUndefined(); break;
        case 'Number': this.#serializeNumber(value); break;
        case 'Boolean': this.#serializeBoolean(value); break;
        case 'String': this.#serializeString(value); break;
        case 'Object': this.#serializeObject(value); break;
        case 'Array': this.#serializeArray(value); break;
        case 'Date': this.#serializeDate(value); break;
        default: this.#serializeUnidentifiedObject(value);
      }
    }

    return this;
  }

  /**
   * Serializes a null
   * @private
   */
  #serializeNull() {
    this.#dynbuf.writeByte(Markers.AMF0.NULL);
  }

  /**
   * Serializes an undefined
   * @private
   */
  #serializeUndefined() {
    this.#dynbuf.writeByte(Markers.AMF0.UNDEFINED);
  }

  /**
   * Serializes a number
   * @private
   * @param {number} value - The number to serialize
   */
  #serializeNumber(value) {
    this.#dynbuf.writeByte(Markers.AMF0.NUMBER);
    this.#dynbuf.writeDouble(value);
  }

  /**
   * Serializes a boolean
   * @private
   * @param {boolean} value - The boolean to serialize
   */
  #serializeBoolean(value) {
    this.#dynbuf.writeByte(Markers.AMF0.BOOLEAN);
    this.#dynbuf.writeBoolean(value);
  }

  /**
   * Serializes a (long) string
   * @private
   * @param {string} value - The string to serialize
   */
  #serializeString(value) {
    const length = Buffer.byteLength(value);

    if (length > 65535) {
      this.#dynbuf.writeByte(Markers.AMF0.LONG_STRING);
      this.#dynbuf.writeUnsignedInt(length);
      this.#dynbuf.writeUTFBytes(value);
    } else {
      this.#dynbuf.writeByte(Markers.AMF0.STRING);
      this.#dynbuf.writeUTF(value);
    }
  }

  /**
   * Serializes an object
   * @private
   * @param {object} value - The object to serialize
   */
  #serializeObject(value) {
    const cache = this.#reference.has(value);

    if (cache.referenced) {
      return this.#serializeReference(cache.index);
    }

    this.#dynbuf.writeByte(Markers.AMF0.OBJECT);

    for (const key in value) {
      this.#dynbuf.writeUTF(key);
      this.serialize(value[key]);
    }

    this.#dynbuf.writeShort(0);
    this.#dynbuf.writeByte(Markers.AMF0.OBJECT_END);
  }

  /**
   * Serializes an array
   * @private
   * @param {any[]} value - The array to serialize
   */
  #serializeArray(value) {
    const cache = this.#reference.has(value);

    if (cache.referenced) {
      return this.#serializeReference(cache.index);
    }

    this.#dynbuf.writeByte(Markers.AMF0.ECMA_ARRAY);
    this.#dynbuf.writeUnsignedInt(value.length); // An associative array will always write 0 here. This seems to be done on purpose by AVM, to treat it as an 'object' perhaps?

    const arrInfo = determineArray(value);

    // Todo

    this.#dynbuf.writeShort(0);
    this.#dynbuf.writeByte(Markers.AMF0.OBJECT_END);
  }

  /**
   * Serializes a date
   * @private
   * @param {Date} value - The date to serialize
   */
  #serializeDate(value) {
    const cache = this.#reference.has(value);

    if (cache.referenced) {
      return this.#serializeReference(cache.index);
    }

    this.#dynbuf.writeByte(Markers.AMF0.DATE);
    this.#dynbuf.writeDouble(value.getTime());
    this.#dynbuf.writeShort(value.getTimezoneOffset()); // The spec clearly says '0x0000' should be written, but this isn't true. It's a tough case, but let's follow AVM
  }

  /**
   * Serializes an unidentified object
   * @private
   * @param {any} value - The unidentified object to serialize
   */
  #serializeUnidentifiedObject(value) {
    const { constructor } = Object.getPrototypeOf(value);
    const aliasName = this.#classAlias.getAliasByClass(constructor);

    if (aliasName) { // This is a registered typed object, so we serialize it as one
      this.#serializeTypedObject(value, aliasName);
    } else if (!isNativeObject(constructor)) { // This is an unregistered typed object, so we serialize it as an object
      this.#serializeObject(value);
    } else { // An unknown type was found, we do the right thing and write the unsupported marker
      this.#serializeUnsupported();
    }
  }

  /**
   * Serializes a typed object
   * @private
   * @param {any} value - The typed object to serialize
   * @param {string} aliasName - The alias name of the typed object
   */
  #serializeTypedObject(value, aliasName) {
    const cache = this.#reference.has(value);

    if (cache.referenced) {
      return this.#serializeReference(cache.index);
    }

    this.#dynbuf.writeByte(Markers.AMF0.TYPED_OBJECT);
    this.#dynbuf.writeUTF(aliasName);

    for (const key in value) {
      this.#dynbuf.writeUTF(key);
      this.serialize(value[key]);
    }

    this.#dynbuf.writeShort(0);
    this.#dynbuf.writeByte(Markers.AMF0.OBJECT_END);
  }

  /**
   * Serializes a reference
   * @private
   * @param {number} index - The index of the referenced value to serialize
   */
  #serializeReference(index) {
    this.#dynbuf.writeByte(Markers.AMF0.REFERENCE);
    this.#dynbuf.writeShort(index);
  }

  /**
   * Serializes an unsupported value
   * @private
   */
  #serializeUnsupported() {
    this.#dynbuf.writeByte(Markers.AMF0.UNSUPPORTED);
  }
}