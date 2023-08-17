'use strict';
const v8 = require('v8');
const { MongoClient } = require('../');

v8.startupSnapshot.setDeserializeMainFunction(() => {
  (async () => {
    try {
      console.log('connecting to...', process.env.MONGODB_URI);
      const client = await MongoClient.connect(process.env.MONGODB_URI);
      console.log('ping says', await client.db('admin').command({ ping: 1 }));
      await client.close();
    } catch (err) {
      process.nextTick(() => {
        throw err;
      });
    }
  })();
});
