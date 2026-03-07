/** @module AMF/Utils */

/**
 * Returns whether the value is a native Node object
 * @param {any} protoObj - The prototype of an object to check
 * @returns {boolean} Whether the given value is a native Node object or not
 */
export const isNativeObject = (protoObj) => protoObj.toString().includes('[native code]');

/**
 * Returns information about what type of array has been determined; associative, sparse and/or dense
 * @param {any[]} arr - The array to check
 * @returns {{associative: boolean, sparse: boolean, dense: boolean}} Info about the given array
 */
export const determineArray = (arr) => {
  // Todo - Perhaps there's a way to improve this. Filtering is too big of a deal when all we want to do is detect
  // An associative array, which you can create using Object.assign(), uses strings for keys, like an object
  const isAssociative = Object.keys(arr).some(key => isNaN(Number(key)));
  // A sparse array is an array with holes. Sparse arrays can be detected by checking if the length property of the array is greater than the number of elements in the array
  const isSparse = (arr.length > arr.filter(() => true).length);
  // A dense array, like [1,2,3], the most casual array, can be determined with a simple length check
  const isDense = (arr.length === Object.values(arr).length);

  return { associative: isAssociative, sparse: isSparse, dense: isDense };
}