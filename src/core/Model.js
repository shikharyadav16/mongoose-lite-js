const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");
const { saveDoc, findDoc, deleteDoc } = require("../utils/operationsHelper");

function createModel(name, schema, connection) {
  const filePath = path.join(connection.path, `${name.toLowerCase()}.yaml`);

  async function save(doc) {
    if (schema.hooks.pre.save)
      for (const fn of schema.hooks.pre.save) await fn(doc);
    const res = saveDoc(doc, schema, filePath);
    if (schema.hooks.post.save)
      for (const fn of schema.hooks.post.save) await fn(doc);
    return res;
  }

  async function create(doc) {
    if (schema.hooks.pre.create)
      for (const fn of schema.hooks.pre.create) await fn(doc);
    const res = saveDoc(doc, schema, filePath);
    if (schema.hooks.post.create)
      for (const fn of schema.hooks.post.create) await fn(doc);
    return res;
  }

  async function find(filter = {}, opts = {}) {
    if (schema.hooks.pre.find)
      for (const fn of schema.hooks.pre.find) await fn();
    const res = findDoc(filter, opts, filePath);
    if (schema.hooks.post.find)
      for (const fn of schema.hooks.post.find) await fn();
    return res;
  }

  async function findOne(filter = {}, opts = {}) {
    if (schema.hooks.pre.findOne)
      for (const fn of schema.hooks.pre.findOne) await fn();
    const res = findDoc(filter, opts, filePath);
    if (schema.hooks.post.findOne)
      for (const fn of schema.hooks.post.findOne) await fn();
    return res[0];
  }

  async function findById(_id) {
    const filter = { _id };
    if (schema.hooks.pre.findById)
      for (const fn of schema.hooks.pre.findById) await fn();
    const res = findDoc(filter);
    if (schema.hooks.post.findById)
      for (const fn of schema.hooks.post.findById) await fn();
    return res;
  }

  async function findByIdAndDelete(_id) {
    const filter = { _id };
    if (schema.hooks.pre.findByIdAndDelete)
      for (const fn of schema.hooks.pre.findByIdAndDelete) await fn();
    const res = deleteDoc(filter, schema, filePath, false);
    if (schema.hooks.post.findByIdAndDelete)
      for (const fn of schema.hooks.post.findByIdAndDelete) await fn();
    return res;
  }
  async function findByIdAndRemove(_id) {
    const filter = { _id };
    if (schema.hooks.pre.findByIdAndRemove)
      for (const fn of schema.hooks.pre.findByIdAndRemove) await fn();
    const res = deleteDoc(filter, schema, filePath, false);
    if (schema.hooks.post.findByIdAndRemove)
      for (const fn of schema.hooks.post.findByIdAndRemove) await fn();
    return res;
  }
  async function findOneAndDelete(filter) {
    if (schema.hooks.pre.findOneAndDelete)
      for (const fn of schema.hooks.pre.findOneAndDelete) await fn();
    const res = deleteDoc(filter, schema, filePath, false);
    if (schema.hooks.post.findOneAndDelete)
      for (const fn of schema.hooks.post.findOneAndDelete) await fn();
    return res;
  }
  async function findOneAndRemove(filter) {
    if (schema.hooks.pre.findOneAndRemove)
      for (const fn of schema.hooks.pre.findOneAndRemove) await fn();
    const res = deleteDoc(filter, schema, filePath, false);
    if (schema.hooks.post.findOneAndRemove)
      for (const fn of schema.hooks.post.findOneAndRemove) await fn();
    return res;
  }
  async function deleteOne(filter) {
    if (schema.hooks.pre.deleteOne)
      for (const fn of schema.hooks.pre.deleteOne) await fn();
    const res = deleteDoc(filter, schema, filePath, false);
    if (schema.hooks.post.deleteOne)
      for (const fn of schema.hooks.post.deleteOne) await fn();
    return res;
}
async function deleteMany(filter) {
    if (schema.hooks.pre.deleteMany)
      for (const fn of schema.hooks.pre.deleteMany) await fn();
    const res = deleteDoc(filter, schema, filePath, true);
    if (schema.hooks.post.deleteMany)
      for (const fn of schema.hooks.post.deleteMany) await fn();
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
  };
}

module.exports = createModel;
