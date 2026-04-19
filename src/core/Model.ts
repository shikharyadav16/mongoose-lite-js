import path from "path";
import { DBHelper } from "../db/DBHelper.js";
import { validateSchema } from "../validations/validation.js";
import { ValidationError } from "../errors/ValidationError.js";
import { AnyObject, FilterQuery, UpdateQuery } from "../types/common.types.js";

type SchemaType = {
    definition: Record<string, any>;
    hooks: Record<"pre" | "post", Record<string, Function[]>>;
};

type ConnectionType = {
    path: string;
};

export function createModel<T extends AnyObject>(name: string, schema: SchemaType, connection: ConnectionType) {
    if (!connection?.path) {
        throw new Error("Connect mongoose before making a model.");
    }

    const schemaCheck = validateSchema(schema.definition);
    if (!schemaCheck.valid) {
        throw new ValidationError(schemaCheck.errors);
    }

    const filePath = path.join(connection.path, `${name.toLowerCase()}.yaml`);

    async function runHooks(type: "pre" | "post", key: string, payload?: any) {
        const hooks = schema.hooks?.[type]?.[key];
        if (hooks) {
            for (const fn of hooks) {
                await fn(payload);
            }
        }
    }

    async function save(doc: T) {
        await runHooks("pre", "save", doc);
        const res = DBHelper.insert(doc, schema, filePath);
        await runHooks("post", "save", res);
        return res;
    }

    async function create(doc: T) {
        await runHooks("pre", "create", doc);
        const res = DBHelper.insert(doc, schema, filePath);
        await runHooks("post", "create", res);
        return res;
    }

    async function find(filter: FilterQuery<T> = {}) {
        await runHooks("pre", "find");
        const res = DBHelper.find(filter, filePath);
        await runHooks("post", "find", res);
        return res;
    }

    async function findOne(filter: FilterQuery<T> = {}) {
        await runHooks("pre", "findOne");
        const res = DBHelper.findOne(filter, filePath);
        await runHooks("post", "findOne", res);
        return res;
    }

    async function findById(_id: string) {
        if (typeof _id !== "string") throw new Error("Invalid ObjectId");
        const filter = { _id } as FilterQuery<T>;

        await runHooks("pre", "findById");
        const res = DBHelper.findOne(filter, filePath);
        await runHooks("post", "findById", res);
        return res;
    }

    async function deleteOne(filter: FilterQuery<T> = {}) {
        await runHooks("pre", "deleteOne");
        const res = DBHelper.delete(filter, schema, filePath, false);
        await runHooks("post", "deleteOne", res);
        return res;
    }

    async function deleteMany(filter: FilterQuery<T> = {}) {
        await runHooks("pre", "deleteMany");
        const res = DBHelper.delete(filter, schema, filePath, true);
        await runHooks("post", "deleteMany", res);
        return res;
    }

    async function updateOne(filter: FilterQuery<T> = {}, doc: UpdateQuery<T>) {
        await runHooks("pre", "updateOne");
        const res = DBHelper.update(filter, doc, filePath);
        await runHooks("post", "updateOne", res);
        return res;
    }

    async function updateMany(filter: FilterQuery<T> = {}, doc: UpdateQuery<T>) {
        await runHooks("pre", "updateMany");
        const res = DBHelper.update(filter, doc, filePath);
        await runHooks("post", "updateMany", res);
        return res;
    }

    async function countDocuments(filter: FilterQuery<T> = {}) {
        await runHooks("pre", "countDocuments");
        const res = DBHelper.count(filter, schema, filePath);
        await runHooks("post", "countDocuments", res);
        return res;
    }

    async function exists(filter: FilterQuery<T> = {}) {
        await runHooks("pre", "exists");
        const res = DBHelper.exists(filter, schema, filePath);
        await runHooks("post", "exists", res);
        return res;
    }

    return {
        name,
        schema,
        connection,
        save,
        create,
        find,
        findOne,
        findById,
        deleteOne,
        deleteMany,
        updateOne,
        updateMany,
        countDocuments,
        exists
    };
}