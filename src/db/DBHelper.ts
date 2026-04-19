import Types from "../types/Types.js";
import { validateSchema } from "../validations/validation.js";
import { readFile, writeFile } from "../utils/yamlHelper.js";
import { AnyObject, FilterQuery, UpdateQuery } from "../types/common.types.js";
import applyDefaults from "../utils/applyDefaults.js"
import matchFilter from "../utils/matchFilter.js";
import applyUpdate from "../utils/applyUpdate.js";


type SchemaDefinition = Record<string, any>;
type WithId<T> = T & { _id: string };

export const DBHelper = {
    insert<T extends AnyObject>(doc: T, schema: { definition: SchemaDefinition }, filePath: string): WithId<T> {
        const resSchema = validateSchema(schema.definition);
        if (!resSchema.valid) throw new Error(resSchema.errors.join(", "));;

        const existing = readFile<WithId<T>>(filePath);
        const filtered = applyDefaults(doc, schema.definition);

        const newDoc: WithId<T> = {
            ...filtered,
            _id: Types.ObjectId(),
        };

        existing.push(newDoc);
        writeFile(filePath, existing);

        return newDoc;
    },

    find<T extends AnyObject>(filter: FilterQuery<T>, filePath: string): T[] {
        const existing = readFile<T>(filePath);
        return existing.filter(doc => matchFilter(doc, filter));
    },

    findOne<T extends AnyObject>(filter: FilterQuery<T>, filePath: string): T | null {
        const existing = readFile<T>(filePath);
        return existing.find(doc => matchFilter(doc, filter)) || null;
    },

    update<T extends AnyObject>(filter: FilterQuery<T>, update: UpdateQuery<T>, filePath: string) {
        const existing = readFile<T>(filePath);
        let count = 0;

        for (let i = 0; i < existing.length; i++) {
            const doc = existing[i];
            if (!doc) continue;

            if (matchFilter(doc, filter)) {
                existing[i] = applyUpdate(doc, update);
                count++;
            }
        }

        writeFile(filePath, existing);
        return { matchedCount: count };
    },
    delete<T extends AnyObject>(filter: FilterQuery<T>, schema: { definition: SchemaDefinition }, filePath: string, multiple: boolean = false) {
        let existing = readFile<T>(filePath);
        const originalLength = existing.length;

        if (multiple) {
            existing = existing.filter(doc => !matchFilter(doc, filter));
        } else {
            const index = existing.findIndex(doc => matchFilter(doc, filter));
            if (index !== -1) {
                existing.splice(index, 1);
            }
        }

        writeFile(filePath, existing);

        return { deletedCount: originalLength - existing.length };
    },

    count<T extends AnyObject>(filter: FilterQuery<T>, schema: { definition: SchemaDefinition }, filePath: string) {
        const existing = readFile<T>(filePath);
        return existing.filter(doc => matchFilter(doc, filter)).length;
    },

    exists<T extends AnyObject>(filter: FilterQuery<T>, schema: { definition: SchemaDefinition }, filePath: string) {
        const existing = readFile<T>(filePath);
        return existing.some(doc => matchFilter(doc, filter));
    }
};