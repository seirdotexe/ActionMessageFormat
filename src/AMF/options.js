/**
 * @module AMF/Options
 *
 * @typedef {object} AMFOptions
 * @property {boolean} compressSparse - Whether or not to compress **AMF0** sparse array entries. Default to true
 * @property {boolean} dateOffset - Whether or not to utilize **AMF0** date offset. Default to false
 */

/** @type {AMFOptions} */
const Options = {
  compressSparse: true,
  dateOffset: false
};

export default Options;