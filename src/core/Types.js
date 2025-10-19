const { randomUUID } = require('crypto');

module.exports = {
  ObjectId: () => randomUUID(),
  String: String,
  Number: Number,
  Boolean: Boolean,
  Array: Array,
  Object: Object,
  Date: Date,
};
