(function ($) {
    $.bhAsideNav = {
        //初始化方法
        /**
         * data数据格式
         {
             text: "应用管理",
             icon: "icon-viewmodule",
             href: " "
             children: [
                 {text: "收到的消息"}
             ]
         }
         */
        "init": function(options){
            var navDefaults = {
                title: "",  //标题
                data: [], //导航列表
                hide: null, //可选，点击关闭按钮的回调
                ready: null //可选，初始化并渲染完成的回调
            };
            options = $.extend({}, navDefaults, options);
            _init(options);
            navData = options.data;
        },
        //显示侧边导航方法
        "show": function(options){
            _show();
        },
        //隐藏侧边导航方法
        "hide": function(options){
            var navDefaults = {
                hide: null //可选，点击关闭按钮的回调
            };
            options = $.extend({}, navDefaults, options);
            _hide(options);
        },
        //销毁侧边导航
        "destroy": function(options){
            _destroy();
        }
    };
    
    var navDataObj = {};

    //动画执行基本时间
    function getAnimateTime(){
        return 450;
    }
    //每个li的高度
    function getLiHeight(){
        return 42;
    }

    function _init(options){
        //导航标题html
        var headerHtml = getNavHeaderHtml(options);
        //导航列表html
        var contentHtml = getContentDom(options);
        //导航遮盖层html
        var backdropHtml = getNavModelBackdrop();
        //将导航添加到body
        $("body").append('<div class="bh-asideNav-container bh-animated bh-outLeft" style="display: none;" bh-aside-nav-role="bhAsideNav">' + headerHtml + contentHtml + '</div>'+backdropHtml);

        //导航事件监听
        navEventListen();
        //初始化完成的回调
        if(options && typeof options.ready !='undefined' && options.ready instanceof Function){
            options.ready();
        }
    }

    //导航遮盖层html
    function getNavModelBackdrop(){
        var _html = '<div class="bh-modal-backdrop bh-animated bh-asideNav-fadeOut" style="display: none;" bh-aside-nav-role="bhAsideNavBackdrop"></div>';
        return _html;
    }

    //导航标题html
    function getNavHeaderHtml(options){
        var _html =
            '<div class="bh-asideNav-top">' +
                '<h1>'+options.title+'</h1>' +
                '<div class="bh-asideNav-top-close">' +
                    '<i class="iconfont icon-clear" bh-aside-nav-role="bhAsideNavCloseBtn"></i>' +
                '</div>' +
            '</div>';
        return _html;
    }

    //菜单分为4级
    //---菜单组分割线----
    // 一级菜单
    //  + 二级菜单
    //   + 三级菜单
    //---菜单组分割线----
    function getContentDom(options) {
        var data = options.data;
        var dataLen = data.length;
        var contentDom = '';
        var isLastGroup = false;
        if(dataLen > 0){
            for(var i=0; i<dataLen; i++){
                if(i == dataLen-1){
                    isLastGroup = true;
                }
                contentDom += getGroupDom({"data":data[i],"isLastGroup":isLastGroup});
            }
        }
        contentDom = '<div class="bh-asideNav-list"><ul class="bh-asideNav">' + contentDom + '</ul></div>';
        return contentDom;
    }
    /**
     * 根据数据构造菜单组
     */
    function getGroupDom(options) {
        var data = options.data;
        var dataLen = data.length;
        var isLastGroup = options.isLastGroup;
        var isLastItemInGroup = false;
        var groupDom = '';
        if(dataLen > 0){
            for(var i=0;i<dataLen;i++) {
                if(!isLastGroup){
                    if(i==dataLen-1){
                        isLastItemInGroup = true;
                    }else{
                        isLastItemInGroup = false;
                    }
                }
                groupDom += getFirstLevelNavDom({"data":data[i],"isLastItemInGroup":isLastItemInGroup});
            }
        }
        return groupDom;
    }
    /**
     * 根据数据构造一级菜单
     */
    function getFirstLevelNavDom(options) {
        var data = options.data;
        var isLastItemInGroup = options.isLastItemInGroup;

        var firstLevelNavDom = "";
        var childsHtml = "";
        var children = data["children"];
        if(children && children.length>0){
            childsHtml = getSecondLevelNavDom({"data":children});

            firstLevelNavDom += getNavLiHtml(data, "", isLastItemInGroup).replace("@childContent", childsHtml);
        }else{
            firstLevelNavDom += getNavLiHtml(data, "", isLastItemInGroup);
        }
        return firstLevelNavDom;
    }
    /**
     * 根据数据构造二级菜单
     */
    function getSecondLevelNavDom(options) {
        var data = options.data;
        var dataLen = data.length;

        var secondNavDom = "";
        var childsHtml = "";
        if(dataLen > 0){
            for(var i=0;i<dataLen;i++) {
                var children = data[i]["children"];
                if(children && children.length>0){
                    childsHtml = "";
                    childsHtml = getThirdLevelNavDom({"data":children});
                    secondNavDom += getNavLiHtml(data[i], "", false).replace("@childContent", childsHtml);
                }else{
                    secondNavDom += getNavLiHtml(data[i], "child", false);
                }
            }
        }else{
            secondNavDom = getNavLiHtml(data, "child", false);
        }
        secondNavDom = '<ul class="bh-asideNav">' + secondNavDom + '</ul>'
        return secondNavDom;
    }
    /**
     * 根据数据构造三级菜单
     */
    function getThirdLevelNavDom(options) {
        var data = options.data;
        var dataLen = data.length;
        var thirdNavDom = "";
        if(dataLen > 0) {
            for (var i = 0; i < dataLen; i++) {
                thirdNavDom += getNavLiHtml(data[i], "child", false);
            }
        }else{
            thirdNavDom = getNavLiHtml(data, "child", false);
        }
        thirdNavDom = '<ul class="bh-asideNav">' + thirdNavDom + '</ul>';
        return thirdNavDom;
    }


    //获取单个li的html
    function getNavLiHtml(dataItem, flag, isLastItemInGroup){
        var text = dataItem.text;
        var icon = dataItem.icon?"<img src='"+dataItem.icon+"' />":"";
        var id = dataItem.id;

        var key = id.toString();
        navDataObj[key] = dataItem;

        //li的class名
        var liClass = '';
        var hasChild = false;
        //当该节点是子元素时li的class为空
        if(flag === "child"){
            liClass = "";
        }else{
            //当该元素存在子元素的列名
            if(dataItem.children && dataItem.children.length > 0){
                liClass = 'bh-asideNav-dropdown';
                hasChild = true;
            }
        }

        if(isLastItemInGroup){
            liClass += " bh-asideNav-splite";
        }
        var _html =
            '<li class="@liClass" data-id="@id">' +
                '<a href="javascript:void(0);">' +
                    '<div><i>@icon</i><span>@text</span></div>' +
                '</a>' +
                '@childContent' +
            '</li>';

        _html = _html.replace("@liClass", liClass).replace("@icon", icon).replace("@text", text).replace("@id", id);
        //当该节点没有子元素时，将子元素的占位符删掉
        if(!hasChild){
            _html = _html.replace("@childContent", "");
        }
        return _html;
    }

    function navEventListen(options){
        var $nav = $("[bh-aside-nav-role=bhAsideNav]");
        //点击关闭按钮
        $nav.on("click", "[bh-aside-nav-role=bhAsideNavCloseBtn]", function(){
            _hide(options);
        });
        var $backdrop = $("[bh-aside-nav-role=bhAsideNavBackdrop]");
        $backdrop.on("click", function(){
            _hide(options);
        });

        //点击有子元素的节点的打开和关闭处理
        $nav.on("click", ".bh-asideNav-dropdown > a", function () {
            var $li = $(this).parent();
            var id = $li.attr("data-id");

            //如果有3级菜单,在展开时,该3级所在的2级菜单,高度需要动态修改
            var secondNav = null,secondNavHeight = null;

            //单行高度
            var singleHeight = getLiHeight();
            //当该元素是未打开状态，将所有有子元素的节点的高都设为默认高，然后再计算当前元素的高
            if (!$li.hasClass("bh-asideNav-open")) {
                var childNavHeight = getChildrenCount($li);

                $nav.find(".bh-asideNav-dropdown").each(function (index,item) {
                    if($(item).find("[data-id="+id+"]").length>0){
                        secondNav = $(item);
                        var hasOpenedSubNavHeight = 0;
                        if(secondNav.find(".bh-asideNav-open").length>0){
                            hasOpenedSubNavHeight = secondNav.find(".bh-asideNav-open").height() - 42;
                        }
                        secondNavHeight = secondNav.height()+childNavHeight-singleHeight - hasOpenedSubNavHeight;
                        $(item).css({"height": secondNavHeight + "px"});
                    }else{
                        $(item).css({"height": singleHeight+"px"});
                    }
                });

                $nav.find(".bh-asideNav-open").each(function (index,item) {
                    if($(item).find("[data-id="+id+"]").length>0){
                        return true;
                    }else{
                        $(item).removeClass("bh-asideNav-open");
                    }
                });
                $li.addClass("bh-asideNav-open").css({"height": childNavHeight+"px"});
            }else{
                //在其他状态下都将节点的高设为默认高
                var liHeight = getLiHeight();
                secondNav = $li.parent().closest(".bh-asideNav-dropdown.bh-asideNav-open");
                if(secondNav.length>0){
                    var childNavHeight = getChildrenCount(secondNav);
                    secondNav.css({"height": childNavHeight+"px"});
                }
                $li.removeClass("bh-asideNav-open").css({"height": liHeight+"px"});
            }
            setTimeout(function(){
                $(".bh-asideNav-container").getNiceScroll().resize();
            }, getAnimateTime());

        });

        //点击所有节点是否移除active的处理
        $nav.on("click", ".bh-asideNav li>a", function () {
            var $li = $(this).closest("li");
            $nav.find(".bh-asideNav-active").removeClass("bh-asideNav-active");
            $li.addClass("bh-asideNav-active");
            //当被点击的元素没有子元素时，将导航隐藏
            if(!$li.hasClass("bh-asideNav-dropdown")){
                _hide(options);
            }

            var options = {"element":$li,"data":getDataById($li.attr("data-id"))};
            $nav.trigger("navOnClick",options);
        });

        $(".bh-asideNav-container").niceScroll({cursorborder:"none",hidecursordelay:10,autohidemode:"scroll"});
    }
    function getDataById(_id){
        var result = null;
        var key = _id.toString();
        result = navDataObj[key];
        return result;
    }
    function getChildrenCount($li) {
        var $childNav = $li.children(".bh-asideNav");
        var $lis = $childNav.children("li");
        var liLen = $lis.length;
        var allLiLen = liLen + 1;
        var childNavHeight = getLiHeight() * allLiLen;
        return childNavHeight;
    }

    //显示导航栏
    function _show(){
        var $nav = $("[bh-aside-nav-role=bhAsideNav]");
        var $backdrop = $("[bh-aside-nav-role=bhAsideNavBackdrop]");
        $nav.removeClass("bh-outLeft").addClass("bh-intoLeft").show();
        $backdrop.removeClass("bh-asideNav-fadeOut").addClass("bh-asideNav-fadeIn").show();
        setTimeout(function(){
            $(".bh-asideNav-container").getNiceScroll().resize();
        }, getAnimateTime());

    }

    //隐藏导航栏，当有回调时只行回调
    function _hide(options){
        var $nav = $("[bh-aside-nav-role=bhAsideNav]");
        var $backdrop = $("[bh-aside-nav-role=bhAsideNavBackdrop]");
        $nav.removeClass("bh-intoLeft").addClass("bh-outLeft");
        $backdrop.removeClass("bh-asideNav-fadeIn").addClass("bh-asideNav-fadeOut");
        setTimeout(function(){
            $backdrop.hide();
            $(".bh-asideNav-container").getNiceScroll().resize();
            if(options && typeof options.hide !='undefined' && options.hide instanceof Function){
                options.hide();
            }
        }, getAnimateTime());
    }

    //销毁导航栏
    function _destroy(){
        $("[bh-aside-nav-role=bhAsideNav]").remove();
        $("[bh-aside-nav-role=bhAsideNavBackdrop]").remove();
    }
})(jQuery);

