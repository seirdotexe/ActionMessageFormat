/**
 * @module AMF/Options
 *
 * @typedef {object} AMFSerializerOptions
 * @property {boolean} compressSparse - Whether or not to compress **AMF0** sparse array entries. Default to true
 *
 * @typedef {object} AMFDeserializerOptions
 * @property {boolean} dateOffset - Whether or not to utilize **AMF0** date offset. Default to false
 * @property {boolean} throwErrorUnsupported - Whether or not to throw an error upon encountering an unknown marker while deserializing. Default to true
 */

/** @type {AMFSerializerOptions} */
export const SerializerOptions = {
  compressSparse: true
};

/** @type {AMFDeserializerOptions} */
export const DeserializerOptions = {
  dateOffset: false,
  throwErrorUnsupported: true
};