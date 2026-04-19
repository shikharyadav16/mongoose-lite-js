export type AnyObject = Record<string, any>;

export type FilterQuery<T> = Partial<{
    [k in keyof T]: | T[k] | 
    {
        $in?: T[k][]; 
        $gt?: T[k]; 
        $lt?: T[k]; 
        $eq?: T[k];
    };
}>;

export type UpdateQuery<T> = {
    $set?: Partial<T>;
    $max?: Partial<T>;
    $min?: Partial<T>;
    $push?: Partial<Record<keyof T, any>>;
    $pull?: Partial<Record<keyof T, any>>;
}