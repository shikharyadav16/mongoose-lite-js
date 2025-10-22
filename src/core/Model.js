const path = require("path");
const DBHelper = require("../utils/operationsHelper");
const { validateSchema } = require("../validations/validation");

function createModel(name, schema, connection) {
  if (!connection?.path) {
    throw new Error("Connect mongoose before making a model.");
  }

  const schemaCheck = validateSchema(schema.definition);
  if (!schemaCheck.valid) {
    throw new Error(
      "Invalid schema definition: " + schemaCheck.errors.join(", ")
    );
  }

  const filePath = path.join(connection.path, `${name.toLowerCase()}.yaml`);

  async function save(doc) {
    if (schema.hooks.pre.save)
      for (const fn of schema.hooks.pre.save) await fn(doc);
    const res = await DBHelper.insert(doc, schema, filePath);
    if (schema.hooks.post.save)
      for (const fn of schema.hooks.post.save) await fn(doc);
    return res;
  }

  async function create(doc) {
    if (schema.hooks.pre.create)
      for (const fn of schema.hooks.pre.create) await fn(doc);
    const res = await DBHelper.insert(doc, schema, filePath);
    if (schema.hooks.post.create)
      for (const fn of schema.hooks.post.create) await fn(doc);
    return res;
  }

  async function find(filter = {}, opts = {}) {
    if (schema.hooks.pre.find)
      for (const fn of schema.hooks.pre.find) await fn();
    const res = await DBHelper.find(filter, schema, filePath);
    if (schema.hooks.post.find)
      for (const fn of schema.hooks.post.find) await fn();
    return res;
  }

  async function findOne(filter = {}, opts = {}) {
    if (schema.hooks.pre.findOne)
      for (const fn of schema.hooks.pre.findOne) await fn();
    const res = await DBHelper.findOne(filter, opts, filePath);
    if (schema.hooks.post.findOne)
      for (const fn of schema.hooks.post.findOne) await fn();
    return res;
  }

  async function findById(_id) {
    let filter = {};
    if (typeof _id === "string") filter = { _id };
    else throw Error("Invalid ObjectId");

    if (schema.hooks.pre.findById)
      for (const fn of schema.hooks.pre.findById) await fn();
    const res = await DBHelper.findOne(filter, schema, filePath);
    if (schema.hooks.post.findById)
      for (const fn of schema.hooks.post.findById) await fn();
    return res;
  }

  async function findByIdAndDelete(_id) {
    let filter = {};
    if (typeof _id === "string") filter = { _id };
    else throw Error("Invalid ObjectId");
    if (schema.hooks.pre.findByIdAndDelete)
      for (const fn of schema.hooks.pre.findByIdAndDelete) await fn();
    const res = DBHelper.delete(filter, schema, filePath, false);
    if (schema.hooks.post.findByIdAndDelete)
      for (const fn of schema.hooks.post.findByIdAndDelete) await fn();
    return res;
  }

  async function findByIdAndRemove(_id) {
    let filter = {};
    if (typeof _id === "string") filter = { _id };
    else throw Error("Invalid ObjectId");
    if (schema.hooks.pre.findByIdAndRemove)
      for (const fn of schema.hooks.pre.findByIdAndRemove) await fn();
    const res = DBHelper.delete(filter, schema, filePath, false);
    if (schema.hooks.post.findByIdAndRemove)
      for (const fn of schema.hooks.post.findByIdAndRemove) await fn();
    return res;
  }

  async function findOneAndDelete(filter = {}) {
    if (typeof filter !== "object") throw new Error("Invalid filter");
    if (schema.hooks.pre.findOneAndDelete)
      for (const fn of schema.hooks.pre.findOneAndDelete) await fn();
    const res = DBHelper.delete(filter, schema, filePath, false);
    if (schema.hooks.post.findOneAndDelete)
      for (const fn of schema.hooks.post.findOneAndDelete) await fn();
    return res;
  }

  async function findOneAndRemove(filter = {}) {
    if (typeof filter !== "object") throw new Error("Invalid filter");
    if (schema.hooks.pre.findOneAndRemove)
      for (const fn of schema.hooks.pre.findOneAndRemove) await fn();
    const res = DBHelper.delete(filter, schema, filePath, false);
    if (schema.hooks.post.findOneAndRemove)
      for (const fn of schema.hooks.post.findOneAndRemove) await fn();
    return res;
  }

  async function deleteOne(filter = {}) {
    if (typeof filter !== "object") throw new Error("Invalid filter");
    if (schema.hooks.pre.deleteOne)
      for (const fn of schema.hooks.pre.deleteOne) await fn();
    const res = DBHelper.delete(filter, schema, filePath, false);
    if (schema.hooks.post.deleteOne)
      for (const fn of schema.hooks.post.deleteOne) await fn();
    return res;
  }

  async function deleteMany(filter = {}) {
    if (schema.hooks.pre.deleteMany)
      for (const fn of schema.hooks.pre.deleteMany) await fn();
    const res = DBHelper.delete(filter, schema, filePath, true);
    if (schema.hooks.post.deleteMany)
      for (const fn of schema.hooks.post.deleteMany) await fn();
    return res;
  }

  async function findByIdAndUpdate(_id, doc, opts = {}) {
    let filter = {};
    if (typeof _id === "string") filter = { _id };
    else throw Error("Invalid ObjectId");
    if (schema.hooks.pre.findByIdAndUpdate)
      for (const fn of schema.hooks.pre.findByIdAndUpdate) await fn();
    const res = DBHelper.update(filter, doc, schema, filePath, false);
    if (schema.hooks.post.findByIdAndUpdate)
      for (const fn of schema.hooks.post.findByIdAndUpdate) await fn(res);
    return res;
  }

  async function findOneAndUpdate(filter = {}, doc, opts = {}) {
    if (schema.hooks.pre.findOneAndUpdate)
      for (const fn of schema.hooks.pre.findOneAndUpdate) await fn();
    const res = DBHelper.update(filter, doc, schema, filePath, false);
    if (schema.hooks.post.findOneAndUpdate)
      for (const fn of schema.hooks.post.findOneAndUpdate) await fn(res);
    return res;
  }

  async function updateOne(filter = {}, doc, opts = {}) {
    if (schema.hooks.pre.updateOne)
      for (const fn of schema.hooks.pre.updateOne) await fn();
    const res = DBHelper.update(filter, doc, schema, filePath, false);
    if (schema.hooks.post.updateOne)
      for (const fn of schema.hooks.post.updateOne) await fn(res);
    return res;
  }

  async function updateMany(filter = {}, doc, opts = {}) {
    if (schema.hooks.pre.updateMany)
      for (const fn of schema.hooks.pre.updateMany) await fn();
    const res = DBHelper.update(filter, doc, schema, filePath, true);
    if (schema.hooks.post.updateMany)
      for (const fn of schema.hooks.post.updateMany) await fn(res);
    return res;
  }

  async function replaceOne(filter, doc, opts = {}) {
    if (schema.hooks.pre.replaceOne)
      for (const fn of schema.hooks.pre.replaceOne) await fn();
    DBHelper.delete(filter, schema, filePath, false);
    const res = DBHelper.insert(doc, schema, filePath);
    if (schema.hooks.post.replaceOne)
      for (const fn of schema.hooks.post.replaceOne) await fn(res);
    return res;
  }
  async function countDocuments(filter = {}, opts = {}) {
    if (schema.hooks.pre.countDocuments)
      for (const fn of schema.hooks.pre.countDocuments) await fn();
    const res = await DBHelper.count(filter, schema, filePath);
    if (schema.hooks.post.countDocuments)
      for (const fn of schema.hooks.post.countDocuments) await fn(res);
    return res;
  }
  async function exists(filter = {}, opts = {}) {
    if (schema.hooks.pre.exists)
      for (const fn of schema.hooks.pre.exists) await fn();
    const res = await DBHelper.exists(filter, schema, filePath);
    if (schema.hooks.post.exists)
      for (const fn of schema.hooks.post.exists) await fn(res);
    return res;
  }

  return {
    find,
    save,
    name,
    create,
    schema,
    connection,
    findOne,
    findById,
    findByIdAndDelete,
    findByIdAndRemove,
    findOneAndDelete,
    findOneAndRemove,
    deleteOne,
    deleteMany,
    findByIdAndUpdate,
    findOneAndUpdate,
    updateOne,
    updateMany,
    replaceOne,
    countDocuments,
    exists
  };
}

module.exports = createModel;
