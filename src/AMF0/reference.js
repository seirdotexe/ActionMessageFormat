/** @module AMF0/Reference */
export default class Reference {
  /**
   * Initialize the array to hold referenced 'seen' objects
   * @private
   * @type {object[]}
   */
  #objects;

  /**
   * Creates a new AMF0 Reference holder
   */
  constructor() {
    this.#objects = [];
  }

  /**
   * Resets the references
   */
  reset() {
    this.#objects = [];
  }

  /**
   * Retrieves an object by its index
   * @param {number} index - The index in the referenced objects array
   * @returns {object} The referenced object
   */
  get(index) {
    return this.#objects[index];
  }

  /**
   * Sets an object to hold as a reference
   * @param {object} value - The object to reference and mark as 'seen'
   */
  set(value) {
    this.#objects[this.#objects.length] = value;
  }

  /**
   * Checks whether the given object is referenced (or, 'seen'). If not, then it's added. For every call, a 'cache' object is returned
   * @param {object} - The object to check if it's referenced or not
   * @returns {{index: number, referenced: boolean}} The cache object; its index and if it's referenced or not
   */
  has(value) {
    const index = this.#objects.indexOf(value);
    const cache = { index, referenced: (index !== -1) };

    if (!cache.referenced) this.set(value);

    return cache;
  }
}