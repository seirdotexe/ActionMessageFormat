import fastJson from 'fast-json-stringify';

/** @module AMF3/Reference */
export default class Reference {
  /**
   * Initialize the array to hold referenced 'seen' strings
   * @private
   * @type {string[]}
   */
  #strings;
  /**
   * Initialize the array to hold referenced 'seen' objects
   * @private
   * @type {object[]}
   */
  #objects;
  /**
   * Initialize the array to hold referenced 'seen' traits. These values are hashed to improve performance
   * @private
   * @type {string[]}
   */
  #traits;
  /**
   * Initialize the JSON stringify tool for traits
   * @private
   * @type {Function}
   */
  #stringify;

  /**
   * Creates a new AMF3 Reference holder
   */
  constructor() {
    this.#strings = [];
    this.#objects = [];
    this.#traits = [];
    this.#stringify = fastJson({
      title: 'AMF3 traits schema',
      type: 'object',
      properties: {
        className: {
          type: 'string'
        },
        externalizable: {
          type: 'boolean'
        },
        dynamic: {
          type: 'boolean'
        },
        keys: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        count: {
          type: 'integer'
        }
      }
    });
  }

  /**
   * Returns the referenced 'seen' strings
   * @returns {string[]}
   */
  get strings() { return this.#strings; }
  /**
   * Returns the referenced 'seen' objects
   * @returns {object[]}
   */
  get objects() { return this.#objects; }
  /**
   * Returns the referenced 'seen' traits
   * @returns {string[]}
   */
  get traits() { return this.#traits; }

  /**
   * Resets the references
   */
  reset() {
    this.#strings = [];
    this.#objects = [];
    this.#traits = [];
  }

  /**
   * Retrieves a referenced value by its index
   * @param {number} index - The index in the referenced type's array table to look up
   * @param {'strings'|'objects'|'traits'} table - The reference table type
   * @returns {object|string} The referenced value
   */
  get(index, table) {
    const value = this[table][index];

    if (table === 'traits') return JSON.parse(value);

    return value;
  }

  /**
   * Sets an object to hold as a reference
   * @param {object|string} value - The value to reference and mark as 'seen'
   * @param {'strings'|'objects'|'traits'} table - The reference table type
   */
  set(value, table) {
    this[table][this[table].length] = value;
  }

  /**
   * Checks whether the given object is referenced (or, 'seen'). If not, then it's added. For every call, a 'cache' object is returned
   * @param {object} - The object to check if it's referenced or not
   * @param {'strings'|'objects'|'traits'} table - The reference table type
   * @returns {{index: number, referenced: boolean}} The cache object; its index and if it's referenced or not
   */
  has(value, table) {
    // We need to stringify the trait object beforehand
    let traitStringified; if (table === 'traits') traitStringified = this.#stringify(value);

    const index = this[table].indexOf((table === 'traits') ? traitStringified : value);
    const cache = { index, referenced: (index !== -1) };

    if (!cache.referenced) this.set((table === 'traits') ? traitStringified : value, table);

    return cache;
  }
}