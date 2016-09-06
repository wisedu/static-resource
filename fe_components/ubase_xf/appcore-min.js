/*
 RequireJS 2.1.22 Copyright (c) 2010-2015, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
var requirejs,require,define;
(function(h){function t(a){return"[object Function]"===N.call(a)}function m(a){return"[object Array]"===N.call(a)}function v(a,c){if(a){var b;for(b=0;b<a.length&&(!a[b]||!c(a[b],b,a));b+=1);}}function g(a,b){if(a){var c;for(c=a.length-1;-1<c&&(!a[c]||!b(a[c],c,a));--c);}}function p(a,b){return ga.call(a,b)}function d(a,b){return p(a,b)&&a[b]}function a(a,b){for(var c in a)if(p(a,c)&&b(a[c],c))break}function c(b,d,e,f){d&&a(d,function(a,d){if(e||!p(b,d))!f||"object"!==typeof a||!a||m(a)||t(a)||a instanceof
RegExp?b[d]=a:(b[d]||(b[d]={}),c(b[d],a,e,f))});return b}function b(a,b){return function(){return b.apply(a,arguments)}}function e(a){throw a;}function f(a){if(!a)return a;var b=h;v(a.split("."),function(a){b=b[a]});return b}function l(a,b,c,d){b=Error(b+"\nhttp://requirejs.org/docs/errors.html#"+a);b.requireType=a;b.requireModules=d;c&&(b.originalError=c);return b}function C(k){function G(x,a,b){var c,e,f,k,l,u,B,g;a=a&&a.split("/");var A=w.map,n=A&&A["*"];if(x){x=x.split("/");e=x.length-1;w.nodeIdCompat&&
R.test(x[e])&&(x[e]=x[e].replace(R,""));"."===x[0].charAt(0)&&a&&(e=a.slice(0,a.length-1),x=e.concat(x));e=x;for(f=0;f<e.length;f++)k=e[f],"."===k?(e.splice(f,1),--f):".."===k&&0!==f&&(1!==f||".."!==e[2])&&".."!==e[f-1]&&0<f&&(e.splice(f-1,2),f-=2);x=x.join("/")}if(b&&A&&(a||n)){e=x.split("/");f=e.length;a:for(;0<f;--f){l=e.slice(0,f).join("/");if(a)for(k=a.length;0<k;--k)if(b=d(A,a.slice(0,k).join("/")))if(b=d(b,l)){c=b;u=f;break a}!B&&n&&d(n,l)&&(B=d(n,l),g=f)}!c&&B&&(c=B,u=g);c&&(e.splice(0,u,
c),x=e.join("/"))}return(c=d(w.pkgs,x))?c:x}function u(a){H&&v(document.getElementsByTagName("script"),function(b){if(b.getAttribute("data-requiremodule")===a&&b.getAttribute("data-requirecontext")===r.contextName)return b.parentNode.removeChild(b),!0})}function B(a){var b=d(w.paths,a);if(b&&m(b)&&1<b.length)return b.shift(),r.require.undef(a),r.makeRequire(null,{skipMap:!0})([a]),!0}function A(a){var b,c=a?a.indexOf("!"):-1;-1<c&&(b=a.substring(0,c),a=a.substring(c+1,a.length));return[b,a]}function C(a,
b,c,q){var e,f,k=null,l=b?b.name:null,u=a,B=!0,g="";a||(B=!1,a="_@r"+(ca+=1));a=A(a);k=a[0];a=a[1];k&&(k=G(k,l,q),f=d(D,k));a&&(k?g=f&&f.normalize?f.normalize(a,function(a){return G(a,l,q)}):-1===a.indexOf("!")?G(a,l,q):a:(g=G(a,l,q),a=A(g),k=a[0],g=a[1],c=!0,e=r.nameToUrl(g)));c=!k||f||c?"":"_unnormalized"+(da+=1);return{prefix:k,name:g,parentMap:b,unnormalized:!!c,url:e,originalName:u,isDefine:B,id:(k?k+"!"+g:g)+c}}function I(a){var b=a.id,c=d(z,b);c||(c=z[b]=new r.Module(a));return c}function F(a,
b,c){var q=a.id,e=d(z,q);if(!p(D,q)||e&&!e.defineEmitComplete)if(e=I(a),e.error&&"error"===b)c(e.error);else e.on(b,c);else"defined"===b&&c(D[q])}function y(a,b){var c=a.requireModules,q=!1;if(b)b(a);else if(v(c,function(b){if(b=d(z,b))b.error=a,b.events.error&&(q=!0,b.emit("error",a))}),!q)n.onError(a)}function M(){S.length&&(v(S,function(a){var b=a[0];"string"===typeof b&&(r.defQueueMap[b]=!0);K.push(a)}),S=[])}function E(a){delete z[a];delete V[a]}function U(a,b,c){var q=a.map.id;a.error?a.emit("error",
a.error):(b[q]=!0,v(a.depMaps,function(q,e){var f=q.id,k=d(z,f);!k||a.depMatched[e]||c[f]||(d(b,f)?(a.defineDep(e,D[f]),a.check()):U(k,b,c))}),c[q]=!0)}function J(){var b,c,d=(b=1E3*w.waitSeconds)&&r.startTime+b<(new Date).getTime(),q=[],e=[],f=!1,k=!0;if(!W){W=!0;a(V,function(a){var b=a.map,x=b.id;if(a.enabled&&(b.isDefine||e.push(a),!a.error))if(!a.inited&&d)B(x)?f=c=!0:(q.push(x),u(x));else if(!a.inited&&a.fetched&&b.isDefine&&(f=!0,!b.prefix))return k=!1});if(d&&q.length)return b=l("timeout",
"Load timeout for modules: "+q,null,q),b.contextName=r.contextName,y(b);k&&v(e,function(a){U(a,{},{})});d&&!c||!f||!H&&!ea||X||(X=setTimeout(function(){X=0;J()},50));W=!1}}function Q(a){p(D,a[0])||I(C(a[0],null,!0)).init(a[1],a[2])}function N(a){a=a.currentTarget||a.srcElement;var b=r.onScriptLoad;a.detachEvent&&!Y?a.detachEvent("onreadystatechange",b):a.removeEventListener("load",b,!1);b=r.onScriptError;a.detachEvent&&!Y||a.removeEventListener("error",b,!1);return{node:a,id:a&&a.getAttribute("data-requiremodule")}}
function fa(){var a;for(M();K.length;){a=K.shift();if(null===a[0])return y(l("mismatch","Mismatched anonymous define() module: "+a[a.length-1]));Q(a)}r.defQueueMap={}}var W,Z,r,O,X,w={waitSeconds:7,baseUrl:"./",paths:{},bundles:{},pkgs:{},shim:{},config:{}},z={},V={},aa={},K=[],D={},T={},ba={},ca=1,da=1;O={require:function(a){return a.require?a.require:a.require=r.makeRequire(a.map)},exports:function(a){a.usingExports=!0;if(a.map.isDefine)return a.exports?D[a.map.id]=a.exports:a.exports=D[a.map.id]=
{}},module:function(a){return a.module?a.module:a.module={id:a.map.id,uri:a.map.url,config:function(){return d(w.config,a.map.id)||{}},exports:a.exports||(a.exports={})}}};Z=function(a){this.events=d(aa,a.id)||{};this.map=a;this.shim=d(w.shim,a.id);this.depExports=[];this.depMaps=[];this.depMatched=[];this.pluginMaps={};this.depCount=0};Z.prototype={init:function(a,c,d,q){q=q||{};if(!this.inited){this.factory=c;if(d)this.on("error",d);else this.events.error&&(d=b(this,function(a){this.emit("error",
a)}));this.depMaps=a&&a.slice(0);this.errback=d;this.inited=!0;this.ignore=q.ignore;q.enabled||this.enabled?this.enable():this.check()}},defineDep:function(a,b){this.depMatched[a]||(this.depMatched[a]=!0,--this.depCount,this.depExports[a]=b)},fetch:function(){if(!this.fetched){this.fetched=!0;r.startTime=(new Date).getTime();var a=this.map;if(this.shim)r.makeRequire(this.map,{enableBuildCallback:!0})(this.shim.deps||[],b(this,function(){return a.prefix?this.callPlugin():this.load()}));else return a.prefix?
this.callPlugin():this.load()}},load:function(){var a=this.map.url;T[a]||(T[a]=!0,r.load(this.map.id,a))},check:function(){if(this.enabled&&!this.enabling){var a,b,c=this.map.id;b=this.depExports;var d=this.exports,f=this.factory;if(!this.inited)p(r.defQueueMap,c)||this.fetch();else if(this.error)this.emit("error",this.error);else if(!this.defining){this.defining=!0;if(1>this.depCount&&!this.defined){if(t(f)){try{d=r.execCb(c,f,b,d)}catch(k){a=k}this.map.isDefine&&void 0===d&&((b=this.module)?d=b.exports:
this.usingExports&&(d=this.exports));if(a){if(this.events.error&&this.map.isDefine||n.onError!==e)return a.requireMap=this.map,a.requireModules=this.map.isDefine?[this.map.id]:null,a.requireType=this.map.isDefine?"define":"require",y(this.error=a);if("undefined"!==typeof console&&console.error)console.error(a);else n.onError(a)}}else d=f;this.exports=d;if(this.map.isDefine&&!this.ignore&&(D[c]=d,n.onResourceLoad)){var l=[];v(this.depMaps,function(a){l.push(a.normalizedMap||a)});n.onResourceLoad(r,
this.map,l)}E(c);this.defined=!0}this.defining=!1;this.defined&&!this.defineEmitted&&(this.defineEmitted=!0,this.emit("defined",this.exports),this.defineEmitComplete=!0)}}},callPlugin:function(){var c=this.map,e=c.id,f=C(c.prefix);this.depMaps.push(f);F(f,"defined",b(this,function(q){var f,k,u=d(ba,this.map.id),g=this.map.name,B=this.map.parentMap?this.map.parentMap.name:null,A=r.makeRequire(c.parentMap,{enableBuildCallback:!0});if(this.map.unnormalized){if(q.normalize&&(g=q.normalize(g,function(a){return G(a,
B,!0)})||""),k=C(c.prefix+"!"+g,this.map.parentMap),F(k,"defined",b(this,function(a){this.map.normalizedMap=k;this.init([],function(){return a},null,{enabled:!0,ignore:!0})})),q=d(z,k.id)){this.depMaps.push(k);if(this.events.error)q.on("error",b(this,function(a){this.emit("error",a)}));q.enable()}}else u?(this.map.url=r.nameToUrl(u),this.load()):(f=b(this,function(a){this.init([],function(){return a},null,{enabled:!0})}),f.error=b(this,function(b){this.inited=!0;this.error=b;b.requireModules=[e];
a(z,function(a){0===a.map.id.indexOf(e+"_unnormalized")&&E(a.map.id)});y(b)}),f.fromText=b(this,function(a,b){var d=c.name,q=C(d),k=P;b&&(a=b);k&&(P=!1);I(q);p(w.config,e)&&(w.config[d]=w.config[e]);try{n.exec(a)}catch(u){return y(l("fromtexteval","fromText eval for "+e+" failed: "+u,u,[e]))}k&&(P=!0);this.depMaps.push(q);r.completeLoad(d);A([d],f)}),q.load(c.name,A,f,w))}));r.enable(f,this);this.pluginMaps[f.id]=f},enable:function(){V[this.map.id]=this;this.enabling=this.enabled=!0;v(this.depMaps,
b(this,function(a,c){var e,q;if("string"===typeof a){a=C(a,this.map.isDefine?this.map:this.map.parentMap,!1,!this.skipMap);this.depMaps[c]=a;if(e=d(O,a.id)){this.depExports[c]=e(this);return}this.depCount+=1;F(a,"defined",b(this,function(a){this.undefed||(this.defineDep(c,a),this.check())}));this.errback?F(a,"error",b(this,this.errback)):this.events.error&&F(a,"error",b(this,function(a){this.emit("error",a)}))}e=a.id;q=z[e];p(O,e)||!q||q.enabled||r.enable(a,this)}));a(this.pluginMaps,b(this,function(a){var b=
d(z,a.id);b&&!b.enabled&&r.enable(a,this)}));this.enabling=!1;this.check()},on:function(a,b){var c=this.events[a];c||(c=this.events[a]=[]);c.push(b)},emit:function(a,b){v(this.events[a],function(a){a(b)});"error"===a&&delete this.events[a]}};r={config:w,contextName:k,registry:z,defined:D,urlFetched:T,defQueue:K,defQueueMap:{},Module:Z,makeModuleMap:C,nextTick:n.nextTick,onError:y,configure:function(b){b.baseUrl&&"/"!==b.baseUrl.charAt(b.baseUrl.length-1)&&(b.baseUrl+="/");var d=w.shim,e={paths:!0,
bundles:!0,config:!0,map:!0};a(b,function(a,b){e[b]?(w[b]||(w[b]={}),c(w[b],a,!0,!0)):w[b]=a});b.bundles&&a(b.bundles,function(a,b){v(a,function(a){a!==b&&(ba[a]=b)})});b.shim&&(a(b.shim,function(a,b){m(a)&&(a={deps:a});!a.exports&&!a.init||a.exportsFn||(a.exportsFn=r.makeShimExports(a));d[b]=a}),w.shim=d);b.packages&&v(b.packages,function(a){var b;a="string"===typeof a?{name:a}:a;b=a.name;a.location&&(w.paths[b]=a.location);w.pkgs[b]=a.name+"/"+(a.main||"main").replace(ha,"").replace(R,"")});a(z,
function(a,b){a.inited||a.map.unnormalized||(a.map=C(b,null,!0))});(b.deps||b.callback)&&r.require(b.deps||[],b.callback)},makeShimExports:function(a){return function(){var b;a.init&&(b=a.init.apply(h,arguments));return b||a.exports&&f(a.exports)}},makeRequire:function(a,b){function e(c,d,f){var u,g;b.enableBuildCallback&&d&&t(d)&&(d.__requireJsBuild=!0);if("string"===typeof c){if(t(d))return y(l("requireargs","Invalid require call"),f);if(a&&p(O,c))return O[c](z[a.id]);if(n.get)return n.get(r,c,
a,e);u=C(c,a,!1,!0);u=u.id;return p(D,u)?D[u]:y(l("notloaded",'Module name "'+u+'" has not been loaded yet for context: '+k+(a?"":". Use require([])")))}fa();r.nextTick(function(){fa();g=I(C(null,a));g.skipMap=b.skipMap;g.init(c,d,f,{enabled:!0});J()});return e}b=b||{};c(e,{isBrowser:H,toUrl:function(b){var c,d=b.lastIndexOf("."),e=b.split("/")[0];-1!==d&&("."!==e&&".."!==e||1<d)&&(c=b.substring(d,b.length),b=b.substring(0,d));return r.nameToUrl(G(b,a&&a.id,!0),c,!0)},defined:function(b){return p(D,
C(b,a,!1,!0).id)},specified:function(b){b=C(b,a,!1,!0).id;return p(D,b)||p(z,b)}});a||(e.undef=function(b){M();var c=C(b,a,!0),e=d(z,b);e.undefed=!0;u(b);delete D[b];delete T[c.url];delete aa[b];g(K,function(a,c){a[0]===b&&K.splice(c,1)});delete r.defQueueMap[b];e&&(e.events.defined&&(aa[b]=e.events),E(b))});return e},enable:function(a){d(z,a.id)&&I(a).enable()},completeLoad:function(a){var b,c,e=d(w.shim,a)||{},k=e.exports;for(M();K.length;){c=K.shift();if(null===c[0]){c[0]=a;if(b)break;b=!0}else c[0]===
a&&(b=!0);Q(c)}r.defQueueMap={};c=d(z,a);if(!b&&!p(D,a)&&c&&!c.inited)if(!w.enforceDefine||k&&f(k))Q([a,e.deps||[],e.exportsFn]);else return B(a)?void 0:y(l("nodefine","No define call for "+a,null,[a]));J()},nameToUrl:function(a,b,c){var e,f,k;(e=d(w.pkgs,a))&&(a=e);if(e=d(ba,a))return r.nameToUrl(e,b,c);if(n.jsExtRegExp.test(a))e=a+(b||"");else{e=w.paths;a=a.split("/");for(f=a.length;0<f;--f)if(k=a.slice(0,f).join("/"),k=d(e,k)){m(k)&&(k=k[0]);a.splice(0,f,k);break}e=a.join("/");e+=b||(/^data\:|\?/.test(e)||
c?"":".js");e=("/"===e.charAt(0)||e.match(/^[\w\+\.\-]+:/)?"":w.baseUrl)+e}return w.urlArgs?e+((-1===e.indexOf("?")?"?":"&")+w.urlArgs):e},load:function(a,b){n.load(r,a,b)},execCb:function(a,b,c,e){return b.apply(e,c)},onScriptLoad:function(a){if("load"===a.type||ia.test((a.currentTarget||a.srcElement).readyState))L=null,a=N(a),r.completeLoad(a.id)},onScriptError:function(b){var c=N(b);if(!B(c.id)){var e=[];a(z,function(a,b){0!==b.indexOf("_@r")&&v(a.depMaps,function(a){a.id===c.id&&e.push(b);return!0})});
return y(l("scripterror",'Script error for "'+c.id+(e.length?'", needed by: '+e.join(", "):'"'),b,[c.id]))}}};r.require=r.makeRequire();return r}function F(){if(L&&"interactive"===L.readyState)return L;g(document.getElementsByTagName("script"),function(a){if("interactive"===a.readyState)return L=a});return L}var n,k,A,G,B,u,L,I,y,M,U=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,Q=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,R=/\.js$/,ha=/^\.\//;k=Object.prototype;var N=k.toString,ga=k.hasOwnProperty,
H=!("undefined"===typeof window||"undefined"===typeof navigator||!window.document),ea=!H&&"undefined"!==typeof importScripts,ia=H&&"PLAYSTATION 3"===navigator.platform?/^complete$/:/^(complete|loaded)$/,Y="undefined"!==typeof opera&&"[object Opera]"===opera.toString(),J={},E={},S=[],P=!1;if("undefined"===typeof define){if("undefined"!==typeof requirejs){if(t(requirejs))return;E=requirejs;requirejs=void 0}"undefined"===typeof require||t(require)||(E=require,require=void 0);n=requirejs=function(a,b,
c,e){var f,k="_";m(a)||"string"===typeof a||(f=a,m(b)?(a=b,b=c,c=e):a=[]);f&&f.context&&(k=f.context);(e=d(J,k))||(e=J[k]=n.s.newContext(k));f&&e.configure(f);return e.require(a,b,c)};n.config=function(a){return n(a)};n.nextTick="undefined"!==typeof setTimeout?function(a){setTimeout(a,4)}:function(a){a()};require||(require=n);n.version="2.1.22";n.jsExtRegExp=/^\/|:|\?|\.js$/;n.isBrowser=H;k=n.s={contexts:J,newContext:C};n({});v(["toUrl","undef","defined","specified"],function(a){n[a]=function(){var b=
J._;return b.require[a].apply(b,arguments)}});H&&(A=k.head=document.getElementsByTagName("head")[0],G=document.getElementsByTagName("base")[0])&&(A=k.head=G.parentNode);n.onError=e;n.createNode=function(a,b,c){b=a.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml","html:script"):document.createElement("script");b.type=a.scriptType||"text/javascript";b.charset="utf-8";b.async=!0;return b};n.load=function(a,b,c){var e=a&&a.config||{},d;if(H){d=n.createNode(e,b,c);if(e.onNodeCreated)e.onNodeCreated(d,
e,b,c);d.setAttribute("data-requirecontext",a.contextName);d.setAttribute("data-requiremodule",b);!d.attachEvent||d.attachEvent.toString&&0>d.attachEvent.toString().indexOf("[native code")||Y?(d.addEventListener("load",a.onScriptLoad,!1),d.addEventListener("error",a.onScriptError,!1)):(P=!0,d.attachEvent("onreadystatechange",a.onScriptLoad));d.src=c;I=d;G?A.insertBefore(d,G):A.appendChild(d);I=null;return d}if(ea)try{importScripts(c),a.completeLoad(b)}catch(f){a.onError(l("importscripts","importScripts failed for "+
b+" at "+c,f,[b]))}};H&&!E.skipDataMain&&g(document.getElementsByTagName("script"),function(a){A||(A=a.parentNode);if(B=a.getAttribute("data-main"))return y=B,E.baseUrl||(u=y.split("/"),y=u.pop(),M=u.length?u.join("/")+"/":"./",E.baseUrl=M),y=y.replace(R,""),n.jsExtRegExp.test(y)&&(y=B),E.deps=E.deps?E.deps.concat(y):[y],!0});define=function(a,b,c){var e,d;"string"!==typeof a&&(c=b,b=a,a=null);m(b)||(c=b,b=null);!b&&t(c)&&(b=[],c.length&&(c.toString().replace(U,"").replace(Q,function(a,c){b.push(c)}),
b=(1===c.length?["require"]:["require","exports","module"]).concat(b)));P&&(e=I||F())&&(a||(a=e.getAttribute("data-requiremodule")),d=J[e.getAttribute("data-requirecontext")]);d?(d.defQueue.push([a,b,c]),d.defQueueMap[a]=!0):S.push([a,b,c])};define.amd={jQuery:!0};n.exec=function(a){return eval(a)};n(E)}})(this);
define("configUtils",["require","exports","module"],function(h,t,m){function v(d){d=d||{};d.type=(d.type||"GET").toUpperCase();d.dataType=d.dataType||"json";var a=g(d.url,d.data),c=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");c.onreadystatechange=function(){if(4==c.readyState){var a=c.status;200<=a&&300>a?d.success&&d.success(c.responseText,c.responseXML):d.fail&&d.fail(a)}};0<=d.url.indexOf("?")&&(d.url=d.url.substring(0,d.url.indexOf("?")));"GET"==d.type?(c.open("GET",
d.url+"?"+a,d.async),c.send(null)):"POST"==d.type&&(c.open("POST",d.url,d.async),c.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),c.send(a))}function g(d,a){var c=[];0<=d.indexOf("?")&&(c=d.substr(d.indexOf("?")+1).split("&"));for(var b in a)c.push(encodeURIComponent(b)+"="+encodeURIComponent(a[b]));c.push(("v="+Math.random()).replace(".",""));return c.join("&")}h=window.APP_CONFIG;var p={};h.SERVER_CONFIG_API&&(p=null,v({url:h.SERVER_CONFIG_API,async:!1,success:function(d){p=
JSON.parse(d)},fail:function(d){console.error("AJAX SERVER_CONFIG_API ERROR")}}));h=$.extend(!0,{},h,p);if(t=localStorage.getItem("schoolConfig"))"string"==typeof t&&(t=JSON.parse(t)),t.footer&&t.footer.normal&&(h.FOOTER_TEXT=t.footer.normal),t.skin&&(h.THEME=t.skin),t.rootPath&&(h.APP_INFO_ROOT_PATH=t.rootPath);return h});define("router",["require","exports","module"],function(h,t,m){h=new Router;h.init();return h});
define("log",["require","exports","module"],function(h,t,m){return{error:function(h){console.error(h)},debug:function(h){console.log(h)},warn:function(h){console.warn(h)}}});
define("utils","require exports module configUtils router log".split(" "),function(h,t,m){var v=h("configUtils"),g=h("router"),p=h("log"),d={loadCompiledPage:function(a,c){var b=d.getConfig("INNER_INDEX_MODE");if(!d.getConfig("DEBUG_MODE")&&window.__Template)return new Hogan.Template(__Template[a]);var e=d.getCurrentRoute(),f="",l=null,l=c?this.getPageFullPath(a,c)+".html":"./modules/"+e+"/"+a+".html";b&&(l="."+l);$.ajax({url:l,dataType:"html",async:!1,cache:!1}).done(function(a){f=a});return Hogan.compile(f)},
getPageFullPath:function(a,c){var b="";try{c("text!./"+a+".html")}catch(e){b=e.message.match("text!(.*).html")[1],b="./"+b}return b},loadCompiledPage2:function(a){var c=null;try{c=h("text!./"+a+".html")}catch(b){return a=b.message.match("text!(.*).html")[1],$.ajax({url:"./"+a+".html",dataType:"html",async:!1,cache:!1}).done(function(a){c=a}),Hogan.compile(c)}},getCurrentRoute:function(){return g.getRoute()[0]},getEcharts:function(){var a=$.Deferred();h(["echarts"],function(c){a.resolve(c)});return a.promise()},
miniMode:function(){$("header").hide();$("footer").remove();$("main").css({"margin-top":"0","max-width":"none",width:"100%",padding:"0"});$(document).trigger("resize")},getUserParams:function(){var a={},c=location.search&&location.search.substr(1);c&&(c=c.split("&"),_.each(c,function(b){b=b.split("=");2==b.length&&(a[b[0]]=b[1])}));return a},getEcharts3:function(a,c,b){var e=$.Deferred();a=$(a);h(["echarts"],function(d){d=d.init(a[0]);b||(a.html('<div style="display:table;width:100%;height:100%;"><div class="bh-color-primary-3" style="text-align:center;vertical-align:middle;display:table-cell;"><i class="iconfont" style="font-size:128px;">&#xe62a;</i><br><span class="h3" style="color:#999">\u6682\u65e0\u6570\u636e</span></div></div>'),
e.reject(d));d.setOption(c);e.resolve(d)});return e.promise()},getConfig:function(a){return v[a]},switchModule:function(a){var c=location.href.replace(/\#.*/,"");location.href=c+"#/"+a},goto:function(a,c){var b=d.getCurrentRoute(),e=location.href.replace(/\#.*/,"");c?window.open("#/"+a):0<=("#/"+a).indexOf("#/"+b)?(location.href=e+"#/"+a,location.reload()):location.href=e+"#/"+a},doAjax:function(a,c,b){var e=$.Deferred(),f=d.getConfig("FE_DEBUG_MODE");if("object"===typeof a)return e.resolve(a);if(_.endsWith(a,
".do")&&f)p.error("\u6b63\u5f0f\u5f00\u53d1\u73af\u5883\u9700\u53bb\u6389config.js\u4e2d\u7684\u201cFE_DEBUG_MODE\u201d\u914d\u7f6e\u9879\uff01\uff01\uff01");else return $(".app-ajax-loading").jqxLoader("open"),$.ajax({type:b||"POST",url:a,traditional:!0,data:c||{},dataType:"json",success:function(a){try{"string"==typeof a&&(a=JSON.parse(a)),"undefined"!=typeof a.loginURL&&""!=a.loginURL&&(window.location.href=a.loginURL)}catch(b){console.log(b)}$(".app-ajax-loading").jqxLoader("close");e.resolve(a)},
error:function(a){$(".app-ajax-loading").jqxLoader("close");var b=JSON.parse(a.responseText);"undefined"!=typeof b.loginURL&&""!=a.loginURL&&(window.location.href=b.loginURL);e.reject(a)}}),e.promise()},doSyncAjax:function(a,c,b){a=$.ajax({type:b||"GET",url:a,traditional:!0,data:c||{},dataType:"json",cache:!1,async:!1,error:function(a){var b=JSON.parse(a.responseText);"undefined"!=typeof b.loginURL&&""!=a.loginURL&&(window.location.href=b.loginURL)}});if(200!=a.status)return{};c=JSON.parse(a.responseText);
"undefined"!=typeof c.loginURL&&""!=a.loginURL&&(window.location.href=c.loginURL);return c},openModalDialog:function(a){$(a.element).jqxWindow({width:a.width||550,height:a.height||220,closeButtonSize:24,showCloseButton:!0,resizable:!1,autoOpen:!1,draggable:!1,isModal:!0,title:a.title,content:a.content});$(a.element).addClass("global-dialog-instance");$(a.element).jqxWindow("open");$(a.element).find(a.closeElement).click(function(){$(a.element).jqxWindow("close")})},warningDialog:function(a){if(a){var c=
[{text:"\u786e\u8ba4",className:"bh-btn-warning"},{text:"\u53d6\u6d88",className:"bh-btn-default"}];a.callback&&(c[0].callback=a.callback);c={iconType:"warning",title:a.title,content:a.content,buttons:a.buttons||c};a.height&&(c.height=a.height);a.width&&(c.width=a.width);$.bhDialog(c)}},dialog:function(a){var c=a.type||"success",b=[],e=null,d=null;if("success"==c||"done"==c)e="bh-btn-success",d="success";else if("warn"==c||"warning"==c||"warning"==c)e="bh-btn-warning",d="warning";else if("danger"==
c||"error"==c)e="bh-btn-danger",d="danger";else if("confirm"==c)e="bh-btn-warning",d="warning";else return;a.iconType=d;a.okCallback&&b.push({text:a.okText||"\u786e\u8ba4",className:e,callback:a.okCallback});a.cancelCallback&&b.push({text:a.noText||a.cancelText||"\u53d6\u6d88",className:"bh-btn-default",callback:a.cancelCallback});a.okCallback&&!a.cancelCallback&&"confirm"==c&&b.push({text:a.noText||a.cancelText||"\u53d6\u6d88",className:"bh-btn-default"});a.buttons=a.buttonList||b;$.bhDialog(a)},
window:function(a){var c=a.params||{},b=a.title,d=a.content,f=a.buttons||a.btns,g=a.callback;a.width&&(c.width=a.width);a.height&&(c.height=a.height);a.inIframe&&(c.inIframe=a.inIframe);return BH_UTILS.bhWindow(d,b,f,c,g)}};return d});
define("resourceConfig",["require","exports","module"],function(h,t,m){return{PUBLIC_CSS:["/fe_components/iconfont/iconfont.css","/fe_components/jqwidget/{{theme}}/bh{{version}}.min.css","/fe_components/jqwidget/{{theme}}/bh-scenes.min.css","/bower_components/animate.css/animate.min.css"],PUBLIC_BASE_JS:["/fe_components/bh_utils.js","/fe_components/amp/ampPlugins.min.js"],PUBLIC_NORMAL_JS:["/fe_components/bh{{version}}.min.js","/fe_components/jqwidget/jqxwidget.min.js"],DEBUG_JS:["/fe_components/mock/mock.js"],
IE_SHIV_JS:["/bower_components/html5shiv/dist/html5shiv.min.js"]}});
define("ubaseUtils","require exports module configUtils router utils".split(" "),function(h,t,m){h("configUtils");var v=h("router"),g=h("utils"),p={getSortedModules:function(){var d=g.getConfig("MODULES");return d=_.sortBy(d,function(a){return-a.route.length})},showLoading:function(){$(".app-loading").addClass("app-loading-show")},hideLoading:function(){$(".app-loading").removeClass("app-loading-show")},cleanMainArea:function(){$("body>main").empty()},genMainLayout:function(){$("body").prepend('<div id="headerPlaceholder"></div><div class="sc-container-outerFrame"><div class="sc-container bh-border-h" bh-container-role="container"><div id="bodyPlaceholder"></div></div></div><div id="footerPlaceholder"></div><div id="levityPlaceholder"></div>')},
getFixedMainLayout:function(){$("body").prepend("<header></header><main></main><footer></footer>")},getFirstModules:function(){var d=g.getConfig("MODULES"),a=g.getConfig("APP_ENTRY");return _.isEmpty(d)?"":(a||d[0].route).trim()},renderHeader:function(){var d=g.getConfig("HEADER"),a=g.getConfig("MODULES")||[],c=p.getFirstModules(),b=g.getConfig("APP_TITLE"),e=[],f=window.location.hash,f=f.replace("#/","");-1!=f.indexOf("/")&&(f=f.substring(0,f.indexOf("/")));for(var l=0;l<a.length;l++){var h={title:a[l].title,
route:a[l].route,hide:a[l].hide,isOpenNewPage:a[l].isOpenNewPage,href:"#/"+a[l].route};if(a[l].isOpenNewPage){var m=location.href.indexOf("/sys/"),m=location.href.substr(0,m);h.href=a[l].route.replace(/\{context\}/,m);_.startsWith(a[l].route,"http://")&&(h.href=a[l].route)}e.push(h)}for(l=0;l<e.length;l++)e[l].route===(f||c)&&(e[l].active=!0);d.feedback=g.getConfig("feedback");d.feedbackData=g.getConfig("feedbackData");d.userInfo=g.getConfig("userInfo")||d.userInfo;d.nav=e;d.title=b;$("body").children("header").bhHeader(d)},
initFooter:function(){var d=g.getConfig("FOOTER_TEXT");$("body").children("footer").bhFooter({text:d||"\u7248\u6743\u4fe1\u606f\uff1a\u00a9 2015 \u6c5f\u82cf\u91d1\u667a\u6559\u80b2\u4fe1\u606f\u80a1\u4efd\u6709\u9650\u516c\u53f8 \u82cfICP\u590710204514\u53f7"})},setContentMinHeight:function(d){if(d&&d&&0<d.length){var a=$(window).height(),c=$("[bh-footer-role=footer]").outerHeight(),b=$("[bh-header-role=bhHeader]").outerHeight();d.css("min-height",a-b-c-1+"px")}},getUserParams:function(){var d={},
a=location.search&&location.search.substr(1);a&&(a=a.split("&"),_.each(a,function(a){a=a.split("=");2==a.length&&(d[a[0]]=a[1])}));return d},initFramework:function(){var d=g.getConfig("MINI_MODE"),a=this.getUserParams();p.hideLoading();p.getFixedMainLayout();p.renderHeader();p.initFooter();p.resetJqueryHtmlMethod();d||"1"==a.min?g.miniMode():p.initEvaluate();p.configRouter();$("body").niceScroll({zindex:99999});$(".app-ajax-loading").jqxLoader({});p.setContentMinHeight($("body").children("main").children("article"));
$(function(){$(window).resize(function(){p.setContentMinHeight($("body").children("main").children("article"))})})},initEvaluate:function(){var d=g.getConfig("APP_INFO_ROOT_PATH"),a=g.getConfig("APP_ID"),c=sessionStorage.getItem("ampUserId"),b=sessionStorage.getItem("ampUserName");$.bhEvaluate.init({appId:a,userName:b,userId:c,rootPath:d})},configRouter:function(){var d=this,a=null;v.configure({delimiter:"/",after:function(){var c=g.getCurrentRoute();if(a!=c){a=c;$(".bh-paper-pile-dialog").remove();
$(".sc-container").removeClass("bh-border-transparent bh-bg-transparent");var b=$("body");b.children("[bh-footer-role=footer]").removeAttr("style");d.setContentMinHeight(b.children("main").children("article"));d.reselectHeaderNav();setTimeout(function(){b.children("main").children("article[bh-layout-role=navLeft]").children("section").css("width","initial")},10);try{$(".jqx-window").jqxWindow("destroy")}catch(e){}}}})},reselectHeaderNav:function(){for(var d=g.getCurrentRoute(),a=g.getConfig("MODULES"),
c=0,b=0;b<a.length;b++)if(a[b].route==d){c=b+1;break}$("header").bhHeader("resetNavActive",{activeIndex:c})},getCurrentModule:function(){for(var d=g.getCurrentRoute(),a=g.getConfig("MODULES"),c=null,b=0;b<a.length;b++)if(a[b].route==d){c=a[b];break}return c},resetJqueryHtmlMethod:function(){$.fn.oldHtmlFn=$.fn.html;var d=this;$.fn.html=function(a,c){var b=null,b=void 0!==a?$(this).oldHtmlFn(a):$(this).oldHtmlFn();if(c){var e=$("body");d.setContentMinHeight(e.children("main")&&e.children("main").children("article"))}d.setButtonAuth();
return b}},setButtonAuth:function(){var d=this.getCurrentModule(),a=$('[manageAuth="Y"]'),c=d&&d.buttons;_.each(a,function(a){_.includes(c,$(a).attr("data-auth")||$(a).attr("id"))||$(a).remove()})},getIEVersion:function(){var d=null;0<navigator.userAgent.indexOf("MSIE")&&(0<navigator.userAgent.indexOf("MSIE 6.0")&&(d=6),0<navigator.userAgent.indexOf("MSIE 7.0")&&(d=7),0<navigator.userAgent.indexOf("MSIE 9.0")&&!window.innerWidth&&(d=8),0<navigator.userAgent.indexOf("MSIE 9.0")&&(d=9));return d}};
return p});
define("baseView","require exports module utils ubaseUtils log".split(" "),function(h,t,m){h("utils");var v=h("ubaseUtils"),g=h("log"),p=function(){this.$rootElement=$("body>main");this._subView=[];this._bindedEventElement=[]},d=$("body");p.prototype={initialize:function(){},getRouterParams:function(){var a={};_.each(this._routerParams,function(c,b){a[b]=c});return a},_coreBindEvent:function(){var a=this;_.isEmpty(this.eventMap)||_.each(_.keys(this.eventMap),function(c){var b=null,e=null;a.eventMap[c]||
g.error("eventMap\u4e2d\u9009\u62e9\u5668\u201c"+c+"\u201d\u7684\u4e8b\u4ef6\u5904\u7406\u51fd\u6570\u672a\u5b9a\u4e49\uff01\uff01\uff01");a.__checkEventConflict(c);if(0<c.indexOf("@"))b=c.substr(0,c.indexOf("@")),e=c.substr(c.indexOf("@")+1),d.on(e,b,a.eventMap[c].bind(a));else d.on("click",c,a.eventMap[c].bind(a))})},__checkEventConflict:function(a){_.contains(this._bindedEventElement,a)?g.warn("\u9009\u62e9\u5668:"+a+"\u5728eventMap\u4e2d\u51fa\u73b0\u91cd\u590d\u7ed1\u5b9a[\u6ce8\uff1a\u6a21\u5757\u4e2d\u6240\u6709eventMap\u7684\u9009\u62e9\u5668\u987b\u4fdd\u8bc1\u552f\u4e00]"):
this._bindedEventElement.push(a)},setHtml:function(a){this.$rootElement.html(a);v.setContentMinHeight($("body").children("main").children("article"))},setRootHtml:function(a){this.$rootElement.html(a);v.setContentMinHeight($("body").children("main").children("article"))},setRootElement:function(a){this.$rootElement=a},_coreBindEventForSubView:function(a){var c=this;_.isEmpty(a)||(a.realInit=a.realInit||a.initialize.bind(a),a.pushSubView=function(a){c.pushSubView(a)},a.initialize=function(b){a.realInit(b);
a.__eventBinded||(a.__eventBinded=!0,_.each(_.keys(a.eventMap),function(b){a.eventMap[b]||g.error("eventMap\u4e2d\u9009\u62e9\u5668\u201c"+b+"\u201d\u7684\u4e8b\u4ef6\u5904\u7406\u51fd\u6570\u672a\u5b9a\u4e49\uff01\uff01\uff01");c.__checkEventConflict(b);if(0<b.indexOf("@"))realElem=b.substr(0,b.indexOf("@")),event=b.substr(b.indexOf("@")+1),d.on(event,realElem,a.eventMap[b].bind(a));else d.on("click",b,a.eventMap[b].bind(a))}))})},pushSubView:function(a){var c=this;a.constructor===Array?_.each(a,
function(a){c._pushSubView(a)}):this._pushSubView(a)},_pushSubView:function(a){_.contains(this._subView,a)||(a.__eventBinded=!1,this._subView.push(a),a.parent=this,this._coreBindEventForSubView(a))}};return function(a,c){var b=new p;b._routerParams=c;$.extend(b,a);d.off();b.initialize();b._coreBindEvent()}});
define("boot","require exports module utils resourceConfig router baseView ubaseUtils".split(" "),function(h,t,m){function v(a){var c=document.createElement("link");c.type="text/css";c.rel="stylesheet";c.href=a;document.getElementsByTagName("head")[0].appendChild(c)}var g=h("utils"),p=h("resourceConfig"),d=h("router"),a=h("baseView"),c=h("ubaseUtils");return{start:function(b){g.getConfig("RESOURCE_SERVER");var d=g.getConfig("DEMO_MODE"),f=c.getSortedModules(),l=c.getFirstModules("");this.setLoadingStyle();
this.setTitle();this.loadPublicCss();this.loadPrivateCss();var p=this.getPublicBaseJs(),m=this.getPublicNormalJs(),n=this.getCurrentAppViews(b&&(b.views||b.VIEWS)),k=this.getUserEntry();h(p,function(){h(m,function(){h(["utils","router"].concat(d?n:[]),function(b,d){for(var e=null,u=0;u<f.length;u++)(function(){var k=3+u,g=f[u].route&&f[u].route.trim();if(!g.isOpenNewPage)d.on("/"+g+"/?((w|.)*)",function(d){if(e!==f[k-3].route){c.cleanMainArea();c.showLoading();d=d?d.split("/"):[];try{h([n[k-3]],function(b){a(b,
d);c.hideLoading()})}catch(u){console.log(u)}e=b.getCurrentRoute()}})})();c.initFramework();k?d.init():d.init("/"+l)})})})},getUserEntry:function(){var a=g.getCurrentRoute(),c=g.getConfig("MODULES");if(_.isEmpty(c))return"";-1==_.findIndex(c,function(c){return c.route==a})&&(a=c[0].route,g.goto(a));return a},loadPublicCss:function(){for(var a=g.getConfig("RESOURCE_SERVER"),c=g.getConfig("BH_VERSION"),d=p.PUBLIC_CSS,l=g.getConfig("THEME")||"blue",c=c?"-"+c:"",h=/fe_components|bower_components/,m=0;m<
d.length;m++)h.test(d[m])?v(a+d[m].replace(/\{\{theme\}\}/,l).replace(/\{\{version\}\}/,c)):v(d[m])},loadPrivateCss:function(){var a=g.getConfig("DEBUG_MODE"),c=g.getConfig("FE_DEBUG_MODE"),f=g.getConfig("DEMO_MODE"),l=g.getConfig("INNER_INDEX_MODE");if(a||c||!window.__Template)if(d.getRoute(),a=g.getConfig("MODULES")){if(f)for(f=0;f<a.length;f++)v((l?".":"")+"./modules/"+a[f].route+"/"+a[f].route+".css");else v((l?".":"")+"./public/css/base.css");v((l?".":"")+"./public/css/style.css")}},getPublicBaseJs:function(){var a=
g.getConfig("RESOURCE_SERVER"),d=p.PUBLIC_BASE_JS,f=p.IE_SHIV_JS,l=c.getIEVersion(),h=[],m=/fe_components|bower_components/;l&&9==l&&(d=d.concat(f));for(f=0;f<d.length;f++)m.test(d[f])?h.push(a+d[f]):h.push(d[f]);return h},getPublicNormalJs:function(){var a=g.getConfig("RESOURCE_SERVER"),c=g.getConfig("FE_DEBUG_MODE"),d=g.getConfig("BH_VERSION"),l=p.PUBLIC_NORMAL_JS,d=d?"-"+d:"",h=p.DEBUG_JS,m=[];c&&(l=l.concat(h));c=/fe_components|bower_components/;for(h=0;h<l.length;h++)c.test(l[h])?m.push(a+l[h].replace(/\{\{version\}\}/,
d)):m.push(l[h]);return m},getCurrentAppViews:function(){var a=c.getSortedModules(),d=g.getConfig("INNER_INDEX_MODE"),f=[];if(a){for(var h=0;h<a.length;h++)a[h].isOpenNewPage?f.push(""):f.push((d?"../":"")+"modules/"+a[h].route+"/"+a[h].route);return f}},setTitle:function(){var a=g.getConfig("APP_TITLE"),c=document.createElement("title");c.innerText=a;document.getElementsByTagName("head")[0].appendChild(c)},setLoadingStyle:function(){var a=document.createElement("style");a.innerText=".app-ajax-loading .bh-loader-icon-line-border{border: 0px solid #ddd;box-shadow:none;}.app-ajax-loading{position:fixed;z-index:30000;}.app-loading{position:absolute;opacity:0;top:150px;left:-75px;margin-left:50%;z-index:-1;text-align:center}.app-loading-show{z-index:9999;animation:fade-in;animation-duration:0.5s;-webkit-animation:fade-in 0.5s}@keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}@-webkit-keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}.spinner>div{width:30px;height:30px;background-color:#4DAAF5;border-radius:100%;display:inline-block;-webkit-animation:bouncedelay 1.4s infinite ease-in-out;animation:bouncedelay 1.4s infinite ease-in-out;-webkit-animation-fill-mode:both;animation-fill-mode:both}.spinner .bounce1{-webkit-animation-delay:-.32s;animation-delay:-.32s}.spinner .bounce2{-webkit-animation-delay:-.16s;animation-delay:-.16s}@-webkit-keyframes bouncedelay{0%,100%,80%{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1)}}@keyframes bouncedelay{0%,100%,80%{transform:scale(0);-webkit-transform:scale(0)}40%{transform:scale(1);-webkit-transform:scale(1)}}";
document.getElementsByTagName("head")[0].appendChild(a);$("body").append('  <div class="app-ajax-loading" style="position:fixed;z-index:30000;background-color:rgba(0,0,0,0);"></div><div class="app-loading"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>');c.showLoading()}}});
define("text",["module"],function(h){function t(a,b){return void 0===a||""===a?b:a}var m,v,g,p,d,a=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"],c=/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,b=/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,e="undefined"!==typeof location&&location.href,f=e&&location.protocol&&location.protocol.replace(/\:/,""),l=e&&location.hostname,C=e&&(location.port||void 0),F={},n=h.config&&h.config()||{};m={version:"2.0.15",strip:function(a){if(a){a=a.replace(c,
"");var d=a.match(b);d&&(a=d[1])}else a="";return a},jsEscape:function(a){return a.replace(/(['\\])/g,"\\$1").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r").replace(/[\u2028]/g,"\\u2028").replace(/[\u2029]/g,"\\u2029")},createXhr:n.createXhr||function(){var b,c,d;if("undefined"!==typeof XMLHttpRequest)return new XMLHttpRequest;if("undefined"!==typeof ActiveXObject)for(c=0;3>c;c+=1){d=a[c];try{b=new ActiveXObject(d)}catch(e){}if(b){a=
[d];break}}return b},parseName:function(a){var b,c,d=!1,e=a.lastIndexOf(".");b=0===a.indexOf("./")||0===a.indexOf("../");-1!==e&&(!b||1<e)?(b=a.substring(0,e),c=a.substring(e+1)):b=a;a=c||b;e=a.indexOf("!");-1!==e&&(d="strip"===a.substring(e+1),a=a.substring(0,e),c?c=a:b=a);return{moduleName:b,ext:c,strip:d}},xdRegExp:/^((\w+)\:)?\/\/([^\/\\]+)/,useXhr:function(a,b,c,d){var e,f;f=m.xdRegExp.exec(a);if(!f)return!0;a=f[2];e=f[3];e=e.split(":");f=e[1];e=e[0];if((c=(!a||a===b)&&(!e||e.toLowerCase()===
c.toLowerCase()))&&!(c=!f&&!e))a:if(f===d)c=!0;else{if(a===b)if("http"===a){c=t(f,"80")===t(d,"80");break a}else if("https"===a){c=t(f,"443")===t(d,"443");break a}c=!1}return c},finishLoad:function(a,b,c,d){c=b?m.strip(c):c;n.isBuild&&(F[a]=c);d(c)},load:function(a,b,c,d){if(d&&d.isBuild&&!d.inlineText)c();else{n.isBuild=d&&d.isBuild;var g=m.parseName(a);d=g.moduleName+(g.ext?"."+g.ext:"");var h=b.toUrl(d),p=n.useXhr||m.useXhr;0===h.indexOf("empty:")?c():!e||p(h,f,l,C)?m.get(h,function(b){m.finishLoad(a,
g.strip,b,c)},function(a){c.error&&c.error(a)}):b([d],function(a){m.finishLoad(g.moduleName+"."+g.ext,g.strip,a,c)})}},write:function(a,b,c,d){F.hasOwnProperty(b)&&(d=m.jsEscape(F[b]),c.asModule(a+"!"+b,"define(function () { return '"+d+"';});\n"))},writeFile:function(a,b,c,d,e){b=m.parseName(b);var f=b.ext?"."+b.ext:"",g=b.moduleName+f,h=c.toUrl(b.moduleName+f)+".js";m.load(g,c,function(b){b=function(a){return d(h,a)};b.asModule=function(a,b){return d.asModule(a,h,b)};m.write(a,g,b,e)},e)}};if("node"===
n.env||!n.env&&"undefined"!==typeof process&&process.versions&&process.versions.node&&!process.versions["node-webkit"]&&!process.versions["atom-shell"])v=require.nodeRequire("fs"),m.get=function(a,b,c){try{var d=v.readFileSync(a,"utf8");"\ufeff"===d[0]&&(d=d.substring(1));b(d)}catch(e){c&&c(e)}};else if("xhr"===n.env||!n.env&&m.createXhr())m.get=function(a,b,c,d){var e=m.createXhr(),f;e.open("GET",a,!0);if(d)for(f in d)d.hasOwnProperty(f)&&e.setRequestHeader(f.toLowerCase(),d[f]);if(n.onXhr)n.onXhr(e,
a);e.onreadystatechange=function(d){if(4===e.readyState&&(d=e.status||0,399<d&&600>d?(d=Error(a+" HTTP status: "+d),d.xhr=e,c&&c(d)):b(e.responseText),n.onXhrComplete))n.onXhrComplete(e,a)};e.send(null)};else if("rhino"===n.env||!n.env&&"undefined"!==typeof Packages&&"undefined"!==typeof java)m.get=function(a,b){var c,d,e=new java.io.File(a),f=java.lang.System.getProperty("line.separator"),e=new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(e),"utf-8")),g="";try{c=
new java.lang.StringBuffer;(d=e.readLine())&&d.length()&&65279===d.charAt(0)&&(d=d.substring(1));for(null!==d&&c.append(d);null!==(d=e.readLine());)c.append(f),c.append(d);g=String(c.toString())}finally{e.close()}b(g)};else if("xpconnect"===n.env||!n.env&&"undefined"!==typeof Components&&Components.classes&&Components.interfaces)g=Components.classes,p=Components.interfaces,Components.utils["import"]("resource://gre/modules/FileUtils.jsm"),d="@mozilla.org/windows-registry-key;1"in g,m.get=function(a,
b){var c,e,f,h={};d&&(a=a.replace(/\//g,"\\"));f=new FileUtils.File(a);try{c=g["@mozilla.org/network/file-input-stream;1"].createInstance(p.nsIFileInputStream),c.init(f,1,0,!1),e=g["@mozilla.org/intl/converter-input-stream;1"].createInstance(p.nsIConverterInputStream),e.init(c,"utf-8",c.available(),p.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER),e.readString(c.available(),h),e.close(),c.close(),b(h.value)}catch(l){throw Error((f&&f.path||"")+": "+l);}};return m});
require([],function(){function h(){require(["boot","utils","text"],function(h,t){h.start();var g=t.getConfig("RESOURCE_SERVER");require.config({waitSeconds:0,baseUrl:"./",paths:{echarts:g+"/bower_components/echarts3/dist/echarts"}})})}var t=require;window.APP_CONFIG?h():t(["./config"],function(m){window.APP_CONFIG=m;h()})});define("index",["boot","utils","text"],function(){});