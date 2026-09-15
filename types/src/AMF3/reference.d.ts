/** @module AMF3/Reference */
export default class Reference {
    /**
     * Resets the references
     */
    reset(): void;
    /**
     * Retrieves a referenced value by its index
     * @param {number} index - The index in the referenced type's array table to look up
     * @param {'strings'|'objects'|'traits'} table - The reference table type
     * @returns {object|string} The referenced value
     */
    get(index: number, table: "strings" | "objects" | "traits"): object | string;
    /**
     * Sets a value to hold as a reference
     * @param {object|string} value - The value to reference and mark as 'seen'
     * @param {'strings'|'objects'|'traits'} table - The reference table type
     */
    set(value: object | string, table: "strings" | "objects" | "traits"): void;
    /**
     * Checks whether the given object is referenced (or, 'seen'). If not, then it's added. For every call, a 'cache' object is returned
     * @param {object|string} value - The value to check if it's referenced or not
     * @param {'strings'|'objects'|'traits'} table - The reference table type
     * @returns {{index: number, referenced: boolean}} The cache object; its index and if it's referenced or not
     */
    has(value: object | string, table: "strings" | "objects" | "traits"): {
        index: number;
        referenced: boolean;
    };
    #private;
}
