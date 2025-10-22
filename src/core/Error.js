class ValidationError extends Error {
  constructor(errorsArray = []) {
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

function validationError(errorsArray) {
  if (!errorsArray || errorsArray.length === 0) return null;
  return new ValidationError(errorsArray);
}

module.exports = { validationError }