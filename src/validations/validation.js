
function validateData(data, schema) {
  const errors = [];

  const extraKeys = Object.keys(data || {}).filter(key => !Object.hasOwn(schema, key));
  if (extraKeys.length > 0) {
    extraKeys.forEach(key => errors.push(`${key} is not defined in schema`));
  }

  if (data === null || typeof data !== "object") {
    errors.push(`data must be a non-null object`);
    return { valid: false, errors };
  }

  function validateField(key, value, rule, path = key) {
    let type;
    if (typeof rule === "function") {
      type = rule;
    } else if (rule.type) {
      type = rule.type;
    }

    const required = rule?.required;
    const enumVals = rule?.enum;
    const min = rule?.min;
    const max = rule?.max;
    const minlength = rule?.minlength;
    const maxlength = rule?.maxlength;
    const defaultValue = rule?.default;

    // Apply default value if needed
    if ((value === undefined || value === null) && defaultValue !== undefined) {
      value = typeof defaultValue === "function" ? defaultValue() : defaultValue;
    }

    // Required check
    if (required && (value === undefined || value === null || value === "")) {
      errors.push(`${path} is required`);
      return;
    }

    if (value === undefined || value === null) return;

    // Nested object check
    if (typeof rule === "object" && !type && !Array.isArray(rule)) {
      if (typeof value !== "object" || value === null) {
        errors.push(`${path}: expected object, got ${typeof value}`);
      } else {
        for (const subKey in rule) {
          validateField(subKey, value[subKey], rule[subKey], `${path}.${subKey}`);
        }
      }
      return;
    }

    // Array check
    if (Array.isArray(rule)) {
      if (!Array.isArray(value)) {
        errors.push(`${path}: expected array, got ${typeof value}`);
        return;
      }
      const itemRule = rule[0];
      value.forEach((item, idx) => validateField(idx, item, itemRule, `${path}[${idx}]`));
      return;
    }

    // Type check
    if (type) {
      const expectedTypeName = type.name.toLowerCase();
      const actualTypeName = typeof value;
      if (expectedTypeName !== actualTypeName) {
        errors.push(`${path}: expected ${expectedTypeName}, got ${actualTypeName}`);
        return;
      }
    }

    // Enum check
    if (enumVals && !enumVals.includes(value)) {
      errors.push(`${path}: value "${value}" not in enum ${JSON.stringify(enumVals)}`);
    }

    // Number checks
    if (type === Number) {
      if (min !== undefined && value < min) errors.push(`${path}: should be >= ${min}`);
      if (max !== undefined && value > max) errors.push(`${path}: should be <= ${max}`);
    }

    // String checks
    if (type === String) {
      if (minlength !== undefined && value.length < minlength) errors.push(`${path}: length should be >= ${minlength}`);
      if (maxlength !== undefined && value.length > maxlength) errors.push(`${path}: length should be <= ${maxlength}`);
    }
  }

  for (const key in schema) {
    validateField(key, data[key], schema[key]);
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}


function validateSchema(schema, path = "") {
  const errors = [];

  function validateField(key, rule, fullPath) {
    const currentPath = fullPath ? `${fullPath}.${key}` : key;

    if (typeof rule === "function") {
      const validTypes = [String, Number, Boolean, Object, Array];
      if (!validTypes.includes(rule)) {
        errors.push(`${currentPath}: invalid type`);
      }
      return;
    }

    if (typeof rule === "object" && !Array.isArray(rule)) {
      if ("type" in rule) {
        const {
          type,
          default: defaultValue,
          enum: enumVals,
          min,
          max,
          minlength,
          maxlength,
        } = rule;

        const validTypes = [String, Number, Boolean, Object, Array];
        if (!validTypes.includes(type)) {
          errors.push(`${currentPath}: invalid type definition`);
        }

        if (defaultValue !== undefined) {
          const typeName = type.name.toLowerCase();
          if (typeof defaultValue !== typeName) {
            errors.push(
              `${currentPath}: default value type mismatch, expected ${typeName}, got ${typeof defaultValue}`
            );
          }
        }

        if (enumVals) {
          if (!Array.isArray(enumVals)) {
            errors.push(`${currentPath}: enum must be an array`);
          } else {
            const typeName = type.name.toLowerCase();
            enumVals.forEach((val, idx) => {
              if (typeof val !== typeName) {
                errors.push(
                  `${currentPath}: enum[${idx}] type mismatch, expected ${typeName}, got ${typeof val}`
                );
              }
            });
          }
        }

        if (type === Number) {
          if (min !== undefined && typeof min !== "number")
            errors.push(`${currentPath}: min must be a number`);
          if (max !== undefined && typeof max !== "number")
            errors.push(`${currentPath}: max must be a number`);
        }

        if (type === String) {
          if (minlength !== undefined && typeof minlength !== "number")
            errors.push(`${currentPath}: minlength must be a number`);
          if (maxlength !== undefined && typeof maxlength !== "number")
            errors.push(`${currentPath}: maxlength must be a number`);
        }
      } else {
        for (const subKey in rule) {
          validateField(subKey, rule[subKey], currentPath);
        }
      }
      return;
    }

    if (Array.isArray(rule)) {
      if (rule.length > 0) validateField(key + "[0]", rule[0], currentPath);
      return;
    }

    errors.push(`${currentPath}: invalid schema definition`);
  }

  for (const key in schema) {
    validateField(key, schema[key], path);
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

function validateModelName(name) {
  const errors = [];

  if (typeof name !== "string") {
    errors.push("Model name must be a string");
  } else {
    if (!name.length) {
      errors.push("Model name cannot be empty");
    }
    if (!/^[A-Za-z]/.test(name)) {
      errors.push("Model name must start with a letter");
    }
    if (!/^[A-Za-z0-9_]+$/.test(name)) {
      errors.push("Model name can only contain letters, numbers, and underscores");
    }
    if (name.length > 50) {
      errors.push("Model name cannot exceed 50 characters");
    }
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

module.exports = { validateData, validateSchema, validateModelName };
