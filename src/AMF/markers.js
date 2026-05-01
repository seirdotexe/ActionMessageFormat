/**
 * @module AMF/Markers
 *
 * @typedef {object} AMF0Markers
 * @property {number} NUMBER 0x00
 * @property {number} BOOLEAN 0x01
 * @property {number} STRING 0x02
 * @property {number} OBJECT 0x03
 * @property {number} MAP 0x04 -- MOVIECLIP
 * @property {number} NULL 0x05
 * @property {number} UNDEFINED 0x06
 * @property {number} REFERENCE 0x07
 * @property {number} ECMA_ARRAY 0x08
 * @property {number} OBJECT_END 0x09
 * @property {number} STRICT_ARRAY 0x0A
 * @property {number} DATE 0x0B
 * @property {number} LONG_STRING 0x0C
 * @property {number} UNSUPPORTED 0x0D
 * @property {number} SET 0x0E -- RECORDSET
 * @property {number} XML_DOCUMENT 0x0F
 * @property {number} TYPED_OBJECT 0x10
 * @property {number} AVMPLUS 0x11
 *
 * @typedef {object} AMF3Markers
 * @property {number} UNDEFINED 0x00
 * @property {number} NULL 0x01
 * @property {number} FALSE 0x02
 * @property {number} TRUE 0x03
 * @property {number} INTEGER 0x04
 * @property {number} DOUBLE 0x05
 * @property {number} STRING 0x06
 * @property {number} XML_DOCUMENT 0x07
 * @property {number} DATE 0x08
 * @property {number} ARRAY 0x09
 * @property {number} OBJECT 0x0A
 * @property {number} XML 0x0B
 * @property {number} BYTE_ARRAY 0x0C
 * @property {number} VECTOR_INT 0x0D
 * @property {number} VECTOR_UINT 0x0E
 * @property {number} VECTOR_DOUBLE 0x0F
 * @property {number} VECTOR_OBJECT 0x10
 * @property {number} DICTIONARY 0x11
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
    MOVIECLIP: 0x04, // Reserved
    NULL: 0x05,
    UNDEFINED: 0x06,
    REFERENCE: 0x07,
    ECMA_ARRAY: 0x08,
    OBJECT_END: 0x09,
    STRICT_ARRAY: 0x0A,
    DATE: 0x0B,
    LONG_STRING: 0x0C,
    UNSUPPORTED: 0x0D,
    RECORDSET: 0x0E, // Reserved
    XML_DOCUMENT: 0x0F, // Todo - Convert to string?
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
    XML_DOCUMENT: 0x07, // Todo - Convert to string?
    DATE: 0x08,
    ARRAY: 0x09,
    OBJECT: 0x0A,
    XML: 0x0B, // Todo - Convert to string?
    BYTE_ARRAY: 0x0C,
    VECTOR_INT: 0x0D,
    VECTOR_UINT: 0x0E,
    VECTOR_DOUBLE: 0x0F,
    VECTOR_OBJECT: 0x10,
    DICTIONARY: 0x11
  }
};

export default Object.freeze(Markers);