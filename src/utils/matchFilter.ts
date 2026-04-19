import { AnyObject, FilterQuery, UpdateQuery } from "../types/common.types.js";

export default function matchFilter<T extends AnyObject>(doc: T, filter: FilterQuery<T>): boolean {
    for (const key in filter) {
        const val = filter[key];
        const docValue = doc[key];

        if (typeof val === "object" && val !== null) {
            const op = val as any;

            if (op.$in && !op.$in.includes(docValue)) return false;

            if (op.$gt !== undefined) {
                if (!(docValue as any > op.$gt)) return false;
            }

            if (op.$lt !== undefined) {
                if (!(docValue as any < op.$lt)) return false;
            }

            if (op.$eq !== undefined) {
                if (!(docValue === op.$eq)) return false;
            }
        } else {
            if (docValue !== val) return false;
        }
    }

    return true;
}