'use strict';
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'snapshot.js'),
  target: 'node',
  mode: 'production',
  resolve: {
    alias: {
      '@mongodb-js/zstd': false,
      kerberos: false,
      snappy: false,
      'mongodb-client-encryption': false
    }
  }
};
