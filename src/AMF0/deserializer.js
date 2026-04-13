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
   * The 'deserialize' function holder
   * @private
   * @type {Function}
   */
  #AMF_Deserialize;
  /**
   * The DynBuffer instance containing AMF0 bytes for this instance
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
   * Creates a new AMF0 deserializer
   * @param {ClassAlias} classAlias - The class alias internally coming from the AMF entrypoint class
   * @param {Function} AMF_Deserialize - The 'deserialize' function coming from the AMF entrypoint class
   */
  constructor(classAlias, AMF_Deserialize) {
    this.#classAlias = classAlias;
    this.#AMF_Deserialize = AMF_Deserialize;
    this.#dynbuf = new DynBuffer();
    this.#reference = new Reference();
  }

  /**
   * Deserializes AMF binary data to an object
   * @param {Buffer?} buffer - The buffer containing the AMF binary data, only applicable from base call in AMF entrypoint class
   * @returns {any} The deserialized object
   */
  deserialize(buffer) {
    // Copy over the buffer to the (empty) DynBuffer instance when passed
    if (buffer && (this.#dynbuf.length === 0)) {
      this.#dynbuf.writeBytes(buffer); this.#dynbuf.position = 0; // Read and reset to the start so we can start reading AMF binary data
    }

    const marker = this.#dynbuf.readByte();

    switch (marker) {
      case Markers.AMF0.NULL: return null;
      case Markers.AMF0.UNDEFINED: return undefined;
      case Markers.AMF0.NUMBER: return this.#deserializeNumber();
      case Markers.AMF0.BOOLEAN: return this.#deserializeBoolean();
      case Markers.AMF0.STRING: return this.#deserializeString();
      case Markers.AMF0.LONG_STRING: return this.#deserializeLongString();
      case Markers.AMF0.REFERENCE: return this.#deserializeReference();
      case Markers.AMF0.OBJECT: return this.#deserializeObject();
      case Markers.AMF0.ECMA_ARRAY: return this.#deserializeArray();
      case Markers.AMF0.DATE: return this.#deserializeDate();
      case Markers.AMF0.TYPED_OBJECT: return this.#deserializeTypedObject();
      case Markers.AMF0.AVMPLUS: return this.#deserializeAVMPlus();
      default: return this.#deserializeUnidentifiedObject(marker);
    }
  }

  /**
   * Deserializes a number
   * @private
   * @returns {number} The deserialized number
   */
  #deserializeNumber() {
    return this.#dynbuf.readDouble();
  }

  /**
   * Deserializes a boolean
   * @private
   * @returns {boolean} The deserialized boolean
   */
  #deserializeBoolean() {
    return this.#dynbuf.readBoolean();
  }

  /**
   * Deserializes a string
   * @private
   * @returns {string} The deserialized string
   */
  #deserializeString() {
    return this.#dynbuf.readUTF();
  }

  /**
   * Deserializes a long string
   * @private
   * @returns {string} The deserialized long string
   */
  #deserializeLongString() {
    return this.#dynbuf.readUTFBytes(this.#dynbuf.readUnsignedInt());
  }

  /**
   * Deserializes a referenced object
   * @private
   * @returns {object} The deserialized referenced object
   */
  #deserializeReference() {
    return this.#reference.get(this.#dynbuf.readUnsignedShort());
  }

  /**
   * Deserializes an object
   * @private
   * @returns {object} The deserialized object
   */
  #deserializeObject() {
    const value = {};

    this.#reference.set(value);

    for (let key = this.#dynbuf.readUTF(); !!key || (this.#dynbuf.readByte() !== Markers.AMF0.OBJECT_END); key = this.#dynbuf.readUTF()) {
      value[key] = this.deserialize();
    }

    return value;
  }

  /**
   * Deserializes an array
   * @private
   * @returns {any[]} The deserialized array
   */
  #deserializeArray() {
    const value = [];
    value.length = this.#dynbuf.readUnsignedInt();

    this.#reference.set(value);

    for (let key = this.#dynbuf.readUTF(); !!key || (this.#dynbuf.readByte() !== Markers.AMF0.OBJECT_END); key = this.#dynbuf.readUTF()) {
      value[key] = this.deserialize();

      //! Undocumented behavior - Turn invalid values into empty values
      if ((value[key] === null) || (value[key] === undefined)) {
        delete value[key];
      }
    }

    return value;
  }

  /**
   * Deserializes a date
   * @private
   * @returns {Date} The deserialized date
   */
  #deserializeDate() {
    const time = this.#dynbuf.readDouble();
    const timezoneOffset = this.#dynbuf.readShort(); //! Unused and reserved
    const value = new Date(time);

    this.#reference.set(value);

    return value;
  }

  /**
   * Deserializes a typed object
   * @private
   * @return {any} The deserialized typed object
   */
  #deserializeTypedObject() {
    const aliasName = this.#dynbuf.readUTF();
    const classObj = this.#classAlias.getClassByAlias(aliasName);
    const value = new classObj();

    this.#reference.set(value);

    for (let key = this.#dynbuf.readUTF(); !!key || (this.#dynbuf.readByte() !== Markers.AMF0.OBJECT_END); key = this.#dynbuf.readUTF()) {
      value[key] = this.deserialize();
    }

    return value;
  }

  /**
   * Deserializes an AVMPlus marker to switch to AMF3
   * @private
   */
  #deserializeAVMPlus() {
    const AMF3Data = this.#dynbuf.stream.subarray(this.#dynbuf.position, this.#dynbuf.bytesAvailable + 1);

    return this.#AMF_Deserialize(AMF3Data);
  }

  /**
   * Catch an unidentifiable object
   * @private
   * @param {number} marker - The unknown AMF0 marker
   * @throws {ReferenceError} If an unknown AMF0 marker has been found
   */
  #deserializeUnidentifiedObject(marker) {
    if (marker !== Markers.AMF0.UNSUPPORTED) {
      throw new ReferenceError(`Unknown or unsupported AMF0 marker found: '${marker}'.`);
    }
  }
}