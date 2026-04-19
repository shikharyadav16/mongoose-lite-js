type ValidationErrorItem = {
    message: string;
    kind: string;
    path: string;
    value: any;
};

export class ValidationError extends Error {
    public errors: Record<string, ValidationErrorItem>;

    constructor(errorsArray: string[] = []) {
        super("Validation failed");

        this.name = "ValidationError";
        this.errors = {};

        errorsArray.forEach(err => {
            const [path, message] = err.split(": ");
            const field = path?.trim() || "unknown";

            this.errors[field] = {
                message: message ? message.trim() : err,
                kind: "user defined",
                path: field,
                value: null
            };
        });

        this.message = `Validation failed: ${Object.entries(this.errors)
            .map(([key, e]) => `${key}: ${e.message}`)
            .join(", ")}`;
    }
}

export function validationError(errorsArray: string[] | undefined | null): ValidationError | null {
    if (!errorsArray || errorsArray.length === 0) return null;
    return new ValidationError(errorsArray);
}