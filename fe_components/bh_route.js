/**
 * 定义前端路由
 */

//路由配置
(function(){
    onHashChange(window.location.href);
    window.addEventListener("hashchange", function(e){
        onHashChange(e.newURL, e.oldURL);
    });
    function onHashChange(url, old_url){
        var start = url.indexOf('#') + 1;
        var hash = url.slice(start);
        var pathArr = hash.split('/');
        var namespaceArr = [];
        var namespaceStr = '';
        var args = [];
        var pageInit, pageBeforeLoad, pageOnLoad;
        var old_hash;
        if(old_url){
            var start = old_url.indexOf('#') + 1;
            old_hash = old_url.slice(start);
        }

        pathArr.shift();
        for(var i = 0; i < pathArr.length; i++){
            // 提取路由传递的参数值和命名空间数组
            if(pathArr[i].indexOf('_v_') != -1){
                args.push(pathArr[i].replace('_v_', ''));
            }else{
                namespaceArr.push(pathArr[i]);
            }
        }
        //如果带参数则转换为带参数的路由格式
        hash = hash.replace(/_v_/g, ':_v_');
        namespaceStr = namespaceArr.join('.');

        pageInit = BH_UTILS.namespace(namespaceStr).pageInit;
        pageBeforeLoad = BH_UTILS.namespace(namespaceStr).pageBeforeLoad;
        pageOnLoad = BH_UTILS.namespace(namespaceStr).pageOnLoad;

        var router = new Router();

        router.on(hash, function(){
            var breakflag = false;
            if(typeof pageInit == 'function'){
                breakflag = pageInit.apply(null, args) === true ? true : false;
            }

            if(!breakflag){
                //如果自定义路由，则不再走pageBeforeLoad和pageOnLoad，而是直接走自定义的渲染函数
                if(typeof BH_UTILS.namespace("routes").r != 'undefined'
                    && typeof BH_UTILS.namespace("routes").r[hash] == 'function'){
                    BH_UTILS.namespace("routes").r[hash].apply(null, args);
                }else{
                    
        
                    BH_UTILS.initHeader(WIS_CONFIG.HEADER, "#" + hash, "#" + old_hash);//需要约定命名规范，根据路由匹配
                    BH_UTILS.initFooter();
                    $("html").niceScroll();
                    var url = WIS_EMAP_SERV.getAbsPath('modules/' + namespaceArr.join('/') + '/' + namespaceArr[namespaceArr.length-1] + '.html');
                    $('#mainPlaceholder').load(url, function(response,status,xhr){
                        if(status == "success" || status == "notmodified" ){
                            if(typeof pageBeforeLoad == 'function'){
                                pageBeforeLoad.apply(null, args);
                            }
                            if(typeof pageOnLoad == 'function'){
                                pageOnLoad.apply(null, args);
                            }
                        }else{
                            $('#headerPlaceholder').remove();
                            $('#mainPlaceholder').html('<h1 style="text-align: center;">404 PAGE NOT FOUND!</h1>');
                        }

                    });
                }

            }
        });

        //设置初始跳转路由，比如：init('/')初始会跳转至'/#/', init('foo')初始会跳转至'/#foo'
        router.init('/');
    }

})();
