/** @module AMF/ClassAlias */
export default class ClassAlias {
    /**
     * Looks up a class by its alias
     * @param {string} aliasName - The alias belonging to the class to retrieve
     * @returns {object} The class belonging to the specified alias
     */
    getClassByAlias(aliasName: string): object;
    /**
     * Looks up an alias by its class
     * @param {object} classObj - The class belonging to the alias to retrieve
     * @returns {string} The alias belonging to the specified class
     */
    getAliasByClass(classObj: object): string;
    /**
     * Registers the class of an object
     * @param {string} aliasName - The alias to register the class under
     * @param {object} classObj - The class to preserve and to associate with the alias
     */
    registerClassAlias(aliasName: string, classObj: object): void;
    /**
     * Unregisters the class of an object
     * @param {string} aliasName - The alias belonging to the class to unregister
     */
    unregisterClassAlias(aliasName: string): void;
    #private;
}
