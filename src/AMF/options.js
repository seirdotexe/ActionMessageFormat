/**
 * @module AMF/Options
 *
 * @typedef {object} AMFSerializerOptions
 * @property {boolean} compressSparse - **AMF0** - Whether to compress sparse array entries or not. Default to **true**
 * @property {boolean} castMapSet - **AMF0** - Whether to cast Map to Object & Set to Array, *or* support Map & Set. Default to **true**
 *
 * @typedef {object} AMFDeserializerOptions
 * @property {boolean} dateOffset - **AMF0** - Whether to utilize date offset or not. Default to **false**
 * @property {boolean} throwErrorUnsupported - Whether to throw an error upon encountering an unknown marker while serializing/deserializing or not. Default to **true**
 */

/** @type {AMFSerializerOptions} */
export const SerializerOptions = {
  compressSparse: true,
  castMapSet: true
};

/** @type {AMFDeserializerOptions} */
export const DeserializerOptions = {
  dateOffset: false,
  throwErrorUnsupported: true
};