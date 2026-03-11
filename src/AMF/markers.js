/**
 * @module AMF/Markers
 *
 * @typedef {object} AMF0Markers
 * @property {number} NUMBER
 * @property {number} BOOLEAN
 * @property {number} STRING
 * @property {number} OBJECT
 * @property {number} MAP
 * @property {number} NULL
 * @property {number} UNDEFINED
 * @property {number} REFERENCE
 * @property {number} ECMA_ARRAY
 * @property {number} OBJECT_END
 * @property {number} STRICT_ARRAY
 * @property {number} DATE
 * @property {number} LONG_STRING
 * @property {number} UNSUPPORTED
 * @property {number} SET
 * @property {number} XML_DOCUMENT
 * @property {number} TYPED_OBJECT
 * @property {number} AVMPLUS
 *
 * @typedef {object} AMF3Markers
 * @property {number} UNDEFINED
 * @property {number} NULL
 * @property {number} FALSE
 * @property {number} TRUE
 * @property {number} INTEGER
 * @property {number} DOUBLE
 * @property {number} STRING
 * @property {number} XML_DOCUMENT
 * @property {number} DATE
 * @property {number} ARRAY
 * @property {number} OBJECT
 * @property {number} XML
 * @property {number} BYTE_ARRAY
 * @property {number} VECTOR_INT
 * @property {number} VECTOR_UINT
 * @property {number} VECTOR_DOUBLE
 * @property {number} VECTOR_OBJECT
 * @property {number} DICTIONARY
 *
 * @typedef {object} AMFMarkers
 * @property {Readonly<AMF0Markers>} AMF0
 * @property {Readonly<AMF3Markers>} AMF3
 */

/** @type {Readonly<AMFMarkers>} */
const Markers = {
  AMF0: {
    NUMBER: 0x00,
    BOOLEAN: 0x01,
    STRING: 0x02,
    OBJECT: 0x03,
    MAP: 0x04, //! Off-spec - Replace unused 'MOVIECLIP' with 'MAP'
    NULL: 0x05,
    UNDEFINED: 0x06,
    REFERENCE: 0x07,
    ECMA_ARRAY: 0x08,
    OBJECT_END: 0x09,
    STRICT_ARRAY: 0x0A,
    DATE: 0x0B,
    LONG_STRING: 0x0C,
    UNSUPPORTED: 0x0D,
    SET: 0x0E, //! Off-spec - Replace unused 'RECORDSET' with 'SET'
    XML_DOCUMENT: 0x0F,
    TYPED_OBJECT: 0x10,
    AVMPLUS: 0x11
  },

  AMF3: {
    UNDEFINED: 0x00,
    NULL: 0x01,
    FALSE: 0x02,
    TRUE: 0x03,
    INTEGER: 0x04,
    DOUBLE: 0x05,
    STRING: 0x06,
    XML_DOCUMENT: 0x07,
    DATE: 0x08,
    ARRAY: 0x09,
    OBJECT: 0x0A,
    XML: 0x0B,
    BYTE_ARRAY: 0x0C,
    VECTOR_INT: 0x0D,
    VECTOR_UINT: 0x0E,
    VECTOR_DOUBLE: 0x0F,
    VECTOR_OBJECT: 0x10,
    DICTIONARY: 0x11
  }
};

export default Object.freeze(Markers);