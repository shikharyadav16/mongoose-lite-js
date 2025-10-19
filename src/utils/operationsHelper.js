const { validateData } = require('../validations/validation');
const { validationError } = require('../core/Error');
const Types = require('../core/Types')
const yaml = require('js-yaml');
const fs =  require('fs')

function applyDefaults(data, schema) {
  if (data === null || typeof data !== "object") return data;

  function applyField(key, value, rule) {
    let type;
    if (typeof rule === "function") type = rule;
    else if (rule.type) type = rule.type;

    const defaultValue = rule?.default;

    if ((value === undefined || value === null) && defaultValue !== undefined) {
      data[key] = typeof defaultValue === "function" ? defaultValue() : defaultValue;
      value = data[key];
    }

    if (typeof rule === "object" && !type && !Array.isArray(rule)) {
      if (typeof value !== "object" || value === null) {
        data[key] = {};
      }
      for (const subKey in rule) {
        applyField(subKey, data[key][subKey], rule[subKey]);
      }
      return;
    }

    if (Array.isArray(rule)) {
      if (!Array.isArray(value)) return;
      const itemRule = rule[0];
      value.forEach((item, idx) => {
        applyField(idx, item, itemRule);
      });
    }
  }
  for (const key in schema) {
    applyField(key, data[key], schema[key]);
  }
  return data;
}

function saveDoc(doc, schema ,filePath) {
  let existing = [];
  if (fs.existsSync(filePath)) existing = yaml.load(fs.readFileSync(filePath, "utf-8")) || [];
  const res = validateData(doc, schema.definition);
  if (!res.valid) {
    throw validationError(res.errors);
  }
  const filetedData = applyDefaults(doc, schema.definition);
  filetedData._id = Types.ObjectId();
  existing.push(filetedData);
  fs.writeFileSync(filePath, yaml.dump(existing));
  return filetedData;
}

async function findDoc(filter = {}, options = {}, filePath) {
    const { limit, skip, sort } = options;

    if (!fs.existsSync(filePath)) return [];

    const docs = yaml.load(fs.readFileSync(filePath, 'utf8')) || [];

    function matchesFilter(docValue, filterValue) {
        if (typeof filterValue === 'object' && filterValue !== null) {
            for (const op in filterValue) {
                const val = filterValue[op];
                switch (op) {
                    case '$eq':
                        if (docValue !== val) return false;
                        break;
                    case '$ne':
                        if (docValue === val) return false;
                        break;
                    case '$gt':
                        if (!(docValue > val)) return false;
                        break;
                    case '$gte':
                        if (!(docValue >= val)) return false;
                        break;
                    case '$lt':
                        if (!(docValue < val)) return false;
                        break;
                    case '$lte':
                        if (!(docValue <= val)) return false;
                        break;
                    case '$in':
                        if (!Array.isArray(val) || !val.includes(docValue)) return false;
                        break;
                    case '$nin':
                        if (!Array.isArray(val) || val.includes(docValue)) return false;
                        break;
                    default:
                        throw new Error(`Unsupported operator ${op}`);
                }
            }
            return true;
        } else {
            return docValue === filterValue;
        }
    }

    let results = docs.filter(doc => {
        return Object.entries(filter).every(([key, value]) => matchesFilter(doc[key], value));
    });

    if (sort) {
        const sortKeys = Object.entries(sort);
        results.sort((a, b) => {
            for (const [key, order] of sortKeys) {
                if (a[key] < b[key]) return order === 1 ? -1 : 1;
                if (a[key] > b[key]) return order === 1 ? 1 : -1;
            }
            return 0;
        });
    }

    if (skip !== undefined) results = results.slice(skip);
    if (limit !== undefined) results = results.slice(0, limit);

    return results;
}


function matchFilter(doc, filter) {
  for (const key in filter) {
    const condition = filter[key];
    const value = doc[key];

    if (typeof condition === "object" && condition !== null && !Array.isArray(condition)) {
      for (const op in condition) {
        const operand = condition[op];
        switch (op) {
          case "$in":
            if (!Array.isArray(operand) || !operand.includes(value)) return false;
            break;
          case "$nin":
            if (Array.isArray(operand) && operand.includes(value)) return false;
            break;
          case "$gt":
            if (!(value > operand)) return false;
            break;
          case "$lt":
            if (!(value < operand)) return false;
            break;
          case "$gte":
            if (!(value >= operand)) return false;
            break;
          case "$lte":
            if (!(value <= operand)) return false;
            break;
          case "$ne":
            if (value === operand) return false;
            break;
          default:
            console.warn(`Unknown operator '${op}' ignored in filter.`);
            return false;
        }
      }
    } else {
      if (value !== condition) return false;
    }
  }
  return true;
}

async function deleteDocs(filter, schema, filePath, deleteMany = false) {
  if (!fs.existsSync(filePath)) {
    return { success: false, deletedCount: 0, message: "No database file found." };
  }

  const docs = yaml.load(fs.readFileSync(filePath, 'utf-8')) || [];

  const invalidKeys = Object.keys(filter).filter(k => !(k in schema.definition));
  if (invalidKeys.length > 0) {
    return {
      success: false,
      deletedCount: 0,
      message: `Invalid filter keys: ${invalidKeys.join(', ')}`,
    };
  }

  let deletedCount = 0;
  let remainingDocs = [];

  for (const doc of docs) {
    const isMatch = matchFilter(doc, filter);
    if (isMatch) {
      deletedCount++;
      if (!deleteMany) continue;
    }
    remainingDocs.push(doc);
  }

  fs.writeFileSync(filePath, yaml.dump(remainingDocs));

  return {
    success: true,
    deletedCount,
    message: deletedCount > 0 ? "Documents deleted successfully." : "No matching documents found.",
  };
}


module.exports = { saveDoc, findDoc, deleteDocs }