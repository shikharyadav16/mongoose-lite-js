# mongoose-lite-js

**A lightweight, virtual Mongoose-like library for JavaScript using YAML storage.**
Provides MongoDB-style data modeling and querying with a familiar Mongoose-like API, but fully offline and lightweight.

## Features

Your library exposes the following Mongoose-style API methods for models:

- Document creation
  - `create()`
  - `save()`
- Querying

  - `find()`
  - `findOne()`
  - `findById()`

- Updating

  - `updateOne()`
  - `updateMany()`
  - `findByIdAndUpdate()`
  - `findOneAndUpdate()`
  - `replaceOne()`

- Deleting

  - `deleteOne()`
  - `deleteMany()`
  - `findByIdAndDelete()`
  - `findByIdAndRemove()`
  - `findOneAndDelete()`
  - `findOneAndRemove()`

- Utility

  - `countDocuments()`
  - `exists()`

- Schema & Connection
  - `schema` – Define schemas with validation, defaults, and unique constraints
  - `connection` – Handle virtual database connection
  - `name` – Model name

> All methods are designed to mimic Mongoose behavior as closely as possible, including nested objects, arrays, and field validations.

## Installation

```bash
npm install mongoose-lite-js
```

## Getting Started

```js
const mongooseLite = require("mongoose-lite-js"); // Main library file
mongooseLite.connect("users"); // Database name

// Define a schema
const UserSchema = mongooseLite.Schema({
  username: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ["tester", "developer", "designer"],
  },
  experience: Number,
});

// Create a model
const User = mongooseLite.model("User", UserSchema);

// Insert documents
User.create({ username: "Alex", role: "tester" });
User.create({
  username: "John",
  role: "developer",
  isActive: false,
  experience: 2,
});

// Show all documents
User.find().then((users) => {
  console.log(users);
});
```

## Schema Features

- Types: `String`, `Number`, `Boolean`
- Required fields: `required: true`
- Default values: `default: ...`
- Unique fields: `unique: true`
- Nested objects and arrays supported

### Example:

```js
const productSchema = {
  name: { type: String, required: true },
  price: { type: Number, min: 0 },
  tags: [String],
  details: {
    weight: Number,
    manufacturer: String,
  },
};
```

## Folder Structure

Data is stored in YAML files inside the folder you specify:

```markdown
project-root/
└─ database_name/
   └─ users.yaml
   └─ products.yaml
```

> Each collection gets its own YAML file automatically.

## License

**MIT © 2025 Shikhar**