import DynBuffer from '@seirdotexe/dynbuffer';
import Markers from '../AMF/markers.js';
import { determineArray, isNativeObject } from '../AMF/utils.js';
import Reference from './reference.js';

/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 */

/** @module AMF3/Serializer */
export default class Serializer {
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
   * The AMF3 reference holder
   * @private
   * @type {Reference}
   */
  #reference;
  /**
   * The Dynamic Property Writer function holder
   * @private
   * @type {Function}
   */
  #dynamicPropertyWriter;

  /**
   * Creates a new AMF3 serializer
   * @param {ClassAlias} classAlias - The class alias internally coming from the AMF entrypoint class
   */
  constructor(classAlias) {
    this.#classAlias = classAlias;
    this.#dynbuf = new DynBuffer();
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
      throw new RangeError(`The uint29 '${value}' is out of range for AMF3 U29.`);
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
        case 'Object': this.#serializeObject(value); break;
        case 'Array': this.#serializeArray(value); break;
        case 'Date': this.#serializeDate(value); break;
        case 'DynBuffer': case 'Buffer': this.#serializeByteArray(value); break;
        case 'Int32Array': case 'Uint32Array': case 'Float64Array': this.#serializeTypedArray(value, type); break;
        case 'Map': case 'WeakMap': this.#serializeDictionary(value); break;
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
      this.#writeUint29(value & 0x1FFFFFFF); // Signed conversion to int29
    } else {
      this.#dynbuf.writeByte(Markers.AMF3.DOUBLE);
      this.#dynbuf.writeDouble(value);
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

  /**
   * Serializes an object
   * @private
   * @param {object} value - The object to serialize
   * @throws {ReferenceError} If an attempt is made to serialize an unregistered externalizable class
   */
  #serializeObject(value) {
    if (this.#dynamicPropertyWriter) this.#dynamicPropertyWriter(value);

    this.#dynbuf.writeByte(Markers.AMF3.OBJECT);

    const cacheObj = this.#reference.has(value, 'objects');
    if (cacheObj.referenced) return this.#writeUint29(cacheObj.index << 1); // U29O-ref

    const proto = Object.getPrototypeOf(value);
    const traits = {};

    // The identified class name of the value. Empty for regular objects, else it's defined by a registered class alias
    traits.className = this.#classAlias.getAliasByClass(proto.constructor) || '';
    // Whether the value is externalizable. It gives more functionality in how to write/read properties
    traits.externalizable = ('writeExternal' in value) && ('readExternal' in value); // Todo - Decorators, but this is viable for now
    // Whether the value's class is dynamic. This is a tough one as every object in JS is dynamic; you can always add properties
    // To give functionality to mark a class as being dynamic, we check a getter named 'dynamic'. We replicate AVM as best as possible for anything else
    traits.dynamic = (Object.getOwnPropertyDescriptor(proto, 'dynamic')?.get && value?.dynamic) || (!traits.className && proto.constructor.name === 'Object');
    // The identified sealed members of the value, only applicable to typed objects
    traits.keys = (traits.externalizable || proto.constructor.name === 'Object') ? [] : Object.keys(value);
    // Last, the amount of sealed members
    traits.count = traits.keys.length;

    // AMF3 requires externalizable objects to have a registered alias
    if (traits.externalizable && !traits.className) {
      throw new ReferenceError(`Tried to serialize an unregistered externalizable class: '${proto.constructor.name}'.`);
    }

    const cacheTraits = this.#reference.has(traits, 'traits');
    if (cacheTraits.referenced) {
      this.#writeUint29((cacheTraits.index << 2) | 1); // U29O-traits-ref
    } else {
      this.#writeUint29(3 | (traits.externalizable ? 4 : 0) | (traits.dynamic ? 8 : 0) | (traits.count << 4)); // U29O-traits
      this.#serializeString(traits.className, false); // class-name

      traits.keys.forEach((traitKey) => this.#serializeString(traitKey, false)); // Write sealed member names first, as specified in the spec
    }

    // Write sealed member values
    for (let i = 0; i < traits.count; i++) {
      this.serialize(value[traits.keys[i]]);
    }

    if (traits.externalizable) {
      value.writeExternal(this.#dynbuf);
    } else if (traits.dynamic) {
      for (const key in value) {
        if (traits.keys.includes(key)) continue; // This is necessary, because it prevents writing sealed member names a second time for registered classes

        this.#serializeString(key, false);
        this.serialize(value[key]);
      }

      this.#writeUint29(1); // Dynamic object empty string terminator
    }
  }

  /**
   * Serializes an array
   * @private
   * @param {any[]} value - The array to serialize
   */
  #serializeArray(value) {
    if (Object.getOwnPropertyDescriptor(value, 'VectorObject')?.value) {
      return this.#serializeTypedArray(value, 'ObjectArray');
    }

    // Todo
  }

  /**
   * Serializes a date
   * @private
   * @param {Date} value - The date to serialize
   */
  #serializeDate(value) {
    this.#dynbuf.writeByte(Markers.AMF3.DATE);

    const cache = this.#reference.has(value, 'objects');
    if (cache.referenced) return this.#writeUint29(cache.index << 1);

    this.#writeUint29(1);
    this.#dynbuf.writeDouble(value.getTime());
  }

  /**
   * Serializes a ByteArray (DynBuffer)
   * @private
   * @param {DynBuffer|import('node:buffer').Buffer} value - The ByteArray to serialize
   */
  #serializeByteArray(value) {
    this.#dynbuf.writeByte(Markers.AMF3.BYTE_ARRAY);

    const cache = this.#reference.has(value, 'objects');
    if (cache.referenced) return this.#writeUint29(cache.index << 1);

    this.#writeUint29((value.length << 1) | 1);
    this.#dynbuf.writeBytes(value);
  }

  /**
   * Serializes a Vector (typed array)
   * @private
   * @param {Int32Array|Uint32Array|Float64Array|any[]} value - The Vector to serialize
   * @param {'Int32Array'|'Uint32Array'|'Float64Array'|'ObjectArray'} type - The type of the Vector to serialize
   * @throws {TypeError} If a Vector Object was tried to serialize with multiple object types
   */
  #serializeTypedArray(value, type) {
    this.#dynbuf.writeByte(
      type === 'Int32Array' ? Markers.AMF3.VECTOR_INT :
        type === 'Uint32Array' ? Markers.AMF3.VECTOR_UINT :
          type === 'Float64Array' ? Markers.AMF3.VECTOR_DOUBLE : Markers.AMF3.VECTOR_OBJECT);

    const cache = this.#reference.has(value, 'objects');
    if (cache.referenced) return this.#writeUint29(cache.index << 1);

    this.#writeUint29((value.length << 1) | 1);
    this.#dynbuf.writeBoolean(!Object.isExtensible(value));

    if (type === 'ObjectArray') {
      // We loosely check if the type of the first value in the array matches to the other values
      const isTyped = value.every((item) => (typeof item === typeof value[0]));
      if (!isTyped) throw new TypeError('Tried to serialize a Vector Object with multiple object types');

      const aliasName = Object.getOwnPropertyDescriptor(value, 'VectorObject').value;
      const classObj = this.#classAlias.getClassByAlias(aliasName);

      classObj ? this.#serializeString(aliasName, false) : this.#writeUint29(1);
    }

    for (let i = 0; i < value.length; i++) {
      type === 'Int32Array' ? this.#dynbuf.writeInt(value[i]) :
        type === 'Uint32Array' ? this.#dynbuf.writeUnsignedInt(value[i]) :
          type === 'Float64Array' ? this.#dynbuf.writeDouble(value[i]) :
            this.serialize(value[i]);
    }
  }

  /**
   * Serializes a Dictionary (Map or WeakMap)
   * @private
   * @param {Map|WeakMap} value - The Dictionary to serialize
   */
  #serializeDictionary(value) {
    this.#dynbuf.writeByte(Markers.AMF3.DICTIONARY);

    const cache = this.#reference.has(value, 'objects');
    if (cache.referenced) return this.#writeUint29(cache.index << 1);

    const isWeak = (value instanceof WeakMap);

    this.#writeUint29((value.size << 1) | 1);
    this.#dynbuf.writeBoolean(isWeak);

    if (isWeak) {
      // Todo
    } else {
      for (const [key, keyVal] of value) {
        this.serialize(key);
        this.serialize(keyVal);
      }
    }
  }

  /**
   * Serializes an unidentified object
   * @private
   * @param {any} value - The unidentified object to serialize
   * @throws {ReferenceError} If an unknown AMF3 type has been found
   */
  #serializeUnidentifiedObject(value) {
    const { constructor } = Object.getPrototypeOf(value);
    const aliasName = this.#classAlias.getAliasByClass(constructor);

    if (aliasName || !isNativeObject(constructor)) {
      this.#serializeObject(value); // Serialize typed and anonymous objects
    } else if (constructor.name === 'Set') {
      this.#serializeArray([...value]);
    } else {
      throw new ReferenceError(`Unknown or unsupported AMF3 type found: '${constructor.name}'.`);
    }
  }
}