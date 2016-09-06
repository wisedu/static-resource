define('configUtils', [
    'require',
    'exports',
    'module',
    'config'
], function(require, exports, module) {
    var config = require('config');
    var serverConfig = {};
    if (config.SERVER_CONFIG_API) {
        var serverConfig = null;
        var resp = ajax({
            url: config.API_BASE_PATH + config.SERVER_CONFIG_API,
            async: false,
            success: function(response) {
                serverConfig = JSON.parse(response);
            },
            fail: function(status) {
                console.error('AJAX SERVER_CONFIG_API ERROR');
            }
        });
    }
    config = $.extend(true, {}, config, serverConfig);

    function ajax(options) {
        options = options || {};
        options.type = (options.type || 'GET').toUpperCase();
        options.dataType = options.dataType || 'json';
        var params = formatParams(options.data);
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else {
            var xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status >= 200 && status < 300) {
                    options.success && options.success(xhr.responseText, xhr.responseXML);
                } else {
                    options.fail && options.fail(status);
                }
            }
        };
        if (options.type == 'GET') {
            xhr.open('GET', options.url + '?' + params, options.async);
            xhr.send(null);
        } else if (options.type == 'POST') {
            xhr.open('POST', options.url, options.async);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(params);
        }
    }

    function formatParams(data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
        }
        arr.push(('v=' + Math.random()).replace('.', ''));
        return arr.join('&');
    }
    return config;
});
define('router', [
    'require',
    'exports',
    'module'
], function(require, exports, module) {
    var router = new Router();
    router.init();
    return router;
});
define('utils', [
    'require',
    'exports',
    'module',
    'configUtils',
    'router'
], function(require, exports, module) {
    var configUtils = require('configUtils');
    var router = require('router');
    var utils = {
        loadCompiledPage: function(relativePath) {
            var currentRoute = router.getRoute()[0];
            var html = '';
            $.ajax({
                url: './modules/' + currentRoute + '/' + relativePath + '.html',
                dataType: 'html',
                async: false
            }).done(function(res) {
                html = res;
            });
            return Hogan.compile(html);
        },
        loadPage: function(relativePath) {
            var html = '';
            $.ajax({
                url: './page/' + relativePath + '.html',
                dataType: 'html',
                async: false
            }).done(function(res) {
                html = res;
            });
            return html;
        },
        initStaticResource: function() {
            var res = utils.loadCompiledPage('index').render({
                server: utils.getConfig('RESOURCE_SERVER')
            });
            $('body').prepend(res);
        },
        getConfig: function(key) {
            return configUtils[key];
        },
        fetch: function(url, options) {
            var def = $.Deferred();
            var loadingIndex = layer.load(2);
            $.post(utils.getConfig('API_BASE_PATH') + '/' + url + '.do', options, function(res) {
                layer.close(loadingIndex);
                if (res.success) {
                    def.resolve(res);
                } else {
                    def.reject(res);
                }
            });
            return def;
        },
        doAjax: function(url, params, method) {
            var deferred = $.Deferred();
            var loadingIndex = layer.load(2);
            $.ajax({
                type: method || 'POST',
                url: url,
                traditional: true,
                data: params || {},
                dataType: 'json',
                success: function(resp) {
                    try {
                        if (typeof resp == 'string') {
                            resp = JSON.parse(resp);
                        }
                        if (typeof resp.loginURL != 'undefined' && resp.loginURL != '') {
                            window.location.href = resp.loginURL;
                        }
                    } catch (e) {}
                    layer.close(loadingIndex);
                    deferred.resolve(resp);
                },
                error: function(resp) {
                    var result = JSON.parse(resp.responseText);
                    if (typeof result.loginURL != 'undefined' && resp.loginURL != '') {
                        window.location.href = result.loginURL;
                    }
                    layer.close(loadingIndex);
                    deferred.reject(resp);
                }
            });
            return deferred.promise();
        },
        doSyncAjax: function(url, params, method) {
            var resp = $.ajax({
                type: method || 'GET',
                url: url,
                traditional: true,
                data: params || {},
                dataType: 'json',
                cache: false,
                async: false,
                error: function(resp) {
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
        genMainLayout: function() {
            var layout = '<div id="headerPlaceholder"></div>' + '<div class="sc-container-outerFrame">' + '<div class="sc-container bh-border-h" bh-container-role="container">' + '<div id="bodyPlaceholder"></div>' + '</div>' + '</div>' + '<div id="footerPlaceholder"></div>' + '<div id="levityPlaceholder"></div>';
            $('body').prepend(layout);
        },
        getFixedMainLayout: function() {
            var layout = '<header></header><main></main><footer></footer><div id="jqx-loading"></div>';
            $('body').prepend(layout);
        },
        getFirstModules: function() {
            var modules = utils.getConfig('MODULES');
            var appEntry = utils.getConfig('APP_ENTRY');
            return appEntry || modules[0].route;
        },
        renderHeader: function() {
            var headerData = utils.getConfig('HEADER');
            var modules = utils.getConfig('MODULES');
            var appEntry = this.getFirstModules();
            var appTitle = utils.getConfig('APP_TITLE');
            var nav = [];
            var hash = window.location.hash;
            hash = hash.replace('#/', '');
            if (hash.indexOf('/') != -1) {
                hash = hash.substring(0, hash.indexOf('/'));
            }
            for (var i = 0; i < modules.length; i++) {
                (function() {
                    var navItem = {
                        title: modules[i].title,
                        route: modules[i].route,
                        href: '#/' + modules[i].route
                    };
                    nav.push(navItem);
                }());
            }
            for (var i = 0; i < nav.length; i++) {
                if (nav[i].route === (hash || appEntry)) {
                    nav[i].active = true;
                }
            }
            headerData['nav'] = nav;
            headerData['title'] = appTitle;
            headerData['feedback'] = utils.getConfig('feedback');
            headerData['feedbackData'] = utils.getConfig('feedbackData');
            headerData['userInfo'] = utils.getConfig('userInfo');
            $('body').children('header').bhHeader(headerData);
        },
        initFooter: function() {
            var text = utils.getConfig('FOOTER_TEXT');
            $('body').children('footer').bhFooter({
                text: text || '版权信息\uFF1A\xA9 2015 江苏金智教育信息股份有限公司 苏ICP备10204514号'
            });
        },
        setContentMinHeight: function($setContainer) {
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
        initFramework: function() {
            utils.getFixedMainLayout();
            utils.renderHeader();
            utils.initFooter();
            utils.resetJqueryHtmlMethod();
            utils.configRouter();
            $('html').niceScroll();
            utils.setContentMinHeight($('body').children('main').children('article'));
            $(function() {
                $(window).resize(function() {
                    utils.setContentMinHeight($('body').children('main').children('article'));
                });
            });
        },
        configRouter: function() {
            var self = this;
            var preRoute = null;
            router.configure({
                after: function() {
                    var currentRoute = router.getRoute()[0];
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
                    setTimeout(function() {
                        $body.children('main').children('article[bh-layout-role=navLeft]').children('section').css('width', 'initial');
                    }, 10);
                    try {
                        $('.jqx-window').jqxWindow('destroy');
                    } catch (e) {}
                }
            });
        },
        reselectHeaderNav: function() {
            var currentRoute = router.getRoute()[0];
            var modules = utils.getConfig('MODULES');
            var currentIndex = 0;
            for (var i = 0; i < modules.length; i++) {
                if (modules[i].route == currentRoute) {
                    currentIndex = i + 1;
                    break;
                }
            }
            $('header').bhHeader('resetNavActive', {
                'activeIndex': currentIndex
            });
        },
        resetJqueryHtmlMethod: function() {
            $.fn.oldHtmlFn = $.fn.html;
            var self = this;
            $.fn.html = function(content, resetFrameworkHeight) {
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
                return res;
            };
        },
        openModalDialog: function(options) {
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
            $(options.element).find(options.closeElement).click(function() {
                $(options.element).jqxWindow('close');
            });
        },
        getIEVersion: function() {
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
        },
        warningDialog: function(options) {
            if (!options)
                return;
            var buttonList = [{
                text: '确认',
                className: 'bh-btn-warning'
            }, {
                text: '取消',
                className: 'bh-btn-default'
            }];
            if (options.callback) {
                buttonList[0].callback = options.callback;
            };
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
        dialog: function(options) {
            var type = options.type || 'success',
                content = options.content,
                params = null,
                buttonList = [];
            var okClass = null,
                iconType = null;
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
                    text: '确认',
                    className: okClass,
                    callback: options.okCallback
                };
                buttonList.push(okButtonInfo);
            };
            if (options.cancelCallback) {
                var cancelButtonInfo = {
                    text: '取消',
                    className: 'bh-btn-default',
                    callback: options.cancelCallback
                };
                buttonList.push(cancelButtonInfo);
            };
            if (options.okCallback && !options.cancelCallback && type == 'confirm') {
                buttonList.push({
                    text: '取消',
                    className: 'bh-btn-default'
                });
            }
            options.buttons = options.buttonList || buttonList;
            $.bhDialog(options);
        }
    };
    return utils;
});
define('resourceConfig', [
    'require',
    'exports',
    'module'
], function(require, exports, module) {
    var config = {
        'PUBLIC_CSS': [
            '/fe_components/jqwidget/purple/bh.min.css',
            '/fe_components/iconfont/iconfont.css',
            '/fe_components/jqwidget/purple/bh-scenes.min.css',
            '/bower_components/sentsinLayer/skin/layer.css',
            './public/css/base.css'
        ],
        'PUBLIC_BASE_JS': [
            '/bower_components/sentsinLayer/layer.js',
            '/fe_components/bh_utils.js',
            '/fe_components/emap.js',
            '/bower_components/echarts/build/dist/echarts.js',
            '/bower_components/echarts/build/dist/chart/bar.js',
            '/bower_components/echarts/build/dist/chart/pie.js'
        ],
        'PUBLIC_NORMAL_JS': [
            '/fe_components/bh.map.js',
            '/fe_components/jqwidget/jqxwidget.min.js',
            '/fe_components/jqwidget/globalize.js'
        ],
        'DEBUG_JS': ['/fe_components/mock/mock.js'],
        'IE_SHIV_JS': ['/bower_components/html5shiv/dist/html5shiv.min.js']
    };
    return config;
});
define('baseView', [
    'require',
    'exports',
    'module',
    'utils'
], function(require, exports, module) {
    var utils = require('utils');
    var viewCore = function() {
        this.$rootElement = $('body>main');
        this._subView = [];
    };
    var availableElement = $('body');
    viewCore.prototype = {
        initialize: function() {},
        getRouterParams: function() {
            return this._routerParams;
        },
        _coreBindEvent: function() {
            var self = this;
            if (_.isEmpty(this.eventMap)) {
                return;
            }
            _.each(_.keys(this.eventMap), function(elem) {
                availableElement.on('click', elem, self.eventMap[elem].bind(self));
            });
        },
        setHtml: function(content) {
            this.$rootElement.html(content);
            utils.setContentMinHeight($('body').children('main').children('article'));
        },
        setRootHtml: function(content) {
            this.$rootElement.html(content);
            utils.setContentMinHeight($('body').children('main').children('article'));
        },
        _coreBindEventForSubView: function(subViewConfig) {
            if (_.isEmpty(subViewConfig)) {
                return;
            }
            var realInit = subViewConfig.initialize.bind(subViewConfig);
            subViewConfig.initialize = function(params) {
                realInit(params);
                if (subViewConfig.__eventBinded) {
                    return;
                } else {
                    subViewConfig.__eventBinded = true;
                }
                _.each(_.keys(subViewConfig.eventMap), function(elem) {
                    availableElement.on('click', elem, subViewConfig.eventMap[elem].bind(subViewConfig));
                });
            };
        },
        pushSubView: function(subViewConfig) {
            subViewConfig.__eventBinded = false;
            this._subView.push(subViewConfig);
            this._coreBindEventForSubView(subViewConfig);
        }
    };

    function baseView(config, path) {
        var app = new viewCore();
        app._routerParams = path;
        $.extend(app, config);
        app.$rootElement.empty();
        availableElement.off('click');
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
    'baseView'
], function(require, exports, module) {
    var utils = require('utils');
    var config = require('resourceConfig');
    var router = require('router');
    var baseView = require('baseView');
    var boot = {
        start: function(options) {
            var cdn = utils.getConfig('RESOURCE_SERVER');
            var modules = utils.getConfig('MODULES');
            var appEntry = utils.getFirstModules('');

            this.setTitle();
            this.loadPublicCss();
            this.loadPrivateCss(options && (options.css || options.CSS));

            var publicBaseJs = this.getPublicBaseJs();
            var publicNormalJs = this.getPublicNormalJs();
            var currentAppViews = this.getCurrentAppViews(options && (options.views || options.VIEWS));

            var appUserEntry = router.getRoute()[0];

            require(publicBaseJs, function() {

                require(publicNormalJs, function() {
                    require(['config', 'utils', 'router'],
                        function(config, utils, router) {
                            var args = arguments;
                            var currentRoute = null;
                            for (var i = 0; i < modules.length; i++) {
                                (function() {
                                    var index = 3 + i;
                                    var route = modules[i].route;
                                    router.on('/' + route + '/?((\w|.)*)', function(path) {
                                        if (currentRoute === modules[index - 3].route) {
                                            return;
                                        }

                                        var path = path ? path.split('/') : [];
                                        try {
                                            require([currentAppViews[index - 3]], function(viewConfig) {
                                                baseView(viewConfig, path);
                                            });
                                        } catch (error) {
                                            console.log(error)
                                        }

                                        currentRoute = router.getRoute()[0];
                                    });
                                })();
                            }
                            utils.initFramework();
                            if (!appUserEntry) {
                                router.init('/' + appEntry);
                            } else {
                                router.init();
                            }
                        });
                });

            });
        },
        loadPublicCss: function() {
            var cdn = utils.getConfig('RESOURCE_SERVER');
            var publicCss = config['PUBLIC_CSS'];
            var regEx = /fe_components|bower_components/;
            for (var i = 0; i < publicCss.length; i++) {
                if (regEx.test(publicCss[i])) {
                    loadCss(cdn + publicCss[i]);
                } else {
                    loadCss(publicCss[i]);
                }
            }
        },
        loadPrivateCss: function() {
            var currentRoute = router.getRoute();
            var modules = utils.getConfig('MODULES');
            if (!modules) {
                return;
            }
            loadCss('./public/css/style.css');
        },
        getPublicBaseJs: function() {
            var cdn = utils.getConfig('RESOURCE_SERVER');
            var publicBaseJs = config['PUBLIC_BASE_JS'];
            var ieShivJs = config['IE_SHIV_JS'];
            var currentBrowserVersion = utils.getIEVersion();
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
        getPublicNormalJs: function() {
            var cdn = utils.getConfig('RESOURCE_SERVER');
            var debugMode = utils.getConfig('FE_DEBUG_MODE');
            var publicNormalJs = config['PUBLIC_NORMAL_JS'];
            var debugJs = config['DEBUG_JS'];
            var deps = [];
            if (debugMode) {
                publicNormalJs = publicNormalJs.concat(debugJs);
            }
            var regEx = /fe_components|bower_components/;
            for (var i = 0; i < publicNormalJs.length; i++) {
                if (regEx.test(publicNormalJs[i])) {
                    deps.push(cdn + publicNormalJs[i]);
                } else {
                    deps.push(publicNormalJs[i]);
                }
            }
            return deps;
        },
        getCurrentAppViews: function() {
            var modules = utils.getConfig('MODULES');
            var deps = [];
            if (!modules) {
                return;
            }
            for (var i = 0; i < modules.length; i++) {
                deps.push('modules/' + modules[i].route + '/' + modules[i].route);
            }
            return deps;
        },
        setTitle: function() {
            var title = utils.getConfig('APP_TITLE');
            var titleElem = document.createElement('title');
            titleElem.innerText = title;
            document.getElementsByTagName('head')[0].appendChild(titleElem);
        }
    };

    function loadCss(url) {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = url;
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    return boot;
});
require.config({
    baseUrl: './',
    paths: {
        'config': './config',
        'resourceConfig': './public/js/config',
        'baseView': './public/js/baseView',
        'boot': './public/js/boot',
        'configUtils': './public/js/configUtils',
        'utils': './public/js/utils',
        'router': './public/js/router'
    }
});
require(['boot'], function(boot) {
    boot.start();
});