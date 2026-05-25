/** @module AMF0/Reference */
export default class Reference {
    /**
     * Resets the references
     */
    reset(): void;
    /**
     * Retrieves an object by its index
     * @param {number} index - The index in the referenced objects array
     * @returns {object} The referenced object
     */
    get(index: number): object;
    /**
     * Sets an object to hold as a reference
     * @param {object} value - The object to reference and mark as 'seen'
     */
    set(value: object): void;
    /**
     * Checks whether the given object is referenced (or, 'seen'). If not, then it's added. For every call, a 'cache' object is returned
     * @param {object} - The object to check if it's referenced or not
     * @returns {{index: number, referenced: boolean}} The cache object; its index and if it's referenced or not
     */
    has(value: any): {
        index: number;
        referenced: boolean;
    };
    #private;
}
