import { AnyObject } from "../types/common.types.js";

type SchemaDefinition = Record<string, any>;

export default function applyDefaults<T extends AnyObject>(doc: T, schema: SchemaDefinition): T {
    const result: AnyObject = { ...doc };

    for (const key in schema) {
        const rule = schema[key];

        if (typeof rule === "object" && "default" in rule && result[key] === undefined) {
            result[key] = typeof rule.default === "function" ? rule.default() : rule.default;
        }
    }

    return result as T;
}