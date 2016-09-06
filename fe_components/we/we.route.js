/**
 * 自动前端路由
 */

(function(){
    onHashChange(window.location.href);
    window.addEventListener("hashchange", function(e){
        onHashChange(window.location.href);
    });
    function onHashChange(newURL){
       //qiyu 2016-8-22 支持 ?min=1#router_name，之前的逻辑似乎是反的，如：#router_name?min=1
        /*
        var start = newURL.indexOf('#') + 1;
        var end = newURL.indexOf('?') != -1 ? newURL.indexOf('?') : newURL.length;
        */
       var start = newURL.indexOf('#') + 1;
       var end = newURL.indexOf('#') != -1 ? newURL.length : newURL.indexOf('#') + 1;

        if(start == 0 || newURL.substring(start, end) == '' || newURL.substring(start, end) == '/'){
            hashInit(newURL);
            return;
        }

        var hashpath = newURL.substring(start, end);
        //格式化hashpath，去除最前面的/
        if(hashpath.substring(0,1) == '/'){
            hashpath = hashpath.substring(1, hashpath.length);
        }
        //页面内锚点导航处理, 不走路由直接页面内部跳转
        if(hashpath.indexOf('_target_') != -1){
            return;
        }

        //渲染路由之前清空前一个路由页面中动态生成的dom
        clearLevity();
        doAlways();
        var paramsObj = handleParams(newURL);
        if(typeof window.BH_NS == 'undefined'){
            render(hashpath, paramsObj);
            return;
        }
        var namespace = window.BH_NS[hashpath] || window.BH_NS['/' + hashpath];
        if(typeof namespace == 'undefined'){
            render(hashpath, paramsObj);
            return;
        }
        var beforeLoad = namespace.beforeLoad;
        var load = namespace.load;
        var onLoad = namespace.onLoad;
        var flag = true;
        //var reg = /^function\s+\w*\s*\([^)]*\)\s*{\s*}$/m;

        if(typeof beforeLoad == 'function'){
            flag = beforeLoad.call(null, paramsObj);
        }

        if(flag === false){
            return;
        }

        
        if(typeof load == 'function' /* && !reg.test(load)*/){
            load.call(null, paramsObj);
        }else{
            render(hashpath, paramsObj);
        }

        if(typeof onLoad == 'function'){
            onLoad.call(null, paramsObj);
        }
    }

    //初始化路由处理
    function hashInit(url){
        
        //qiyu 2016-8-22 min=1的时候，头部没有初始化，获取hash的方式调整
        // var hash = $('.bh-headerBar-nav-item.bh-active').parent('a').attr('href');
        var nav_active = WIS_CONFIG.HEADER.nav.filter(function(val){
            if(val.active){
                return true;
            }
        });

        var hash = nav_active.length > 0 ? nav_active[0].href : "";
        
        var search = '';
        if(url.indexOf('?') != -1){
            search = url.substring(url.indexOf('?'), url.length);
        }
		//2016-03-31 去除路由前面的参数--刘军
        // window.location.href = window.location.pathname + hash + search;
        //qiyu 2016-8-22 顺序不正确
        window.location.href = window.location.pathname + search + hash;
    }

    //清空动态生成区域的内容
    function clearLevity(){
        $('#levityPlaceholder').empty();
        $('.bh-property-dialog').remove();
        try{
            $('.jqx-window').jqxWindow('destroy'); 
        }catch(e){
            //console.log(e);
        }
    }

    //提取参数, 将url后面的参数转化为map对象
    function handleParams(url){
        var start = url.indexOf('?');
        var end = url.length;
        var map = {};
        var params = '';
        if(start == -1){
            return map;
        }
        params = url.substring(start + 1, end);
        if(params == ''){
            return map;
        }

        var arrTmp = params.split('&');
        for(var i = 0; i < arrTmp.length; i++){
            var arrTmp2 = arrTmp[i].split('=');
            map[arrTmp2[0]] = arrTmp2[1];
        }

        return map;
    }

    //自动页面渲染
    function render(hashpath, paramsObj){
        var url = handleHashPath(hashpath);
        if(url == ''){
            //console.log("path error:");
            return;
        }
        var html = BH_UTILS.getHTML(url, paramsObj);
        if(html == 404){
            //跳转404页面
            //window.location.href = '';
            //return；
        }
        $('#bodyPlaceholder').html(html);
    }

    //处理hashpath
    function handleHashPath(hashpath){
        if(hashpath.substring(0, 7) == "http://" || hashpath.substring(0, 8) == "https://"){
            return hashpath;
        }
        var rootpath = '';
        if(typeof WIS_CONFIG != 'undefined' && typeof WIS_CONFIG.ROOT_PATH != 'undefined'){
            rootpath = WIS_CONFIG.ROOT_PATH;
        }
        if(hashpath.indexOf('.do') == -1){
            var pathArr = hashpath.split('/');
            return rootpath + '/modules/' + hashpath + '/' + pathArr[pathArr.length - 1] + '.html';
        }else{
            return hashpath;
        }
    }

    //切换路由每次都会执行的动作
    function doAlways(){
        $("body").getNiceScroll(0).doScrollTop(0);
        $("body").getNiceScroll(0).doScrollLeft(0);
        $('.sc-container').removeClass('bh-border-transparent bh-bg-transparent');
        //给外层的container添加最小高度
        BH_UTILS.setContentMinHeight($("[bh-container-role=container]"));
        $('#footerPlaceholder').removeAttr('style');
        if(typeof window.BH_NS != 'undefined' && typeof window.BH_NS.doAlways == 'function'){
            window.BH_NS.doAlways();
        }
    }

})();
