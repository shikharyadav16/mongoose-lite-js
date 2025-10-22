function validateData(data, schema) {
  const errors = [];

  const extraKeys = Object.keys(data || {}).filter(
    (key) => !Object.hasOwn(schema, key)
  );
  if (extraKeys.length > 0) {
    extraKeys.forEach((key) =>
      errors.push(`${key}: Path \`${key}\` is not defined in schema.`)
    );
  }

  if (data === null || typeof data !== "object") {
    errors.push("data: Path `data` must be a non-null object");
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

    if ((value === undefined || value === null) && defaultValue !== undefined) {
      value =
        typeof defaultValue === "function" ? defaultValue() : defaultValue;
    }

    if (required && (value === undefined || value === null || value === "")) {
      errors.push(`${path}: Path \`${path}\` is required.`);
      return;
    }

    if (value === undefined || value === null) return;

    const isNestedObject =
      (typeof rule === "object" && !Array.isArray(rule) && !type) ||
      type === Object;

    if (isNestedObject) {
      if (typeof value !== "object" || value === null) {
        errors.push(
          `${path}: Path \`${path}\` expected an object, got ${typeof value}`
        );
      } else {
        const subRules = { ...rule };
        if (subRules.type) delete subRules.type; // remove type to avoid recursion into type
        for (const subKey in subRules) {
          validateField(
            subKey,
            value[subKey],
            subRules[subKey],
            `${path}.${subKey}`
          );
        }
      }
      return;
    }

    // Array check
    if (Array.isArray(rule)) {
      if (!Array.isArray(value)) {
        errors.push(
          `${path}: Path \`${path}\` expected an array, got ${typeof value}`
        );
        return;
      }
      const itemRule = rule[0];
      value.forEach((item, idx) =>
        validateField(idx, item, itemRule, `${path}[${idx}]`)
      );
      return;
    }

    // Type check
    if (type) {
      const expectedTypeName = type.name.toLowerCase();
      const actualTypeName = typeof value;
      if (expectedTypeName !== actualTypeName) {
        errors.push(
          `${path}: Path \`${path}\` expected ${expectedTypeName}, got ${actualType}`
        );
        return;
      }
    }

    // Enum check
    if (enumVals && !enumVals.includes(value)) {
      errors.push(
        `${path}: Path \`${path}\` value \`${value}\` is not in enum ${JSON.stringify(
          enumVals
        )}`
      );
    }

    // Number checks
    if (type === Number) {
      if (min !== undefined && value < min)
        errors.push(
          `${path}: Path \`${path}\` (${value}) is less than minimum allowed value (${min}).`
        );
      if (max !== undefined && value > max)
        errors.push(
          `${path}: Path \`${path}\` (${value}) is more than maximum allowed value (${max}).`
        );
    }

    // String checks
    if (type === String) {
      if (minlength !== undefined && value.length < minlength)
        errors.push(
          `${path}: Path \`${path}\` length (${value.length}) is shorter than the minimum allowed (${minlength}).`
        );
      if (maxlength !== undefined && value.length > maxlength)
        errors.push(
          `${path}: Path \`${path}\` length (${value.length}) exceeds the maximum allowed (${maxlength}).`
        );
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
    const invalidTypes = ["string", "number", "boolean"];

    if (invalidTypes.includes(typeof rule)) {
      errors.push(`${key} has invalid type definition "${rule}".`);
      return { valid: false, errors };
    }

    const currentPath = fullPath ? `${fullPath}.${key}` : key;

    if (typeof rule === "function") {
      const validTypes = [String, Number, Boolean, Object, Array];
      if (!validTypes.includes(rule)) {
        errors.push(
          `${currentPath}: Path \`${currentPath}\` has invalid type definition.`
        );
      }
      return;
    }

    if (typeof rule === "object" && rule !== null && !Array.isArray(rule)) {
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
          errors.push(
            `${currentPath}: Path \`${currentPath}\` has invalid type definition.`
          );
        }

        if (defaultValue !== undefined) {
          if (type === Array) {
            if (!Array.isArray(defaultValue)) {
              errors.push(
                `${currentPath}: Path \`${currentPath}\` default must be an array.`
              );
            }
          } else {
            const typeName = type.name.toLowerCase();
            if (typeof defaultValue !== typeName) {
              errors.push(
                `${currentPath}: Path \`${currentPath}\` default value type mismatch.`
              );
            }
          }
        }

        if (enumVals) {
          if (!Array.isArray(enumVals)) {
            errors.push(
              `${currentPath}: Path \`${currentPath}\` enum must be an array.`
            );
          } else {
            const typeName = type.name.toLowerCase();
            enumVals.forEach((val, idx) => {
              if (typeof val !== typeName) {
                errors.push(
                  `${currentPath}: Path \`${currentPath}\` enum[${idx}] type mismatch.`
                );
              }
            });
          }
        }

        if (type === Number) {
          if (min !== undefined && typeof min !== "number")
            errors.push(
              `${currentPath}: Path \`${currentPath}\` min must be a number.`
            );
          if (max !== undefined && typeof max !== "number")
            errors.push(
              `${currentPath}: Path \`${currentPath}\` max must be a number.`
            );
        }

        if (type === String) {
          if (minlength !== undefined && typeof minlength !== "number")
            errors.push(
              `${currentPath}: Path \`${currentPath}\` minlength must be a number.`
            );
          if (maxlength !== undefined && typeof maxlength !== "number")
            errors.push(
              `${currentPath}: Path \`${currentPath}\` maxlength must be a number.`
            );
        }
      } else {
        for (const subKey in rule) {
          validateField(subKey, rule[subKey], currentPath);
        }
      }
      return;
    }

    if (Array.isArray(rule)) {
      if (rule.length !== 1) {
        errors.push(
          `${currentPath}: Path \`${currentPath}\` array schema must have exactly one element.`
        );
        return;
      }

      const arrayRule = rule[0];
      if (typeof arrayRule === "function" && !arrayRule._isArrayElement) {
        errors.push(
          `${currentPath}: Path \`${currentPath}\` array element must be an object with { type: ... }`
        );
        return;
      }

      validateField(key + "[0]", arrayRule, currentPath);
      return;
    }
  }

  for (const key in schema) {
    validateField(key, schema[key], path);
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

function validateModelName(name) {
  const errors = [];

  if (typeof name !== "string") {
    errors.push("modelName: Path `modelName` must be a string.");
    return { valid: false, errors };
  }

  if (name.length === 0) {
    errors.push("modelName: Path `modelName` cannot be empty.");
  }

  if (!/^[A-Za-z]/.test(name)) {
    errors.push("modelName: Path `modelName` must start with a letter.");
  }

  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
    errors.push(
      "modelName: Path `modelName` may only contain letters, numbers, and underscores."
    );
  }

  if (name.length > 50) {
    errors.push(
      "modelName: Path `modelName` length exceeds the maximum allowed (50)."
    );
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

module.exports = { validateData, validateSchema, validateModelName };
