// Dependencies
var FileSystem = require('fs');

// Static members
var DEFAULT_CLONE_DEPTH = 20,
    NODE_CONFIG, CONFIG_DIR, RUNTIME_JSON_FILENAME, NODE_ENV, APP_INSTANCE,
    HOST, HOSTNAME, ALLOW_CONFIG_MUTATIONS,
    env = {},
    privateUtil = {},
    deprecationWarnings = {},
    configSources = [],          // Configuration sources - array of {name, original, parsed}
    checkMutability = true;      // Check for mutability/immutability on first get

var Config = function() {
    var t = this;

    // Bind all utility functions to this
    for (var fnName in util) {
        util[fnName] = util[fnName].bind(t);
    }

    // Merge configurations into this
    util.extendDeep(t, util.loadFileConfigs());
    util.attachProtoDeep(t);
};

/**
 * Utilities are under the util namespace vs. at the top level
 */
var util = Config.prototype.util = {};

var getImpl= function(object, property) {
    var t = this,
        elems = Array.isArray(property) ? property : property.split('.'),
        name = elems[0],
        value = object[name];
    if (elems.length <= 1) {
        return value;
    }
    if (typeof value !== 'object') {
        return undefined;
    }
    return getImpl(value, elems.slice(1));
};

Config.prototype.get = function(property) {
    var value = getImpl(this, property);

    if (value === undefined) {
        console.error('Configuration property "' + property + '" is not defined');
        return value;
    }

    if (checkMutability) {
        if (!util.initParam('ALLOW_CONFIG_MUTATIONS', false)) {
            util.makeImmutable(config);
        }
        checkMutability = false;
    }
    return value;
};

Config.prototype.has = function(property) {
    return (getImpl(this, property) !== undefined);
};

util.watch = function(object, property, handler, depth) {
    var t = this, o = object;
    var allProperties = property ? [property] : Object.keys(o);

    if (!deprecationWarnings.watch) {
        console.error('WARNING: config.' + fnName + '() is deprecated, and will not be supported in release 2.0.');
        console.error('WARNING: See https://github.com/lorenwest/node-config/wiki/Future-Compatibility#upcoming-incompatibilities');
        deprecationWarnings.watch = true;
    }

    // Depth detection
    depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
    if (depth < 0) {
        return;
    }

    // Create hidden properties on the object
    if (!o.__watchers)
        util.makeHidden(o, '__watchers', {});
    if (!o.__propertyValues)
        util.makeHidden(o, '__propertyValues', {});

    // Attach watchers to all requested properties
    allProperties.forEach(function(prop){

        // Setup the property for watching (first time only)
        if (typeof(o.__propertyValues[prop]) == 'undefined') {

            // Don't error re-defining the property if immutable
            var descriptor = Object.getOwnPropertyDescriptor(o, prop);
            if (descriptor && descriptor.writable === false)
                return;

            // Copy the value to the hidden field, and add the property to watchers
            o.__propertyValues[prop] = [o[prop]];
            o.__watchers[prop] = [];

            // Attach the property watcher
            Object.defineProperty(o, prop, {
                enumerable : true,

                get : function(){
                    // If more than 1 item is in the values array,
                    // then we're currently processing watchers.
                    if (o.__propertyValues[prop].length == 1)
                    // Current value
                        return o.__propertyValues[prop][0];
                    else
                    // [0] is prior value, [1] is new value being processed
                        return o.__propertyValues[prop][1];
                },

                set : function(newValue) {

                    // Return early if no change
                    var origValue = o[prop];
                    if (util.equalsDeep(origValue, newValue))
                        return;

                    // Remember the new value, and return if we're in another setter
                    o.__propertyValues[prop].push(newValue);
                    if (o.__propertyValues[prop].length > 2)
                        return;

                    // Call all watchers for each change requested
                    var numIterations = 0;
                    while (o.__propertyValues[prop].length > 1) {

                        // Detect recursion
                        if (++numIterations > 20) {
                            o.__propertyValues[prop] = [origValue];
                            throw new Error('Recursion detected while setting [' + prop + ']');
                        }

                        // Call each watcher for the current values
                        var oldValue = o.__propertyValues[prop][0];
                        newValue = o.__propertyValues[prop][1];
                        o.__watchers[prop].forEach(function(watcher) {
                            try {
                                watcher(o, prop, oldValue, newValue);
                            } catch (e) {
                                // Log an error and continue with subsequent watchers
                                console.error("Exception in object watcher for " + prop, e);
                            }
                        });

                        // Done processing this value
                        o.__propertyValues[prop].splice(0,1);
                    }
                }
            });

        } // Done setting up the property for watching (first time)

        // Add the watcher to the property
        o.__watchers[prop].push(handler);

        // Recurs if this is an object...
        if (o[prop] && typeof(o[prop]) == 'object') {
            util.watch(o[prop], null, handler, depth - 1);
        }

    }); // Done processing each property

    // Return the original object - for chaining
    return o;
};

util.setModuleDefaults = function(moduleName, defaultProperties) {

    // Copy the properties into a new object
    var t = this,
        moduleConfig = util.cloneDeep(defaultProperties);

    // Set module defaults into the first sources element
    if (configSources.length === 0 || configSources[0].name !== 'Module Defaults') {
        configSources.splice(0, 0, {
            name: 'Module Defaults',
            parsed: {}
        });
    }
    configSources[0].parsed[moduleName] = {};
    util.extendDeep(configSources[0].parsed[moduleName], defaultProperties);

    // Attach handlers & watchers onto the module config object
    util.attachProtoDeep(moduleConfig);

    // Fold module configs into the config object.  This won't override
    // current values, if they've been made immutable.
    t[moduleName] = t[moduleName] || {};
    util.extendDeep(t[moduleName], moduleConfig);

    // Return the module config
    return t[moduleName];
};

util.makeHidden = function(object, property, value) {

    // Use the existing value if the new value isn't specified
    value = (typeof value == 'undefined') ? object[property] : value;

    // Create the hidden property
    Object.defineProperty(object, property, {
        value: value,
        enumerable : false
    });

    return object;
}

util.makeImmutable = function(object, property, value) {
    var properties = null;

    // Backwards compatibility mode where property/value can be specified
    if (typeof property === 'string') {
        return Object.defineProperty(object, property, {
            value : (typeof value == 'undefined') ? object[property] : value,
            writable : false,
            configurable: false
        });
    }

    // Get the list of properties to work with
    if (Array.isArray(property)) {
        properties = property;
    }
    else {
        properties = Object.keys(object);
    }

    // Process each property
    for (var i = 0; i < properties.length; i++) {
        var propertyName = properties[i],
            value = object[propertyName];

        Object.defineProperty(object, propertyName, {
            value: value,
            writable : false,
            configurable: false
        });

        // Call recursively if an object.
        if (util.isObject(value)) {
            util.makeImmutable(value);
        }
    }

    return object;
};


util.getConfigSources = function() {
    var t = this;
    return configSources.slice(0);
};

util.loadFileConfigs = function() {

    // Initialize
    var t = this,
        config = {};

    // Initialize parameters from command line, environment, or default
    NODE_ENV = util.initParam('NODE_ENV', 'development');
    CONFIG_DIR = util.initParam('NODE_CONFIG_DIR', process.cwd() + '/config');
    if (CONFIG_DIR.indexOf('.') === 0) {
        CONFIG_DIR = process.cwd() + '/' + CONFIG_DIR;
    }
    APP_INSTANCE = util.initParam('NODE_APP_INSTANCE');
    HOST = util.initParam('HOST');
    HOSTNAME = util.initParam('HOSTNAME');

    // This is for backward compatibility
    RUNTIME_JSON_FILENAME = util.initParam('NODE_CONFIG_RUNTIME_JSON', CONFIG_DIR + '/runtime.json');

    // Determine the host name from the OS module, $HOST, or $HOSTNAME
    // Remove any . appendages, and default to null if not set
    try {
        var hostName = HOST || HOSTNAME;

        // Store the hostname that won.
        env.HOSTNAME = hostName;

        if (!hostName) {
            var OS = require('os');
            hostName = OS.hostname();
        }
    } catch (e) {
        hostName = '';
    }
    hostName = hostName ? hostName.split('.')[0] : null;

    // Read each file in turn
    var baseNames = ['default', NODE_ENV, hostName, hostName + '-' + NODE_ENV, 'local', 'local-' + NODE_ENV];
    var extNames = ['js', 'json'];
    baseNames.forEach(function(baseName) {
        extNames.forEach(function(extName) {

            // Try merging the config object into this object
            var fullFilename = CONFIG_DIR + '/' + baseName + '.' + extName;
            var configObj = util.parseFile(fullFilename);
            if (configObj) {
                util.extendDeep(config, configObj);
            }

            // See if the application instance file is available
            if (APP_INSTANCE) {
                fullFilename = CONFIG_DIR + '/' + baseName + '-' + APP_INSTANCE + '.' + extName;
                configObj = util.parseFile(fullFilename);
                if (configObj) {
                    util.extendDeep(config, configObj);
                }
            }
        });
    });

    // Override configurations from the $NODE_CONFIG environment variable
    var envConfig = {};
    if (process.env.NODE_CONFIG) {
        try {
            envConfig = JSON.parse(process.env.NODE_CONFIG);
        } catch(e) {
            console.error('The $NODE_CONFIG environment variable is malformed JSON');
        }
        util.extendDeep(config, envConfig);
        configSources.push({
            name: "$NODE_CONFIG",
            parsed: envConfig
        });
    }

    // Override configurations from the --NODE_CONFIG command line
    var cmdLineConfig = util.getCmdLineArg('NODE_CONFIG');
    if (cmdLineConfig) {
        try {
            cmdLineConfig = JSON.parse(cmdLineConfig);
        } catch(e) {
            console.error('The --NODE_CONFIG={json} command line argument is malformed JSON');
        }
        util.extendDeep(config, cmdLineConfig);
        configSources.push({
            name: "--NODE_CONFIG argument",
            parsed: cmdLineConfig
        });
    }

    // Override with environment variables if there is a custom-environment-variables.EXT mapping file
    var customEnvVars = util.getCustomEnvVars(CONFIG_DIR, extNames);
    util.extendDeep(config, customEnvVars);

    // Place the mixed NODE_CONFIG into the environment
    env['NODE_CONFIG'] = JSON.stringify(util.extendDeep(envConfig, cmdLineConfig, {}));

    // Extend the original config with the contents of runtime.json (backwards compatibility)
    var runtimeJson = util.parseFile(RUNTIME_JSON_FILENAME) || {};
    util.extendDeep(config, runtimeJson);

    // Return the configuration object
    return config;
};

util.parseFile = function(fullFilename) {

    // Initialize
    var t = this,
        extension = fullFilename.substr(fullFilename.lastIndexOf('.') + 1),
        configObject = null,
        fileContent = null;

    // Return null if the file doesn't exist.
    // Note that all methods here are the Sync versions.  This is appropriate during
    // module loading (which is a synchronous operation), but not thereafter.
    try {
        var stat = FileSystem.statSync(fullFilename);
        if (!stat || stat.size < 1) {
            return null;
        }
    } catch (e1) {
        return null
    }

    // Try loading the file.
    try {
        fileContent = FileSystem.readFileSync(fullFilename, 'UTF-8');
    }
    catch (e2) {
        throw new Error('Config file ' + fullFilename + ' cannot be read');
    }

    // Parse the file based on extension
    try {
        if (extension == 'json') {
            // Allow comments in JSON files
            configObject = JSON.parse(util.stripComments(fileContent));
        }
        else if (extension == 'js') {
            // Use the built-in parser for .js files
            configObject = require(fullFilename);
        }
    }
    catch (e3) {
        throw new Error("Cannot parse config file: '" + fullFilename + "': " + e3);
    }

    // Keep track of this configuration source if it has anything in it
    if (typeof configObject == 'object' && JSON.stringify(configObject).length > 2) {
        configSources.push({
            name: fullFilename,
            original: fileContent,
            parsed: configObject
        });
    }

    return configObject;
};

util.attachProtoDeep = function(toObject, depth) {

    // Recursion detection
    var t = this;
    depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
    if (depth < 0) {
        return toObject;
    }

    // Adding Config.prototype methods directly to toObject as hidden properties
    // because adding to toObject.__proto__ exposes the function in toObject
    for (var fnName in Config.prototype) {
        if (!toObject[fnName]) {
            util.makeHidden(toObject, fnName, Config.prototype[fnName]);
        }
    }

    // Add prototypes to sub-objects
    for (var prop in toObject) {
        if (util.isObject(toObject[prop])) {
            util.attachProtoDeep(toObject[prop], depth - 1);
        }
    }

    // Return the original object
    return toObject;
};

util.cloneDeep = function(obj, depth) {

    // Recursion detection
    var t = this;
    depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
    if (depth < 0) {
        return {};
    }

    // Create the copy of the correct type
    var copy = Array.isArray(obj) ? [] : {};

    // Cycle through each element
    for (var prop in obj) {

        // Call recursively if an object or array
        if (obj[prop] && typeof obj[prop] == 'object') {
            copy[prop] = util.cloneDeep(obj[prop], depth - 1);
        }
        else {
            copy[prop] = obj[prop];
        }
    }

    // Return the copied object
    return copy;

};

util.setPath = function (object, path, value) {
    var nextKey = null;
    if (value === null || path.length === 0) {
        return;
    }
    else if (path.length === 1) { // no more keys to make, so set the value
        object[path.shift()] = value;
    }
    else {
        nextKey = path.shift();
        if (!object.hasOwnProperty(nextKey)) {
            object[nextKey] = {};
        }
        util.setPath(object[nextKey], path, value);
    }
};

util.substituteDeep = function (substitutionMap, variables) {
    var result = {};

    function _substituteVars(map, vars, pathTo) {
        for (var prop in map) {
            var value = map[prop];
            if (typeof(value) === 'string') { // We found a leaf variable name
                if (vars[value]) { // if the vars provide a value set the value in the result map
                    util.setPath(result, pathTo.concat(prop), vars[value]);
                }
            }
            else if (util.isObject(value)) { // work on the subtree, giving it a clone of the pathTo
                _substituteVars(value, vars, pathTo.concat(prop));
            }
            else {
                msg = "Illegal key type for substitution map at " + pathTo.join('.') + ': ' + typeof(value);
                throw Error(msg);
            }
        }
    }

    _substituteVars(substitutionMap, variables, []);
    return result;

};

util.getCustomEnvVars = function (CONFIG_DIR, extNames) {
    var result = {};
    extNames.forEach(function (extName) {
        var fullFilename = CONFIG_DIR + '/' + 'custom-environment-variables' + '.' + extName;
        var configObj = util.parseFile(fullFilename);
        if (configObj) {
            var environmentSubstitutions = util.substituteDeep(configObj, process.env);
            util.extendDeep(result, environmentSubstitutions);
        }
    });
    return result;
};

util.equalsDeep = function(object1, object2, depth) {

    // Recursion detection
    var t = this;
    depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
    if (depth < 0) {
        return {};
    }

    // Fast comparisons
    if (!object1 || !object2) {
        return false;
    }
    if (object1 === object2) {
        return true;
    }
    if (typeof(object1) != 'object' || typeof(object2) != 'object') {
        return false;
    }

    // They must have the same keys.  If their length isn't the same
    // then they're not equal.  If the keys aren't the same, the value
    // comparisons will fail.
    if (Object.keys(object1).length != Object.keys(object2).length) {
        return false;
    }

    // Compare the values
    for (var prop in object1) {

        // Call recursively if an object or array
        if (object1[prop] && typeof(object1[prop]) === 'object') {
            if (!util.equalsDeep(object1[prop], object2[prop], depth - 1)) {
                return false;
            }
        }
        else {
            if (object1[prop] !== object2[prop]) {
                return false;
            }
        }
    }

    // Test passed.
    return true;
};

util.diffDeep = function(object1, object2, depth) {

    // Recursion detection
    var t = this, diff = {};
    depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
    if (depth < 0) {
        return {};
    }

    // Process each element from object2, adding any element that's different
    // from object 1.
    for (var parm in object2) {
        var value1 = object1[parm];
        var value2 = object2[parm];
        if (value1 && value2 && util.isObject(value2)) {
            if (!(util.equalsDeep(value1, value2))) {
                diff[parm] = util.diffDeep(value1, value2, depth - 1);
            }
        }
        else if (Array.isArray(value1) && Array.isArray(value2)) {
            if(!util.equalsDeep(value1, value2)) {
                diff[parm] = value2;
            }
        }
        else if (value1 !== value2){
            diff[parm] = value2;
        }
    }

    // Return the diff object
    return diff;

};

util.extendDeep = function(mergeInto) {

    // Initialize
    var t = this;
    var vargs = Array.prototype.slice.call(arguments, 1);
    var depth = vargs.pop();
    if (typeof(depth) != 'number') {
        vargs.push(depth);
        depth = DEFAULT_CLONE_DEPTH;
    }

    // Recursion detection
    if (depth < 0) {
        return mergeInto;
    }

    // Cycle through each object to extend
    vargs.forEach(function(mergeFrom) {

        // Cycle through each element of the object to merge from
        for (var prop in mergeFrom) {

            // Extend recursively if both elements are objects
            if (util.isObject(mergeInto[prop]) && util.isObject(mergeFrom[prop])) {
                util.extendDeep(mergeInto[prop], mergeFrom[prop], depth - 1);
            }

            // Copy recursively if the mergeFrom element is an object (or array or fn)
            else if (mergeFrom[prop] && typeof mergeFrom[prop] == 'object') {
                mergeInto[prop] = util.cloneDeep(mergeFrom[prop], depth - 1);
            }

            // Simple assignment otherwise
            else {
                mergeInto[prop] = mergeFrom[prop];
            }
        }
    });

    // Chain
    return mergeInto;

};

util.stripComments = function(fileStr) {

    var uid = '_' + +new Date(),
        primitives = [],
        primIndex = 0;

    return (
        fileStr

            /* Remove strings */
            .replace(/(['"])(\\\1|.)+?\1/g, function(match){
                primitives[primIndex] = match;
                return (uid + '') + primIndex++;
            })

            /* Remove Regexes */
            .replace(/([^\/])(\/(?!\*|\/)(\\\/|.)+?\/[gim]{0,3})/g, function(match, $1, $2){
                primitives[primIndex] = $2;
                return $1 + (uid + '') + primIndex++;
            })

            /*
             - Remove single-line comments that contain would-be multi-line delimiters
             E.g. // Comment /* <--
             - Remove multi-line comments that contain would be single-line delimiters
             E.g. /* // <--
             */
            .replace(/\/\/.*?\/?\*.+?(?=\n|\r|$)|\/\*[\s\S]*?\/\/[\s\S]*?\*\//g, '')

            /*
             Remove single and multi-line comments,
             no consideration of inner-contents
             */
            .replace(/\/\/.+?(?=\n|\r|$)|\/\*[\s\S]+?\*\//g, '')

            /*
             Remove multi-line comments that have a replaced ending (string/regex)
             Greedy, so no inner strings/regexes will stop it.
             */
            .replace(RegExp('\\/\\*[\\s\\S]+' + uid + '\\d+', 'g'), '')

            /* Bring back strings & regexes */
            .replace(RegExp(uid + '(\\d+)', 'g'), function(match, n){
                return primitives[n];
            })
        );

};

util.isObject = function(obj) {
    return (obj !== null) && (typeof obj == 'object') && !(Array.isArray(obj));
};

util.initParam = function (paramName, defaultValue) {
    var t = this;

    // Record and return the value
    var value = util.getCmdLineArg(paramName) || process.env[paramName] || defaultValue;
    env[paramName] = value;
    return value;
}

util.getCmdLineArg = function (searchFor) {
    var cmdLineArgs = process.argv.slice(2, process.argv.length),
        argName = '--' + searchFor + '=';

    for (var argvIt = 0; argvIt < cmdLineArgs.length; argvIt++) {
        if (cmdLineArgs[argvIt].indexOf(argName) === 0) {
            return cmdLineArgs[argvIt].substr(argName.length);
        }
    }

    return false;
}

util.getEnv = function (varName) {
    return env[varName];
}

// Process pre-1.0 utility names
var utilWarnings = {};
['watch', 'setModuleDefaults', 'makeHidden', 'makeImmutable', 'getConfigSources', '_loadFileConfigs',
    '_parseFile', '_attachProtoDeep', '_cloneDeep', '_equalsDeep', '_diffDeep', '_extendDeep',
    '_stripComments', '_isObject', '_initParam', '_getCmdLineArg'].forEach(function(oldName) {

        // Config.util names don't have underscores
        var newName = oldName;
        if (oldName.indexOf('_') === 0) {
            newName = oldName.substr(1);
        }

        // Build the wrapper with warning
        Config.prototype[oldName] = function(){

            // Produce the warning
            if (!utilWarnings[oldName]) {
                console.error('WARNING: config.' + oldName + '() is deprecated.  Use config.util.' + newName + '() instead.');
                console.error('WARNING: See https://github.com/lorenwest/node-config/wiki/Future-Compatibility#upcoming-incompatibilities');
                utilWarnings[oldName] = true;
            }

            // Forward the call
            return util[newName].apply(this, arguments);
        }
    });

// Instantiate and export the configuration
var config = module.exports = new Config();

// Produce warnings if the configuration is empty
var showWarnings = !(util.initParam('SUPPRESS_NO_CONFIG_WARNING'));
if (showWarnings && Object.keys(config).length === 0) {
    console.error('WARNING: No configurations found in configuration directory:');
    console.error('WARNING: ' + CONFIG_DIR);
    //console.error('WARNING: See https://www.npmjs.org/package/config for more information.');
}