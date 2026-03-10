import DynBuffer from '@seirdotexe/dynbuffer';
import Markers from '../AMF/markers.js';
import { determineArray, isNativeObject } from '../AMF/utils.js';
import Reference from './reference.js';

/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 * @typedef {import('../AMF/options.js').AMFOptions} AMFOptions
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
   * Initialize the Dynamic Property Writer function
   * @private
   * @type {Function}
   */
  #dynamicPropertyWriter;
  /**
   * Initialize the AMF options object holder
   * @private
   * @type {AMFOptions}
   */
  #options;

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
   * Cache the method of a Dynamic Property Writer to the AMF0 serializer class
   * @param {Function} method - The Dynamic Property Writer method
   */
  set dynamicPropertyWriter(method) {
    this.#dynamicPropertyWriter = method;
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
    if (value === null) {
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

    if (this.#dynamicPropertyWriter) {
      this.#dynamicPropertyWriter(value);
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
    this.#dynbuf.writeUnsignedInt(value.length); // An associative array will always write 0 here by AVM. This is done on purpose; we must treat it as an object! The keys will turn into sparse entries which is unwanted

    const arrInfo = determineArray(value);

    /*
    AVM secretly cleans up sparse entries in an array. It only cleans when setting array values by index
    It does this to save buffer bytes, an optimization as you may say

    var value:Array = []; // won't clean when you do [,,1] - Node is unable to determine the difference
    value[2] = 1;

    The AMF0 serialized hex will be: 08 00 00 00 03 00 01 32 00 3f f0 00 00 00 00 00 00 00 00 09
    01 32 = writeUTF length and the letter '2' followed by the number 1 in writeDouble

    Because the length is still written, sparse entries will return, and the deserialized value will be unaffected
    */

    // Write sparse and/or dense values
    if (arrInfo.sparse || arrInfo.dense) {
      for (let i = 0; i < value.length; i++) {
        if (!Object.hasOwn(value, i) && this.#options.compressSparse) continue; // Undocumented optimization, skip sparse entries, used to preserve buffer bytes

        this.#dynbuf.writeUTF(String(i));
        this.serialize(value[i]);
      }
    }

    // Write associative values
    if (arrInfo.associative) {
      for (const key in value) {
        if (isNaN(key)) { // Skip dense values
          this.#dynbuf.writeUTF(key);
          this.serialize(value[key]);
        }
      }
    }

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
    } else if (!isNativeObject(constructor)) { // This is an unregistered typed object (AVM calls this an anonymous object), so we serialize it as an object
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