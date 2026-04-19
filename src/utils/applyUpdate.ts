import { AnyObject, FilterQuery, UpdateQuery } from "../types/common.types.js";

export default function applyUpdate<T extends AnyObject>(doc: T, update: UpdateQuery<T>): T {
    const newDoc: AnyObject = { ...doc };

    if (!Object.keys(update).some((k) => k.startsWith("$"))) {
        Object.assign(newDoc, update);
        return newDoc as T;
    }

    if (update.$set) {
        Object.assign(newDoc, update.$set);
    }

    if (update.$max) {
        for (const key in update.$max) {
            const val = update.$max[key];
            if (val !== undefined && (newDoc[key] as any) < val) {
                newDoc[key] = val;
            }
        }
    }

    if (update.$min) {
        for (const key in update.$min) {
            const val = update.$min[key];
            if (val !== undefined && (newDoc[key] as any) > val) {
                newDoc[key] = val;
            }
        }
    }

    if (update.$push) {
        for (const key in update.$push) {
            if (!Array.isArray(newDoc[key])) {
                newDoc[key] = [];
            }
            (newDoc[key] as any[]).push(update.$push[key]);
        }
    }

    if (update.$pull) {
        for (const key in update.$pull) {
            if (Array.isArray(newDoc[key])) {
                newDoc[key] = (newDoc[key] as any[]).filter(item => item !== update.$pull![key]);
            }
        }
    }

    return newDoc as T;
}
