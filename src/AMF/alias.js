/** @module AMF/ClassAlias */
export default class ClassAlias {
  /**
   * Initialize a new WeakMap to store class->alias (aliases by their class)
   * @private
   * @type {WeakMap<object, string>}
   */
  #classes;
  /**
   * Initialize a new Map to store alias->class (classes by their alias)
   * @private
   * @type {Map<string, object>}
   */
  #aliases;

  /**
   * Creates a new ClassAlias
   */
  constructor() {
    this.#classes = new WeakMap();
    this.#aliases = new Map();
  }

  /**
   * Looks up a class by its alias
   * @param {string} aliasName - The alias belonging to the class to retrieve
   * @returns {object} The class belonging to the specified alias
   */
  getClassByAlias(aliasName) {
    return this.#aliases.get(aliasName);
  }

  /**
   * Looks up an alias by its class
   * @param {object} classObj - The class belonging to the alias to retrieve
   * @returns {string} The alias belonging to the specified class
   */
  getAliasByClass(classObj) {
    return this.#classes.get(classObj);
  }

  /**
   * Registers the class of an object
   * @param {string} aliasName - The alias to register the class under
   * @param {object} classObj - The class to preserve and to associate with the alias
   */
  registerClassAlias(aliasName, classObj) {
    this.#classes.set(classObj, aliasName);
    this.#aliases.set(aliasName, classObj);
  }

  /**
   * Unregisters the class of an object
   * @param {string} aliasName - The alias belonging to the class to unregister
   */
  unregisterClassAlias(aliasName) {
    const classObj = this.getClassByAlias(aliasName);

    this.#classes.delete(classObj);
    this.#aliases.delete(aliasName);
  }
}