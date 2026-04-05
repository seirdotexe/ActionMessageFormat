import ClassAlias from './AMF/alias.js';

import { default as Serializer0 } from './AMF0/serializer.js';
import { default as Serializer3 } from './AMF3/serializer.js';

import { default as Deserializer0 } from './AMF0/deserializer.js';
import { default as Deserializer3 } from './AMF3/deserializer.js';

import { DeserializerOptions, SerializerOptions } from './AMF/static/options.js';

/**
 * @typedef {import('./AMF/remoting/packet.js').default} Packet
 */

/**
 * @author SeirDotExe
 * @license BSD-3-Clause
 */
export class AMF {
  /**
   * Initialize the class alias holder
   * @static
   * @type {ClassAlias}
   */
  static classAlias = new ClassAlias();

  /**
   * Initialize the serializers
   * @static
   * @type {{ 0: Serializer0, 3: Serializer3}}
   */
  static #serializers = {
    0: new Serializer0(this.classAlias),
    3: new Serializer3(this.classAlias)
  };

  /**
   * Initialize the deserializers
   * @static
   * @type {{ 0: Deserializer0, 3: Deserializer3}}
   */
  static #deserializers = {
    0: new Deserializer0(this.classAlias, AMF.deserialize.bind(AMF)),
    3: new Deserializer3(this.classAlias)
  };

  /**
   * Registers a Dynamic Property Writer to dynamically modify an object before it's serialized
   * @param {Function} method - The Dynamic Property Writer method
   * @param {0|3} [version=3] - The AMF version
   * @throws {ReferenceError} There must be 1 argument in the given method
   */
  static registerDynamicPropertyWriter(method, version = 3) {
    if (method.length !== 1) {
      throw new ReferenceError('A Dynamic Property Writer can only take 1 argument, which is used to pass objects for modification.');
    }

    this.#serializers[version].dynamicPropertyWriter = method;
  }

  /**
   * Serializes an object into AMF binary data
   * @static
   * @param {any} value - Any supported value to serialize
   * @param {0|3} [version=3] - The AMF version
   * @param {SerializerOptions?} options - The options object which has certain settings to utilize different AMF behavior
   * @returns {Buffer} Returns the AMF data in a buffer
   */
  static serialize(value, version = 3, options = SerializerOptions) {
    this.#serializers[version].options = options;

    return this.#serializers[version].serialize(value).flush();
  }

  /**
   * Deserializes AMF binary data to an object
   * @static
   * @param {Buffer} buffer - The AMF binary data
   * @param {0|3} [version=3] - The AMF version
   * @param {DeserializerOptions?} options - The options object which has certain settings to utilize different AMF behavior
   * @returns {any} The deserialized object
   */
  static deserialize(buffer, version = 3, options = DeserializerOptions) {
    this.#deserializers[version].options = options;

    return this.#deserializers[version].deserialize(buffer);
  }

  /**
   * Serializes a packet into AMF binary data
   * @static
   * @param {Packet} packet - The AMF packet to serialize
   * @param {DeserializerOptions?} options - The options object which has certain settings to utilize different AMF behavior. **Depends on 'packet.version'**!
   * @returns {Buffer} Returns the AMF packet data in a buffer
   */
  static serializePacket(packet, options = SerializerOptions) {
    this.#serializers[packet.version].options = options;

    return this.#serializers[0].serializePacket(packet).flush();
  }
}