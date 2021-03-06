'use strict';

const OperationBase = require('./operation').OperationBase;
const updateDocuments = require('./common_functions').updateDocuments;
const hasAtomicOperators = require('../utils').hasAtomicOperators;
const Aspect = require('./operation').Aspect;
const defineAspects = require('./operation').defineAspects;

class UpdateManyOperation extends OperationBase {
  constructor(collection, filter, update, options) {
    super(options);

    if (!hasAtomicOperators(update)) {
      throw new TypeError('Update document requires atomic operators');
    }

    this.collection = collection;
    this.filter = filter;
    this.update = update;
  }

  execute(callback) {
    const coll = this.collection;
    const filter = this.filter;
    const update = this.update;
    const options = this.options;

    // Set single document update
    options.multi = true;
    // Execute update
    updateDocuments(coll, filter, update, options, (err, r) => {
      if (callback == null) return;
      if (err) return callback(err);
      if (r == null) return callback(null, { result: { ok: 1 } });

      // If an explain operation was executed, don't process the server results
      if (this.explain) return callback(undefined, r.result);

      r.modifiedCount = r.result.nModified != null ? r.result.nModified : r.result.n;
      r.upsertedId =
        Array.isArray(r.result.upserted) && r.result.upserted.length > 0
          ? r.result.upserted[0] // FIXME(major): should be `r.result.upserted[0]._id`
          : null;
      r.upsertedCount =
        Array.isArray(r.result.upserted) && r.result.upserted.length ? r.result.upserted.length : 0;
      r.matchedCount =
        Array.isArray(r.result.upserted) && r.result.upserted.length > 0 ? 0 : r.result.n;
      callback(null, r);
    });
  }
}

defineAspects(UpdateManyOperation, [Aspect.EXPLAINABLE]);

module.exports = UpdateManyOperation;
