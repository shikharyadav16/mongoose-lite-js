import { randomUUID } from "crypto";

const Types = {
  ObjectId(): string {
    return randomUUID();
  },

  String: String as StringConstructor,
  Number: Number as NumberConstructor,
  Boolean: Boolean as BooleanConstructor,
  Array: Array as ArrayConstructor,
  Object: Object as ObjectConstructor,
  Date: Date as DateConstructor,
};

export default Types;