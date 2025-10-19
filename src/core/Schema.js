function createSchema(definition, options = {}) {
    const virtuals = {};
    const methods = {};
    const statics = {};
    const hooks = { pre: {}, post: {} };

    function addMethod(name, fn) {
        methods[name] = fn;
        console.log("Method added!")
    }

    function addStatic(name, fn) {
        statics[name] = fn;
    }

    function addHooks(type, operation, fn) {
        hooks[type][operation] = hooks[type][operation] || [];
        hooks[type][operation].push(fn);
    }

    return {
        definition,
        options,
        virtuals,
        methods,
        statics,
        hooks,
        addMethod,
        addStatic,
        addHooks
    }
}

module.exports = createSchema;