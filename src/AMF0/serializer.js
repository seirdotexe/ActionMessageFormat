import DynBuffer from '@seirdotexe/dynbuffer';
import Markers from '../AMF/static/markers.js';
import { determineArray, isNativeObject } from '../AMF/utils.js';
import Reference from './reference.js';

/**
 * @typedef {import('../AMF/alias.js').default} ClassAlias
 * @typedef {import('../AMF/static/options.js').AMFSerializerOptions} AMFOptions
 *
 * @typedef {import('../AMF/remoting/header.js').default} Header
 * @typedef {import('../AMF/remoting/message.js').default} Message
 * @typedef {import('../AMF/remoting/packet.js').default} Packet
 */

/** @module AMF0/Serializer */
export default class Serializer {
  /**
   * The AMF class alias holder
   * @private
   * @type {ClassAlias}
   */
  #classAlias;
  /**
   * The 'serialize' function holder
   * @private
   * @type {Function}
   */
  #AMF_Serialize;
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
   * The Dynamic Property Writer function holder
   * @private
   * @type {Function}
   */
  #dynamicPropertyWriter;
  /**
   * The AMF options object holder
   * @private
   * @type {AMFOptions}
   */
  #options;

  /**
   * Initialize the list of types to serialize with AMF0 when facing possible AVM+ challenges
   * @static
   * @type {string[]}
   */
  static #NATIVE_TYPES = ['number', 'boolean', 'string'];

  /**
   * Creates a new AMF0 serializer
   * @param {ClassAlias} classAlias - The class alias internally coming from the AMF entrypoint class
   * @param {Function} AMF_Serialize - The 'serialize' function coming from the AMF entrypoint class
   */
  constructor(classAlias, AMF_Serialize) {
    this.#classAlias = classAlias;
    this.#AMF_Serialize = AMF_Serialize;
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
   * Serializes a packet into AMF binary data
   * @param {Packet} packet - The AMF packet to serialize
   * @returns {Serializer} Returns the AMF serializer to perform a swift flush in AMF entrypoint class
   */
  serializePacket(packet) {
    let positionBeforeAMF = 0, positionAfterAMF = 0;

    this.#dynbuf.writeShort(packet.version);
    // Write headers
    this.#dynbuf.writeShort(packet.headerCount);
    for (const header of packet.headers) {
      // Write 'name' and 'mustUnderstand'
      this.#dynbuf.writeUTF(header.name);
      this.#dynbuf.writeBoolean(header.mustUnderstand);
      // Store the position before writing AMF data, and temporarily write -1 for length
      positionBeforeAMF = this.#dynbuf.position; this.#dynbuf.writeInt(-1);
      // Serialize data
      this.#serializeAVMPlus(header.data);
      // Store the position after writing AMF data, then go back to before we serialized 'data'
      positionAfterAMF = this.#dynbuf.position; this.#dynbuf.position = positionBeforeAMF;
      // Write the amount of bytes needed that were needed to serialize the AMF data, then reset back for closure
      this.#dynbuf.writeInt(positionAfterAMF - positionBeforeAMF - 4); this.#dynbuf.position = positionAfterAMF;
      // Todo - Reference reset, where?
    }

    // Write messages
    this.#dynbuf.writeShort(packet.messageCount);
    for (const message of packet.messages) {
      // Write 'targetURI' and 'responseURI'
      this.#dynbuf.writeUTF(message.targetURI);
      this.#dynbuf.writeUTF(message.responseURI);
      // Store the position before writing AMF data and temporarily write -1 for length
      positionBeforeAMF = this.#dynbuf.position; this.#dynbuf.writeInt(-1);
      // Serialize data
      this.#serializeStrictArray(message.data);
      // Store the position after writing AMF data, then go back to before we serialized 'data'
      positionAfterAMF = this.#dynbuf.position; this.#dynbuf.position = positionBeforeAMF;
      // Write the amount of bytes that were needed to serialize the AMF data, then reset back for closure
      this.#dynbuf.writeInt(positionAfterAMF - positionBeforeAMF - 4); this.#dynbuf.position = positionAfterAMF;
      // Todo - Reference reset, where?
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
    if (this.#dynamicPropertyWriter) {
      this.#dynamicPropertyWriter(value);
    }

    const cache = this.#reference.has(value);
    if (cache.referenced) return this.#serializeReference(cache.index);

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
    if (cache.referenced) return this.#serializeReference(cache.index);

    this.#dynbuf.writeByte(Markers.AMF0.ECMA_ARRAY);
    this.#dynbuf.writeUnsignedInt(value.length); //! Undocumented behavior - An associative array will always write 0 here by AVM. This is done on purpose; we must treat it as an object! The keys will turn into sparse entries which is unwanted

    const arrInfo = determineArray(value);

    /*
    AVM secretly cleans up sparse entries in an array. But very important to note: it only does this when setting array values by index. It does this to optimize buffer space

    var value:Array = []; // It won't optimize when you do [,,1] - Also Node is unable to determine the difference. AVM probably inspects this behavior through a proxy class
    value[2] = 1;

    The AMF0 serialized hex will be: 08 00 00 00 03 00 01 32 00 3f f0 00 00 00 00 00 00 00 00 09
    01 32 = writeUTF length and the letter '2' followed by the number 1 in writeDouble

    Because the length is still written, sparse entries will naturally return, and the deserialized value will be unaffected
    */

    // Write sparse and/or dense values
    if (arrInfo.sparse || arrInfo.dense) {
      for (let i = 0; i < value.length; i++) {
        if (!Object.hasOwn(value, i) && this.#options.compressSparse) continue; //! Undocumented behavior - Skip sparse entries, used to preserve buffer bytes

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
    if (cache.referenced) return this.#serializeReference(cache.index);

    this.#dynbuf.writeByte(Markers.AMF0.DATE);
    this.#dynbuf.writeDouble(value.getTime());
    this.#dynbuf.writeShort(value.getTimezoneOffset()); //! Undocumented behavior - The spec clearly says '0x0000' should be written, but this isn't true. It does actually write the timezone offset
  }

  /**
   * Serializes a strict array
   * @private
   * @param {any[]} value - The strict array to serialize
   */
  #serializeStrictArray(value) {
    const cache = this.#reference.has(value);
    if (cache.referenced) return this.#serializeReference(cache.index);

    this.#dynbuf.writeByte(Markers.AMF0.STRICT_ARRAY);
    this.#dynbuf.writeUnsignedInt(value.length);

    for (let i = 0; i < value.length; i++) {
      this.#serializeAVMPlus(value[i]);
    }
  }

  /**
   * Serializes an AVMPlus marker and its value in AMF3
   * @private
   * @param {any} value - The value to serialize in AMF3, some sort of object
   */
  #serializeAVMPlus(value) {
    if ((value === null) || (value === undefined) || Serializer.#NATIVE_TYPES.includes(typeof value)) {
      this.serialize(value);
    } else {
      this.#dynbuf.writeByte(Markers.AMF0.AVMPLUS);
      this.#dynbuf.writeBytes(this.#AMF_Serialize(value));
    }
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
    } else { // An unknown (base) type was found
      if (constructor.name === 'Map') {
        this.#options.castMapSet ? this.#serializeObject(Object.fromEntries(value)) : this.#serializeMap(value);
      } else if (constructor.name === 'Set') {
        this.#options.castMapSet ? this.#serializeArray([...value]) : this.#serializeSet(value);
      } else {
        this.#serializeUnsupported(); //! We do the right thing and write the unsupported marker
      }
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
    if (cache.referenced) return this.#serializeReference(cache.index);

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
   * Serializes a map
   * @private
   * @param {Map} value - The map to serialize
   */
  #serializeMap(value) {
    const cache = this.#reference.has(value);
    if (cache.referenced) return this.#serializeReference(cache.index);

    this.#dynbuf.writeByte(Markers.AMF0.MAP);

    for (const [key, mapVal] of value) {
      this.#dynbuf.writeUTF(key);
      this.serialize(mapVal);
    }

    this.#dynbuf.writeShort(0);
    this.#dynbuf.writeByte(Markers.AMF0.OBJECT_END);
  }

  /**
   * Serializes a set
   * @private
   * @param {Set} value - The set to serialize
   */
  #serializeSet(value) {
    const cache = this.#reference.has(value);
    if (cache.referenced) return this.#serializeReference(cache.index);

    this.#dynbuf.writeByte(Markers.AMF0.SET);
    this.#dynbuf.writeUnsignedInt(value.size);

    for (const setVal of value) {
      this.serialize(setVal);
    }
  }

  /**
   * Serializes an unsupported value
   * @private
   */
  #serializeUnsupported() {
    this.#dynbuf.writeByte(Markers.AMF0.UNSUPPORTED);
  }
}