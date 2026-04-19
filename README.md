# mongoose-lite-js

A lightweight, Mongoose-like ODM built in TypeScript using YAML storage.
It provides a familiar MongoDB-style API for schema definition, validation, and querying, without requiring a database server.

---

## Overview

mongoose-lite-js is designed for developers who want a simple, file-based data layer while retaining a structured schema system similar to Mongoose. It is suitable for lightweight applications, prototyping, learning purposes, and environments where running a full database is unnecessary.

---

## Features

### Document Creation

* `create()`
* `save()`

### Querying

* `find()`
* `findOne()`
* `findById()`

### Updating

* `updateOne()`
* `updateMany()`
* `findByIdAndUpdate()`
* `findOneAndUpdate()`
* `replaceOne()`

### Deletion

* `deleteOne()`
* `deleteMany()`
* `findByIdAndDelete()`
* `findByIdAndRemove()`
* `findOneAndDelete()`
* `findOneAndRemove()`

### Utilities

* `countDocuments()`
* `exists()`

### Core Components

* `Schema` – Define structure, validation rules, and defaults
* `model` – Create model instances for interaction
* `connect` – Initialize YAML-based storage

---

## Installation

```bash
npm install mongoose-lite-js
```

---

## Dependencies

The library uses the following runtime dependency:

* `js-yaml` – Used for reading and writing YAML files for persistent storage

---

## Getting Started

### ES Module Usage

```js
import mongooseLite from "mongoose-lite-js";

mongooseLite.connect("./data");

const UserSchema = mongooseLite.Schema({
  username: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ["tester", "developer", "designer"] },
  experience: Number
});

const User = mongooseLite.model("User", UserSchema);

await User.create({ username: "Alex", role: "tester" });

const users = await User.find({});
console.log(users);
```

---

### CommonJS Usage (if enabled)

```js
const mongooseLite = require("mongoose-lite-js");
```

---

## Schema Capabilities

* Primitive types: `String`, `Number`, `Boolean`, `Date`
* Complex types: `Array`, `Object`
* Required validation
* Default values (static or function-based)
* Enum validation
* Numeric constraints (`min`, `max`)
* String constraints (`minlength`, `maxlength`)
* Nested objects
* Arrays of typed elements

---

### Example Schema

```js
const ProductSchema = mongooseLite.Schema({
  name: { type: String, required: true },
  price: { type: Number, min: 0 },
  tags: [String],
  details: {
    weight: Number,
    manufacturer: String
  }
});
```

---

## Data Storage

Data is persisted as YAML files inside the directory passed to `connect()`.

Example:

```bash
project-root/
└─ data/
   ├─ user.yaml
   └─ product.yaml
```

Each model corresponds to a single YAML file (collection).

---

## Project Structure

```md
src/
│
├── core/
│   ├── Schema.ts
│   ├── Model.ts
│   └── index.ts
│
├── types/
│   ├── common.types.ts
│   └── Types.ts
│
├── db/
│   ├── Connection.ts
│   └── DBHelper.ts
│
├── utils/
│   ├── applyDefaults.ts
│   ├── applyUpdates.ts
│   ├── matchFilter.ts
│   └── yamlHelper.ts
│
├── errors/
│   └── ValidationError.ts
│
└── index.ts
```

---

## Design Goals

* Provide a familiar Mongoose-like developer experience
* Eliminate the need for a running database
* Maintain strong typing with TypeScript
* Keep the system lightweight and easy to extend
* Support structured validation and schema enforcement

---

## Limitations

* Not intended for high-concurrency or large-scale production systems
* File-based storage may not be suitable for large datasets
* No built-in indexing or advanced query optimization

---

## License

MIT License
© 2025 Shikhar
