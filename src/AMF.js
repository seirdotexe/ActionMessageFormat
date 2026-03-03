import ClassAlias from './AMF/alias.js';

import { default as Serializer0 } from './AMF0/serializer.js';
import { default as Serializer3 } from './AMF3/serializer.js';

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
   * Serialize an object into AMF binary data
   * @static
   * @param {any} value - Any supported value to serialize
   * @param {0|3} [version=3] - The AMF version
   * @returns {Buffer} Returns the AMF data in a buffer
   */
  static serialize(value, version = 3) {
    return this.#serializers[version].serialize(value).flush();
  }


  static deserialize(buffer, version = 3) { }
}