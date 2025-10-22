const path = require("path");
const Types = require("../core/Types");
const { validateData, validateSchema } = require("../validations/validation");

const { readFile, writeFile } = require("./yamlHelper");

function applyDefaults(doc, schema) {
  const result = { ...doc };
  for (const key in schema) {
    const rule = schema[key];
    if (
      typeof rule === "object" &&
      "default" in rule &&
      result[key] === undefined
    ) {
      result[key] =
        typeof rule.default === "function" ? rule.default() : rule.default;
    }
  }
  return result;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  const keysA = Object.keys(a),
    keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => deepEqual(a[key], b[key]));
}

function checkSchemaUnique(filteredData, existingData, schema) {
  const errors = [];

  for (const key in schema) {
    const rule = schema[key];

    if (rule?.unique) {
      const value = filteredData[key];
      if (existingData.some((doc) => deepEqual(doc[key], value))) {
        errors.push(`${key} must be unique`);
      }
    }

    if (rule?.type === Object && typeof filteredData[key] === "object") {
      const nestedExisting = existingData.map((d) => d[key] || {});
      const nestedErrors = checkSchemaUnique(
        filteredData[key],
        nestedExisting,
        rule
      );
      errors.push(...nestedErrors.map((e) => `${key}.${e}`));
    }
  }

  return errors;
}

function prepareDocForInsert(doc, schema, existingData) {
  const validationResult = validateData(doc, schema);
  if (!validationResult.valid)
    return { valid: false, errors: validationResult.errors };

  const filteredData = applyDefaults(doc, schema);

  filteredData._id = Types.ObjectId();

  const uniquenessErrors = checkSchemaUnique(
    filteredData,
    existingData,
    schema
  );
  if (uniquenessErrors.length)
    return { valid: false, errors: uniquenessErrors };

  return { valid: true, doc: filteredData };
}

const DBHelper = {
  insert: (doc, schema, filePath) => {
    const resSchema = validateSchema(schema.definition);
    if (!resSchema.valid) throw new Error(resSchema.errors);

    const existing = readFile(filePath);

    const prepared = prepareDocForInsert(doc, schema.definition, existing);
    if (!prepared.valid)
      throw new Error("Validation Error: " + JSON.stringify(prepared.errors));

    existing.push(prepared.doc);
    writeFile(filePath, existing);
    return prepared.doc;
  },

  insertMany: (docs, schema, filePath) => {
    const existing = readFile(filePath);

    const resSchema = validateSchema(schema.definition);
    if (!resSchema.valid) throw new Error(resSchema.errors);

    const result = [];
    const errors = [];

    docs.forEach((doc, idx) => {
      const prepared = prepareDocForInsert(doc, schema.definition, existing);
      if (!prepared.valid) {
        errors.push({ index: idx, errors: prepared.errors });
      } else {
        existing.push(prepared.doc);
        result.push(prepared.doc);
      }
    });

    writeFile(filePath, existing);
    return { inserted: result, errors };
  },

  find: (filter, schema, filePath) => {
    const existing = readFile(filePath);
    return existing.filter((doc) => matchFilter(doc, filter));
  },

  findOne: (filter, schema, filePath) => {
    const existing = readFile(filePath);
    return existing.find((doc) => matchFilter(doc, filter)) || null;
  },

  update: (filter, update, schema, filePath, multiple = false) => {
    const existing = readFile(filePath);
    let updatedCount = 0;

    for (let i = 0; i < existing.length; i++) {
      if (matchFilter(existing[i], filter)) {
        existing[i] = applyUpdate(existing[i], update);
        updatedCount++;
        if (!multiple) break;
      }
    }
    writeFile(filePath, existing);
    return { matchedCount: updatedCount };
  },

  delete: (filter, schema, filePath, multiple = false) => {
    let existing = readFile(filePath);
    const originalLength = existing.length;

    if (multiple) {
      existing = existing.filter((doc) => !matchFilter(doc, filter));
    } else {
      const index = existing.findIndex((doc) => matchFilter(doc, filter));
      if (index !== -1) {
        existing.splice(index, 1);
      }
    }

    writeFile(filePath, existing);
    return { deletedCount: originalLength - existing.length };
  },
  count: (filter, schema, filePath) => {
    const existing = readFile(filePath) || [];
    const matchedDocs = existing.filter((doc) => matchFilter(doc, filter));
    return matchedDocs.length;
  },
  exists: (filter, schema, filePath) => {
    const existing = readFile(filePath) || [];
    const found = existing.some((doc) => matchFilter(doc, filter));
    return found;
  },
};

function matchFilter(doc, filter) {
  for (const key in filter) {
    const val = filter[key];
    if (typeof val === "object" && val !== null) {
      if ("$in" in val && !val.$in.includes(doc[key])) return false;
      if ("$gt" in val && !(doc[key] > val.$gt)) return false;
      if ("$lt" in val && !(doc[key] < val.$lt)) return false;
      if ("$eq" in val && !(doc[key] === val.$eq)) return false;
      if (!["$in", "$gt", "$lt", "$eq"].includes(Object.keys(val)[0])) {
        if (!matchFilter(doc[key] || {}, val)) return false;
      }
    } else {
      if (doc[key] !== val) return false;
    }
  }

  return true;
}

function applyUpdate(doc, update) {
  if (!Object.keys(update).some((k) => k.startsWith("$"))) {
    update = { $set: update };
  }

  const newDoc = JSON.parse(JSON.stringify(doc));

  function setValue(obj, path, value) {
    const keys = path.split(".");
    let temp = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in temp)) temp[keys[i]] = {};
      temp = temp[keys[i]];
    }
    temp[keys[keys.length - 1]] = value;
  }

  function getValue(obj, path) {
    const keys = path.split(".");
    let temp = obj;
    for (let k of keys) {
      if (temp == null) return undefined;
      temp = temp[k];
    }
    return temp;
  }

  for (const op in update) {
    const changes = update[op];

    switch (op) {
      case "$set":
        for (const path in changes) {
          setValue(newDoc, path, changes[path]);
        }
        break;

      case "$max":
        for (const path in changes) {
          const current = getValue(newDoc, path);
          if (current === undefined || current < changes[path]) {
            setValue(newDoc, path, changes[path]);
          }
        }
        break;

      case "$min":
        for (const path in changes) {
          const current = getValue(newDoc, path);
          if (current === undefined || current > changes[path]) {
            setValue(newDoc, path, changes[path]);
          }
        }
        break;

      case "$push":
        for (const path in changes) {
          let arr = getValue(newDoc, path);
          if (!Array.isArray(arr)) setValue(newDoc, path, []);
          arr = getValue(newDoc, path);
          arr.push(changes[path]);
        }
        break;

      case "$pull":
        for (const path in changes) {
          let arr = getValue(newDoc, path);
          if (Array.isArray(arr)) {
            arr = arr.filter((x) => {
              const val = changes[path];
              if (typeof val === "function") return !val(x);
              return x !== val;
            });
            setValue(newDoc, path, arr);
          }
        }
        break;

      default:
        for (const path in changes) {
          setValue(newDoc, path, changes[path]);
        }
        break;
    }
  }

  return newDoc;
}

module.exports = DBHelper;
