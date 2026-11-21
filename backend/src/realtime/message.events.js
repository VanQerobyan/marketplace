const { EventEmitter } = require('node:events');

// Services publish after successful writes, including writes made through REST.
module.exports = new EventEmitter();
