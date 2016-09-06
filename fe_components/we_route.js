/**
 * 自动前端路由
 */

(function(){
    onHashChange(window.location.href);
    window.addEventListener("hashchange", function(e){
        onHashChange(e.newURL, e.oldURL);
    });
    function onHashChange(newURL, oldURL){
        var start = newURL.indexOf('#') + 1;
        var end = newURL.indexOf('?') != -1 ? newURL.indexOf('?') : newURL.length;

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
        var namespace = window.BH_NS[hashpath] || window.BH_NS['/' + hashpath];
        if(typeof namespace == 'undefined'){
            render(hashpath);
            return;
        }
        var beforeLoad = namespace.beforeLoad;
        var load = namespace.load;
        var onLoad = namespace.onLoad;
        var paramsObj = handleParams(newURL);
        var flag = true;

        if(typeof beforeLoad == 'function'){
            flag = beforeLoad.call(null, paramsObj);
        }

        if(flag === false){
            return;
        }

        if(typeof load == 'function'){
            load.call(null, paramsObj);
        }else{
            render(hashpath);
        }

        if(typeof onLoad == 'function'){
            onLoad.call(null, paramsObj);
        }
    }

    //初始化路由处理
    function hashInit(url){
        var hash = $('.bh-headerBar-nav-item.bh-active a').attr('href');
        var search = '';
        if(url.indexOf('?') != -1){
            search = url.substring(url.indexOf('?'), url.length);
        }
        window.location.hash = hash + search;
    }

    //清空动态生成区域的内容
    function clearLevity(){
        $('#levityPlaceholder').empty();
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
    function render(hashpath){
        var absPath = WIS_EMAP_SERV.getAbsPath(hashpath);
        var pathArr = absPath.split('/');
        if(hashpath.indexOf('.do') == -1){
            absPath = absPath + '/' + pathArr[pathArr.length] + '.html';
        }
        var html = BH_UTILS.getHTML(absPath);
        if(html == 404){
            //跳转404页面
            //window.location.href = '';
            //return；
        }
        $('#mainPlaceholder').html(html);
    }

})();
