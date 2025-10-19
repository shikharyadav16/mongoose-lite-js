const validationError = (errorsArray) => {
  const err = new Error("Validation failed");
  err.name = "ValidationError";
  err.errors = {};
  console.log(errorsArray)

  errorsArray.forEach((errStr) => {
    const [path, message] = errStr.includes(":")
      ? errStr.split(/:(.+)/).map((s) => s.trim())
      : ["_error", errStr];
    err.errors[path] = { message };
  });

  return err;
};

module.exports = { validationError };