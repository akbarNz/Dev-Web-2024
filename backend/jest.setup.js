require('dotenv').config();
const { TextEncoder, TextDecoder } = require('util');

// Set up globals
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;