/**
 * @module AMF/Static/Options
 *
 * @typedef {object} AMFSerializerOptions
 * @property {boolean} throwErrorUnsupported - Whether to throw an error upon encountering an unknown marker while serializing or not. Default to **true**
 * @property {boolean} compressSparse - **AMF0** - Whether to compress sparse array entries or not. Default to **true**
 * @property {boolean} castMapSet - **AMF0** - Whether to cast Map to Object & Set to Array, *or* support Map & Set. Default to **true**
 *
 * @typedef {object} AMFDeserializerOptions
 * @property {boolean} throwErrorUnsupported - Whether to throw an error upon encountering an unknown marker while deserializing or not. Default to **true**
 * @property {boolean} dateOffset - **AMF0** - Whether to utilize date offset or not. Default to **false**
 * @property {boolean} strictDynamic - **AMF3** - Whether to seal a class when the getter 'dynamic' has been set to 'false'. Default to **true**
 */

/** @type {AMFSerializerOptions} */
export const SerializerOptions = {
  throwErrorUnsupported: true,
  compressSparse: true,
  castMapSet: true
};

/** @type {AMFDeserializerOptions} */
export const DeserializerOptions = {
  throwErrorUnsupported: true,
  dateOffset: false,
  strictDynamic: true
};