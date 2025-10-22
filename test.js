// test.js
const mongooseLite = require('./index'); // Main library file

mongooseLite.connect("users") // Database name

// Define a schema
const UserSchema = mongooseLite.Schema({
  username: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ["tester", "developer", "designer"]
  },
  experience: Number
});

// Create a model
const User = mongooseLite.model('User', UserSchema);

// Insert documents
User.create({ username: "Alex", role: "tester" });
User.create({ username: "John", role: "developer", isActive: false, experience: 2 });

// Show all documents
User.find().then(users => {
  console.log(users);
});
