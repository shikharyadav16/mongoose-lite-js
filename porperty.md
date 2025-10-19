# Mongoose

## 1️⃣ Mongoose Data Types

| Type                           | Description                | Example                                                         |
| ------------------------------ | -------------------------- | --------------------------------------------------------------- |
| `String`                       | Text                       | `name: String`                                                  |
| `Number`                       | Numeric                    | `age: Number`                                                   |
| `Boolean`                      | true/false                 | `isActive: Boolean`                                             |
| `Date`                         | Date/time                  | `createdAt: Date`                                               |
| `Buffer`                       | Binary data                | `photo: Buffer`                                                 |
| `ObjectId`                     | MongoDB ObjectId reference | `author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }` |
| `Mixed` (`Schema.Types.Mixed`) | Any type, flexible         | `meta: Schema.Types.Mixed`                                      |
| `Array`                        | Array of any type          | `tags: [String]`                                                |
| `Map`                          | Key-value map              | `settings: { type: Map, of: String }`                           |
| `Decimal128`                   | High-precision decimal     | `price: Schema.Types.Decimal128`                                |

## 2️⃣ Common Schema Attributes / Options

| Attribute   | Type                | Description                                                       |
| ----------- | ------------------- | ----------------------------------------------------------------- |
| `type`      | Function / Type     | Defines the field’s type. Required for detailed definitions.      |
| `required`  | Boolean or Function | Field must be present (can also be conditional).                  |
| `default`   | Any or Function     | Default value if field is missing.                                |
| `enum`      | Array               | Field value must be one of the specified array values.            |
| `min`       | Number              | Minimum numeric value.                                            |
| `max`       | Number              | Maximum numeric value.                                            |
| `minlength` | Number              | Minimum string length.                                            |
| `maxlength` | Number              | Maximum string length.                                            |
| `match`     | RegExp              | Regex pattern to validate string values.                          |
| `unique`    | Boolean             | Creates a unique index in MongoDB (does not validate on its own). |
| `validate`  | Function or Object  | Custom validation function with error message.                    |
| `immutable` | Boolean             | Field cannot be changed once set.                                 |
| `select`    | Boolean             | Include/exclude field by default in queries.                      |
| `get`       | Function            | Transform value when retrieved from DB.                           |
| `set`       | Function            | Transform value before saving to DB.                              |
| `alias`     | String              | Alternative name for field access.                                |
| `ref`       | String              | Reference another Mongoose model (for `ObjectId`).                |
| `sparse`    | Boolean             | Sparse index.                                                     |
| `index`     | Boolean             | Index field in MongoDB.                                           |
| `validate`  | Object / Function   | Custom validator for complex logic.                               |


## 3️⃣ Nested / Complex Structures

- Nested Objects:

```js
address: {
  street: { type: String, required: true },
  city: { type: String },
  zip: { type: Number }
}
```

- Arrays of objects or primitives:

```js
tags: [String]
friends: [{ name: String, age: Number }]
```

- Map type:

```js
settings: { type: Map, of: String }
```

## 4️⃣ Example Mongoose Schema

```js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2 },
  email: { type: String, required: true, unique: true, match: /@/ },
  age: { type: Number, min: 0, max: 120, default: 18 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  roles: { type: [String], enum: ["admin", "user", "guest"], default: ["user"] },
  meta: { type: mongoose.Schema.Types.Mixed },
  friends: [{ name: String, age: Number }],
  settings: { type: Map, of: String }
});
```


# Virtual Mongoose

## 1️⃣ Supported Data Types (for type)

| Type                                                                                               | Description                                        |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `String`                                                                                           | Text values.                                       |
| `Number`                                                                                           | Numeric values.                                    |
| `Boolean`                                                                                          | `true` or `false`.                                 |
| `Object`                                                                                           | Plain JavaScript objects (nested schemas).         |
| `Array`                                                                                            | Arrays of any type (e.g., `[String]`, `[Number]`). |
| *Optional/Extended:* `Date`, `Buffer`, `Map`, `Set` (not fully implemented in your validator yet). |                                                    |

## 2️⃣ Supported Attributes

| Attribute   | Type                                | Description                                                          |
| ----------- | ----------------------------------- | -------------------------------------------------------------------- |
| `type`      | Function (`String`, `Number`, etc.) | Required for Mongoose-style full object definitions.                 |
| `required`  | `true/false`                        | Field must be present and not `null`/empty string/undefined.         |
| `default`   | Any value or function               | Default value assigned if the field is missing or `undefined`.       |
| `enum`      | Array                               | Value must be one of the array values. Works for strings or numbers. |
| `min`       | Number                              | Minimum allowed numeric value.                                       |
| `max`       | Number                              | Maximum allowed numeric value.                                       |
| `minlength` | Number                              | Minimum allowed string length.                                       |
| `maxlength` | Number                              | Maximum allowed string length.                                       |

## 3️⃣ Array Support

```js
tags: [String]          // array of strings
scores: [Number]        // array of numbers
nestedArray: [{ a: Number }]  // array of objects with schema
```

## 4️⃣ Nested Objects

```js
address: {
  street: String,
  city: String,
  zip: Number
}
```

```js
address: {
  type: Object,
  required: true
}
```