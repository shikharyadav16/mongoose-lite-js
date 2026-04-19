type HookType = "pre" | "post";
type OperationType = string;

type MethodFunction<T = any> = (this: T, ...args: any[]) => any;
type HookFunction<T = any> = (doc: T) => void | Promise<void>;

type SchemaDefinition<T> = {[k in keyof T]: any};
type SchemaOptions = Record<string, any>;

export class Schema<T = any> {
    public definition: SchemaDefinition<T>;
    public options: SchemaOptions;

    public virtuals: Record<string, (this: T) => any> = {};
    public statics: Record<string, MethodFunction> = {};
    public methods: Record<string, MethodFunction<T>> = {};
    public hooks: Record<HookType, Record<OperationType, HookFunction<T>[]>> = {pre: {}, post: {}};

    constructor(definition: SchemaDefinition<T>, options: SchemaOptions = {}) {
        this.definition = definition;
        this.options = options;
    }

    addMethod(name: string, fn: MethodFunction<T>): void {
        this.methods[name] = fn
    }

    addStatic(name: string, fn: MethodFunction): void {
        this.statics[name] = fn
    }

    addHook(type: HookType, operation: OperationType, fn: HookFunction<T>): void {
        if (!this.hooks[type][operation]) {
            this.hooks[type][operation] = []
        }
        this.hooks[type][operation].push(fn)
    }

    pre(operation: OperationType, fn: HookFunction<T>) {
        this.addHook("pre", operation, fn);
    }

    post(operation: OperationType, fn: HookFunction<T>) {
        this.addHook("post", operation, fn);
    }
}

export function createSchema<T>(definition: SchemaDefinition<T>, options: SchemaOptions = {}): Schema<T> {
    return new Schema<T>(definition, options);
}