/** @module AMF/Remoting/Message */
export default class Message {
  /**
   * Creates a new remoting Message
   * @param {string} targetURI - The operation to invoke
   * @param {string} responseURI - The unique operation name to match the response to the client invoke
   * @param {any} data - The provided message data
   */
  constructor(targetURI, responseURI, data) {
    /**
     * The operation to invoke
     * @type {string}
     */
    this.targetURI = targetURI;
    /**
     * The unique operation name to match the response to the client invoke
     * @type {string}
     */
    this.responseURI = responseURI;
    /**
     * The provided message data
     * @type {any}
     */
    this.data = data;
  }
}