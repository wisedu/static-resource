var requirejs,require,define;!function(global){function isFunction(e){return"[object Function]"===ostring.call(e)}function isArray(e){return"[object Array]"===ostring.call(e)}function each(e,t){if(e){var n;for(n=0;n<e.length&&(!e[n]||!t(e[n],n,e));n+=1);}}function eachReverse(e,t){if(e){var n;for(n=e.length-1;n>-1&&(!e[n]||!t(e[n],n,e));n-=1);}}function hasProp(e,t){return hasOwn.call(e,t)}function getOwn(e,t){return hasProp(e,t)&&e[t]}function eachProp(e,t){var n;for(n in e)if(hasProp(e,n)&&t(e[n],n))break}function mixin(e,t,n,i){return t&&eachProp(t,function(t,r){!n&&hasProp(e,r)||(!i||"object"!=typeof t||!t||isArray(t)||isFunction(t)||t instanceof RegExp?e[r]=t:(e[r]||(e[r]={}),mixin(e[r],t,n,i)))}),e}function bind(e,t){return function(){return t.apply(e,arguments)}}function scripts(){return document.getElementsByTagName("script")}function defaultOnError(e){throw e}function getGlobal(e){if(!e)return e;var t=global;return each(e.split("."),function(e){t=t[e]}),t}function makeError(e,t,n,i){var r=new Error(t+"\nhttp://requirejs.org/docs/errors.html#"+e);return r.requireType=e,r.requireModules=i,n&&(r.originalError=n),r}function newContext(e){function t(e){var t,n;for(t=0;t<e.length;t++)if(n=e[t],"."===n)e.splice(t,1),t-=1;else if(".."===n){if(0===t||1===t&&".."===e[2]||".."===e[t-1])continue;t>0&&(e.splice(t-1,2),t-=2)}}function n(e,n,i){var r,o,a,s,c,u,d,l,f,p,h,g,m=n&&n.split("/"),v=M.map,b=v&&v["*"];if(e&&(e=e.split("/"),d=e.length-1,M.nodeIdCompat&&jsSuffixRegExp.test(e[d])&&(e[d]=e[d].replace(jsSuffixRegExp,"")),"."===e[0].charAt(0)&&m&&(g=m.slice(0,m.length-1),e=g.concat(e)),t(e),e=e.join("/")),i&&v&&(m||b)){a=e.split("/");e:for(s=a.length;s>0;s-=1){if(u=a.slice(0,s).join("/"),m)for(c=m.length;c>0;c-=1)if(o=getOwn(v,m.slice(0,c).join("/")),o&&(o=getOwn(o,u))){l=o,f=s;break e}!p&&b&&getOwn(b,u)&&(p=getOwn(b,u),h=s)}!l&&p&&(l=p,f=h),l&&(a.splice(0,f,l),e=a.join("/"))}return r=getOwn(M.pkgs,e),r?r:e}function i(e){isBrowser&&each(scripts(),function(t){return t.getAttribute("data-requiremodule")===e&&t.getAttribute("data-requirecontext")===E.contextName?(t.parentNode.removeChild(t),!0):void 0})}function r(e){var t=getOwn(M.paths,e);return t&&isArray(t)&&t.length>1?(t.shift(),E.require.undef(e),E.makeRequire(null,{skipMap:!0})([e]),!0):void 0}function o(e){var t,n=e?e.indexOf("!"):-1;return n>-1&&(t=e.substring(0,n),e=e.substring(n+1,e.length)),[t,e]}function a(e,t,i,r){var a,s,c,u,d=null,l=t?t.name:null,f=e,p=!0,h="";return e||(p=!1,e="_@r"+($+=1)),u=o(e),d=u[0],e=u[1],d&&(d=n(d,l,r),s=getOwn(k,d)),e&&(d?h=s&&s.normalize?s.normalize(e,function(e){return n(e,l,r)}):-1===e.indexOf("!")?n(e,l,r):e:(h=n(e,l,r),u=o(h),d=u[0],h=u[1],i=!0,a=E.nameToUrl(h))),c=!d||s||i?"":"_unnormalized"+(T+=1),{prefix:d,name:h,parentMap:t,unnormalized:!!c,url:a,originalName:f,isDefine:p,id:(d?d+"!"+h:h)+c}}function s(e){var t=e.id,n=getOwn(S,t);return n||(n=S[t]=new E.Module(e)),n}function c(e,t,n){var i=e.id,r=getOwn(S,i);!hasProp(k,i)||r&&!r.defineEmitComplete?(r=s(e),r.error&&"error"===t?n(r.error):r.on(t,n)):"defined"===t&&n(k[i])}function u(e,t){var n=e.requireModules,i=!1;t?t(e):(each(n,function(t){var n=getOwn(S,t);n&&(n.error=e,n.events.error&&(i=!0,n.emit("error",e)))}),i||req.onError(e))}function d(){globalDefQueue.length&&(each(globalDefQueue,function(e){var t=e[0];"string"==typeof t&&(E.defQueueMap[t]=!0),O.push(e)}),globalDefQueue=[])}function l(e){delete S[e],delete C[e]}function f(e,t,n){var i=e.map.id;e.error?e.emit("error",e.error):(t[i]=!0,each(e.depMaps,function(i,r){var o=i.id,a=getOwn(S,o);!a||e.depMatched[r]||n[o]||(getOwn(t,o)?(e.defineDep(r,k[o]),e.check()):f(a,t,n))}),n[i]=!0)}function p(){var e,t,n=1e3*M.waitSeconds,o=n&&E.startTime+n<(new Date).getTime(),a=[],s=[],c=!1,d=!0;if(!b){if(b=!0,eachProp(C,function(e){var n=e.map,u=n.id;if(e.enabled&&(n.isDefine||s.push(e),!e.error))if(!e.inited&&o)r(u)?(t=!0,c=!0):(a.push(u),i(u));else if(!e.inited&&e.fetched&&n.isDefine&&(c=!0,!n.prefix))return d=!1}),o&&a.length)return e=makeError("timeout","Load timeout for modules: "+a,null,a),e.contextName=E.contextName,u(e);d&&each(s,function(e){f(e,{},{})}),o&&!t||!c||!isBrowser&&!isWebWorker||y||(y=setTimeout(function(){y=0,p()},50)),b=!1}}function h(e){hasProp(k,e[0])||s(a(e[0],null,!0)).init(e[1],e[2])}function g(e,t,n,i){e.detachEvent&&!isOpera?i&&e.detachEvent(i,t):e.removeEventListener(n,t,!1)}function m(e){var t=e.currentTarget||e.srcElement;return g(t,E.onScriptLoad,"load","onreadystatechange"),g(t,E.onScriptError,"error"),{node:t,id:t&&t.getAttribute("data-requiremodule")}}function v(){var e;for(d();O.length;){if(e=O.shift(),null===e[0])return u(makeError("mismatch","Mismatched anonymous define() module: "+e[e.length-1]));h(e)}E.defQueueMap={}}var b,x,E,w,y,M={waitSeconds:7,baseUrl:"./",paths:{},bundles:{},pkgs:{},shim:{},config:{}},S={},C={},q={},O=[],k={},_={},R={},$=1,T=1;return w={require:function(e){return e.require?e.require:e.require=E.makeRequire(e.map)},exports:function(e){return e.usingExports=!0,e.map.isDefine?e.exports?k[e.map.id]=e.exports:e.exports=k[e.map.id]={}:void 0},module:function(e){return e.module?e.module:e.module={id:e.map.id,uri:e.map.url,config:function(){return getOwn(M.config,e.map.id)||{}},exports:e.exports||(e.exports={})}}},x=function(e){this.events=getOwn(q,e.id)||{},this.map=e,this.shim=getOwn(M.shim,e.id),this.depExports=[],this.depMaps=[],this.depMatched=[],this.pluginMaps={},this.depCount=0},x.prototype={init:function(e,t,n,i){i=i||{},this.inited||(this.factory=t,n?this.on("error",n):this.events.error&&(n=bind(this,function(e){this.emit("error",e)})),this.depMaps=e&&e.slice(0),this.errback=n,this.inited=!0,this.ignore=i.ignore,i.enabled||this.enabled?this.enable():this.check())},defineDep:function(e,t){this.depMatched[e]||(this.depMatched[e]=!0,this.depCount-=1,this.depExports[e]=t)},fetch:function(){if(!this.fetched){this.fetched=!0,E.startTime=(new Date).getTime();var e=this.map;return this.shim?void E.makeRequire(this.map,{enableBuildCallback:!0})(this.shim.deps||[],bind(this,function(){return e.prefix?this.callPlugin():this.load()})):e.prefix?this.callPlugin():this.load()}},load:function(){var e=this.map.url;_[e]||(_[e]=!0,E.load(this.map.id,e))},check:function(){if(this.enabled&&!this.enabling){var e,t,n=this.map.id,i=this.depExports,r=this.exports,o=this.factory;if(this.inited){if(this.error)this.emit("error",this.error);else if(!this.defining){if(this.defining=!0,this.depCount<1&&!this.defined){if(isFunction(o)){try{r=E.execCb(n,o,i,r)}catch(a){e=a}if(this.map.isDefine&&void 0===r&&(t=this.module,t?r=t.exports:this.usingExports&&(r=this.exports)),e){if(this.events.error&&this.map.isDefine||req.onError!==defaultOnError)return e.requireMap=this.map,e.requireModules=this.map.isDefine?[this.map.id]:null,e.requireType=this.map.isDefine?"define":"require",u(this.error=e);"undefined"!=typeof console&&console.error?console.error(e):req.onError(e)}}else r=o;if(this.exports=r,this.map.isDefine&&!this.ignore&&(k[n]=r,req.onResourceLoad)){var s=[];each(this.depMaps,function(e){s.push(e.normalizedMap||e)}),req.onResourceLoad(E,this.map,s)}l(n),this.defined=!0}this.defining=!1,this.defined&&!this.defineEmitted&&(this.defineEmitted=!0,this.emit("defined",this.exports),this.defineEmitComplete=!0)}}else hasProp(E.defQueueMap,n)||this.fetch()}},callPlugin:function(){var e=this.map,t=e.id,i=a(e.prefix);this.depMaps.push(i),c(i,"defined",bind(this,function(i){var r,o,d,f=getOwn(R,this.map.id),p=this.map.name,h=this.map.parentMap?this.map.parentMap.name:null,g=E.makeRequire(e.parentMap,{enableBuildCallback:!0});return this.map.unnormalized?(i.normalize&&(p=i.normalize(p,function(e){return n(e,h,!0)})||""),o=a(e.prefix+"!"+p,this.map.parentMap),c(o,"defined",bind(this,function(e){this.map.normalizedMap=o,this.init([],function(){return e},null,{enabled:!0,ignore:!0})})),d=getOwn(S,o.id),void(d&&(this.depMaps.push(o),this.events.error&&d.on("error",bind(this,function(e){this.emit("error",e)})),d.enable()))):f?(this.map.url=E.nameToUrl(f),void this.load()):(r=bind(this,function(e){this.init([],function(){return e},null,{enabled:!0})}),r.error=bind(this,function(e){this.inited=!0,this.error=e,e.requireModules=[t],eachProp(S,function(e){0===e.map.id.indexOf(t+"_unnormalized")&&l(e.map.id)}),u(e)}),r.fromText=bind(this,function(n,i){var o=e.name,c=a(o),d=useInteractive;i&&(n=i),d&&(useInteractive=!1),s(c),hasProp(M.config,t)&&(M.config[o]=M.config[t]);try{req.exec(n)}catch(l){return u(makeError("fromtexteval","fromText eval for "+t+" failed: "+l,l,[t]))}d&&(useInteractive=!0),this.depMaps.push(c),E.completeLoad(o),g([o],r)}),void i.load(e.name,g,r,M))})),E.enable(i,this),this.pluginMaps[i.id]=i},enable:function(){C[this.map.id]=this,this.enabled=!0,this.enabling=!0,each(this.depMaps,bind(this,function(e,t){var n,i,r;if("string"==typeof e){if(e=a(e,this.map.isDefine?this.map:this.map.parentMap,!1,!this.skipMap),this.depMaps[t]=e,r=getOwn(w,e.id))return void(this.depExports[t]=r(this));this.depCount+=1,c(e,"defined",bind(this,function(e){this.undefed||(this.defineDep(t,e),this.check())})),this.errback?c(e,"error",bind(this,this.errback)):this.events.error&&c(e,"error",bind(this,function(e){this.emit("error",e)}))}n=e.id,i=S[n],hasProp(w,n)||!i||i.enabled||E.enable(e,this)})),eachProp(this.pluginMaps,bind(this,function(e){var t=getOwn(S,e.id);t&&!t.enabled&&E.enable(e,this)})),this.enabling=!1,this.check()},on:function(e,t){var n=this.events[e];n||(n=this.events[e]=[]),n.push(t)},emit:function(e,t){each(this.events[e],function(e){e(t)}),"error"===e&&delete this.events[e]}},E={config:M,contextName:e,registry:S,defined:k,urlFetched:_,defQueue:O,defQueueMap:{},Module:x,makeModuleMap:a,nextTick:req.nextTick,onError:u,configure:function(e){e.baseUrl&&"/"!==e.baseUrl.charAt(e.baseUrl.length-1)&&(e.baseUrl+="/");var t=M.shim,n={paths:!0,bundles:!0,config:!0,map:!0};eachProp(e,function(e,t){n[t]?(M[t]||(M[t]={}),mixin(M[t],e,!0,!0)):M[t]=e}),e.bundles&&eachProp(e.bundles,function(e,t){each(e,function(e){e!==t&&(R[e]=t)})}),e.shim&&(eachProp(e.shim,function(e,n){isArray(e)&&(e={deps:e}),!e.exports&&!e.init||e.exportsFn||(e.exportsFn=E.makeShimExports(e)),t[n]=e}),M.shim=t),e.packages&&each(e.packages,function(e){var t,n;e="string"==typeof e?{name:e}:e,n=e.name,t=e.location,t&&(M.paths[n]=e.location),M.pkgs[n]=e.name+"/"+(e.main||"main").replace(currDirRegExp,"").replace(jsSuffixRegExp,"")}),eachProp(S,function(e,t){e.inited||e.map.unnormalized||(e.map=a(t,null,!0))}),(e.deps||e.callback)&&E.require(e.deps||[],e.callback)},makeShimExports:function(e){function t(){var t;return e.init&&(t=e.init.apply(global,arguments)),t||e.exports&&getGlobal(e.exports)}return t},makeRequire:function(t,r){function o(n,i,c){var d,l,f;return r.enableBuildCallback&&i&&isFunction(i)&&(i.__requireJsBuild=!0),"string"==typeof n?isFunction(i)?u(makeError("requireargs","Invalid require call"),c):t&&hasProp(w,n)?w[n](S[t.id]):req.get?req.get(E,n,t,o):(l=a(n,t,!1,!0),d=l.id,hasProp(k,d)?k[d]:u(makeError("notloaded",'Module name "'+d+'" has not been loaded yet for context: '+e+(t?"":". Use require([])")))):(v(),E.nextTick(function(){v(),f=s(a(null,t)),f.skipMap=r.skipMap,f.init(n,i,c,{enabled:!0}),p()}),o)}return r=r||{},mixin(o,{isBrowser:isBrowser,toUrl:function(e){var i,r=e.lastIndexOf("."),o=e.split("/")[0],a="."===o||".."===o;return-1!==r&&(!a||r>1)&&(i=e.substring(r,e.length),e=e.substring(0,r)),E.nameToUrl(n(e,t&&t.id,!0),i,!0)},defined:function(e){return hasProp(k,a(e,t,!1,!0).id)},specified:function(e){return e=a(e,t,!1,!0).id,hasProp(k,e)||hasProp(S,e)}}),t||(o.undef=function(e){d();var n=a(e,t,!0),r=getOwn(S,e);r.undefed=!0,i(e),delete k[e],delete _[n.url],delete q[e],eachReverse(O,function(t,n){t[0]===e&&O.splice(n,1)}),delete E.defQueueMap[e],r&&(r.events.defined&&(q[e]=r.events),l(e))}),o},enable:function(e){var t=getOwn(S,e.id);t&&s(e).enable()},completeLoad:function(e){var t,n,i,o=getOwn(M.shim,e)||{},a=o.exports;for(d();O.length;){if(n=O.shift(),null===n[0]){if(n[0]=e,t)break;t=!0}else n[0]===e&&(t=!0);h(n)}if(E.defQueueMap={},i=getOwn(S,e),!t&&!hasProp(k,e)&&i&&!i.inited){if(!(!M.enforceDefine||a&&getGlobal(a)))return r(e)?void 0:u(makeError("nodefine","No define call for "+e,null,[e]));h([e,o.deps||[],o.exportsFn])}p()},nameToUrl:function(e,t,n){var i,r,o,a,s,c,u,d=getOwn(M.pkgs,e);if(d&&(e=d),u=getOwn(R,e))return E.nameToUrl(u,t,n);if(req.jsExtRegExp.test(e))s=e+(t||"");else{for(i=M.paths,r=e.split("/"),o=r.length;o>0;o-=1)if(a=r.slice(0,o).join("/"),c=getOwn(i,a)){isArray(c)&&(c=c[0]),r.splice(0,o,c);break}s=r.join("/"),s+=t||(/^data\:|\?/.test(s)||n?"":".js"),s=("/"===s.charAt(0)||s.match(/^[\w\+\.\-]+:/)?"":M.baseUrl)+s}return M.urlArgs?s+((-1===s.indexOf("?")?"?":"&")+M.urlArgs):s},load:function(e,t){req.load(E,e,t)},execCb:function(e,t,n,i){return t.apply(i,n)},onScriptLoad:function(e){if("load"===e.type||readyRegExp.test((e.currentTarget||e.srcElement).readyState)){interactiveScript=null;var t=m(e);E.completeLoad(t.id)}},onScriptError:function(e){var t=m(e);if(!r(t.id)){var n=[];return eachProp(S,function(e,i){0!==i.indexOf("_@r")&&each(e.depMaps,function(e){return e.id===t.id&&n.push(i),!0})}),u(makeError("scripterror",'Script error for "'+t.id+(n.length?'", needed by: '+n.join(", "):'"'),e,[t.id]))}}},E.require=E.makeRequire(),E}function getInteractiveScript(){return interactiveScript&&"interactive"===interactiveScript.readyState?interactiveScript:(eachReverse(scripts(),function(e){return"interactive"===e.readyState?interactiveScript=e:void 0}),interactiveScript)}var req,s,head,baseElement,dataMain,src,interactiveScript,currentlyAddingScript,mainScript,subPath,version="2.1.22",commentRegExp=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,cjsRequireRegExp=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,jsSuffixRegExp=/\.js$/,currDirRegExp=/^\.\//,op=Object.prototype,ostring=op.toString,hasOwn=op.hasOwnProperty,ap=Array.prototype,isBrowser=!("undefined"==typeof window||"undefined"==typeof navigator||!window.document),isWebWorker=!isBrowser&&"undefined"!=typeof importScripts,readyRegExp=isBrowser&&"PLAYSTATION 3"===navigator.platform?/^complete$/:/^(complete|loaded)$/,defContextName="_",isOpera="undefined"!=typeof opera&&"[object Opera]"===opera.toString(),contexts={},cfg={},globalDefQueue=[],useInteractive=!1;if("undefined"==typeof define){if("undefined"!=typeof requirejs){if(isFunction(requirejs))return;cfg=requirejs,requirejs=void 0}"undefined"==typeof require||isFunction(require)||(cfg=require,require=void 0),req=requirejs=function(e,t,n,i){var r,o,a=defContextName;return isArray(e)||"string"==typeof e||(o=e,isArray(t)?(e=t,t=n,n=i):e=[]),o&&o.context&&(a=o.context),r=getOwn(contexts,a),r||(r=contexts[a]=req.s.newContext(a)),o&&r.configure(o),r.require(e,t,n)},req.config=function(e){return req(e)},req.nextTick="undefined"!=typeof setTimeout?function(e){setTimeout(e,4)}:function(e){e()},require||(require=req),req.version=version,req.jsExtRegExp=/^\/|:|\?|\.js$/,req.isBrowser=isBrowser,s=req.s={contexts:contexts,newContext:newContext},req({}),each(["toUrl","undef","defined","specified"],function(e){req[e]=function(){var t=contexts[defContextName];return t.require[e].apply(t,arguments)}}),isBrowser&&(head=s.head=document.getElementsByTagName("head")[0],baseElement=document.getElementsByTagName("base")[0],baseElement&&(head=s.head=baseElement.parentNode)),req.onError=defaultOnError,req.createNode=function(e,t,n){var i=e.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml","html:script"):document.createElement("script");return i.type=e.scriptType||"text/javascript",i.charset="utf-8",i.async=!0,i},req.load=function(e,t,n){var i,r=e&&e.config||{};if(isBrowser)return i=req.createNode(r,t,n),r.onNodeCreated&&r.onNodeCreated(i,r,t,n),i.setAttribute("data-requirecontext",e.contextName),i.setAttribute("data-requiremodule",t),!i.attachEvent||i.attachEvent.toString&&i.attachEvent.toString().indexOf("[native code")<0||isOpera?(i.addEventListener("load",e.onScriptLoad,!1),i.addEventListener("error",e.onScriptError,!1)):(useInteractive=!0,i.attachEvent("onreadystatechange",e.onScriptLoad)),i.src=n,currentlyAddingScript=i,baseElement?head.insertBefore(i,baseElement):head.appendChild(i),currentlyAddingScript=null,i;if(isWebWorker)try{importScripts(n),e.completeLoad(t)}catch(o){e.onError(makeError("importscripts","importScripts failed for "+t+" at "+n,o,[t]))}},isBrowser&&!cfg.skipDataMain&&eachReverse(scripts(),function(e){return head||(head=e.parentNode),dataMain=e.getAttribute("data-main"),dataMain?(mainScript=dataMain,cfg.baseUrl||(src=mainScript.split("/"),mainScript=src.pop(),subPath=src.length?src.join("/")+"/":"./",cfg.baseUrl=subPath),mainScript=mainScript.replace(jsSuffixRegExp,""),req.jsExtRegExp.test(mainScript)&&(mainScript=dataMain),cfg.deps=cfg.deps?cfg.deps.concat(mainScript):[mainScript],!0):void 0}),define=function(e,t,n){var i,r;"string"!=typeof e&&(n=t,t=e,e=null),isArray(t)||(n=t,t=null),!t&&isFunction(n)&&(t=[],n.length&&(n.toString().replace(commentRegExp,"").replace(cjsRequireRegExp,function(e,n){t.push(n)}),t=(1===n.length?["require"]:["require","exports","module"]).concat(t))),useInteractive&&(i=currentlyAddingScript||getInteractiveScript(),i&&(e||(e=i.getAttribute("data-requiremodule")),r=contexts[i.getAttribute("data-requirecontext")])),r?(r.defQueue.push([e,t,n]),r.defQueueMap[e]=!0):globalDefQueue.push([e,t,n])},define.amd={jQuery:!0},req.exec=function(text){return eval(text)},req(cfg)}}(this),define("configUtils",["require","exports","module","config"],function(e,t,n){function i(e){e=e||{},e.type=(e.type||"GET").toUpperCase(),e.dataType=e.dataType||"json";var t=r(e.url,e.data);if(window.XMLHttpRequest)var n=new XMLHttpRequest;else var n=new ActiveXObject("Microsoft.XMLHTTP");n.onreadystatechange=function(){if(4==n.readyState){var t=n.status;t>=200&&300>t?e.success&&e.success(n.responseText,n.responseXML):e.fail&&e.fail(t)}},e.url.indexOf("?")>=0&&(e.url=e.url.substring(0,e.url.indexOf("?"))),"GET"==e.type?(n.open("GET",e.url+"?"+t,e.async),n.send(null)):"POST"==e.type&&(n.open("POST",e.url,e.async),n.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),n.send(t))}function r(e,t){var n=[];if(e.indexOf("?")>=0)var n=e.substr(e.indexOf("?")+1).split("&");for(var i in t)n.push(encodeURIComponent(i)+"="+encodeURIComponent(t[i]));return n.push(("v="+Math.random()).replace(".","")),n.join("&")}var o=e("config"),a={};if(o.SERVER_CONFIG_API){var a=null;i({url:o.SERVER_CONFIG_API,async:!1,success:function(e){a=JSON.parse(e)},fail:function(e){console.error("AJAX SERVER_CONFIG_API ERROR")}})}return o=$.extend(!0,{},o,a)}),define("router",["require","exports","module"],function(e,t,n){var i=new Router;return i.init(),i}),define("log",["require","exports","module"],function(e,t,n){var i={error:function(e){console.error(e)},debug:function(e){console.log(e)}};return i}),define("utils",["require","exports","module","configUtils","router","log"],function(e,t,n){var i=e("configUtils"),r=e("router"),o=e("log"),a=e,s={loadCompiledPage:function(e,t){var n=s.getConfig("INNER_INDEX_MODE"),i=s.getConfig("DEBUG_MODE");if(!i&&window.__Template)return new Hogan.Template(__Template[e]);var r=s.getCurrentRoute(),o="",a=null;return a=t?"./modules/common/"+t+"/"+e+".html":"./modules/"+r+"/"+e+".html",n&&(a="."+a),$.ajax({url:a,dataType:"html",async:!1,cache:!1}).done(function(e){o=e}),Hogan.compile(o)},getCurrentRoute:function(){var e=r.getRoute()[0];return e},getEcharts:function(){var e=$.Deferred();return a(["echarts"],function(t){e.resolve(t)}),e.promise()},miniMode:function(){$("header").hide(),$("footer").remove(),$("main").css({"margin-top":"0","max-width":"none",width:"100%",padding:"0"}),$(document).trigger("resize")},getEcharts3:function(e,t,n){var i=$.Deferred();return e=$(e),a(["echarts"],function(r){var o=r.init(e[0]);n||(e.html('<div style="display:table;width:100%;height:100%;"><div class="bh-color-primary-3" style="text-align:center;vertical-align:middle;display:table-cell;"><i class="iconfont" style="font-size:128px;">&#xe62a;</i><br><span class="h3" style="color:#999">暂无数据</span></div></div>'),i.reject(o)),o.setOption(t),i.resolve(o)}),i.promise()},getConfig:function(e){return i[e]},switchModule:function(e){var t=location.href.replace(/\#.*/,"");location.href=t+"#/"+e},"goto":function(e,t){var n=s.getCurrentRoute(),i=location.href.replace(/\#.*/,"");return t?void window.open("#/"+e):void(("#/"+e).indexOf("#/"+n)>=0?(location.href=i+"#/"+e,location.reload()):location.href=i+"#/"+e)},doAjax:function(e,t,n){var i=$.Deferred(),r=s.getConfig("FE_DEBUG_MODE");return"object"==typeof e?i.resolve(e):_.endsWith(e,".do")&&r?void o.error("正式开发环境需去掉config.js中的“FE_DEBUG_MODE”配置项！！！"):($.ajax({type:n||"POST",url:e,traditional:!0,data:t||{},dataType:"json",success:function(e){try{"string"==typeof e&&(e=JSON.parse(e)),"undefined"!=typeof e.loginURL&&""!=e.loginURL&&(window.location.href=e.loginURL)}catch(t){console.log(t)}i.resolve(e)},error:function(e){var t=JSON.parse(e.responseText);"undefined"!=typeof t.loginURL&&""!=e.loginURL&&(window.location.href=t.loginURL),i.reject(e)}}),i.promise())},doSyncAjax:function(e,t,n){var i=$.ajax({type:n||"GET",url:e,traditional:!0,data:t||{},dataType:"json",cache:!1,async:!1,error:function(e){var t=JSON.parse(e.responseText);"undefined"!=typeof t.loginURL&&""!=e.loginURL&&(window.location.href=t.loginURL)}});if(200!=i.status)return{};var r=JSON.parse(i.responseText);return"undefined"!=typeof r.loginURL&&""!=i.loginURL&&(window.location.href=r.loginURL),r},openModalDialog:function(e){$(e.element).jqxWindow({width:e.width||550,height:e.height||220,closeButtonSize:24,showCloseButton:!0,resizable:!1,autoOpen:!1,draggable:!1,isModal:!0,title:e.title,content:e.content}),$(e.element).addClass("global-dialog-instance"),$(e.element).jqxWindow("open"),$(e.element).find(e.closeElement).click(function(){$(e.element).jqxWindow("close")})},warningDialog:function(e){if(e){var t=[{text:"确认",className:"bh-btn-warning"},{text:"取消",className:"bh-btn-default"}];e.callback&&(t[0].callback=e.callback);var n={iconType:"warning",title:e.title,content:e.content,buttons:e.buttons||t};e.height&&(n.height=e.height),e.width&&(n.width=e.width),$.bhDialog(n)}},dialog:function(e){var t=e.type||"success",n=(e.content,[]),i=null,r=null;if("success"==t||"done"==t)i="bh-btn-success",r="success";else if("warn"==t||"warning"==t||"warning"==t)i="bh-btn-warning",r="warning";else if("danger"==t||"error"==t)i="bh-btn-danger",r="danger";else{if("confirm"!=t)return;i="bh-btn-warning",r="warning"}if(e.iconType=r,e.okCallback){var o={text:e.okText||"确认",className:i,callback:e.okCallback};n.push(o)}if(e.cancelCallback){var a={text:e.noText||e.cancelText||"取消",className:"bh-btn-default",callback:e.cancelCallback};n.push(a)}e.okCallback&&!e.cancelCallback&&"confirm"==t&&n.push({text:e.noText||e.cancelText||"取消",className:"bh-btn-default"}),e.buttons=e.buttonList||n,$.bhDialog(e)},window:function(e){var t=e.params||{},n=e.title,i=e.content,r=e.buttons,o=e.callback,a=$('<div style="padding-bottom:72px;position:fixed;"><div class="head"></div><div><div class="content"></div><div id="buttons" style="position: absolute;bottom:32px;width: 100%;left: 0;float: right;padding: 0 24px;"><hr style="border:none;border-top: 1px solid #efefef;margin-bottom: 10px;"></div></div></div>');if($("body").append(a),$("#buttons",a).hide(),$(".head",a).append($("<h2></h2>").append(n)),$(".content",a).append(i),a.on("open",function(){$("body").getNiceScroll().remove(),$("body").css({overflow:"hidden","overflow-x":"hidden","overflow-y":"hidden"})}),a.on("close",function(){var e=$(".bh-form-horizontal",a);e.length>0&&e.parent().emapForm("destroy"),a.jqxWindow("destroy"),$("body").niceScroll()}),r=r||[{text:"确定",className:"bh-btn-primary",callback:o},{text:"取消",className:"bh-btn-default",callback:function(){a.jqxWindow("close")}}],e.showButtons!==!1){$("#buttons",a).show();for(var s=r.length-1;s>=0;s--){var c=$('<button class="bh-btn '+r[s].className+' bh-pull-right">'+r[s].text+"</button>");if(r[s].callback){var u=r[s].callback;c.data("callback",u),c.click(function(){var e=$(this).data("callback"),t=e.apply(a,[a]);t!==!1&&a.jqxWindow("close")})}$("#buttons",a).append(c)}}return a.jqxWindow($.extend({resizable:!1,isModal:!0,modalOpacity:.3,height:e.height||t.height||"100%",width:e.width||t.width||500,autoOpen:!1},t)).jqxWindow("open"),$(".content",a).parent().niceScroll(),a}};return s}),define("resourceConfig",["require","exports","module"],function(e,t,n){var i={PUBLIC_CSS:["/fe_components/iconfont/iconfont.css","/fe_components/jqwidget/{{theme}}/bh.min.css","/fe_components/jqwidget/{{theme}}/bh-scenes.min.css"],PUBLIC_BASE_JS:[],PUBLIC_NORMAL_JS:["/fe_components/bh.min.js","/fe_components/we/we.pagination.js"],DEBUG_JS:[],IE_SHIV_JS:["/bower_components/html5shiv/dist/html5shiv.min.js"]};return i}),define("ubaseUtils",["require","exports","module","configUtils","router","utils"],function(e,t,n){var i=(e("configUtils"),e("router")),r=e("utils"),o={getSortedModules:function(){var e=r.getConfig("MODULES");return e=_.sortBy(e,function(e){return-e.route.length})},showLoading:function(){$(".app-loading").addClass("app-loading-show")},hideLoading:function(){$(".app-loading").removeClass("app-loading-show")},cleanMainArea:function(){$("body>main").empty()},genMainLayout:function(){var e='<div id="headerPlaceholder"></div><div class="sc-container-outerFrame"><div class="sc-container bh-border-h" bh-container-role="container"><div id="bodyPlaceholder"></div></div></div><div id="footerPlaceholder"></div><div id="levityPlaceholder"></div>';$("body").prepend(e)},getFixedMainLayout:function(){var e="<header></header><main></main><footer></footer>";$("body").prepend(e)},getFirstModules:function(){var e=r.getConfig("MODULES"),t=r.getConfig("APP_ENTRY");return _.isEmpty(e)?"":(t||e[0].route).trim()},renderHeader:function(){var e=r.getConfig("HEADER"),t=r.getConfig("MODULES")||[],n=o.getFirstModules(),i=r.getConfig("APP_TITLE"),a=[],s=window.location.hash;s=s.replace("#/",""),-1!=s.indexOf("/")&&(s=s.substring(0,s.indexOf("/")));for(var c=0;c<t.length;c++)!function(){var e={title:t[c].title,route:t[c].route,hide:t[c].hide,href:"#/"+t[c].route};a.push(e)}();for(var c=0;c<a.length;c++)a[c].route===(s||n)&&(a[c].active=!0);e.feedback=r.getConfig("feedback"),e.feedbackData=r.getConfig("feedbackData"),e.userInfo=r.getConfig("userInfo")||e.userInfo,e.nav=a,e.title=i,$("body").children("header").bhHeader(e)},initFooter:function(){var e=r.getConfig("FOOTER_TEXT");$("body").children("footer").bhFooter({text:e||"版权信息：© 2015 江苏金智教育信息股份有限公司 苏ICP备10204514号"})},setContentMinHeight:function(e){if(e&&e&&e.length>0){var t=$(window),n=t.height(),i=$("[bh-footer-role=footer]").outerHeight(),r=$("[bh-header-role=bhHeader]").outerHeight(),o=n-r-i-1;e.css("min-height",o+"px")}},initFramework:function(){var e=r.getConfig("MINI_MODE");o.hideLoading(),o.getFixedMainLayout(),o.renderHeader(),o.initFooter(),o.resetJqueryHtmlMethod(),e&&r.miniMode(),o.configRouter(),$("body").niceScroll({zindex:99999}),o.setContentMinHeight($("body").children("main").children("article")),$(function(){$(window).resize(function(){o.setContentMinHeight($("body").children("main").children("article"))})})},configRouter:function(){var e=this,t=null;i.configure({delimiter:"/",after:function(){var n=r.getCurrentRoute();if(t!=n){t=n,$(".bh-paper-pile-dialog").remove(),$(".sc-container").removeClass("bh-border-transparent bh-bg-transparent");var i=$("body");i.children("[bh-footer-role=footer]").removeAttr("style"),e.setContentMinHeight(i.children("main").children("article")),e.reselectHeaderNav(),setTimeout(function(){i.children("main").children("article[bh-layout-role=navLeft]").children("section").css("width","initial")},10);try{$(".jqx-window").jqxWindow("destroy")}catch(o){}}}})},reselectHeaderNav:function(){for(var e=r.getCurrentRoute(),t=r.getConfig("MODULES"),n=0,i=0;i<t.length;i++)if(t[i].route==e){n=i+1;break}$("header").bhHeader("resetNavActive",{activeIndex:n})},resetJqueryHtmlMethod:function(){$.fn.oldHtmlFn=$.fn.html;var e=this;$.fn.html=function(t,n){var i=null;if(i=void 0!==t?$(this).oldHtmlFn(t):$(this).oldHtmlFn(),n){var r=$("body");e.setContentMinHeight(r.children("main")&&r.children("main").children("article"))}return i}},getIEVersion:function(){var e=null;return navigator.userAgent.indexOf("MSIE")>0&&(navigator.userAgent.indexOf("MSIE 6.0")>0&&(e=6),navigator.userAgent.indexOf("MSIE 7.0")>0&&(e=7),navigator.userAgent.indexOf("MSIE 9.0")>0&&!window.innerWidth&&(e=8),navigator.userAgent.indexOf("MSIE 9.0")>0&&(e=9)),e}};return o}),define("baseView",["require","exports","module","utils","ubaseUtils","log"],function(e,t,n){function i(e,t){var n=new a;n._routerParams=t,$.extend(n,e),s.off(),n.initialize(),n._coreBindEvent()}var r=(e("utils"),e("ubaseUtils")),o=e("log"),a=function(){this.$rootElement=$("body>main"),this._subView=[]},s=$("body");return a.prototype={initialize:function(){},getRouterParams:function(){var e={};return _.each(this._routerParams,function(t,n){e[n]=t}),e},_coreBindEvent:function(){var e=this;_.isEmpty(this.eventMap)||_.each(_.keys(this.eventMap),function(t){var n=null,i=null;e.eventMap[t]||o.error("eventMap中选择器“"+t+"”的事件处理函数未定义！！！"),t.indexOf("@")>0?(n=t.substr(0,t.indexOf("@")),i=t.substr(t.indexOf("@")+1),s.on(i,n,e.eventMap[t].bind(e))):s.on("click",t,e.eventMap[t].bind(e))})},setHtml:function(e){this.$rootElement.html(e),r.setContentMinHeight($("body").children("main").children("article"))},setRootHtml:function(e){this.$rootElement.html(e),r.setContentMinHeight($("body").children("main").children("article"))},setRootElement:function(e){this.$rootElement=e},_coreBindEventForSubView:function(e){if(!_.isEmpty(e)){var t=e.initialize.bind(e);e.initialize=function(n){t(n),e.__eventBinded||(e.__eventBinded=!0,_.each(_.keys(e.eventMap),function(t){e.eventMap[t]||o.error("eventMap中选择器“"+t+"”的事件处理函数未定义！！！"),t.indexOf("@")>0?(realElem=t.substr(0,t.indexOf("@")),event=t.substr(t.indexOf("@")+1),s.on(event,realElem,e.eventMap[t].bind(e))):s.on("click",t,e.eventMap[t].bind(e))}))}}},pushSubView:function(e){var t=this;e.constructor===Array?_.each(e,function(e){t._pushSubView(e)}):this._pushSubView(e)},_pushSubView:function(e){e.__eventBinded=!1,this._subView.push(e),e.parent=this,this._coreBindEventForSubView(e)}},i}),define("boot",["require","exports","module","utils","resourceConfig","router","baseView","ubaseUtils"],function(e,t,n){function i(e){var t=document.createElement("link");t.type="text/css",t.rel="stylesheet",t.href=e,document.getElementsByTagName("head")[0].appendChild(t)}var r=e("utils"),o=e("resourceConfig"),a=e("router"),s=e("baseView"),c=e,u=e("ubaseUtils"),d={start:function(e){var t=(r.getConfig("RESOURCE_SERVER"),r.getConfig("DEMO_MODE")),n=u.getSortedModules(),i=u.getFirstModules("");this.setLoadingStyle(),this.setTitle(),this.loadPublicCss(),this.loadPrivateCss();var o=this.getPublicBaseJs(),a=this.getPublicNormalJs(),d=this.getCurrentAppViews(e&&(e.views||e.VIEWS)),l=this.getUserEntry();c(o,function(){c(a,function(){c(["utils","router"].concat(t?d:[]),function(e,t){for(var r=null,o=0;o<n.length;o++)!function(){var i=3+o,a=n[o].route&&n[o].route.trim();t.on("/"+a+"/?((w|.)*)",function(t){if(r!==n[i-3].route){u.cleanMainArea(),u.showLoading();var t=t?t.split("/"):[];try{c([d[i-3]],function(e){s(e,t),u.hideLoading()})}catch(o){console.log(o)}r=e.getCurrentRoute()}})}();u.initFramework(),l?t.init():t.init("/"+i)})})})},getUserEntry:function(){var e=r.getCurrentRoute(),t=r.getConfig("MODULES");if(_.isEmpty(t))return"";var n=_.findIndex(t,function(t){return t.route==e});return-1==n&&(e=t[0].route,r["goto"](e)),e},loadPublicCss:function(){for(var e=r.getConfig("RESOURCE_SERVER"),t=o.PUBLIC_CSS,n=r.getConfig("THEME")||"blue",a=/fe_components|bower_components/,s=0;s<t.length;s++)i(a.test(t[s])?e+t[s].replace(/\{\{theme\}\}/,n):t[s])},loadPrivateCss:function(){var e=r.getConfig("DEBUG_MODE"),t=r.getConfig("FE_DEBUG_MODE"),n=r.getConfig("DEMO_MODE"),o=r.getConfig("INNER_INDEX_MODE");
if(e||t||!window.__Template){var s=(a.getRoute(),r.getConfig("MODULES"));if(s){if(n)for(var c=0;c<s.length;c++)i((o?".":"")+"./modules/"+s[c].route+"/"+s[c].route+".css");else i((o?".":"")+"./public/css/base.css");i((o?".":"")+"./public/css/style.css")}}},getPublicBaseJs:function(){var e=r.getConfig("RESOURCE_SERVER"),t=o.PUBLIC_BASE_JS,n=o.IE_SHIV_JS,i=u.getIEVersion(),a=[],s=/fe_components|bower_components/;i&&9==i&&(t=t.concat(n));for(var c=0;c<t.length;c++)s.test(t[c])?a.push(e+t[c]):a.push(t[c]);return a},getPublicNormalJs:function(){var e=r.getConfig("RESOURCE_SERVER"),t=r.getConfig("FE_DEBUG_MODE"),n=o.PUBLIC_NORMAL_JS,i=o.DEBUG_JS,a=[];t&&(n=n.concat(i));for(var s=/fe_components|bower_components/,c=0;c<n.length;c++)s.test(n[c])?a.push(e+n[c]):a.push(n[c]);return a},getCurrentAppViews:function(){var e=u.getSortedModules(),t=r.getConfig("INNER_INDEX_MODE"),n=[];if(e){for(var i=0;i<e.length;i++)n.push((t?"../":"")+"modules/"+e[i].route+"/"+e[i].route);return n}},setTitle:function(){var e=r.getConfig("APP_TITLE"),t=document.createElement("title");t.innerText=e,document.getElementsByTagName("head")[0].appendChild(t)},setLoadingStyle:function(){var e=document.createElement("style");e.innerText=l,document.getElementsByTagName("head")[0].appendChild(e),$("body").append('  <div class="app-ajax-loading" style="position:fixed;z-index:30000;background-color:rgba(0,0,0,0);"></div><div class="app-loading"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>'),u.showLoading()}},l=".app-ajax-loading .bh-loader-icon-line-border{border: 0px solid #ddd;box-shadow:none;}.app-ajax-loading{position:fixed;z-index:30000;}.app-loading{position:absolute;opacity:0;top:150px;left:-75px;margin-left:50%;z-index:-1;text-align:center}.app-loading-show{z-index:9999;animation:fade-in;animation-duration:0.5s;-webkit-animation:fade-in 0.5s}@keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}@-webkit-keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}.spinner>div{width:30px;height:30px;background-color:#4DAAF5;border-radius:100%;display:inline-block;-webkit-animation:bouncedelay 1.4s infinite ease-in-out;animation:bouncedelay 1.4s infinite ease-in-out;-webkit-animation-fill-mode:both;animation-fill-mode:both}.spinner .bounce1{-webkit-animation-delay:-.32s;animation-delay:-.32s}.spinner .bounce2{-webkit-animation-delay:-.16s;animation-delay:-.16s}@-webkit-keyframes bouncedelay{0%,100%,80%{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1)}}@keyframes bouncedelay{0%,100%,80%{transform:scale(0);-webkit-transform:scale(0)}40%{transform:scale(1);-webkit-transform:scale(1)}}";return d}),require(["boot","utils"],function(e,t){e.start();var n=t.getConfig("RESOURCE_SERVER");require.config({baseUrl:"./",paths:{echarts:n+"/bower_components/echarts3/dist/echarts"}})}),define("index",["boot","utils"],function(){});