const { createConnection } = require('./Connection')
const createSchema = require('./Schema');
const createModel = require('./Model')
const { Types } = require('./Types');
const { validateSchema, validateModelName } = require('../validations/validation');
const { validationError } = require('./Error');

function VirtualMongoose() {
    const connections = [];
    const models = {};

    function connect(path) {
        const conn = createConnection(path);
        connections.push(conn);
        console.log("Virtual Mongoose connected!");
        return conn;
    }

    function Schema(def, opts) {
        const res = validateSchema(def);
        if (!res.valid) {
            throw validationError(res.errors)
        }
        const schema = createSchema(def, opts)
        return schema;
    }
    
    function model(name, schema) {
        const conn = connections[0];
        console.log("Connection:", conn)
        const res = validateModelName(name);
        if (!res.valid) {
            throw validationError(res.errors)
        }
        const mdl = createModel(name, schema, conn);
        models[name] = mdl;
        return mdl;
    }
    // return { connect }
    return { connect, Schema, model, Types }
}

module.exports = VirtualMongoose();