import DynBuffer from '@seirdotexe/dynbuffer';
import { isBoxedPrimitive } from 'node:util/types';
import Markers from '../AMF/markers.js';

/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 */

/**
 * @exports
 * @default
 * @class
 * @module AMF0
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
   * Creates a new AMF0 serializer
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
   * Serializes a value in AMF0 format
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
  #serializeString(value) { }

  /**
   * Serializes an object
   * @private
   * @param {object} value - The object to serialize
   */
  #serializeObject(value) { }

  /**
   * Serializes an array
   * @private
   * @param {any[]} value - The array to serialize
   */
  #serializeArray(value) { }

  /**
   * Serializes a date
   * @private
   * @param {Date} value - The date to serialize
   */
  #serializeDate(value) { }

  /**
   * Serializes an unidentified object
   * @private
   * @param {any} value - The unidentified object to serialize
   */
  #serializeUnidentifiedObject(value) { }

  /**
   * Serializes a typed object
   * @private
   * @param {any} value - The typed object to serialize
   * @param {string} aliasName - The alias name of the typed object
   */
  #serializeTypedObject(value, aliasName) { }

  /**
   * Serializes a reference
   * @private
   * @param {number} index - The index of the referenced value to serialize
   */
  #serializeReference(index) { }

  /**
   * Serializes an unsupported value
   * @private
   */
  #serializeUnsupported() {
    this.#dynbuf.writeByte(Markers.AMF0.UNSUPPORTED);
  }
}