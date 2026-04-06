import Header from './header.js';
import Message from './message.js';

/** @module AMF/Remoting/Packet */
export default class Packet {
  /**
   * The headers in the AMF packet
   * @type {Set<Header>}
   */
  #headers;
  /**
   * The messages in the AMF packet
   * @type {Set<Message>}
   */
  #messages;

  /**
   * Creates a new remoting Packet
   * @param {0|3} [version=3] - The AMF packet version used to serialize/deserialize header and message body values
   */
  constructor(version = 3) {
    /**
     * The AMF packet version
     * @type {0|3}
     */
    this.version = version;
    this.#headers = new Set();
    this.#messages = new Set();
  }

  /**
   * Overwrite for inspecting on the Packet class
   * @param {number} depth - The 'depth' param of util.inspect
   * @param {Object} options - The util.InspectOptionsStylized options
   * @param {Function} inspect - The util.inspect function
   * @returns {string} A pretty printed representation of the Packet class
   */
  [Symbol.for('nodejs.util.inspect.custom')](depth, options, inspect) {
    return `${options.stylize('Packet', 'special')} {
        \r  version: ${options.stylize(this.version, 'number')},
        \r  headers: ${inspect(this.#headers, { ...options, compact: true })},
        \r  messages: ${inspect(this.#messages, { ...options, compact: true })}
      \r}`;
  }

  /**
   * Returns all of the headers in the AMF packet
   * @returns {Set<Header>} All of the headers
   */
  get headers() {
    return this.#headers;
  }

  /**
   * Returns all of the messages in the AMF packet
   * @returns {Set<Message>} All of the messages
   */
  get messages() {
    return this.#messages
  }

  /**
   * Returns the amount of headers in the AMF packet
   * @returns {number} The amount of headers
   */
  get headerCount() {
    return this.#headers.size;
  }

  /**
   * Returns the amount of messages in the AMF packet
   * @returns {number} The amount of messages
   */
  get messageCount() {
    return this.#messages.size;
  }

  /**
   * Adds a header
   * @param {string} name - Identifies the header and the ActionScript object data associated with it
   * @param {boolean} mustUnderstand - Indicates that the server must understand and process this header before it handles any of the following headers or messages
   * @param {any} data - The provided header data
   */
  addHeader(name, mustUnderstand = false, data) {
    const header = new Header(name, mustUnderstand, data);

    this.#headers.add(header);
  }

  /**
   * Removes a header
   * @param {string} name - The header's name to remove
   */
  removeHeader(name) {
    for (const header of this.#headers) {
      if (header.name === name) this.#headers.delete(header);
    }
  }

  /**
   * Adds a message
   * @param {string} targetURI - The operation to invoke
   * @param {string} responseURI - The unique operation name to match the response to the client invoke
   * @param {...any} data - The provided message data
   */
  addMessage(targetURI, responseURI, ...data) {
    const message = new Message(targetURI, responseURI, data);

    this.#messages.add(message);
  }

  /**
   * Removes a message
   * @param {string} targetURI - The operation URI of the message to remove
   */
  removeMessage(targetURI) {
    for (const message of this.#messages) {
      if (message.targetURI === targetURI) this.#messages.delete(message);
    }
  }
}