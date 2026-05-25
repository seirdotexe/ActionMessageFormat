declare const _default: Readonly<Readonly<AMFMarkers>>;
export default _default;
export type AMF0Markers = {
    /**
     * 0x00
     */
    NUMBER: number;
    /**
     * 0x01
     */
    BOOLEAN: number;
    /**
     * 0x02
     */
    STRING: number;
    /**
     * 0x03
     */
    OBJECT: number;
    /**
     * 0x04 -- MOVIECLIP
     */
    MAP: number;
    /**
     * 0x05
     */
    NULL: number;
    /**
     * 0x06
     */
    UNDEFINED: number;
    /**
     * 0x07
     */
    REFERENCE: number;
    /**
     * 0x08
     */
    ECMA_ARRAY: number;
    /**
     * 0x09
     */
    OBJECT_END: number;
    /**
     * 0x0A
     */
    STRICT_ARRAY: number;
    /**
     * 0x0B
     */
    DATE: number;
    /**
     * 0x0C
     */
    LONG_STRING: number;
    /**
     * 0x0D
     */
    UNSUPPORTED: number;
    /**
     * 0x0E -- RECORDSET
     */
    SET: number;
    /**
     * 0x0F
     */
    XML_DOCUMENT: number;
    /**
     * 0x10
     */
    TYPED_OBJECT: number;
    /**
     * 0x11
     */
    AVMPLUS: number;
};
export type AMF3Markers = {
    /**
     * 0x00
     */
    UNDEFINED: number;
    /**
     * 0x01
     */
    NULL: number;
    /**
     * 0x02
     */
    FALSE: number;
    /**
     * 0x03
     */
    TRUE: number;
    /**
     * 0x04
     */
    INTEGER: number;
    /**
     * 0x05
     */
    DOUBLE: number;
    /**
     * 0x06
     */
    STRING: number;
    /**
     * 0x07
     */
    XML_DOCUMENT: number;
    /**
     * 0x08
     */
    DATE: number;
    /**
     * 0x09
     */
    ARRAY: number;
    /**
     * 0x0A
     */
    OBJECT: number;
    /**
     * 0x0B
     */
    XML: number;
    /**
     * 0x0C
     */
    BYTE_ARRAY: number;
    /**
     * 0x0D
     */
    VECTOR_INT: number;
    /**
     * 0x0E
     */
    VECTOR_UINT: number;
    /**
     * 0x0F
     */
    VECTOR_DOUBLE: number;
    /**
     * 0x10
     */
    VECTOR_OBJECT: number;
    /**
     * 0x11
     */
    DICTIONARY: number;
};
export type AMFMarkers = {
    AMF0: Readonly<AMF0Markers>;
    AMF3: Readonly<AMF3Markers>;
};
