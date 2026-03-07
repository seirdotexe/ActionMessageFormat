/** @module AMF/Utils */

/**
 * Returns whether the value is a native Node object
 * @param {any} protoObj - The prototype of an object to check
 * @returns {boolean} Whether the given value is a native Node object or not
 */
export const isNativeObject = (protoObj) => protoObj.toString().includes('[native code]');