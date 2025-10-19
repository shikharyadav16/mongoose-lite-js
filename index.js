const mongoose = require('./src/core/VirtualMongoose');

mongoose.connect('/date');

const userSchema = mongoose.Schema({
    name: String,
    phone: {
        type: String,
        required: true,
        default: "123"
    },
    bool: {
        type: Boolean,
        required: true,
        default: false
    }

},
{timeStamp: true});

const User = mongoose.model("a_12123", userSchema)
const users = User.find({ name: 'abcd' })


console.log(users)