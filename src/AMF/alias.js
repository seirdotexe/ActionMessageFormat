/**
 * @exports
 * @default
 * @class
 * @module AMF
 */
export default class ClassAlias {
  /**
   * Initialize a new WeakMap to store class->alias
   * @private
   * @type {WeakMap<object, string>}
   */
  #classes;
  /**
   * Initialize a new Map to store alias->class
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
   * Looks up a class that previously had an alias registered to it
   * @param {string} aliasName - The alias belonging to the class to retrieve
   * @returns {object} The class belonging to the specified alias
   */
  getClassByAlias(aliasName) {
    return this.#aliases.get(aliasName);
  }

  /**
   * Looks up an alias that previously had a class registered to it
   * @param {object} classObj - The class belonging to the alias to retrieve
   * @returns {string} The alias belonging to the specified class
   */
  getAliasByClass(classObj) {
    return this.#classes.get(classObj);
  }

  /**
   * Register a class of an object when the object is encoded in AMF
   * @param {string} aliasName - The alias to register the class under
   * @param {object} classObj - The class to preserve and to associate with the alias
   */
  registerClassAlias(aliasName, classObj) {
    this.#classes.set(classObj, aliasName);
    this.#aliases.set(aliasName, classObj);
  }

  /**
   * Unregisters a class completely so that its alias is no longer associated
   * @param {string} aliasName - The alias to unregister and clear all associations to any class
   */
  deregisterClassAlias(aliasName) {
    const classObj = this.getClassByAlias(aliasName);

    this.#classes.delete(classObj);
    this.#aliases.delete(aliasName);
  }
}