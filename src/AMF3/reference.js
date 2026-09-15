/** @module AMF3/Reference */
export default class Reference {
  /**
   * Initialize the reference tables
   * @private
   * @type {{
   * strings: string[],
   * objects: object[],
   * traits: string[]
   * }}
   */
  #tables;

  /**
   * Creates a new AMF3 Reference holder
   */
  constructor() {
    this.#tables = { strings: [], objects: [], traits: [] };
    this.reset = this.reset.bind(this); // Bind so 'serializePacket' and 'deserializePacket' can pass from within AMF entrypoint
  }

  /**
   * Resets the references
   */
  reset() {
    this.#tables = { strings: [], objects: [], traits: [] };
  }

  /**
   * Retrieves a referenced value by its index
   * @param {number} index - The index in the referenced type's array table to look up
   * @param {'strings'|'objects'|'traits'} table - The reference table type
   * @returns {object|string} The referenced value
   */
  get(index, table) {
    const value = this.#tables[table][index];

    return (table === 'traits') ? JSON.parse(value) : value;
  }

  /**
   * Sets a value to hold as a reference
   * @param {object|string} value - The value to reference and mark as 'seen'
   * @param {'strings'|'objects'|'traits'} table - The reference table type
   */
  set(value, table) {
    this.#tables[table].push(value);
  }

  /**
   * Checks whether the given object is referenced (or, 'seen'). If not, then it's added. For every call, a 'cache' object is returned
   * @param {object|string} value - The value to check if it's referenced or not
   * @param {'strings'|'objects'|'traits'} table - The reference table type
   * @returns {{index: number, referenced: boolean}} The cache object; its index and if it's referenced or not
   */
  has(value, table) {
    const index = this.#tables[table].indexOf(value);
    const cache = { index, referenced: (index !== -1) };

    if (!cache.referenced) this.set(value, table);

    return cache;
  }
}