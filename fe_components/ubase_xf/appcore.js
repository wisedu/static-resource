/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.1.22 Copyright (c) 2010-2015, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
//Not using strict: uneven strict support in browsers, #392, and causes
//problems with requirejs.exec()/transpiler plugins that may not be strict.
/*jslint regexp: true, nomen: true, sloppy: true */
/*global window, navigator, document, importScripts, setTimeout, opera */

var requirejs, require, define;
(function (global) {
    var req, s, head, baseElement, dataMain, src,
        interactiveScript, currentlyAddingScript, mainScript, subPath,
        version = '2.1.22',
        commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        currDirRegExp = /^\.\//,
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        ap = Array.prototype,
        isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document),
        isWebWorker = !isBrowser && typeof importScripts !== 'undefined',
        //PS3 indicates loaded and complete, but need to wait for complete
        //specifically. Sequence is 'loading', 'loaded', execution,
        // then 'complete'. The UA check is unfortunate, but not sure how
        //to feature test w/o causing perf issues.
        readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
                      /^complete$/ : /^(complete|loaded)$/,
        defContextName = '_',
        //Oh the tragedy, detecting opera. See the usage of isOpera for reason.
        isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        contexts = {},
        cfg = {},
        globalDefQueue = [],
        useInteractive = false;

    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    /**
     * Helper function for iterating over an array. If the func returns
     * a true value, it will break out of the loop.
     */
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    /**
     * Helper function for iterating over an array backwards. If the func
     * returns a true value, it will break out of the loop.
     */
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }

    /**
     * Cycles over properties in an object and calls a function for each
     * property value. If the function returns a truthy value, then the
     * iteration is stopped.
     */
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     */
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value === 'object' && value &&
                        !isArray(value) && !isFunction(value) &&
                        !(value instanceof RegExp)) {

                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }

    //Similar to Function.prototype.bind, but the 'this' object is specified
    //first, since it is easier to read/figure out what 'this' will be.
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }

    function scripts() {
        return document.getElementsByTagName('script');
    }

    function defaultOnError(err) {
        throw err;
    }

    //Allow getting a global that is expressed in
    //dot notation, like 'a.b.c'.
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }

    /**
     * Constructs an error with a pointer to an URL with more information.
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }

    if (typeof define !== 'undefined') {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            //Do not overwrite an existing requirejs instance.
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }

    //Allow for a require config object
    if (typeof require !== 'undefined' && !isFunction(require)) {
        //assume it is a config object.
        cfg = require;
        require = undefined;
    }

    function newContext(contextName) {
        var inCheckLoaded, Module, context, handlers,
            checkLoadedTimeoutId,
            config = {
                //Defaults. Do not set a default for map
                //config to speed up normalize(), which
                //will run faster if there is no default.
                waitSeconds: 7,
                baseUrl: './',
                paths: {},
                bundles: {},
                pkgs: {},
                shim: {},
                config: {}
            },
            registry = {},
            //registry of just enabled modules, to speed
            //cycle breaking code when lots of modules
            //are registered, but not activated.
            enabledRegistry = {},
            undefEvents = {},
            defQueue = [],
            defined = {},
            urlFetched = {},
            bundlesMap = {},
            requireCounter = 1,
            unnormalizedCounter = 1;

        /**
         * Trims the . and .. from an array of path segments.
         * It will keep a leading path segment if a .. will become
         * the first path segment, to help with module name lookups,
         * which act like paths, but can be remapped. But the end result,
         * all paths that use this function should look normalized.
         * NOTE: this method MODIFIES the input array.
         * @param {Array} ary the array of path segments.
         */
        function trimDots(ary) {
            var i, part;
            for (i = 0; i < ary.length; i++) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && ary[2] === '..') || ary[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }

        /**
         * Given a relative module name, like ./something, normalize it to
         * a real name that can be mapped to a path.
         * @param {String} name the relative name
         * @param {String} baseName a real name that the name arg is relative
         * to.
         * @param {Boolean} applyMap apply the map config to the value. Should
         * only be done if this normalization is for a dependency ID.
         * @returns {String} normalized name
         */
        function normalize(name, baseName, applyMap) {
            var pkgMain, mapValue, nameParts, i, j, nameSegment, lastIndex,
                foundMap, foundI, foundStarMap, starI, normalizedBaseParts,
                baseParts = (baseName && baseName.split('/')),
                map = config.map,
                starMap = map && map['*'];

            //Adjust any relative paths.
            if (name) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // If wanting node ID compatibility, strip .js from end
                // of IDs. Have to do this here, and not in nameToUrl
                // because node allows either .js or non .js to map
                // to same file.
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                // Starts with a '.' so need the baseName
                if (name[0].charAt(0) === '.' && baseParts) {
                    //Convert baseName to array, and lop off the last part,
                    //so that . matches that 'directory' and not name of the baseName's
                    //module. For instance, baseName of 'one/two/three', maps to
                    //'one/two/three.js', but we want the directory, 'one/two' for
                    //this normalization.
                    normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                    name = normalizedBaseParts.concat(name);
                }

                trimDots(name);
                name = name.join('/');
            }

            //Apply map config if available.
            if (applyMap && map && (baseParts || starMap)) {
                nameParts = name.split('/');

                outerLoop: for (i = nameParts.length; i > 0; i -= 1) {
                    nameSegment = nameParts.slice(0, i).join('/');

                    if (baseParts) {
                        //Find the longest baseName segment match in the config.
                        //So, do joins on the biggest to smallest lengths of baseParts.
                        for (j = baseParts.length; j > 0; j -= 1) {
                            mapValue = getOwn(map, baseParts.slice(0, j).join('/'));

                            //baseName segment has config, find if it has one for
                            //this name.
                            if (mapValue) {
                                mapValue = getOwn(mapValue, nameSegment);
                                if (mapValue) {
                                    //Match, update name to the new value.
                                    foundMap = mapValue;
                                    foundI = i;
                                    break outerLoop;
                                }
                            }
                        }
                    }

                    //Check for a star map match, but just hold on to it,
                    //if there is a shorter segment match later in a matching
                    //config, then favor over this star map.
                    if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
                        foundStarMap = getOwn(starMap, nameSegment);
                        starI = i;
                    }
                }

                if (!foundMap && foundStarMap) {
                    foundMap = foundStarMap;
                    foundI = starI;
                }

                if (foundMap) {
                    nameParts.splice(0, foundI, foundMap);
                    name = nameParts.join('/');
                }
            }

            // If the name points to a package's name, use
            // the package main instead.
            pkgMain = getOwn(config.pkgs, name);

            return pkgMain ? pkgMain : name;
        }

        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name &&
                            scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }

        function hasPathFallback(id) {
            var pathConfig = getOwn(config.paths, id);
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                //Pop off the first array value, since it failed, and
                //retry
                pathConfig.shift();
                context.require.undef(id);

                //Custom require that does not do map translation, since
                //ID is "absolute", already mapped/resolved.
                context.makeRequire(null, {
                    skipMap: true
                })([id]);

                return true;
            }
        }

        //Turns a plugin!resource to [plugin, resource]
        //with the plugin being undefined if the name
        //did not have a plugin prefix.
        function splitPrefix(name) {
            var prefix,
                index = name ? name.indexOf('!') : -1;
            if (index > -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            return [prefix, name];
        }

        /**
         * Creates a module mapping that includes plugin prefix, module
         * name, and path. If parentModuleMap is provided it will
         * also normalize the name via require.normalize()
         *
         * @param {String} name the module name
         * @param {String} [parentModuleMap] parent module map
         * for the module name, used to resolve relative names.
         * @param {Boolean} isNormalized: is the ID already normalized.
         * This is true if this call is done for a define() module ID.
         * @param {Boolean} applyMap: apply the map config to the ID.
         * Should only be true if this map is for a dependency.
         *
         * @returns {Object}
         */
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url, pluginModule, suffix, nameParts,
                prefix = null,
                parentName = parentModuleMap ? parentModuleMap.name : null,
                originalName = name,
                isDefine = true,
                normalizedName = '';

            //If no name, then it means it is a require call, generate an
            //internal name.
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }

            nameParts = splitPrefix(name);
            prefix = nameParts[0];
            name = nameParts[1];

            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = getOwn(defined, prefix);
            }

            //Account for relative paths if there is a base name.
            if (name) {
                if (prefix) {
                    if (pluginModule && pluginModule.normalize) {
                        //Plugin is loaded, use its normalize method.
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    } else {
                        // If nested plugin references, then do not try to
                        // normalize, as it will not normalize correctly. This
                        // places a restriction on resourceIds, and the longer
                        // term solution is not to normalize until plugins are
                        // loaded and all normalizations to allow for async
                        // loading of a loader plugin. But for now, fixes the
                        // common uses. Details in #1131
                        normalizedName = name.indexOf('!') === -1 ?
                                         normalize(name, parentName, applyMap) :
                                         name;
                    }
                } else {
                    //A regular module.
                    normalizedName = normalize(name, parentName, applyMap);

                    //Normalized name may be a plugin ID due to map config
                    //application in normalize. The map config values must
                    //already be normalized, so do not need to redo that part.
                    nameParts = splitPrefix(normalizedName);
                    prefix = nameParts[0];
                    normalizedName = nameParts[1];
                    isNormalized = true;

                    url = context.nameToUrl(normalizedName);
                }
            }

            //If the id is a plugin id that cannot be determined if it needs
            //normalization, stamp it with a unique ID so two matching relative
            //ids that may conflict can be separate.
            suffix = prefix && !pluginModule && !isNormalized ?
                     '_unnormalized' + (unnormalizedCounter += 1) :
                     '';

            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ?
                        prefix + '!' + normalizedName :
                        normalizedName) + suffix
            };
        }

        function getModule(depMap) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }

            return mod;
        }

        function on(depMap, name, fn) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (hasProp(defined, id) &&
                    (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id]);
                }
            } else {
                mod = getModule(depMap);
                if (mod.error && name === 'error') {
                    fn(mod.error);
                } else {
                    mod.on(name, fn);
                }
            }
        }

        function onError(err, errback) {
            var ids = err.requireModules,
                notified = false;

            if (errback) {
                errback(err);
            } else {
                each(ids, function (id) {
                    var mod = getOwn(registry, id);
                    if (mod) {
                        //Set error on module, so it skips timeout checks.
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });

                if (!notified) {
                    req.onError(err);
                }
            }
        }

        /**
         * Internal method to transfer globalQueue items to this context's
         * defQueue.
         */
        function takeGlobalQueue() {
            //Push all the globalDefQueue items into the context's defQueue
            if (globalDefQueue.length) {
                each(globalDefQueue, function(queueItem) {
                    var id = queueItem[0];
                    if (typeof id === 'string') {
                        context.defQueueMap[id] = true;
                    }
                    defQueue.push(queueItem);
                });
                globalDefQueue = [];
            }
        }

        handlers = {
            'require': function (mod) {
                if (mod.require) {
                    return mod.require;
                } else {
                    return (mod.require = context.makeRequire(mod.map));
                }
            },
            'exports': function (mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    if (mod.exports) {
                        return (defined[mod.map.id] = mod.exports);
                    } else {
                        return (mod.exports = defined[mod.map.id] = {});
                    }
                }
            },
            'module': function (mod) {
                if (mod.module) {
                    return mod.module;
                } else {
                    return (mod.module = {
                        id: mod.map.id,
                        uri: mod.map.url,
                        config: function () {
                            return getOwn(config.config, mod.map.id) || {};
                        },
                        exports: mod.exports || (mod.exports = {})
                    });
                }
            }
        };

        function cleanRegistry(id) {
            //Clean up machinery used for waiting modules.
            delete registry[id];
            delete enabledRegistry[id];
        }

        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;

            if (mod.error) {
                mod.emit('error', mod.error);
            } else {
                traced[id] = true;
                each(mod.depMaps, function (depMap, i) {
                    var depId = depMap.id,
                        dep = getOwn(registry, depId);

                    //Only force things that have not completed
                    //being defined, so still in the registry,
                    //and only if it has not been matched up
                    //in the module already.
                    if (dep && !mod.depMatched[i] && !processed[depId]) {
                        if (getOwn(traced, depId)) {
                            mod.defineDep(i, defined[depId]);
                            mod.check(); //pass false?
                        } else {
                            breakCycle(dep, traced, processed);
                        }
                    }
                });
                processed[id] = true;
            }
        }

        function checkLoaded() {
            var err, usingPathFallback,
                waitInterval = config.waitSeconds * 1000,
                //It is possible to disable the wait interval by using waitSeconds of 0.
                expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
                noLoads = [],
                reqCalls = [],
                stillLoading = false,
                needCycleCheck = true;

            //Do not bother if this call was a result of a cycle break.
            if (inCheckLoaded) {
                return;
            }

            inCheckLoaded = true;

            //Figure out the state of all the modules.
            eachProp(enabledRegistry, function (mod) {
                var map = mod.map,
                    modId = map.id;

                //Skip things that are not enabled or in error state.
                if (!mod.enabled) {
                    return;
                }

                if (!map.isDefine) {
                    reqCalls.push(mod);
                }

                if (!mod.error) {
                    //If the module should be executed, and it has not
                    //been inited and time is up, remember it.
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        } else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    } else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            //No reason to keep looking for unfinished
                            //loading. If the only stillLoading is a
                            //plugin resource though, keep going,
                            //because it may be that a plugin resource
                            //is waiting on a non-plugin cycle.
                            return (needCycleCheck = false);
                        }
                    }
                }
            });

            if (expired && noLoads.length) {
                //If wait time expired, throw error of unloaded modules.
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }

            //Not expired, check for a cycle.
            if (needCycleCheck) {
                each(reqCalls, function (mod) {
                    breakCycle(mod, {}, {});
                });
            }

            //If still waiting on loads, and the waiting load is something
            //other than a plugin resource, or there are still outstanding
            //scripts, then just try back later.
            if ((!expired || usingPathFallback) && stillLoading) {
                //Something is still waiting to load. Wait for it, but only
                //if a timeout is not already in effect.
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }

            inCheckLoaded = false;
        }

        Module = function (map) {
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.shim = getOwn(config.shim, map.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;

            /* this.exports this.factory
               this.depMaps = [],
               this.enabled, this.fetched
            */
        };

        Module.prototype = {
            init: function (depMaps, factory, errback, options) {
                options = options || {};

                //Do not do more inits if already done. Can happen if there
                //are multiple define calls for the same module. That is not
                //a normal, common case, but it is also not unexpected.
                if (this.inited) {
                    return;
                }

                this.factory = factory;

                if (errback) {
                    //Register for errors on this module.
                    this.on('error', errback);
                } else if (this.events.error) {
                    //If no errback already, but there are error listeners
                    //on this module, set up an errback to pass to the deps.
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }

                //Do a copy of the dependency array, so that
                //source inputs are not modified. For example
                //"shim" deps are passed in here directly, and
                //doing a direct modification of the depMaps array
                //would affect that config.
                this.depMaps = depMaps && depMaps.slice(0);

                this.errback = errback;

                //Indicate this module has be initialized
                this.inited = true;

                this.ignore = options.ignore;

                //Could have option to init this module in enabled mode,
                //or could have been previously marked as enabled. However,
                //the dependencies are not known until init is called. So
                //if enabled previously, now trigger dependencies as enabled.
                if (options.enabled || this.enabled) {
                    //Enable this module and dependencies.
                    //Will call this.check()
                    this.enable();
                } else {
                    this.check();
                }
            },

            defineDep: function (i, depExports) {
                //Because of cycles, defined callback for a given
                //export can be called more than once.
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },

            fetch: function () {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;

                context.startTime = (new Date()).getTime();

                var map = this.map;

                //If the manager is for a plugin managed resource,
                //ask the plugin to load it now.
                if (this.shim) {
                    context.makeRequire(this.map, {
                        enableBuildCallback: true
                    })(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                } else {
                    //Regular dependency.
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },

            load: function () {
                var url = this.map.url;

                //Regular dependency.
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },

            /**
             * Checks if the module is ready to define itself, and if so,
             * define it.
             */
            check: function () {
                if (!this.enabled || this.enabling) {
                    return;
                }

                var err, cjsModule,
                    id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory;

                if (!this.inited) {
                    // Only fetch if not already in the defQueue.
                    if (!hasProp(context.defQueueMap, id)) {
                        this.fetch();
                    }
                } else if (this.error) {
                    this.emit('error', this.error);
                } else if (!this.defining) {
                    //The factory could trigger another require call
                    //that would result in checking this module to
                    //define itself again. If already in the process
                    //of doing that, skip this work.
                    this.defining = true;

                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            try {
                                exports = context.execCb(id, factory, depExports, exports);
                            } catch (e) {
                                err = e;
                            }

                            // Favor return value over exports. If node/cjs in play,
                            // then will not have a return value anyway. Favor
                            // module.exports assignment over exports object.
                            if (this.map.isDefine && exports === undefined) {
                                cjsModule = this.module;
                                if (cjsModule) {
                                    exports = cjsModule.exports;
                                } else if (this.usingExports) {
                                    //exports already set the defined value.
                                    exports = this.exports;
                                }
                            }

                            if (err) {
                                // If there is an error listener, favor passing
                                // to that instead of throwing an error. However,
                                // only do it for define()'d  modules. require
                                // errbacks should not be called for failures in
                                // their callbacks (#699). However if a global
                                // onError is set, use that.
                                if ((this.events.error && this.map.isDefine) ||
                                    req.onError !== defaultOnError) {
                                    err.requireMap = this.map;
                                    err.requireModules = this.map.isDefine ? [this.map.id] : null;
                                    err.requireType = this.map.isDefine ? 'define' : 'require';
                                    return onError((this.error = err));
                                } else if (typeof console !== 'undefined' &&
                                           console.error) {
                                    // Log the error for debugging. If promises could be
                                    // used, this would be different, but making do.
                                    console.error(err);
                                } else {
                                    // Do not want to completely lose the error. While this
                                    // will mess up processing and lead to similar results
                                    // as bug 1440, it at least surfaces the error.
                                    req.onError(err);
                                }
                            }
                        } else {
                            //Just a literal value
                            exports = factory;
                        }

                        this.exports = exports;

                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports;

                            if (req.onResourceLoad) {
                                var resLoadMaps = [];
                                each(this.depMaps, function (depMap) {
                                    resLoadMaps.push(depMap.normalizedMap || depMap);
                                });
                                req.onResourceLoad(context, this.map, resLoadMaps);
                            }
                        }

                        //Clean up
                        cleanRegistry(id);

                        this.defined = true;
                    }

                    //Finished the define stage. Allow calling check again
                    //to allow define notifications below in the case of a
                    //cycle.
                    this.defining = false;

                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    }

                }
            },

            callPlugin: function () {
                var map = this.map,
                    id = map.id,
                    //Map already normalized the prefix.
                    pluginMap = makeModuleMap(map.prefix);

                //Mark this as a dependency for this plugin, so it
                //can be traced for cycles.
                this.depMaps.push(pluginMap);

                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var load, normalizedMap, normalizedMod,
                        bundleId = getOwn(bundlesMap, this.map.id),
                        name = this.map.name,
                        parentName = this.map.parentMap ? this.map.parentMap.name : null,
                        localRequire = context.makeRequire(map.parentMap, {
                            enableBuildCallback: true
                        });

                    //If current map is not normalized, wait for that
                    //normalized name to load instead of continuing.
                    if (this.map.unnormalized) {
                        //Normalize the ID if the plugin allows it.
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }

                        //prefix and name should already be normalized, no need
                        //for applying map config again either.
                        normalizedMap = makeModuleMap(map.prefix + '!' + name,
                                                      this.map.parentMap);
                        on(normalizedMap,
                            'defined', bind(this, function (value) {
                                this.map.normalizedMap = normalizedMap;
                                this.init([], function () { return value; }, null, {
                                    enabled: true,
                                    ignore: true
                                });
                            }));

                        normalizedMod = getOwn(registry, normalizedMap.id);
                        if (normalizedMod) {
                            //Mark this as a dependency for this plugin, so it
                            //can be traced for cycles.
                            this.depMaps.push(normalizedMap);

                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }

                        return;
                    }

                    //If a paths config, then just load that file instead to
                    //resolve the plugin, as it is built into that paths layer.
                    if (bundleId) {
                        this.map.url = context.nameToUrl(bundleId);
                        this.load();
                        return;
                    }

                    load = bind(this, function (value) {
                        this.init([], function () { return value; }, null, {
                            enabled: true
                        });
                    });

                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];

                        //Remove temp unnormalized modules for this module,
                        //since they will never be resolved otherwise now.
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                cleanRegistry(mod.map.id);
                            }
                        });

                        onError(err);
                    });

                    //Allow plugins to load other code without having to know the
                    //context or how to 'complete' the load.
                    load.fromText = bind(this, function (text, textAlt) {
                        /*jslint evil: true */
                        var moduleName = map.name,
                            moduleMap = makeModuleMap(moduleName),
                            hasInteractive = useInteractive;

                        //As of 2.1.0, support just passing the text, to reinforce
                        //fromText only being called once per resource. Still
                        //support old style of passing moduleName but discard
                        //that moduleName in favor of the internal ref.
                        if (textAlt) {
                            text = textAlt;
                        }

                        //Turn off interactive script matching for IE for any define
                        //calls in the text, then turn it back on at the end.
                        if (hasInteractive) {
                            useInteractive = false;
                        }

                        //Prime the system by creating a module instance for
                        //it.
                        getModule(moduleMap);

                        //Transfer any config to this other module.
                        if (hasProp(config.config, id)) {
                            config.config[moduleName] = config.config[id];
                        }

                        try {
                            req.exec(text);
                        } catch (e) {
                            return onError(makeError('fromtexteval',
                                             'fromText eval for ' + id +
                                            ' failed: ' + e,
                                             e,
                                             [id]));
                        }

                        if (hasInteractive) {
                            useInteractive = true;
                        }

                        //Mark this as a dependency for the plugin
                        //resource
                        this.depMaps.push(moduleMap);

                        //Support anonymous modules.
                        context.completeLoad(moduleName);

                        //Bind the value of that module to the value for this
                        //resource ID.
                        localRequire([moduleName], load);
                    });

                    //Use parentName here since the plugin's name is not reliable,
                    //could be some weird string with no path that actually wants to
                    //reference the parentName's path.
                    plugin.load(map.name, localRequire, load, config);
                }));

                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },

            enable: function () {
                enabledRegistry[this.map.id] = this;
                this.enabled = true;

                //Set flag mentioning that the module is enabling,
                //so that immediate calls to the defined callbacks
                //for dependencies do not trigger inadvertent load
                //with the depCount still being zero.
                this.enabling = true;

                //Enable each dependency
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;

                    if (typeof depMap === 'string') {
                        //Dependency needs to be converted to a depMap
                        //and wired up to this module.
                        depMap = makeModuleMap(depMap,
                                               (this.map.isDefine ? this.map : this.map.parentMap),
                                               false,
                                               !this.skipMap);
                        this.depMaps[i] = depMap;

                        handler = getOwn(handlers, depMap.id);

                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }

                        this.depCount += 1;

                        on(depMap, 'defined', bind(this, function (depExports) {
                            if (this.undefed) {
                                return;
                            }
                            this.defineDep(i, depExports);
                            this.check();
                        }));

                        if (this.errback) {
                            on(depMap, 'error', bind(this, this.errback));
                        } else if (this.events.error) {
                            // No direct errback on this module, but something
                            // else is listening for errors, so be sure to
                            // propagate the error correctly.
                            on(depMap, 'error', bind(this, function(err) {
                                this.emit('error', err);
                            }));
                        }
                    }

                    id = depMap.id;
                    mod = registry[id];

                    //Skip special modules like 'require', 'exports', 'module'
                    //Also, don't call enable if it is already enabled,
                    //important in circular dependency cases.
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));

                //Enable each plugin that is used in
                //a dependency
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));

                this.enabling = false;

                this.check();
            },

            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },

            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    //Now that the error handler was triggered, remove
                    //the listeners, since this broken Module instance
                    //can stay around for a while in the registry.
                    delete this.events[name];
                }
            }
        };

        function callGetModule(args) {
            //Skip modules already defined.
            if (!hasProp(defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
            }
        }

        function removeListener(node, func, name, ieName) {
            //Favor detachEvent because of IE9
            //issue, see attachEvent/addEventListener comment elsewhere
            //in this file.
            if (node.detachEvent && !isOpera) {
                //Probably IE. If not it will throw an error, which will be
                //useful to know.
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        }

        /**
         * Given an event from a script node, get the requirejs info from it,
         * and then removes the event listeners on the node.
         * @param {Event} evt
         * @returns {Object}
         */
        function getScriptData(evt) {
            //Using currentTarget instead of target for Firefox 2.0's sake. Not
            //all old browsers will be supported, but this one was easy enough
            //to support and still makes sense.
            var node = evt.currentTarget || evt.srcElement;

            //Remove the listeners once here.
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');

            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }

        function intakeDefines() {
            var args;

            //Any defined modules in the global queue, intake them now.
            takeGlobalQueue();

            //Make sure any remaining defQueue items get properly processed.
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' +
                        args[args.length - 1]));
                } else {
                    //args are id, deps, factory. Should be normalized by the
                    //define() function.
                    callGetModule(args);
                }
            }
            context.defQueueMap = {};
        }

        context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            defQueueMap: {},
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,
            onError: onError,

            /**
             * Set a configuration for the context.
             * @param {Object} cfg config object to integrate.
             */
            configure: function (cfg) {
                //Make sure the baseUrl ends in a slash.
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }

                //Save off the paths since they require special processing,
                //they are additive.
                var shim = config.shim,
                    objs = {
                        paths: true,
                        bundles: true,
                        config: true,
                        map: true
                    };

                eachProp(cfg, function (value, prop) {
                    if (objs[prop]) {
                        if (!config[prop]) {
                            config[prop] = {};
                        }
                        mixin(config[prop], value, true, true);
                    } else {
                        config[prop] = value;
                    }
                });

                //Reverse map the bundles
                if (cfg.bundles) {
                    eachProp(cfg.bundles, function (value, prop) {
                        each(value, function (v) {
                            if (v !== prop) {
                                bundlesMap[v] = prop;
                            }
                        });
                    });
                }

                //Merge shim
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        //Normalize the structure
                        if (isArray(value)) {
                            value = {
                                deps: value
                            };
                        }
                        if ((value.exports || value.init) && !value.exportsFn) {
                            value.exportsFn = context.makeShimExports(value);
                        }
                        shim[id] = value;
                    });
                    config.shim = shim;
                }

                //Adjust packages if necessary.
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location, name;

                        pkgObj = typeof pkgObj === 'string' ? {name: pkgObj} : pkgObj;

                        name = pkgObj.name;
                        location = pkgObj.location;
                        if (location) {
                            config.paths[name] = pkgObj.location;
                        }

                        //Save pointer to main module ID for pkg name.
                        //Remove leading dot in main, so main paths are normalized,
                        //and remove any trailing .js, since different package
                        //envs have different conventions: some use a module name,
                        //some use a file name.
                        config.pkgs[name] = pkgObj.name + '/' + (pkgObj.main || 'main')
                                     .replace(currDirRegExp, '')
                                     .replace(jsSuffixRegExp, '');
                    });
                }

                //If there are any "waiting to execute" modules in the registry,
                //update the maps for them, since their info, like URLs to load,
                //may have changed.
                eachProp(registry, function (mod, id) {
                    //If module already has init called, since it is too
                    //late to modify them, and ignore unnormalized ones
                    //since they are transient.
                    if (!mod.inited && !mod.map.unnormalized) {
                        mod.map = makeModuleMap(id, null, true);
                    }
                });

                //If a deps array or a config callback is specified, then call
                //require with those args. This is useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },

            makeShimExports: function (value) {
                function fn() {
                    var ret;
                    if (value.init) {
                        ret = value.init.apply(global, arguments);
                    }
                    return ret || (value.exports && getGlobal(value.exports));
                }
                return fn;
            },

            makeRequire: function (relMap, options) {
                options = options || {};

                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;

                    if (options.enableBuildCallback && callback && isFunction(callback)) {
                        callback.__requireJsBuild = true;
                    }

                    if (typeof deps === 'string') {
                        if (isFunction(callback)) {
                            //Invalid call
                            return onError(makeError('requireargs', 'Invalid require call'), errback);
                        }

                        //If require|exports|module are requested, get the
                        //value for them from the special handlers. Caveat:
                        //this only works while module is being defined.
                        if (relMap && hasProp(handlers, deps)) {
                            return handlers[deps](registry[relMap.id]);
                        }

                        //Synchronous access to one module. If require.get is
                        //available (as in the Node adapter), prefer that.
                        if (req.get) {
                            return req.get(context, deps, relMap, localRequire);
                        }

                        //Normalize module name, if it contains . or ..
                        map = makeModuleMap(deps, relMap, false, true);
                        id = map.id;

                        if (!hasProp(defined, id)) {
                            return onError(makeError('notloaded', 'Module name "' +
                                        id +
                                        '" has not been loaded yet for context: ' +
                                        contextName +
                                        (relMap ? '' : '. Use require([])')));
                        }
                        return defined[id];
                    }

                    //Grab defines waiting in the global queue.
                    intakeDefines();

                    //Mark all the dependencies as needing to be loaded.
                    context.nextTick(function () {
                        //Some defines could have been added since the
                        //require call, collect them.
                        intakeDefines();

                        requireMod = getModule(makeModuleMap(null, relMap));

                        //Store if map config should be applied to this require
                        //call for dependencies.
                        requireMod.skipMap = options.skipMap;

                        requireMod.init(deps, callback, errback, {
                            enabled: true
                        });

                        checkLoaded();
                    });

                    return localRequire;
                }

                mixin(localRequire, {
                    isBrowser: isBrowser,

                    /**
                     * Converts a module name + .extension into an URL path.
                     * *Requires* the use of a module name. It does not support using
                     * plain URLs like nameToUrl.
                     */
                    toUrl: function (moduleNamePlusExt) {
                        var ext,
                            index = moduleNamePlusExt.lastIndexOf('.'),
                            segment = moduleNamePlusExt.split('/')[0],
                            isRelative = segment === '.' || segment === '..';

                        //Have a file extension alias, and it is not the
                        //dots from a relative path.
                        if (index !== -1 && (!isRelative || index > 1)) {
                            ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                            moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                        }

                        return context.nameToUrl(normalize(moduleNamePlusExt,
                                                relMap && relMap.id, true), ext,  true);
                    },

                    defined: function (id) {
                        return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
                    },

                    specified: function (id) {
                        id = makeModuleMap(id, relMap, false, true).id;
                        return hasProp(defined, id) || hasProp(registry, id);
                    }
                });

                //Only allow undef on top level require calls
                if (!relMap) {
                    localRequire.undef = function (id) {
                        //Bind any waiting define() calls to this context,
                        //fix for #408
                        takeGlobalQueue();

                        var map = makeModuleMap(id, relMap, true),
                            mod = getOwn(registry, id);

                        mod.undefed = true;
                        removeScript(id);

                        delete defined[id];
                        delete urlFetched[map.url];
                        delete undefEvents[id];

                        //Clean queued defines too. Go backwards
                        //in array so that the splices do not
                        //mess up the iteration.
                        eachReverse(defQueue, function(args, i) {
                            if (args[0] === id) {
                                defQueue.splice(i, 1);
                            }
                        });
                        delete context.defQueueMap[id];

                        if (mod) {
                            //Hold on to listeners in case the
                            //module will be attempted to be reloaded
                            //using a different config.
                            if (mod.events.defined) {
                                undefEvents[id] = mod.events;
                            }

                            cleanRegistry(id);
                        }
                    };
                }

                return localRequire;
            },

            /**
             * Called to enable a module if it is still in the registry
             * awaiting enablement. A second arg, parent, the parent module,
             * is passed in for context, when this method is overridden by
             * the optimizer. Not shown here to keep code compact.
             */
            enable: function (depMap) {
                var mod = getOwn(registry, depMap.id);
                if (mod) {
                    getModule(depMap).enable();
                }
            },

            /**
             * Internal method used by environment adapters to complete a load event.
             * A load event could be a script load or just a load pass from a synchronous
             * load call.
             * @param {String} moduleName the name of the module to potentially complete.
             */
            completeLoad: function (moduleName) {
                var found, args, mod,
                    shim = getOwn(config.shim, moduleName) || {},
                    shExports = shim.exports;

                takeGlobalQueue();

                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        //If already found an anonymous module and bound it
                        //to this name, then this is some other anon module
                        //waiting for its completeLoad to fire.
                        if (found) {
                            break;
                        }
                        found = true;
                    } else if (args[0] === moduleName) {
                        //Found matching define call for this script!
                        found = true;
                    }

                    callGetModule(args);
                }
                context.defQueueMap = {};

                //Do this after the cycle of callGetModule in case the result
                //of those calls/init calls changes the registry.
                mod = getOwn(registry, moduleName);

                if (!found && !hasProp(defined, moduleName) && mod && !mod.inited) {
                    if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        } else {
                            return onError(makeError('nodefine',
                                             'No define call for ' + moduleName,
                                             null,
                                             [moduleName]));
                        }
                    } else {
                        //A script that does not call define(), so just simulate
                        //the call for it.
                        callGetModule([moduleName, (shim.deps || []), shim.exportsFn]);
                    }
                }

                checkLoaded();
            },

            /**
             * Converts a module name to a file path. Supports cases where
             * moduleName may actually be just an URL.
             * Note that it **does not** call normalize on the moduleName,
             * it is assumed to have already been normalized. This is an
             * internal API, not a public one. Use toUrl for the public API.
             */
            nameToUrl: function (moduleName, ext, skipExt) {
                var paths, syms, i, parentModule, url,
                    parentPath, bundleId,
                    pkgMain = getOwn(config.pkgs, moduleName);

                if (pkgMain) {
                    moduleName = pkgMain;
                }

                bundleId = getOwn(bundlesMap, moduleName);

                if (bundleId) {
                    return context.nameToUrl(bundleId, ext, skipExt);
                }

                //If a colon is in the URL, it indicates a protocol is used and it is just
                //an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
                //or ends with .js, then assume the user meant to use an url and not a module id.
                //The slash is important for protocol-less URLs as well as full paths.
                if (req.jsExtRegExp.test(moduleName)) {
                    //Just a plain path, not module name lookup, so just return it.
                    //Add extension if it is included. This is a bit wonky, only non-.js things pass
                    //an extension, this method probably needs to be reworked.
                    url = moduleName + (ext || '');
                } else {
                    //A module that needs to be converted to a path.
                    paths = config.paths;

                    syms = moduleName.split('/');
                    //For each module name segment, see if there is a path
                    //registered for it. Start with most specific name
                    //and work up from it.
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');

                        parentPath = getOwn(paths, parentModule);
                        if (parentPath) {
                            //If an array, it means there are a few choices,
                            //Choose the one that is desired
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        }
                    }

                    //Join the path parts together, then figure out if baseUrl is needed.
                    url = syms.join('/');
                    url += (ext || (/^data\:|\?/.test(url) || skipExt ? '' : '.js'));
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : config.baseUrl) + url;
                }

                return config.urlArgs ? url +
                                        ((url.indexOf('?') === -1 ? '?' : '&') +
                                         config.urlArgs) : url;
            },

            //Delegates to req.load. Broken out as a separate function to
            //allow overriding in the optimizer.
            load: function (id, url) {
                req.load(context, id, url);
            },

            /**
             * Executes a module callback function. Broken out as a separate function
             * solely to allow the build system to sequence the files in the built
             * layer in the right sequence.
             *
             * @private
             */
            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args);
            },

            /**
             * callback for script loads, used to check status of loading.
             *
             * @param {Event} evt the event from the browser for the script
             * that was loaded.
             */
            onScriptLoad: function (evt) {
                //Using currentTarget instead of target for Firefox 2.0's sake. Not
                //all old browsers will be supported, but this one was easy enough
                //to support and still makes sense.
                if (evt.type === 'load' ||
                        (readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
                    //Reset interactive script so a script node is not held onto for
                    //to long.
                    interactiveScript = null;

                    //Pull out the name of the module and the context.
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },

            /**
             * Callback for script errors.
             */
            onScriptError: function (evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    var parents = [];
                    eachProp(registry, function(value, key) {
                        if (key.indexOf('_@r') !== 0) {
                            each(value.depMaps, function(depMap) {
                                if (depMap.id === data.id) {
                                    parents.push(key);
                                }
                                return true;
                            });
                        }
                    });
                    return onError(makeError('scripterror', 'Script error for "' + data.id +
                                             (parents.length ?
                                             '", needed by: ' + parents.join(', ') :
                                             '"'), evt, [data.id]));
                }
            }
        };

        context.require = context.makeRequire();
        return context;
    }

    /**
     * Main entry point.
     *
     * If the only argument to require is a string, then the module that
     * is represented by that string is fetched for the appropriate context.
     *
     * If the first argument is an array, then it will be treated as an array
     * of dependency string names to fetch. An optional function callback can
     * be specified to execute when all of those dependencies are available.
     *
     * Make a local req variable to help Caja compliance (it assumes things
     * on a require that are not standardized), and to give a short
     * name for minification/local scope use.
     */
    req = requirejs = function (deps, callback, errback, optional) {

        //Find the right context, use default
        var context, config,
            contextName = defContextName;

        // Determine if have config object in the call.
        if (!isArray(deps) && typeof deps !== 'string') {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = errback;
                errback = optional;
            } else {
                deps = [];
            }
        }

        if (config && config.context) {
            contextName = config.context;
        }

        context = getOwn(contexts, contextName);
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }

        if (config) {
            context.configure(config);
        }

        return context.require(deps, callback, errback);
    };

    /**
     * Support require.config() to make it easier to cooperate with other
     * AMD loaders on globally agreed names.
     */
    req.config = function (config) {
        return req(config);
    };

    /**
     * Execute something after the current tick
     * of the event loop. Override for other envs
     * that have a better solution than setTimeout.
     * @param  {Function} fn function to execute later.
     */
    req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
        setTimeout(fn, 4);
    } : function (fn) { fn(); };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    req.version = version;

    //Used to filter out dependencies that are already paths.
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };

    //Create default context.
    req({});

    //Exports some context-sensitive methods on global require.
    each([
        'toUrl',
        'undef',
        'defined',
        'specified'
    ], function (prop) {
        //Reference from contexts instead of early binding to default context,
        //so that during builds, the latest instance of the default context
        //with its config gets used.
        req[prop] = function () {
            var ctx = contexts[defContextName];
            return ctx.require[prop].apply(ctx, arguments);
        };
    });

    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        //If BASE tag is in play, using appendChild is a problem for IE6.
        //When that browser dies, this can be removed. Details in this jQuery bug:
        //http://dev.jquery.com/ticket/2709
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }

    /**
     * Any errors that require explicitly generates will be passed to this
     * function. Intercept/override it if you want custom error handling.
     * @param {Error} err the error object.
     */
    req.onError = defaultOnError;

    /**
     * Creates the node for the load command. Only used in browser envs.
     */
    req.createNode = function (config, moduleName, url) {
        var node = config.xhtml ?
                document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
                document.createElement('script');
        node.type = config.scriptType || 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        return node;
    };

    /**
     * Does the request to load a module for the browser case.
     * Make this a separate function to allow other environments
     * to override it.
     *
     * @param {Object} context the require context to find state.
     * @param {String} moduleName the name of the module.
     * @param {Object} url the URL to the module.
     */
    req.load = function (context, moduleName, url) {
        var config = (context && context.config) || {},
            node;
        if (isBrowser) {
            //In the browser so use a script tag
            node = req.createNode(config, moduleName, url);
            if (config.onNodeCreated) {
                config.onNodeCreated(node, config, moduleName, url);
            }

            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);

            //Set up load listener. Test attachEvent first because IE9 has
            //a subtle issue in its addEventListener and script onload firings
            //that do not match the behavior of all other browsers with
            //addEventListener support, which fire the onload event for a
            //script right after the script execution. See:
            //https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
            //UNFORTUNATELY Opera implements attachEvent but does not follow the script
            //script execution mode.
            if (node.attachEvent &&
                    //Check if node.attachEvent is artificially added by custom script or
                    //natively supported by browser
                    //read https://github.com/jrburke/requirejs/issues/187
                    //if we can NOT find [native code] then it must NOT natively supported.
                    //in IE8, node.attachEvent does not have toString()
                    //Note the test for "[native code" with no closing brace, see:
                    //https://github.com/jrburke/requirejs/issues/273
                    !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
                    !isOpera) {
                //Probably IE. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous define call to a name.
                //However, IE reports the script as being in 'interactive'
                //readyState at the time of the define call.
                useInteractive = true;

                node.attachEvent('onreadystatechange', context.onScriptLoad);
                //It would be great to add an error handler here to catch
                //404s in IE9+. However, onreadystatechange will fire before
                //the error handler, so that does not help. If addEventListener
                //is used, then IE will fire error before load, but we cannot
                //use that pathway given the connect.microsoft.com issue
                //mentioned above about not doing the 'script execute,
                //then fire the script load event listener before execute
                //next script' that other browsers do.
                //Best hope: IE10 fixes the issues,
                //and then destroys all installs of IE 6-9.
                //node.attachEvent('onerror', context.onScriptError);
            } else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;

            //For some cache cases in IE 6-8, the script executes before the end
            //of the appendChild execution, so to tie an anonymous define
            //call to the module name (which is stored on the node), hold on
            //to a reference to this node, but clear after the DOM insertion.
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;

            return node;
        } else if (isWebWorker) {
            try {
                //In a web worker, use importScripts. This is not a very
                //efficient use of importScripts, importScripts will block until
                //its script is downloaded and evaluated. However, if web workers
                //are in play, the expectation is that a build has been done so
                //that only one script needs to be loaded anyway. This may need
                //to be reevaluated if other use cases become common.
                importScripts(url);

                //Account for anonymous modules
                context.completeLoad(moduleName);
            } catch (e) {
                context.onError(makeError('importscripts',
                                'importScripts failed for ' +
                                    moduleName + ' at ' + url,
                                e,
                                [moduleName]));
            }
        }
    };

    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }

        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return (interactiveScript = script);
            }
        });
        return interactiveScript;
    }

    //Look for a data-main script attribute, which could also adjust the baseUrl.
    if (isBrowser && !cfg.skipDataMain) {
        //Figure out baseUrl. Get it from the script tag with require.js in it.
        eachReverse(scripts(), function (script) {
            //Set the 'head' where we can append children by
            //using the script's parent.
            if (!head) {
                head = script.parentNode;
            }

            //Look for a data-main attribute to set main script for the page
            //to load. If it is there, the path to data main becomes the
            //baseUrl, if it is not already set.
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                //Preserve dataMain in case it is a path (i.e. contains '?')
                mainScript = dataMain;

                //Set final baseUrl if there is not already an explicit one.
                if (!cfg.baseUrl) {
                    //Pull off the directory of data-main for use as the
                    //baseUrl.
                    src = mainScript.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/')  + '/' : './';

                    cfg.baseUrl = subPath;
                }

                //Strip off any trailing .js since mainScript is now
                //like a module name.
                mainScript = mainScript.replace(jsSuffixRegExp, '');

                //If mainScript is still a path, fall back to dataMain
                if (req.jsExtRegExp.test(mainScript)) {
                    mainScript = dataMain;
                }

                //Put the data-main script in the files to load.
                cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript];

                return true;
            }
        });
    }

    /**
     * The function that handles definitions of modules. Differs from
     * require() in that a string for the module should be the first argument,
     * and the function to execute after dependencies are loaded should
     * return a value to define the module corresponding to the first argument's
     * name.
     */
    define = function (name, deps, callback) {
        var node, context;

        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps;
            deps = null;
        }

        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!deps && isFunction(callback)) {
            deps = [];
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, '')
                    .replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep);
                    });

                //May be a CommonJS thing even without require calls, but still
                //could use exports, and module. Avoid doing exports and module
                //work though if it just needs require.
                //REQUIRES the function to expect the CommonJS variables in the
                //order listed below.
                deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
            }
        }

        //If in IE 6-8 and hit an anonymous define() call, do the interactive
        //work.
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }

        //Always save off evaluating the def call until the script onload handler.
        //This allows multiple modules to be in a file without prematurely
        //tracing dependencies, and allows for anonymous module support,
        //where the module name is not known until the script onload event
        //occurs. If no context, use the global queue, and get it processed
        //in the onscript load callback.
        if (context) {
            context.defQueue.push([name, deps, callback]);
            context.defQueueMap[name] = true;
        } else {
            globalDefQueue.push([name, deps, callback]);
        }
    };

    define.amd = {
        jQuery: true
    };

    /**
     * Executes the text. Normally just uses eval, but can be modified
     * to use a better, environment-specific call. Only used for transpiling
     * loader plugins, not for plain JS modules.
     * @param {String} text the text to execute/evaluate.
     */
    req.exec = function (text) {
        /*jslint evil: true */
        return eval(text);
    };

    //Set up with config info.
    req(cfg);
}(this));

define('configUtils', [
    'require',
    'exports',
    'module'
], function (require, exports, module) {
    var config = window.APP_CONFIG;
    var serverConfig = {};
    if (config.SERVER_CONFIG_API) {
        var serverConfig = null;
        ajax({
            url: config.SERVER_CONFIG_API,
            async: false,
            success: function (response) {
                serverConfig = JSON.parse(response);
            },
            fail: function (status) {
                console.error('AJAX SERVER_CONFIG_API ERROR');
            }
        });
    }
    config = $.extend(true, {}, config, serverConfig);
    function ajax(options) {
        options = options || {};
        options.type = (options.type || 'GET').toUpperCase();
        options.dataType = options.dataType || 'json';
        var params = formatParams(options.url, options.data);
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else {
            var xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status >= 200 && status < 300) {
                    options.success && options.success(xhr.responseText, xhr.responseXML);
                } else {
                    options.fail && options.fail(status);
                }
            }
        };
        if (options.url.indexOf('?') >= 0) {
            options.url = options.url.substring(0, options.url.indexOf('?'));
        }
        if (options.type == 'GET') {
            xhr.open('GET', options.url + '?' + params, options.async);
            xhr.send(null);
        } else if (options.type == 'POST') {
            xhr.open('POST', options.url, options.async);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(params);
        }
    }
    function formatParams(url, data) {
        var arr = [];
        if (url.indexOf('?') >= 0) {
            var arr = url.substr(url.indexOf('?') + 1).split('&');
        }
        for (var name in data) {
            arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
        }
        arr.push(('v=' + Math.random()).replace('.', ''));
        return arr.join('&');
    }
    var platformConfig = localStorage.getItem('schoolConfig');
    if (platformConfig) {
        if (typeof platformConfig == 'string') {
            platformConfig = JSON.parse(platformConfig);
        }
        if (platformConfig.footer && platformConfig.footer.normal) {
            config['FOOTER_TEXT'] = platformConfig.footer.normal;
        }
        if (platformConfig.skin) {
            config['THEME'] = platformConfig.skin;
        }
        if (platformConfig.rootPath) {
            config['APP_INFO_ROOT_PATH'] = platformConfig.rootPath;
        }
    }
    return config;
});
define('router', [
    'require',
    'exports',
    'module'
], function (require, exports, module) {
    var router = new Router();
    router.init();
    return router;
});
define('log', [
    'require',
    'exports',
    'module'
], function (require, exports, module) {
    var log = {
        error: function (message) {
            console.error(message);
        },
        debug: function (message) {
            console.log(message);
        },
        warn: function (message) {
            console.warn(message);
        }
    };
    return log;
});
define('utils', [
    'require',
    'exports',
    'module',
    'configUtils',
    'router',
    'log'
], function (require, exports, module) {
    var configUtils = require('configUtils');
    var router = require('router');
    var log = require('log');
    var req = require;
    var utils = {
        loadCompiledPage: function (relativePath, req) {
            var innerIndexMode = utils.getConfig('INNER_INDEX_MODE');
            var debug = utils.getConfig('DEBUG_MODE');
            if (!debug && window.__Template) {
                return new Hogan.Template(__Template[relativePath]);
            }
            var currentRoute = utils.getCurrentRoute();
            var html = '';
            var url = null;
            if (req) {
                url = this.getPageFullPath(relativePath, req) + '.html';
            } else {
                url = './modules/' + currentRoute + '/' + relativePath + '.html';
            }
            if (innerIndexMode) {
                url = '.' + url;
            }
            $.ajax({
                url: url,
                dataType: 'html',
                async: false,
                cache: false
            }).done(function (res) {
                html = res;
            });
            return Hogan.compile(html);
        },
        getPageFullPath: function (relativePath, req) {
            var html = null;
            var pageFullPath = '';
            try {
                html = req('text!./' + relativePath + '.html');
            } catch (error) {
                pageFullPath = error.message.match('text!(.*).html')[1];
                pageFullPath = './' + pageFullPath;
            }
            return pageFullPath;
        },
        loadCompiledPage2: function (relativePath) {
            var html = null;
            try {
                html = req('text!./' + relativePath + '.html');
            } catch (error) {
                var modulePath = error.message.match('text!(.*).html')[1];
                modulePath = './' + modulePath + '.html';
                $.ajax({
                    url: modulePath,
                    dataType: 'html',
                    async: false,
                    cache: false
                }).done(function (res) {
                    html = res;
                });
                return Hogan.compile(html);
            }
        },
        getCurrentRoute: function () {
            var currentRoute = router.getRoute()[0];
            return currentRoute;
        },
        getEcharts: function () {
            var def = $.Deferred();
            req(['echarts'], function (ec) {
                def.resolve(ec);
            });
            return def.promise();
        },
        miniMode: function () {
            $('header').hide();
            $('footer').remove();
            $('main').css({
                'margin-top': '0',
                'max-width': 'none',
                'width': '100%',
                'padding': '0'
            });
            $(document).trigger('resize');
        },
        getUserParams: function () {
            var params = {};
            var search = location.search && location.search.substr(1);
            if (search) {
                var paramsArr = search.split('&');
                _.each(paramsArr, function (item) {
                    var kv = item.split('=');
                    if (kv.length == 2) {
                        params[kv[0]] = kv[1];
                    }
                });
            }
            return params;
        },
        getEcharts3: function ($elem, option, isNotEmpty) {
            var def = $.Deferred();
            $elem = $($elem);
            req(['echarts'], function (ec) {
                var myChart = ec.init($elem[0]);
                if (!isNotEmpty) {
                    $elem.html('<div style="display:table;width:100%;height:100%;"><div class="bh-color-primary-3" style="text-align:center;vertical-align:middle;display:table-cell;"><i class="iconfont" style="font-size:128px;">&#xe62a;</i><br><span class="h3" style="color:#999">暂无数据</span></div></div>');
                    def.reject(myChart);
                }
                myChart.setOption(option);
                def.resolve(myChart);
            });
            return def.promise();
        },
        getConfig: function (key) {
            return configUtils[key];
        },
        switchModule: function (moduleName) {
            var baseUrl = location.href.replace(/\#.*/, '');
            location.href = baseUrl + '#/' + moduleName;
        },
        goto: function (path, blank) {
            var currentRoute = utils.getCurrentRoute();
            var baseUrl = location.href.replace(/\#.*/, '');
            if (blank) {
                window.open('#/' + path);
                return;
            }
            if (('#/' + path).indexOf('#/' + currentRoute) >= 0) {
                location.href = baseUrl + '#/' + path;
                location.reload();
            } else {
                location.href = baseUrl + '#/' + path;
            }
        },
        doAjax: function (url, params, method) {
            var deferred = $.Deferred();
            var feDebugMode = utils.getConfig('FE_DEBUG_MODE');
            if (typeof url === 'object') {
                return deferred.resolve(url);
            }
            if (_.endsWith(url, '.do') && feDebugMode) {
                log.error('正式开发环境需去掉config.js中的\u201CFE_DEBUG_MODE\u201D配置项\uFF01\uFF01\uFF01');
                return;
            }
            $('.app-ajax-loading').jqxLoader('open');
            $.ajax({
                type: method || 'POST',
                url: url,
                traditional: true,
                data: params || {},
                dataType: 'json',
                success: function (resp) {
                    try {
                        if (typeof resp == 'string') {
                            resp = JSON.parse(resp);
                        }
                        if (typeof resp.loginURL != 'undefined' && resp.loginURL != '') {
                            window.location.href = resp.loginURL;
                        }
                    } catch (e) {
                        console.log(e);
                    }
                    $('.app-ajax-loading').jqxLoader('close');
                    deferred.resolve(resp);
                },
                error: function (resp) {
                    $('.app-ajax-loading').jqxLoader('close');
                    var result = JSON.parse(resp.responseText);
                    if (typeof result.loginURL != 'undefined' && resp.loginURL != '') {
                        window.location.href = result.loginURL;
                    }
                    deferred.reject(resp);
                }
            });
            return deferred.promise();
        },
        doSyncAjax: function (url, params, method) {
            var resp = $.ajax({
                type: method || 'GET',
                url: url,
                traditional: true,
                data: params || {},
                dataType: 'json',
                cache: false,
                async: false,
                error: function (resp) {
                    var result = JSON.parse(resp.responseText);
                    if (typeof result.loginURL != 'undefined' && resp.loginURL != '') {
                        window.location.href = result.loginURL;
                    }
                }
            });
            if (resp.status != 200) {
                return {};
            }
            var result = JSON.parse(resp.responseText);
            if (typeof result.loginURL != 'undefined' && resp.loginURL != '') {
                window.location.href = result.loginURL;
            }
            return result;
        },
        openModalDialog: function (options) {
            $(options.element).jqxWindow({
                width: options.width || 550,
                height: options.height || 220,
                closeButtonSize: 24,
                showCloseButton: true,
                resizable: false,
                autoOpen: false,
                draggable: false,
                isModal: true,
                title: options.title,
                content: options.content
            });
            $(options.element).addClass('global-dialog-instance');
            $(options.element).jqxWindow('open');
            $(options.element).find(options.closeElement).click(function () {
                $(options.element).jqxWindow('close');
            });
        },
        warningDialog: function (options) {
            if (!options)
                return;
            var buttonList = [
                {
                    text: '确认',
                    className: 'bh-btn-warning'
                },
                {
                    text: '取消',
                    className: 'bh-btn-default'
                }
            ];
            if (options.callback) {
                buttonList[0].callback = options.callback;
            }
            ;
            var params = {
                iconType: 'warning',
                title: options.title,
                content: options.content,
                buttons: options.buttons || buttonList
            };
            if (options.height) {
                params['height'] = options.height;
            }
            if (options.width) {
                params['width'] = options.width;
            }
            $.bhDialog(params);
        },
        dialog: function (options) {
            var type = options.type || 'success', content = options.content, params = null, buttonList = [];
            var okClass = null, iconType = null;
            if (type == 'success' || type == 'done') {
                okClass = 'bh-btn-success';
                iconType = 'success';
            } else if (type == 'warn' || type == 'warning' || type == 'warning') {
                okClass = 'bh-btn-warning';
                iconType = 'warning';
            } else if (type == 'danger' || type == 'error') {
                okClass = 'bh-btn-danger';
                iconType = 'danger';
            } else if (type == 'confirm') {
                okClass = 'bh-btn-warning';
                iconType = 'warning';
            } else {
                return;
            }
            options.iconType = iconType;
            if (options.okCallback) {
                var okButtonInfo = {
                    text: options.okText || '确认',
                    className: okClass,
                    callback: options.okCallback
                };
                buttonList.push(okButtonInfo);
            }
            ;
            if (options.cancelCallback) {
                var cancelButtonInfo = {
                    text: options.noText || options.cancelText || '取消',
                    className: 'bh-btn-default',
                    callback: options.cancelCallback
                };
                buttonList.push(cancelButtonInfo);
            }
            if (options.okCallback && !options.cancelCallback && type == 'confirm') {
                buttonList.push({
                    text: options.noText || options.cancelText || '取消',
                    className: 'bh-btn-default'
                });
            }
            options.buttons = options.buttonList || buttonList;
            $.bhDialog(options);
        },
        window: function (options) {
            var params = options.params || {};
            var title = options.title, content = options.content, btns = options.buttons || options.btns, callback = options.callback;
            if (options.width) {
                params.width = options.width;
            }
            if (options.height) {
                params.height = options.height;
            }
            if (options.inIframe) {
                params.inIframe = options.inIframe;
            }
            return BH_UTILS.bhWindow(content, title, btns, params, callback);
        }
    };
    return utils;
});
define('resourceConfig', [
    'require',
    'exports',
    'module'
], function (require, exports, module) {
    var config = {
        'PUBLIC_CSS': [
            '/fe_components/iconfont/iconfont.css',
            '/fe_components/jqwidget/{{theme}}/bh{{version}}.min.css',
            '/fe_components/jqwidget/{{theme}}/bh-scenes.min.css',
            '/bower_components/animate.css/animate.min.css'
        ],
        'PUBLIC_BASE_JS': [
            '/fe_components/bh_utils.js',
            '/fe_components/amp/ampPlugins.min.js'
        ],
        'PUBLIC_NORMAL_JS': [
            '/fe_components/bh{{version}}.min.js',
            '/fe_components/jqwidget/jqxwidget.min.js'
        ],
        'DEBUG_JS': ['/fe_components/mock/mock.js'],
        'IE_SHIV_JS': ['/bower_components/html5shiv/dist/html5shiv.min.js']
    };
    return config;
});
define('ubaseUtils', [
    'require',
    'exports',
    'module',
    'configUtils',
    'router',
    'utils'
], function (require, exports, module) {
    var configUtils = require('configUtils');
    var router = require('router');
    var utils = require('utils');
    var req = require;
    var ubaseUtils = {
        getSortedModules: function () {
            var modules = utils.getConfig('MODULES');
            modules = _.sortBy(modules, function (obj) {
                return -obj.route.length;
            });
            return modules;
        },
        showLoading: function () {
            $('.app-loading').addClass('app-loading-show');
        },
        hideLoading: function () {
            $('.app-loading').removeClass('app-loading-show');
        },
        cleanMainArea: function () {
            $('body>main').empty();
        },
        genMainLayout: function () {
            var layout = '<div id="headerPlaceholder"></div>' + '<div class="sc-container-outerFrame">' + '<div class="sc-container bh-border-h" bh-container-role="container">' + '<div id="bodyPlaceholder"></div>' + '</div>' + '</div>' + '<div id="footerPlaceholder"></div>' + '<div id="levityPlaceholder"></div>';
            $('body').prepend(layout);
        },
        getFixedMainLayout: function () {
            var layout = '<header></header><main></main><footer></footer>';
            $('body').prepend(layout);
        },
        getFirstModules: function () {
            var modules = utils.getConfig('MODULES');
            var appEntry = utils.getConfig('APP_ENTRY');
            if (_.isEmpty(modules)) {
                return '';
            }
            return (appEntry || modules[0].route).trim();
        },
        renderHeader: function () {
            var headerData = utils.getConfig('HEADER');
            var modules = utils.getConfig('MODULES') || [];
            var appEntry = ubaseUtils.getFirstModules();
            var appTitle = utils.getConfig('APP_TITLE');
            var nav = [];
            var hash = window.location.hash;
            hash = hash.replace('#/', '');
            if (hash.indexOf('/') != -1) {
                hash = hash.substring(0, hash.indexOf('/'));
            }
            for (var i = 0; i < modules.length; i++) {
                (function () {
                    var navItem = {
                        title: modules[i].title,
                        route: modules[i].route,
                        hide: modules[i].hide,
                        isOpenNewPage: modules[i].isOpenNewPage,
                        href: '#/' + modules[i].route
                    };
                    if (modules[i].isOpenNewPage) {
                        var sysIndex = location.href.indexOf('/sys/');
                        var origin = location.href.substr(0, sysIndex);
                        navItem.href = modules[i].route.replace(/\{context\}/, origin);
                        if (_.startsWith(modules[i].route, 'http://')) {
                            navItem.href = modules[i].route;
                        }
                    }
                    nav.push(navItem);
                }());
            }
            for (var i = 0; i < nav.length; i++) {
                if (nav[i].route === (hash || appEntry)) {
                    nav[i].active = true;
                }
            }
            headerData['feedback'] = utils.getConfig('feedback');
            headerData['feedbackData'] = utils.getConfig('feedbackData');
            headerData['userInfo'] = utils.getConfig('userInfo') || headerData['userInfo'];
            headerData['nav'] = nav;
            headerData['title'] = appTitle;
            $('body').children('header').bhHeader(headerData);
        },
        initFooter: function () {
            var text = utils.getConfig('FOOTER_TEXT');
            $('body').children('footer').bhFooter({ text: text || '版权信息\uFF1A\xA9 2015 江苏金智教育信息股份有限公司 苏ICP备10204514号' });
        },
        setContentMinHeight: function ($setContainer) {
            if (!$setContainer) {
                return;
            }
            if ($setContainer && $setContainer.length > 0) {
                var $window = $(window);
                var windowHeight = $window.height();
                var footerHeight = $('[bh-footer-role=footer]').outerHeight();
                var headerHeight = $('[bh-header-role=bhHeader]').outerHeight();
                var minHeight = windowHeight - headerHeight - footerHeight - 1;
                $setContainer.css('min-height', minHeight + 'px');
            }
        },
        getUserParams: function () {
            var params = {};
            var search = location.search && location.search.substr(1);
            if (search) {
                var paramsArr = search.split('&');
                _.each(paramsArr, function (item) {
                    var kv = item.split('=');
                    if (kv.length == 2) {
                        params[kv[0]] = kv[1];
                    }
                });
            }
            return params;
        },
        initFramework: function () {
            var miniMode = utils.getConfig('MINI_MODE');
            var userParams = this.getUserParams();
            ubaseUtils.hideLoading();
            ubaseUtils.getFixedMainLayout();
            ubaseUtils.renderHeader();
            ubaseUtils.initFooter();
            ubaseUtils.resetJqueryHtmlMethod();
            if (miniMode || userParams['min'] == '1') {
                utils.miniMode();
            } else {
                ubaseUtils.initEvaluate();
            }
            ubaseUtils.configRouter();
            $('body').niceScroll({ zindex: 99999 });
            $('.app-ajax-loading').jqxLoader({});
            ubaseUtils.setContentMinHeight($('body').children('main').children('article'));
            $(function () {
                $(window).resize(function () {
                    ubaseUtils.setContentMinHeight($('body').children('main').children('article'));
                });
            });
        },
        initEvaluate: function () {
            var rootPath = utils.getConfig('APP_INFO_ROOT_PATH');
            var appId = utils.getConfig('APP_ID');
            var ampUserId = sessionStorage.getItem('ampUserId');
            var ampUserName = sessionStorage.getItem('ampUserName');
            $.bhEvaluate.init({
                appId: appId,
                userName: ampUserName,
                userId: ampUserId,
                rootPath: rootPath
            });
        },
        configRouter: function () {
            var self = this;
            var preRoute = null;
            router.configure({
                delimiter: '/',
                after: function () {
                    var currentRoute = utils.getCurrentRoute();
                    if (preRoute == currentRoute) {
                        return;
                    } else {
                        preRoute = currentRoute;
                    }
                    $('.bh-paper-pile-dialog').remove();
                    $('.sc-container').removeClass('bh-border-transparent bh-bg-transparent');
                    var $body = $('body');
                    $body.children('[bh-footer-role=footer]').removeAttr('style');
                    self.setContentMinHeight($body.children('main').children('article'));
                    self.reselectHeaderNav();
                    setTimeout(function () {
                        $body.children('main').children('article[bh-layout-role=navLeft]').children('section').css('width', 'initial');
                    }, 10);
                    try {
                        $('.jqx-window').jqxWindow('destroy');
                    } catch (e) {
                    }
                }
            });
        },
        reselectHeaderNav: function () {
            var currentRoute = utils.getCurrentRoute();
            var modules = utils.getConfig('MODULES');
            var currentIndex = 0;
            for (var i = 0; i < modules.length; i++) {
                if (modules[i].route == currentRoute) {
                    currentIndex = i + 1;
                    break;
                }
            }
            $('header').bhHeader('resetNavActive', { 'activeIndex': currentIndex });
        },
        getCurrentModule: function () {
            var currentRoute = utils.getCurrentRoute();
            var modules = utils.getConfig('MODULES');
            var currentModule = null;
            for (var i = 0; i < modules.length; i++) {
                if (modules[i].route == currentRoute) {
                    currentModule = modules[i];
                    break;
                }
            }
            return currentModule;
        },
        resetJqueryHtmlMethod: function () {
            $.fn.oldHtmlFn = $.fn.html;
            var self = this;
            $.fn.html = function (content, resetFrameworkHeight) {
                var res = null;
                if (content !== undefined) {
                    res = $(this).oldHtmlFn(content);
                } else {
                    res = $(this).oldHtmlFn();
                }
                if (resetFrameworkHeight) {
                    var $body = $('body');
                    self.setContentMinHeight($body.children('main') && $body.children('main').children('article'));
                }
                self.setButtonAuth();
                return res;
            };
        },
        setButtonAuth: function () {
            var currentModule = this.getCurrentModule();
            var authControlledButtons = $('[manageAuth="Y"]');
            var buttons = currentModule && currentModule.buttons;
            _.each(authControlledButtons, function (item) {
                if (!_.includes(buttons, $(item).attr('data-auth') || $(item).attr('id'))) {
                    $(item).remove();
                }
            });
        },
        getIEVersion: function () {
            var version = null;
            if (navigator.userAgent.indexOf('MSIE') > 0) {
                if (navigator.userAgent.indexOf('MSIE 6.0') > 0) {
                    version = 6;
                }
                if (navigator.userAgent.indexOf('MSIE 7.0') > 0) {
                    version = 7;
                }
                if (navigator.userAgent.indexOf('MSIE 9.0') > 0 && !window.innerWidth) {
                    version = 8;
                }
                if (navigator.userAgent.indexOf('MSIE 9.0') > 0) {
                    version = 9;
                }
            }
            return version;
        }
    };
    return ubaseUtils;
});
define('baseView', [
    'require',
    'exports',
    'module',
    'utils',
    'ubaseUtils',
    'log'
], function (require, exports, module) {
    var utils = require('utils');
    var ubaseUtils = require('ubaseUtils');
    var log = require('log');
    var viewCore = function () {
        this.$rootElement = $('body>main');
        this._subView = [];
        this._bindedEventElement = [];
    };
    var availableElement = $('body');
    viewCore.prototype = {
        initialize: function () {
        },
        getRouterParams: function () {
            var res = {};
            _.each(this._routerParams, function (param, index) {
                res[index] = param;
            });
            return res;
        },
        _coreBindEvent: function () {
            var self = this;
            if (_.isEmpty(this.eventMap)) {
                return;
            }
            _.each(_.keys(this.eventMap), function (elem) {
                var realElem = null, event = null;
                if (!self.eventMap[elem]) {
                    log.error('eventMap中选择器\u201C' + elem + '\u201D的事件处理函数未定义\uFF01\uFF01\uFF01');
                }
                self.__checkEventConflict(elem);
                if (elem.indexOf('@') > 0) {
                    realElem = elem.substr(0, elem.indexOf('@'));
                    event = elem.substr(elem.indexOf('@') + 1);
                    availableElement.on(event, realElem, self.eventMap[elem].bind(self));
                } else {
                    availableElement.on('click', elem, self.eventMap[elem].bind(self));
                }
            });
        },
        __checkEventConflict: function (elem) {
            if (_.contains(this._bindedEventElement, elem)) {
                log.warn('选择器:' + elem + '在eventMap中出现重复绑定[注\uFF1A模块中所有eventMap的选择器须保证唯一]');
            } else {
                this._bindedEventElement.push(elem);
            }
        },
        setHtml: function (content) {
            this.$rootElement.html(content);
            ubaseUtils.setContentMinHeight($('body').children('main').children('article'));
        },
        setRootHtml: function (content) {
            this.$rootElement.html(content);
            ubaseUtils.setContentMinHeight($('body').children('main').children('article'));
        },
        setRootElement: function (elem) {
            this.$rootElement = elem;
        },
        _coreBindEventForSubView: function (subViewConfig) {
            var self = this;
            if (_.isEmpty(subViewConfig)) {
                return;
            }
            subViewConfig.realInit = subViewConfig.realInit || subViewConfig.initialize.bind(subViewConfig);
            subViewConfig.pushSubView = function (subViewConfig) {
                self.pushSubView(subViewConfig);
            };
            subViewConfig.initialize = function (params) {
                subViewConfig.realInit(params);
                if (subViewConfig.__eventBinded) {
                    return;
                } else {
                    subViewConfig.__eventBinded = true;
                }
                _.each(_.keys(subViewConfig.eventMap), function (elem) {
                    if (!subViewConfig.eventMap[elem]) {
                        log.error('eventMap中选择器\u201C' + elem + '\u201D的事件处理函数未定义\uFF01\uFF01\uFF01');
                    }
                    self.__checkEventConflict(elem);
                    if (elem.indexOf('@') > 0) {
                        realElem = elem.substr(0, elem.indexOf('@'));
                        event = elem.substr(elem.indexOf('@') + 1);
                        availableElement.on(event, realElem, subViewConfig.eventMap[elem].bind(subViewConfig));
                    } else {
                        availableElement.on('click', elem, subViewConfig.eventMap[elem].bind(subViewConfig));
                    }
                });
            };
        },
        pushSubView: function (subViewConfig) {
            var self = this;
            if (subViewConfig.constructor === Array) {
                _.each(subViewConfig, function (subView) {
                    self._pushSubView(subView);
                });
            } else {
                this._pushSubView(subViewConfig);
            }
        },
        _pushSubView: function (subViewConfig) {
            if (_.contains(this._subView, subViewConfig)) {
                return;
            }
            subViewConfig.__eventBinded = false;
            this._subView.push(subViewConfig);
            subViewConfig.parent = this;
            this._coreBindEventForSubView(subViewConfig);
        }
    };
    function baseView(config, path) {
        var app = new viewCore();
        app._routerParams = path;
        $.extend(app, config);
        availableElement.off();
        app.initialize();
        app._coreBindEvent();
    }
    return baseView;
});
define('boot', [
    'require',
    'exports',
    'module',
    'utils',
    'resourceConfig',
    'router',
    'baseView',
    'ubaseUtils'
], function (require, exports, module) {
    var utils = require('utils');
    var config = require('resourceConfig');
    var router = require('router');
    var baseView = require('baseView');
    var req = require;
    var ubaseUtils = require('ubaseUtils');
    var boot = {
        start: function (options) {
            var cdn = utils.getConfig('RESOURCE_SERVER');
            var demoMode = utils.getConfig('DEMO_MODE');
            var modules = ubaseUtils.getSortedModules();
            var appEntry = ubaseUtils.getFirstModules('');
            this.setLoadingStyle();
            this.setTitle();
            this.loadPublicCss();
            this.loadPrivateCss();
            var publicBaseJs = this.getPublicBaseJs();
            var publicNormalJs = this.getPublicNormalJs();
            var currentAppViews = this.getCurrentAppViews(options && (options.views || options.VIEWS));
            var appUserEntry = this.getUserEntry();
            req(publicBaseJs, function () {
                req(publicNormalJs, function () {
                    req([
                        'utils',
                        'router'
                    ].concat(demoMode ? currentAppViews : []), function (utils, router) {
                        var args = arguments;
                        var currentRoute = null;
                        for (var i = 0; i < modules.length; i++) {
                            (function () {
                                var index = 3 + i;
                                var route = modules[i].route && modules[i].route.trim();
                                if (route.isOpenNewPage) {
                                    return;
                                }
                                router.on('/' + route + '/?((w|.)*)', function (path) {
                                    if (currentRoute === modules[index - 3].route) {
                                        return;
                                    }
                                    ubaseUtils.cleanMainArea();
                                    ubaseUtils.showLoading();
                                    var path = path ? path.split('/') : [];
                                    try {
                                        req([currentAppViews[index - 3]], function (viewConfig) {
                                            baseView(viewConfig, path);
                                            ubaseUtils.hideLoading();
                                        });
                                    } catch (error) {
                                        console.log(error);
                                    }
                                    currentRoute = utils.getCurrentRoute();
                                });
                            }());
                        }
                        ubaseUtils.initFramework();
                        if (!appUserEntry) {
                            router.init('/' + appEntry);
                        } else {
                            router.init();
                        }
                    });
                });
            });
        },
        getUserEntry: function () {
            var currentRoute = utils.getCurrentRoute();
            var modules = utils.getConfig('MODULES');
            if (_.isEmpty(modules)) {
                return '';
            }
            var index = _.findIndex(modules, function (o) {
                return o.route == currentRoute;
            });
            if (index == -1) {
                currentRoute = modules[0].route;
                utils.goto(currentRoute);
            }
            return currentRoute;
        },
        loadPublicCss: function () {
            var cdn = utils.getConfig('RESOURCE_SERVER');
            var bhVersion = utils.getConfig('BH_VERSION');
            var publicCss = config['PUBLIC_CSS'];
            var publicCssNew;
            var theme = utils.getConfig('THEME') || 'blue';
            var version = bhVersion ? '-' + bhVersion : '';
            var regEx = /fe_components|bower_components/;
            for (var i = 0; i < publicCss.length; i++) {
                if (regEx.test(publicCss[i])) {
                    loadCss(cdn + publicCss[i].replace(/\{\{theme\}\}/, theme).replace(/\{\{version\}\}/, version));
                } else {
                    loadCss(publicCss[i]);
                }
            }
        },
        loadPrivateCss: function () {
            var debug = utils.getConfig('DEBUG_MODE');
            var fedebug = utils.getConfig('FE_DEBUG_MODE');
            var demoMode = utils.getConfig('DEMO_MODE');
            var innerIndexMode = utils.getConfig('INNER_INDEX_MODE');
            if (!debug && !fedebug && window.__Template) {
                return;
            }
            var currentRoute = router.getRoute();
            var modules = utils.getConfig('MODULES');
            if (!modules) {
                return;
            }
            if (demoMode) {
                for (var i = 0; i < modules.length; i++) {
                    loadCss((innerIndexMode ? '.' : '') + './modules/' + modules[i].route + '/' + modules[i].route + '.css');
                }
            } else {
                loadCss((innerIndexMode ? '.' : '') + './public/css/base.css');
            }
            loadCss((innerIndexMode ? '.' : '') + './public/css/style.css');
        },
        getPublicBaseJs: function () {
            var cdn = utils.getConfig('RESOURCE_SERVER');
            var publicBaseJs = config['PUBLIC_BASE_JS'];
            var ieShivJs = config['IE_SHIV_JS'];
            var currentBrowserVersion = ubaseUtils.getIEVersion();
            var deps = [];
            var regEx = /fe_components|bower_components/;
            if (currentBrowserVersion && currentBrowserVersion == 9) {
                publicBaseJs = publicBaseJs.concat(ieShivJs);
            }
            for (var i = 0; i < publicBaseJs.length; i++) {
                if (regEx.test(publicBaseJs[i])) {
                    deps.push(cdn + publicBaseJs[i]);
                } else {
                    deps.push(publicBaseJs[i]);
                }
            }
            return deps;
        },
        getPublicNormalJs: function () {
            var cdn = utils.getConfig('RESOURCE_SERVER');
            var debugMode = utils.getConfig('FE_DEBUG_MODE');
            var bhVersion = utils.getConfig('BH_VERSION');
            var publicNormalJs = config['PUBLIC_NORMAL_JS'];
            var version = bhVersion ? '-' + bhVersion : '';
            var debugJs = config['DEBUG_JS'];
            var deps = [];
            if (debugMode) {
                publicNormalJs = publicNormalJs.concat(debugJs);
            }
            var regEx = /fe_components|bower_components/;
            for (var i = 0; i < publicNormalJs.length; i++) {
                if (regEx.test(publicNormalJs[i])) {
                    deps.push(cdn + publicNormalJs[i].replace(/\{\{version\}\}/, version));
                } else {
                    deps.push(publicNormalJs[i]);
                }
            }
            return deps;
        },
        getCurrentAppViews: function () {
            var modules = ubaseUtils.getSortedModules();
            var innerIndexMode = utils.getConfig('INNER_INDEX_MODE');
            var deps = [];
            if (!modules) {
                return;
            }
            for (var i = 0; i < modules.length; i++) {
                if (modules[i].isOpenNewPage) {
                    deps.push('');
                } else {
                    deps.push((innerIndexMode ? '../' : '') + 'modules/' + modules[i].route + '/' + modules[i].route);
                }
            }
            return deps;
        },
        setTitle: function () {
            var title = utils.getConfig('APP_TITLE');
            var titleElem = document.createElement('title');
            titleElem.innerText = title;
            document.getElementsByTagName('head')[0].appendChild(titleElem);
        },
        setLoadingStyle: function () {
            var style = document.createElement('style');
            style.innerText = loadingCss;
            document.getElementsByTagName('head')[0].appendChild(style);
            $('body').append('  <div class="app-ajax-loading" style="position:fixed;z-index:30000;background-color:rgba(0,0,0,0);"></div><div class="app-loading"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>');
            ubaseUtils.showLoading();
        }
    };
    function loadCss(url) {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = url;
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    var loadingCss = '.app-ajax-loading .bh-loader-icon-line-border{border: 0px solid #ddd;box-shadow:none;}.app-ajax-loading{position:fixed;z-index:30000;}.app-loading{position:absolute;opacity:0;top:150px;left:-75px;margin-left:50%;z-index:-1;text-align:center}.app-loading-show{z-index:9999;animation:fade-in;animation-duration:0.5s;-webkit-animation:fade-in 0.5s}@keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}@-webkit-keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}.spinner>div{width:30px;height:30px;background-color:#4DAAF5;border-radius:100%;display:inline-block;-webkit-animation:bouncedelay 1.4s infinite ease-in-out;animation:bouncedelay 1.4s infinite ease-in-out;-webkit-animation-fill-mode:both;animation-fill-mode:both}.spinner .bounce1{-webkit-animation-delay:-.32s;animation-delay:-.32s}.spinner .bounce2{-webkit-animation-delay:-.16s;animation-delay:-.16s}@-webkit-keyframes bouncedelay{0%,100%,80%{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1)}}@keyframes bouncedelay{0%,100%,80%{transform:scale(0);-webkit-transform:scale(0)}40%{transform:scale(1);-webkit-transform:scale(1)}}';
    return boot;
});
define('text', ['module'], function (module) {
    'use strict';
    var text, fs, Cc, Ci, xpcIsWindows, progIds = [
            'Msxml2.XMLHTTP',
            'Microsoft.XMLHTTP',
            'Msxml2.XMLHTTP.4.0'
        ], xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im, hasLocation = typeof location !== 'undefined' && location.href, defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''), defaultHostName = hasLocation && location.hostname, defaultPort = hasLocation && (location.port || undefined), buildMap = {}, masterConfig = module.config && module.config() || {};
    function useDefault(value, defaultValue) {
        return value === undefined || value === '' ? defaultValue : value;
    }
    function isSamePort(protocol1, port1, protocol2, port2) {
        if (port1 === port2) {
            return true;
        } else if (protocol1 === protocol2) {
            if (protocol1 === 'http') {
                return useDefault(port1, '80') === useDefault(port2, '80');
            } else if (protocol1 === 'https') {
                return useDefault(port1, '443') === useDefault(port2, '443');
            }
        }
        return false;
    }
    text = {
        version: '2.0.15',
        strip: function (content) {
            if (content) {
                content = content.replace(xmlRegExp, '');
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = '';
            }
            return content;
        },
        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1').replace(/[\f]/g, '\\f').replace(/[\b]/g, '\\b').replace(/[\n]/g, '\\n').replace(/[\t]/g, '\\t').replace(/[\r]/g, '\\r').replace(/[\u2028]/g, '\\u2028').replace(/[\u2029]/g, '\\u2029');
        },
        createXhr: masterConfig.createXhr || function () {
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== 'undefined') {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== 'undefined') {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {
                    }
                    if (xhr) {
                        progIds = [progId];
                        break;
                    }
                }
            }
            return xhr;
        },
        parseName: function (name) {
            var modName, ext, temp, strip = false, index = name.lastIndexOf('.'), isRelative = name.indexOf('./') === 0 || name.indexOf('../') === 0;
            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1);
            } else {
                modName = name;
            }
            temp = ext || modName;
            index = temp.indexOf('!');
            if (index !== -1) {
                strip = temp.substring(index + 1) === 'strip';
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }
            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },
        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort, match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];
            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];
            return (!uProtocol || uProtocol === protocol) && (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) && (!uPort && !uHostName || isSamePort(uProtocol, uPort, protocol, port));
        },
        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },
        load: function (name, req, onLoad, config) {
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }
            masterConfig.isBuild = config && config.isBuild;
            var parsed = text.parseName(name), nonStripName = parsed.moduleName + (parsed.ext ? '.' + parsed.ext : ''), url = req.toUrl(nonStripName), useXhr = masterConfig.useXhr || text.useXhr;
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext, parsed.strip, content, onLoad);
                });
            }
        },
        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + '!' + moduleName, 'define(function () { return \'' + content + '\';});\n');
            }
        },
        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName), extPart = parsed.ext ? '.' + parsed.ext : '', nonStripName = parsed.moduleName + extPart, fileName = req.toUrl(parsed.moduleName + extPart) + '.js';
            text.load(nonStripName, req, function (value) {
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };
                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };
    if (masterConfig.env === 'node' || !masterConfig.env && typeof process !== 'undefined' && process.versions && !!process.versions.node && !process.versions['node-webkit'] && !process.versions['atom-shell']) {
        fs = require.nodeRequire('fs');
        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                if (file[0] === '\uFEFF') {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || !masterConfig.env && text.createXhr()) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }
            xhr.onreadystatechange = function (evt) {
                var status, err;
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }
                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || !masterConfig.env && typeof Packages !== 'undefined' && typeof java !== 'undefined') {
        text.get = function (url, callback) {
            var stringBuffer, line, encoding = 'utf-8', file = new java.io.File(url), lineSeparator = java.lang.System.getProperty('line.separator'), input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)), content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();
                if (line && line.length() && line.charAt(0) === 65279) {
                    line = line.substring(1);
                }
                if (line !== null) {
                    stringBuffer.append(line);
                }
                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                content = String(stringBuffer.toString());
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || !masterConfig.env && typeof Components !== 'undefined' && Components.classes && Components.interfaces) {
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = '@mozilla.org/windows-registry-key;1' in Cc;
        text.get = function (url, callback) {
            var inStream, convertStream, fileObj, readData = {};
            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }
            fileObj = new FileUtils.File(url);
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1'].createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);
                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1'].createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, 'utf-8', inStream.available(), Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});
require([], function () {
    var req = require;
    if (!window.APP_CONFIG) {
        req(['./config'], function (config) {
            window.APP_CONFIG = config;
            startBoot();
        });
    } else {
        startBoot();
    }
    function startBoot() {
        require([
            'boot',
            'utils',
            'text'
        ], function (boot, utils) {
            boot.start();
            var cdn = utils.getConfig('RESOURCE_SERVER');
            require.config({
                waitSeconds: 0,
                baseUrl: './',
                paths: { 'echarts': cdn + '/bower_components/echarts3/dist/echarts' }
            });
        });
    }
});
define('index', [
    'boot',
    'utils',
    'text'
], function () {
    return;
});