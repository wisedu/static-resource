+(function(){
    if(typeof (Waves) !== "undefined"){
        Waves.attach('.bh-btn:not(.bh-disabled):not([disabled])');
        Waves.init();
    }
})();


/* ========================================================================
 * Bootstrap: tab.js v3.3.4
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
+function ($) {
    'use strict';

    // TAB CLASS DEFINITION
    // ====================

    var Tab = function (element) {
        this.element = $(element)
    };

    Tab.VERSION = '3.3.4';

    Tab.TRANSITION_DURATION = 150;

    Tab.prototype.show = function () {
        var $this    = this.element;
        var $ul      = $this.closest('ul:not(.dropdown-menu)');
        var selector = $this.data('target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        if ($this.parent('li').hasClass('bh-active')){return;}

        var $previous = $ul.find('.bh-active:last a');
        var hideEvent = $.Event('hide.bs.tab', {
            relatedTarget: $this[0]
        });
        var showEvent = $.Event('show.bs.tab', {
            relatedTarget: $previous[0]
        });

        $previous.trigger(hideEvent);
        $this.trigger(showEvent);

        if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {return;}

        var $target = $(selector);

        this.activate($this.closest('li'), $ul);
        this.activate($target, $target.parent(), function () {
            $previous.trigger({
                type: 'hidden.bs.tab',
                relatedTarget: $this[0]
            });
            $this.trigger({
                type: 'shown.bs.tab',
                relatedTarget: $previous[0]
            })
        })
    };

    Tab.prototype.activate = function (element, container, callback) {
        var $active    = container.find('> .bh-active');
        var transition = callback
            && $.support.transition
            && (($active.length && $active.hasClass('bh-fade')) || !!container.find('> .bh-fade').length);

        function next() {
            $active
                .removeClass('bh-active')
                .find('> .dropdown-menu > .bh-active')
                .removeClass('bh-active')
                .end()
                .find('[data-toggle="bhTab"]')
                .attr('aria-expanded', false);

            element
                .addClass('bh-active')
                .find('[data-toggle="bhTab"]')
                .attr('aria-expanded', true);

            if (transition) {
                element[0].offsetWidth; // reflow for transition
                element.addClass('bh-in');
            } else {
                element.removeClass('bh-fade');
            }

            if (element.parent('.dropdown-menu').length) {
                element
                    .closest('li.dropdown')
                    .addClass('bh-active')
                    .end()
                    .find('[data-toggle="bhTab"]')
                    .attr('aria-expanded', true)
            }

            callback && callback()
        }

        $active.length && transition ?
            $active
                .one('bsTransitionEnd', next)
                .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
            next();

        $active.removeClass('bh-in')
    };


    // TAB PLUGIN DEFINITION
    // =====================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data  = $this.data('bs.tab');

            if (!data) $this.data('bs.tab', (data = new Tab(this)));
            if (typeof option == 'string') data[option]();
        })
    }

    var old = $.fn.tab;

    $.fn.tab             = Plugin;
    $.fn.tab.Constructor = Tab;


    // TAB NO CONFLICT
    // ===============

    $.fn.tab.noConflict = function () {
        $.fn.tab = old;
        return this;
    };


    // TAB DATA-API
    // ============

    var clickHandler = function (e) {
        e.preventDefault();
        Plugin.call($(this), 'show')
    };

    $(document)
        .on('click.bs.tab.data-api', '[data-toggle="bhTab"]', clickHandler);

}(jQuery);


+function ($) {
    'use strict';

    $(document).on("click", ".bh-table tr", function(e){
        if (e.target.nodeName == "INPUT") {return;}
        var _self = $(this);
        var table = _self.closest("table.bh-table");
        var tbody = table.children("tbody");

        if (_self.hasClass("bh-ch-active")) {
            _self.removeClass("bh-ch-active");
            ampTableGetColTds(_self, 0, "bh-ch-active");
        }else {
            table.find("tr.bh-ch-active, td.bh-ch-active").removeClass("bh-ch-active");
            _self.addClass("bh-ch-active");
            ampTableGetColTds(_self, 1, "bh-ch-active");
        }
    }).on("mouseover", ".bh-table td", function(){
        var _self = $(this);
        _self.parent("tr").addClass("bh-ch-hover");
        ampTableGetColTds(_self, 1, "bh-ch-hover");

    }).on("mouseout", ".bh-table td", function(){
        var _self = $(this);
        _self.parent("tr").removeClass("bh-ch-hover");
        ampTableGetColTds(_self, 0, "bh-ch-hover");
    });

    function ampTableGetColTds ($ele, type, className) {
        /*var table = $ele.closest("table.bh-table-cross-highlight");
        var index = $ele.index();
        table.find("tr").each(function(){
            var td = $(this).children("td:eq(" + index + ")");
            if (type) {
                td.addClass(className);
            }else {
                td.removeClass(className);
            }
        });*/
    }

}(jQuery);

/**
 * bhDialog插件
 */
(function () {
    $.bhDefaults = $.bhDefaults || {};
    $.bhDefaults.Dialog = {
        iconType: '',//可以传三个值，success/warning/danger
        title: '',
        content: '',
        className: '',
        buttons: [
            {text: '确定', className: 'bh-btn-primary', callback: null}
        ],
        width: 464,
        height: "auto"
    };
    /**
     *
     * @param options
     * options.iconType: '',
     * options.title:'标题',
     * options.content:'内容',
     * options.buttons:[{text:'确定',className:'bh-btn-primary'}]
     */
    $.bhDialog = function (options) {
        var bodyHtml = $("body");
        var params = $.extend({}, $.bhDefaults.Dialog, options || {});
        var g = {};
        var po = {
            _init: function () {
                var dialog = $("<div></div>");
                var dialogId = po.NewGuid();
                dialog.attr("id", "dialog" + dialogId);

                var dialogModal = $("<div class='bh-modal'></div>");

                var dialogWin = $("<div class='bh-pop bh-card bh-card-lv4'></div>");
                if (params.width) {
                    dialogWin.width(params.width);
                }
                if (params.height) {
                    dialogWin.height(params.height);
                }
                if (params.className) {
                    dialogWin.addClass(params.className);
                }

                //根据iconType添加icon相应的dom
                po._createDialogIcon(dialogWin);

                //根据标题、内容和按钮，添加对话框正文相应的dom
                po._createDialogBody(dialogWin, dialogId);

                dialogModal.append(dialogWin);

                dialog.append(dialogModal);

                //灰色的蒙版层
                dialog.append($('<div class="bh-modal-backdrop"></div>'));
                bodyHtml.append(dialog);
                po._resetPos(dialogWin);
                po._checkScrollbar();
                bodyHtml.addClass("bh-has-modal-body");
            },
            _resetPos:function(dialogWin){
                //重新计算dialogWin的位置，让其垂直方向居中
                var _clientHeight = document.documentElement.clientHeight;//可视区域的高度
                var _contentHeight = dialogWin.height();

                dialogWin.css("margin-top",(_clientHeight - _contentHeight) / 2);
            },
            _checkScrollbar: function () {
                var fullWindowWidth = window.innerWidth;
                if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
                    var documentElementRect = document.documentElement.getBoundingClientRect();
                    fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
                }
                var bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
                var scrollbarWidth = po._measureScrollbar();
                po._setScrollbar(bodyIsOverflowing,scrollbarWidth);
            },
            _setScrollbar: function (bodyIsOverflowing,scrollbarWidth) {
                var bodyPad = parseInt((bodyHtml.css('padding-right') || 0), 10);
                g.originalBodyPad = document.body.style.paddingRight || '';
                if (bodyIsOverflowing) bodyHtml.css('padding-right', bodyPad + scrollbarWidth);
            },
            _resetScrollbar: function () {
                bodyHtml.css('padding-right', g.originalBodyPad);
            },
            _measureScrollbar: function () { // thx walsh
                var scrollDiv = document.createElement('div')
                scrollDiv.className = 'bh-modal-scrollbar-measure';
                bodyHtml.append(scrollDiv);
                var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
                bodyHtml[0].removeChild(scrollDiv);
                return scrollbarWidth;
            },
            _removeDialog: function (dialogId) {
                $("#dialog" + dialogId).remove();
                po._resetScrollbar();
                bodyHtml.removeClass("bh-has-modal-body");
            },
            _createDialogBody: function (dialogWin, dialogId) {
                //组装body
                var dialogBody = $("<div class='bh-dialog-content'></div>");
                //设置对话框的标题
                var dialogTitle = $('<h4 class="bh-dialog-center"></h4>');
                dialogTitle.text(params.title);
                dialogBody.append(dialogTitle);

                //设置对话框的正文
                var dialogContent = $('<p class="content"></p>');
                dialogContent.text(params.content);
                dialogBody.append(dialogContent);

                var dialogLine = $('<div class="bh-dialog-light"></div>');
                dialogBody.append(dialogLine);
                po._createDialogBtn(dialogBody, dialogId);
                dialogWin.append(dialogBody);
            },

            _createDialogBtn: function (dialogBody, dialogId) {
                var dialogBtnContainer = $('<div class="bh-dialog-center"></div>');
                if (params.buttons && params.buttons.length > 0) {
                    var btnLen = params.buttons.length;
                    for (var i = 0; i < btnLen; i++) {
                        var btn = po._createBtn(params.buttons[i], dialogId);
                        dialogBtnContainer.append(btn);
                    }
                } else {
                    //页面必须有一个按钮
                    var btn = po._createBtn({text: "确定", className: "bh-btn-primary"}, dialogId);
                    dialogBtnContainer.append(btn);
                }

                dialogBody.append(dialogBtnContainer);
            },
            /**
             * 单个按钮的创建方法
             * @param btnInfo
             * @param dialogId
             * @returns {*|jQuery|HTMLElement}
             * @private
             */
            _createBtn: function (btnInfo, dialogId) {
                var btn = $("<button class='bh-btn waves-effect'></button>");
                if (btnInfo && btnInfo.text) btn.text(btnInfo.text);
                if (btnInfo && btnInfo.className) btn.addClass(btnInfo.className);
                btn.click(function () {
                    po._removeDialog(dialogId);
                    btnInfo.callback && btnInfo.callback();
                });
                return btn;
            },
            /**
             * 根据iconType，把icon相应的dom加到dialogWin中
             * @param dialogWin
             * @private
             */
            _createDialogIcon: function (dialogWin) {
                if (params.iconType != '') {
                    if (params.iconType == 'success') {
                        dialogWin.addClass("bh-dialog-success");
                    } else if (params.iconType == 'warning') {
                        dialogWin.addClass("bh-dialog-warning");
                    } else if (params.iconType == 'danger') {
                        dialogWin.addClass("bh-dialog-danger");
                    }
                    var dialogIcon = po._getDialogIconDom(params.iconType);
                    dialogWin.append(dialogIcon);
                }
            },
            /**
             * 根据icon类型，返回构造成icon的dom字符串
             * @param iconType
             * @returns {string}
             * @private
             */
            _getDialogIconDom: function (iconType) {
                var successIconDom = '<div class="bh-dialog-icon bh-dialog-icon-success">' +
                    '<span class="bh-dialog-icon-line bh-dialog-icon-tip "></span>' +
                    '<span class="bh-dialog-icon-line bh-dialog-icon-long "></span>' +
                    '<div class="bh-dialog-success-icon-placeholder"></div>' +
                    '<div class="bh-dialog-success-icon-fix"></div>' +
                    '</div>';

                var warningIconDom = '<div class="bh-dialog-icon">' +
                    '<span class="bh-dialog-body "></span>' +
                    '<span class="bh-dialog-dot "></span>' +
                    '</div>';

                var dangerIconDom = '<div class="bh-dialog-icon ">' +
                    '<span class="bh-dialog-error-mark">' +
                    '<span class="bh-dialog-icon-line bh-dialog-error-iconLeft "></span>' +
                    '<span class="bh-dialog-icon-line bh-dialog-error-iconRight "></span>' +
                    '</span>' +
                    '</div>';
                var iconDomString = '';
                if (iconType == 'success') {
                    iconDomString = successIconDom;
                } else if (iconType == 'warning') {
                    iconDomString = warningIconDom;
                } else if (iconType == 'danger') {
                    iconDomString = dangerIconDom;
                }
                return iconDomString;
            },
            /**
             * 生成随机字符串
             * @returns {string}
             * @constructor
             */
            NewGuid: function () {
                return (po.S4() + po.S4() + "-" + po.S4() + "-" + po.S4() + "-" + po.S4() + "-" + po.S4() + po.S4() + po.S4());
            },
            S4: function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
        }
        po._init();
    };
}).call(this);

/**
 * radio型的label的点击样式切换
 */
+function ($) {
    'use strict';
    $(document).on("click", ".bh-label-radio", function(e){
        var $item = $(this);
        $item.closest(".bh-label-radio-group").find(".bh-label-radio").removeClass("bh-active");
        $item.addClass("bh-active");
    });
}(jQuery);

/**
 * 给单列的表单的行添加背景
 */
+function ($) {
    'use strict';
    $(document).on("click", "input.bh-form-control", function(e){
        changeFormLineBgColor($(this));
    });
    $(document).on("click", "textarea.bh-form-control", function(e){
        changeFormLineBgColor($(this));
    });
    $(document).on("click", "input[type='radio']", function(e){
        changeFormLineBgColor($(this));
    });
    $(document).on("click", "input[type='checkbox']", function(e){
        changeFormLineBgColor($(this));
    });


    function changeFormLineBgColor($item){
        var $form = $item.closest("[bh-form-role=bhForm]");
        if($form.length > 0){
            $form.find(".bh-row").removeClass("bh-active");
            $item.closest(".bh-row").addClass("bh-active");
        }
    }
}(jQuery);


/**
 * 下拉按钮点击事件
 */
+(function($){
    'use strict';

    $(document).on("click","[bh-dropdown-role=bhDropdownBtn]",function(){
        var $dropdown = $(this).closest("[bh-dropdown-role=bhDropdown]");
        $dropdown.find("[bh-dropdown-role=bhDropdownMenu]").toggleClass("bh-dropdown-open");
    });
})(jQuery);
/**
 * 该代码暂不删除
 * 该代码暂不删除
 * 该代码暂不删除
 * 下拉按user卡片
 */
//+(function($){
//    'use strict';
//
//    $(document).on("mouseenter","[sc-panel-user-1-role=openDown]",function(){
//        var $item = $(this);
//        var $container = $item.find(".sc-panel-user-1-container");
//        var _height = $container.outerHeight();
//        var _minHeight = _height + 28;
//        var existStyle = $container.attr("sc-panel-user-1-role-exist-style");
//        if(!existStyle){
//            var _style = $container.attr("style");
//            if(!_style){
//                _style = " ";
//            }
//            $container.attr("sc-panel-user-1-role-exist-style", _style);
//        }
//        $container.css({"min-height": _minHeight + "px"});
//    });
//    $(document).on("mouseleave","[sc-panel-user-1-role=openDown]",function(){
//        var $item = $(this);
//        var $container = $item.find(".sc-panel-user-1-container");
//        var existStyle = $container.attr("sc-panel-user-1-role-exist-style");
//        $container.attr("style", existStyle);
//    });
//})(jQuery);
(function ($) {
    /**
     * 页面滚动，使元素块变浮动
     * @param data
     */
    $.bhAffix = function(data){
        var bhAffixDefaults = {
            hostContainer: "", //期望浮动元素在页面滚动到达该容器的top值时变成浮动的容器, 后面简称“父容器”
            header: $("header.sc-head"), //普通头部
            miniHeader: $("header.sc-head-mini"), //迷你头部
            fixedContainer: "", //浮动元素
            offset: {} //自己调节浮动块的偏移，top和left
        };
        var options = $.extend({}, bhAffixDefaults, data);

        if(options.fixedContainer.length > 0){
            if(options.fixedContainer.attr("bh-affix-role") !== "bhAffix"){
                $(window).on("scroll.bhAffix", function(){
                    setBlockPosition();
                });

                options.fixedContainer.attr("bh-affix-role", "bhAffix");
            }
        }

        function setBlockPosition(){
            if(options.fixedContainer.length > 0){
                var $window = $(window);
                var scrollTop = $window.scrollTop();

                var hostOffset = options.hostContainer.offset();
                //父容器的top
                var hostTop = hostOffset.top;
                //父容器的left
                var hostLeft = hostOffset.left;
                //普通头部的高
                var headHeight = options.header ? options.header.outerHeight() : 0;
                var fixedContOffset = options.fixedContainer.offset();
                //浮动元素的top
                var fixedContTop = fixedContOffset.top;
                //浮动元素的left
                var fixedLeft = fixedContOffset.left;
                //浮动元素距离父容器的距离
                var diffHeight = fixedContTop - hostTop;
                //自定义偏移的top值
                var offsetTop = options.offset.top ? parseInt(options.offset.top, 10) : 0;
                //浮动元素距离顶部的距离
                diffHeight = diffHeight + offsetTop;

                //当滚动高度大于期望高度的处理
                if(scrollTop >= hostTop - offsetTop - headHeight){
                    //获取之前存放在浮动元素上的style（是已经计算好的style，避免重复计算）
                    var fixedStyleData = options.fixedContainer.data("bhAffixStyleData");
                    if(!fixedStyleData){
                        if(options.offset.left){
                            fixedLeft = fixedLeft + parseInt(options.offset.left, 10);
                        }
                        var toFixedTop = diffHeight;
                        if(options.miniHeader){
                            toFixedTop += options.miniHeader.outerHeight();
                        }else{
                            toFixedTop += headHeight;
                        }
                        //计算后的浮动style
                        fixedStyleData = {"left": fixedLeft+"px", "position":"fixed", "top": toFixedTop};
                        //浮动元素初始的style（用户自己设定的style，将其缓存起来，避免清除浮动style时将用户的style清掉）
                        var _style = options.fixedContainer.attr("style");
                        //将计算的和元素的style存入浮动元素中
                        options.fixedContainer.data("beforeBhAffixStyle", _style).data("bhAffixStyleData", fixedStyleData);
                    }

                    options.fixedContainer.css(fixedStyleData).data("bhAffixFlag",true);
                }else{
                    //取消元素浮动的处理，替换style为用户自己设定的style
                    var _style = options.fixedContainer.data("beforeBhAffixStyle");
                    var fixedFlag = options.fixedContainer.data("bhAffixFlag");
                    if(!_style){
                        _style = "";
                    }
                    if(fixedFlag){
                        options.fixedContainer.attr("style", _style);
                        options.fixedContainer.data("bhAffixFlag", false);
                    }
                }
            }
        }


    }
})(jQuery);
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
                iconFont: "", //字体图标的总类名
                data: [], //导航列表
                hide: null, //可选，点击关闭按钮的回调
                ready: null //可选，初始化并渲染完成的回调
            };
            options = $.extend({}, navDefaults, options);
            _init(options);
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
        var contentHtml = getNavContentHtml(options);
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
                    '<i class="iconfont icon-close" bh-aside-nav-role="bhAsideNavCloseBtn"></i>' +
                '</div>' +
            '</div>';
        return _html;
    }

    //导航列表html
    function getNavContentHtml(options){
        var data = options.data;
        var dataLen = data.length;
        var iconFont = options.iconFont;

        var navHtml = "";
        if(dataLen > 0){
            for(var i=0; i<dataLen; i++){
                var dataGroup = data[i];
                var dataGroupLen = dataGroup.length;
                if(dataGroupLen>0){
                    //是否是组里的最末元素
                    var isLastItemInGroup = false;
                    for(var j=0;j<dataGroupLen;j++){
                        //最后一组不加分割线
                        if(i < dataLen-1){
                            if(j==dataGroupLen-1){
                                isLastItemInGroup = true;
                            }else{
                                isLastItemInGroup = false;
                            }
                        }
                        var dataItem = dataGroup[j];
                        var dataChild = dataItem.children;
                        //当存在子元素时，拼接子元素列表的html
                        if(dataChild && dataChild.length > 0){
                            var childsHtml = "";
                            var childLen = dataChild.length;
                            if(childLen > 0){
                                for(var k=0; k<childLen; k++){
                                    childsHtml += getNavLiHtml(dataChild[k], iconFont, "child", false);
                                }
                                childsHtml = '<ul class="bh-asideNav">' + childsHtml + '</ul>';
                            }
                            navHtml += getNavLiHtml(dataItem, iconFont, "", isLastItemInGroup).replace("@childContent", childsHtml);
                        }else{
                            navHtml += getNavLiHtml(dataItem, iconFont, "", isLastItemInGroup);
                        }
                    }
                }

            }
        }
        navHtml = '<div class="bh-asideNav-list"><ul class="bh-asideNav">' + navHtml + '</ul></div>';
        return navHtml;
    }

    //获取单个li的html
    function getNavLiHtml(dataItem, iconFont, flag, isLastItemInGroup){
        var text = dataItem.text;
        var icon = dataItem.icon;
        var href = dataItem.href;
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

        if(!href){
            //当href没有的处理
            href = "javascript:void(0);"
        }
        if(isLastItemInGroup){
            liClass += " bh-asideNav-splite";
        }
        var _html =
            '<li class="@liClass">' +
                '<a href="@href">' +
                    '<div><i class="@iconFont @iconName"></i>@text</div>' +
                '</a>' +
                '@childContent' +
            '</li>';

        _html = _html.replace("@liClass", liClass).replace("@href", href).replace("@iconFont", iconFont)
            .replace("@iconName", icon).replace("@text", text);
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

        //点击有子元素的节点的打开和关闭处理
        $nav.on("click", ".bh-asideNav-dropdown > a", function () {
            var $li = $(this).parent();
            //当该元素是未打开状态，将所有有子元素的节点的高都设为默认高，然后再计算当前元素的高
            if (!$li.hasClass("bh-asideNav-open")) {
                $nav.find(".bh-asideNav-dropdown").css({"height": getLiHeight()+"px"});
                var $childNav = $li.find(".bh-asideNav");
                var $lis = $childNav.children("li");
                var liLen = $lis.length;
                var allLiLen = liLen + 1;
                var childNavHeight = getLiHeight() * allLiLen;
                $nav.find(".bh-asideNav-open").removeClass("bh-asideNav-open");
                $li.addClass("bh-asideNav-open").css({"height": childNavHeight+"px"});
            }else{
                //在其他状态下都将节点的高设为默认高
                var liHeight = getLiHeight();
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
        });

        $(".bh-asideNav-container").niceScroll({cursorborder:"none",hidecursordelay:10,autohidemode:"scroll"});
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


(function () {
    var Plugin, _init,_renderItem;
    Plugin = (function () {
        function Plugin(element, options) {
            this.options = $.extend({}, $.fn.bhButtonGroup.defaults, options);
            this.$element = $(element);
            _init(this.$element, this.options);
        }

        Plugin.prototype.setValue = function (val) {
            var value;
            if (!val || val == null || val == '') {
                value = 'ALL';
            }
            $('.bh-label-radio.bh-active', this.$element).removeClass('bh-active');
            $('.bh-label-radio[data-id=' + value + ']').addClass('bh-active');
        };

        Plugin.prototype.getValue = function () {
            var value = $('.bh-label-radio.bh-active', this.$element).data('id');
            return (value == 'ALL' ? '' : value);
        };

        return Plugin;
    })();

    _init = function (element, options) {

        if (options.data && options.data != null && options.data.length > 0) {
            _renderItem(options.data, element, options);
        } else if (options.url) {
            var source =
            {
                datatype: "json",
                root: "datas>code>rows",
                datafields: [
                    {name: 'id'},
                    {name: 'name'}
                ],
                id: 'id',
                url: options.url
            };
            var dataAdapter = new $.jqx.dataAdapter(source, {
                loadComplete: function (Array) {
                    var buttonGroupData = Array.datas.code.rows;
                    _renderItem(buttonGroupData, element, options);
                }
            });
            dataAdapter.dataBind();
        }

    };

    _renderItem = function(arr, element, options) {
        var itemHtml = '';
        if (options.allOption) {
            itemHtml = '<div class="bh-active bh-label-radio" data-id="ALL">全部</div>';
        }
        $(arr).each(function () {
            itemHtml += '<div class="bh-label-radio" data-id="' + this.id + '">' + this.name + '</div>';
        });
        element.html(itemHtml);
    };

    $.fn.bhButtonGroup = function (options) {
        var instance;
        instance = this.data('plugin');
        if (!instance) {
            return this.each(function () {
                return $(this).data('plugin', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') return instance[options]();
        return this;
    };

    $.fn.bhButtonGroup.defaults = {
        allOption: true
    };

}).call(this);
/**
 * 可折叠面板
 *
 */
(function ($) {
    /**
     * 定义一个插件
     */
    var Plugin;

    /**
     * 这里是一个自运行的单例模式。
     */
    Plugin = (function () {

        /**
         * 插件实例化部分，初始化时调用的代码可以放这里
         */
        function Plugin(element, options) {
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.bhCollapsiblePanel.defaults, options);
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            init(this.settings, this.$element);
        }

        //展开面板
        Plugin.prototype.expandPanel = function () {
            var switchBtn = this.$element.find('[bh-collapsible-panel-flag="switch"]');
            expandPanel(switchBtn,this.settings);
        };
        //收缩面板
        Plugin.prototype.collapsePanel = function () {
            var switchBtn = this.$element.find('[bh-collapsible-panel-flag="switch"]');
            collapsePanel(switchBtn,this.settings);
        };

        return Plugin;

    })();

    function init(options, dom){
        var content = dom.html();
        //初始化头部
        var _html = getPanelHtml(options);
        dom.html(_html);
        var $block = $(".bh-collapsible-panel-content",dom);
        $block.append(content);
        dom.show();
        $block.data("height",$block.outerHeight());
        $block.css("height",0).hide();
        addEventListener(dom,options);
    }

    function addEventListener(dom,options){
        dom.on("click",'.bh-collapsible-panel',function(e){
            e = e || window.event;
            var targetNode = e.target || e.srcElement;
            if($(targetNode).attr("bh-collapsible-panel-flag") == "switch"){
                if($(targetNode).attr("bh-collapsible-panel-role") == "expand"){
                    expandPanel($(targetNode),options);
                }else{
                    collapsePanel($(targetNode),options);
                }
            }else if($(targetNode).hasClass("bh-collapsible-panel")) {
                var switchBtn = $(this).find('[bh-collapsible-panel-flag="switch"]');
                if(switchBtn.attr("bh-collapsible-panel-role") == "expand"){
                    expandPanel(switchBtn,options);
                }
            }else if($(targetNode).closest(".bh-collapsible-panel-toolbar").length == 0){
                var $parent = $(targetNode).closest(".bh-collapsible-panel");
                var switchBtn = $parent.find('[bh-collapsible-panel-flag="switch"]');
                if(switchBtn.attr("bh-collapsible-panel-role") == "expand"){
                    expandPanel(switchBtn,options);
                }
            }
        });
    }

    function getPanelHtml(options){
        var panelClass = "bh-collapsible-panel";
        if(options.hasBorder){
            panelClass+=" has-border";
        }
        var _html ='<div class="'+panelClass+'">'+
            '<h3 class="bh-collapsible-panel-title">'+options.title+'</h3>'+
            options.tag+
            '<div class="bh-text-caption bh-caption-default">'+options.caption+'</div>'+
            '<div class="bh-collapsible-panel-toolbar">'+
            options.toolbar +
            '<a href="javascript:void(0);" class="bh-btn-link" bh-collapsible-panel-flag="switch" bh-collapsible-panel-role="expand">展开</a>'+
            '</div>'+
            '<div class="bh-collapsible-panel-content bh-collapsible-panel-animate">'+
            '</div>'+
            '</div>';
        return _html;
    }

    function collapsePanel(target,options){
        var $block = $(target).closest(".bh-collapsible-panel").find(".bh-collapsible-panel-content");
        $block.css({"height": 0});
        var $card = $block.parent();
        setTimeout(function(){
            $block.hide();
            $card.removeClass("bh-card bh-card-lv2");
        }, getAnimateTime());
        var switchBtn = $card.find("[bh-collapsible-panel-flag='switch']");
        switchBtn.text("展开");
        switchBtn.attr("bh-collapsible-panel-role","expand");
        if(options && options.afterCollapse){
            setTimeout(function(){
                options.afterCollapse();
            }, getAnimateTime());
        }
    }
    function expandPanel(target,options){
        var $block = $(target).closest(".bh-collapsible-panel").find(".bh-collapsible-panel-content");
        var $card = $block.parent();
        //给自己加阴影
        $card.addClass("bh-card bh-card-lv2");

        var height = $block.data("height");
        $block.show();
        setTimeout(function(){
            $block.css({"height": height});
        }, 1);
        $(target).text("收起");
        $(target).attr("bh-collapsible-panel-role","collapse");
        if(options && options.afterExpand){
            setTimeout(function(){
                options.afterExpand();
            }, getAnimateTime());
        }
    }
    /**
     * 动画的执行的基础时间
     * @returns {number}
     */
    function getAnimateTime(){
        return 450;
    }
    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.bhCollapsiblePanel = function (options, params) {
        var instance;
        instance = this.data('bhCollapsiblePanel');
        /**
         * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
         */
        if (!instance) {
            return this.each(function () {
                //将实例化后的插件缓存在dom结构里（内存里）
                return $(this).data('bhCollapsiblePanel', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        /**
         * 优雅处： 如果插件的参数是一个字符串，则 调用 插件的 字符串方法。
         * 如 $('#id').plugin('doSomething') 则实际调用的是 $('#id).plugin.doSomething();
         * doSomething是刚才定义的接口。
         * 这种方法 在 juqery ui 的插件里 很常见。
         */
        if ($.type(options) === 'string') instance[options](params);
        return this;
    };

    /**
     * 插件的默认值
     */
    $.fn.bhCollapsiblePanel.defaults = {
        title:"", //大标题内容，可以是传纯文本或html
        tag:"", //标签html
        caption:"", //小标题内容，可以是传纯文本或html
        toolbar:"", //工具栏的DOM的Html
        hasBorder:true, //是否显示边框
        afterExpand:null, //展开面板后的回调
        afterCollapse:null //收缩面板后的回调
    };
})(jQuery);
(function ($) {
    /**
     * 定义一个插件
     */
    var Plugin;

    /**
     * 这里是一个自运行的单例模式。
     */
    Plugin = (function () {

        /**
         * 插件实例化部分，初始化时调用的代码可以放这里
         */
        function Plugin(element, options) {
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.bhHeader.defaults, options);
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            init(this.settings, this.$element);
        }
        return Plugin;

    })();

    function init(options, dom){
        var _html = getFooterHtml(options);
        dom.html(_html).attr("bh-footer-role", "footer").addClass("bh-footer");
    }

    function getFooterHtml(options){
        var _html = '<div class="bh-footer-content">'+options.text+'</div>';
        return _html;
    }

    function setFooterOnBottom(dom, options){

    }


    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.bhFooter = function (options) {
        return this.each(function () {
            return new Plugin(this, options);
        });
    };

    /**
     * 插件的默认值
     */
    $.fn.bhFooter.defaults = {
        text: ""
    };
})(jQuery);
(function ($) {
    $.bhFormOutline = {
        show: function(options){
            var formOutlineDefaults = {
                insertContainer: "", //必填，要插入的容器
                offset: {}, //可选，大纲的偏移量{ top, left, right, bottom}，默认是右对齐
                scrollOffsetTop: 0, //可选，锚点定位的位置的top偏移量
                statistics: true //可选，是否对表单输入进行统计， true默认进行统计
            };
            options = $.extend({}, formOutlineDefaults, options);
            formOutlineShow(options);
        },
        hide: function(options){
            var formOutlineDefaults = {
                insertContainer: "", //可选，要插入的容器
                destroy: true //可选，隐藏时是否要删除该大纲，默认删除
            };
            options = $.extend({}, formOutlineDefaults, options);
            formOutlineHide(options);
        }
    };

    /**
     * 表单填写大纲
     * @param insertContainer 要插入的容器
     * @param offset 大纲的偏移量{ top, left, right, bottom}，默认是右对齐
     * @param scrollOffsetTop 锚点定位的位置偏移量
     * @param statistics 是否对表单输入进行统计， true默认进行统计
     */
    function formOutlineShow(options){
        var formOutlineGuid = options.insertContainer.attr("bh-form-outline-role-form-guid");
        if(formOutlineGuid){
            $("div[bh-form-outline-role-outline-guid="+formOutlineGuid+"]")
                .removeClass("bh-fadeOut").addClass("bh-fadeIn").show();
            return;
        }

        //为内容块和大纲创建guid
        formOutlineGuid = NewGuid();
        //大纲外框html
        var formOutlineHtml = getFormOutlineHtml();
        //大纲子元素html
        var formOutlineItemHtml = getFormOutlineItemHtml();
        var outlineList = [];
        //获取生成大纲的title
        options.insertContainer.find("[bh-role-form-outline=title]").each(function(){
            var guid = NewGuid();
            var $item = $(this);
            var title = $item.text();
            $item.attr("bh-role-form-outline-item-title-guid", guid);
            outlineList.push({"title": title, "guid": guid});
        });

        //获取生成大纲的表单块
        options.insertContainer.find("[bh-role-form-outline=container]").each(function(index){
            var guid = outlineList[index].guid;
            var $item = $(this);
            $item.attr("bh-role-form-outline-item-guid", guid);

            var statisticsData = {};
            statisticsData.editBoxCount = 0;
            statisticsData.enterEditBoxCount = 0;
            statisticsData = statisticsEditBox($item, "input", statisticsData);
            statisticsData = statisticsEditBox($item, "textarea", statisticsData);
            statisticsData = statisticsEditBox($item, "select", statisticsData);

            outlineList[index].statistics = statisticsData;
        });

        //生成大纲展示html
        var formOutlineContent = "";
        var outlineLength = outlineList.length;
        if(outlineLength > 0){
            for(var i=0;i<outlineLength;i++){
                var outlineItem = outlineList[i];
                var active = "";
                if(i === 0){
                    active = "bh-active";
                }
                var statistics = outlineItem.statistics;
                var count = "";
                var success = "";
                if(statistics){
                    if(statistics.editBoxCount){
                        if(options.statistics){
                            count = statistics.enterEditBoxCount + "/" + statistics.editBoxCount;
                            success = statistics.enterEditBoxCount === statistics.editBoxCount ? "bh-success" : "";
                        }
                    }
                }

                formOutlineContent += formOutlineItemHtml.replace("@active", active).replace("@index", i+1).replace("@text", outlineItem.title)
                    .replace("@success", success).replace("@count", count).replace("@guid", outlineItem.guid);
            }
        }

        //设置大纲位置
        var _style = "";
        if(options.offset){
            var offset = options.offset;
            if(offset.left === 0 || offset.left){
                _style += "left:" + offset.left +"px;";
            }
            if(offset.right === 0 || offset.right){
                _style += "right:" + offset.right +"px;";
            }
            if(offset.top === 0 || offset.top){
                _style += "top:" + offset.top +"px;";
            }
            if(offset.bottom === 0 || offset.bottom){
                _style += "bottom:" + offset.bottom +"px;";
            }
        }

        //将大纲插入页面
        formOutlineHtml = formOutlineHtml.replace("@content", formOutlineContent).replace("@style", _style).replace("@outlineGuid", formOutlineGuid);
        var $formOutline = $(formOutlineHtml);
        options.insertContainer.append($formOutline).attr("bh-form-outline-role-form-guid", formOutlineGuid);

        //大纲表单输入事件监听
        if(options.statistics){
            //对输入框进行输入或点击（针对非输入项的，如radio，checkbox）的事件监听
            options.insertContainer.on({
                "keydown": function(e){
                    setTimeout(function(){
                        getEnterTagObj(e);
                    },50);
                },
                "click": function(e){
                    getEnterTagObj(e);
                }
            });

            //监听 下拉列表 dropdownlist
            options.insertContainer.find(".jqx-dropdownlist-state-normal").each(function(){
                var $item = $(this);
                $item.on('select', function (event){
                    var $parentBlock = $item.closest("[bh-role-form-outline=container]");
                    checkAndRefreshCount($parentBlock);
                });
            });

            //监听 时间 datetimeinput
            options.insertContainer.find(".jqx-datetimeinput").each(function(){
                var $item = $(this);
                $item.on('valueChanged', function (event){
                    var $parentBlock = $item.closest("[bh-role-form-outline=container]");
                    checkAndRefreshCount($parentBlock);
                });
            });

            //监听 combobox
            options.insertContainer.find(".jqx-combobox").each(function(){
                var $item = $(this);
                $item.on('change', function (event){
                    setTimeout(function(){
                        var $parentBlock = $item.closest("[bh-role-form-outline=container]");
                        checkAndRefreshCount($parentBlock);
                    }, 50);
                });
            });
        }

        //浮动块的监听
        $formOutline.on("click", "div.bh-form-outline-item", function(){
            var $item = $(this);
            var $formOutline = $item.closest("div[bh-role-form-outline-fixed=bhFormOutline]");
            var guid = $item.attr("bh-role-form-outline-fixed-item-guid");
            var $title = $("[bh-role-form-outline-item-title-guid="+guid+"]");
            var fixedTop = $title.offset().top;
            if(options.scrollOffsetTop){
                fixedTop = fixedTop - parseInt(options.scrollOffsetTop, 10);
            }
            $("html, body").animate({scrollTop:(fixedTop)}, 450);
            $formOutline.find("div.bh-form-outline-item").removeClass("bh-active");
            $item.addClass("bh-active");
        });
    }

    function formOutlineHide(options){
        var $formOutline = "";
        if(options.insertContainer){
            var guid = options.insertContainer.attr("bh-form-outline-role-form-guid");
            $formOutline = $("div[bh-form-outline-role-outline-guid="+guid+"]");
        }else{
            $formOutline = $("[bh-role-form-outline-fixed=bhFormOutline]");
        }
        $formOutline.removeClass("bh-fadeIn").addClass("bh-fadeOut");
        if(options.destroy){
            $formOutline.remove();
        }
    }

    function getFormOutlineHtml(){
        var _html = '<div class="bh-form-outline bh-animated-doubleTime bh-fadeIn" bh-role-form-outline-fixed="bhFormOutline" bh-form-outline-role-outline-guid="@outlineGuid" style="@style">@content</div>';
        return _html;
    }

    function getFormOutlineItemHtml(){
        var _html =
            '<div class="bh-form-outline-item @active" bh-role-form-outline-fixed-item-guid="@guid">' +
                '<span class="bh-form-outline-itemIndex">@index</span>' +
                '<span class="bh-form-outline-itemText">@text</span>' +
                '<span class="bh-form-outline-itemCount @success">@count</span>' +
            '</div>';
        return _html;
    }

    function getEnterTagObj(e){
        var $target = $(e.target || e.srcElement);
        var tagName = $target[0].localName;
        var $parentBlock = $target.closest("[bh-role-form-outline=container]");

        if(e.type === "click"){
            if(tagName === "input"){
                if($target.attr("type") === "radio" || $target.attr("type") === "checkbox"){
                    checkAndRefreshCount($parentBlock);
                }
            }
        }else{
            if(tagName === "input" || tagName === "textarea" || tagName === "select"){
                checkAndRefreshCount($parentBlock);
            }
        }

    }

    function checkAndRefreshCount($editBox){
        var statisticsData = {};
        statisticsData.editBoxCount = 0;
        statisticsData.enterEditBoxCount = 0;
        statisticsData = statisticsEditBox($editBox, "input", statisticsData);
        statisticsData = statisticsEditBox($editBox, "textarea", statisticsData);
        statisticsData = statisticsEditBox($editBox, "select", statisticsData);

        var $count = $("div[bh-role-form-outline-fixed=bhFormOutline]").find("div[bh-role-form-outline-fixed-item-guid="+$editBox.attr("bh-role-form-outline-item-guid")+"]")
            .find(".bh-form-outline-itemCount");
        var countText = $.trim($count.text());
        var newCount = statisticsData.enterEditBoxCount + "/" + statisticsData.editBoxCount;
        if(countText != newCount){
            if(statisticsData.enterEditBoxCount === statisticsData.editBoxCount){
                $count.addClass("bh-success");
            }else{
                $count.removeClass("bh-success");
            }
            $count.html(newCount);
        }

        $editBox.data("formOutlineKeyUpCount", 0);
    }

    //统计输入框和已编辑的项
    function statisticsEditBox($container, tagName, statisticsData){
        if(tagName === "input"){
            //存放radio和checkbox，一组radio或checkbox是一个输入项
            var radioCheckboxGroupData = {};
            //存放其他的input
            var inputData = [];
            $container.find(tagName).each(function(){
                var $item = $(this);
                if(!$item.closest(".bh-row").attr("hidden")){
                    var type = this.type;
                    //radio和checkbox时，将name放入json对象中
                    if(type === "radio" || type === "checkbox"){
                        var name = this.name;
                        radioCheckboxGroupData[name] = name;
                    }else{
                        if($item.closest(".jqx-combobox").length > 0 && $item.hasClass("jqx-combobox-input")){
                        //combobox含有两个input将其中一个占位的input过滤掉
                        }else{
                            inputData.push($item);
                        }
                    }
                }
            });

            //统计其他input的输入项
            var inputDataLen = inputData.length;
            if(inputDataLen > 0){
                for(var i=0; i<inputDataLen; i++){
                    statisticsData.editBoxCount++;
                    if($.trim(inputData[i].val()).length != 0){
                        statisticsData.enterEditBoxCount++;
                    }
                }
            }

            //统计radio和checkbox的输入项
            for(var key in radioCheckboxGroupData){
                statisticsData.editBoxCount++;
                var value = $container.find("input[name='"+key+"']:checked").val();
                if(value){
                    statisticsData.enterEditBoxCount++;
                }
            }
        }else{
            $container.find(tagName).each(function(){
                var $item = $(this);
                if(!$item.closest(".bh-row").attr("hidden")){
                    statisticsData.editBoxCount++;
                    if($.trim($item.val()).length != 0){
                        statisticsData.enterEditBoxCount++;
                    }
                }
            });
        }

        return statisticsData;
    }


    function NewGuid(){
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
    function S4(){
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

})(jQuery);

(function ($) {
    $.bhPropertyDialog = {
        show: function(data){
            var dialogDefaults = {
                insertContainer: "", //必填，弹出框要插入的容器
                title: "", //必填，弹出框的title
                content: "", //必填，弹出框的内容html
                footer: "", //可选，弹出框的页脚按钮html，可传入html片段，或default（使用默认的页脚），或空（无页脚）
                hideCover: false, //可选，是否隐藏遮罩层，默认不隐藏
                autoDestroy: true, //可选, 隐藏时自动销毁，默认销毁
                ok: null,
                cancel: null,
                open: null, //可选，每次打开弹出框后的回调，不包括第一次的初始化
                hide: null, //可选，每次隐藏弹出框后的回调
                ready: null //可选，初始化并渲染完成的回调
            };
            var options = $.extend({}, dialogDefaults, data);
            showDialog(options);
        },
        hide: function(data){
            var dialogDefaults = {
                close: null, //可选，当关闭的回调
                destroy: true //可选，值为true或false； true则在隐藏的同时将弹出框remove
            };
            var options = $.extend({}, dialogDefaults, data);
            dialogHide(options);
        },
        footerHide: function(){
            dialogFooterHide();
        },
        footerShow: function(){
            dialogFooterShow();
        },
        destroy: function(){
            dialogDestroy();
        }
    };

    /**
     * 动画的执行的基础时间
     * @returns {number}
     */
    function getAnimateTime(){
        return 450;
    }

    /**
     * 弹出侧边框
     * @param insertContainer 弹出框要插入的容器
     * @param title 弹出框的title
     * @param content 弹出框的内容html
     * @param footer 弹出框的按钮html
     */
    function showDialog(data){
        var $dialog = $("div[bh-role-property-dialog=bhPropertyDialog]");
        data = resetOptionContainer(data);
        //若不存在则新建一个
        if($dialog.length === 0){
            //获取弹框框架
            var dialogHtml = getDialogHtml();
            //获取页脚html
            var footerHtml = "";
            if(data.footer){
                if(data.footer === "default"){
                    //使用默认页脚
                    footerHtml = getDefaultFooterHtml();
                }else{
                    //使用传入的页脚
                    footerHtml = data.footer;
                }
            }
            dialogHtml = dialogHtml.replace("@title", data.title).replace("@content", data.content).replace("@footer", footerHtml);
            $dialog = $(dialogHtml);
            //无页脚时，隐藏页脚
            if(!footerHtml){
                $dialog.find("[bh-role-property-dialog=footer]").hide();
            }

            data.insertContainer.append($dialog);
            //弹框事件监听
            dialogEventListen($dialog, data);

            setTimeout(function(){
                //初始化结束后的回调
                if(typeof data.ready !='undefined' && data.ready instanceof Function){
                    data.ready();
                }

                //给按钮添加水波纹效果
                BH_UTILS.wavesInit();
            }, getAnimateTime());
        }else{
            setTimeout(function(){
                //每次打开的回调
                if(typeof data.open !='undefined' && data.open instanceof Function){
                    data.open();
                }
            }, getAnimateTime());
        }

        //当hideCover为false时显示遮罩层
        if(!data.hideCover){
            $dialog.find(".bh-property-dialog-cover").show()
                .removeClass("bh-property-dialog-cover-fadeOut").addClass("bh-property-dialog-cover-fadeIn");
        }

        $dialog.show();
        //移除动画
        $dialog.find("div.bh-property-dialog-container").removeClass("bh-outRight").addClass("bh-intoRight");
    }

    function getDefaultFooterHtml(){
        var _html =
            '<a class="bh-btn bh-btn-primary bh-btn-large" bh-role-property-dialog="okBtn">确定</a>' +
            '<a class="bh-btn bh-btn-default bh-btn-large" bh-role-property-dialog="cancelBtn">取消</a>';
        return _html;
    }

    function getDialogHtml(){
        var _html =
            '<div class="bh-property-dialog" bh-role-property-dialog="bhPropertyDialog">' +
                '<div class="bh-property-dialog-container bh-animated bh-outRight bh-card bh-card-lv2">' +
                    '<div class="bh-mb-16">' +
                        '<i class="iconfont icon-close bh-pull-right bh-cursor-point" bh-role-property-dialog="bhPropertyDialogClose"></i>' +
                        '<h2>@title</h2>' +
                    '</div>' +
                    '<div>' +
                        '@content' +
                    '</div>' +
                    '<div class="bh-property-dialog-footer bh-animated bh-outDown" bh-role-property-dialog="footer">' +
                        '@footer' +
                    '</div>' +
                '</div>' +
                '<div class="bh-property-dialog-cover bh-animated bh-property-dialog-cover-fadeIn"></div>' +
            '</div>';
        return _html;
    }


    /**
     * 隐藏侧边框
     * @param flag 默认弹框不销毁，"destroy"将弹框销毁
     */
    function dialogHide(options){
        if(typeof options.close !='undefined' && options.close instanceof Function){
            //当关闭回调返回false时，阻止弹框关闭
            var optionFlag = options.close();
            if(typeof optionFlag === "boolean" && !optionFlag){
                return;
            }
        }
        var $dialog = $("div[bh-role-property-dialog=bhPropertyDialog]");
        if($dialog.length > 0){
            $dialog.find("div.bh-property-dialog-container").removeClass("bh-intoRight").addClass("bh-outRight");
            $dialog.find("div.bh-property-dialog-cover").removeClass("bh-property-dialog-cover-fadeIn")
                .addClass("bh-property-dialog-cover-fadeOut");

            setTimeout(function(){
                $dialog.hide();
                $dialog.find("div.bh-property-dialog-footer").hide().removeClass("bh-intoUp").addClass("bh-outDown");
                if(options.destroy || options.autoDestroy){
                    $dialog.remove();
                }
            }, getAnimateTime());
        }
    }


    /**
     * 显示侧边框页脚
     * @param insertContainer 弹出框插入的容器
     */
    function dialogFooterHide(){
        $("div[bh-role-property-dialog=bhPropertyDialog]").find("div.bh-property-dialog-footer")
            .removeClass("bh-intoUp").addClass("bh-outDown");
    }

    /**
     * 隐藏侧边框页脚
     * @param insertContainer 弹出框插入的容器
     */
    function dialogFooterShow(){
        var $dialogFooter = $("div[bh-role-property-dialog=bhPropertyDialog]").find("div.bh-property-dialog-footer");
        $dialogFooter.removeClass("bh-outDown").addClass("bh-intoUp").show();
    }


    /**
     * 将弹框销毁
     */
    function dialogDestroy(){
        var $dialog = $("div[bh-role-property-dialog=bhPropertyDialog]");
        if($dialog.length > 0){
            dialogEventOff($dialog);
            $dialog.remove();
        }
    }

    function dialogEventListen($dialog, data){
        $dialog.on("click", "i[bh-role-property-dialog=bhPropertyDialogClose]", function(){
            data.close = data.hide;
            $.bhPropertyDialog.hide(data);
        });

        $dialog.on("click", "[bh-role-property-dialog=okBtn]", function(){
            data.close = data.ok;
            $.bhPropertyDialog.hide(data);
        });

        $dialog.on("click", "[bh-role-property-dialog=cancelBtn]", function(){
            data.close = data.cancel;
            $.bhPropertyDialog.hide(data);
        });
    }

    function dialogEventOff($dialog){
        $dialog.off("click");
    }

    function resetOptionContainer(data){
        if(!data.insertContainer){
            var $body = $("body");
            var $paperDialogs = $body.find("[bh-paper-pile-dialog-role=bhPaperPileDialog]");
            if($paperDialogs.length > 0){
                var $insertToDialog = "";
                var insertToDialogIndex = 0;
                var hasOpenDialogs = $body.find("div[bh-paper-pile-dialog-role=bhPaperPileDialog]");
                if(hasOpenDialogs.length > 0){
                    hasOpenDialogs.each(function(){
                        var $itemDialog = $(this);
                        var dialogIndex = parseInt($itemDialog.attr("bh-paper-pile-dialog-role-index"), 10);
                        if(dialogIndex > insertToDialogIndex){
                            $insertToDialog = $itemDialog;
                        }
                    });
                }
                if($insertToDialog.length > 0){
                    data.insertContainer = $insertToDialog.children().children("aside");
                }
            }else{
                if($body.children("main").length > 0){
                    var tempFixedArticle = $body.children("main").children("article");
                    if(tempFixedArticle.length > 0){
                        var $aside = tempFixedArticle.children("aside");
                        if($aside.length > 0){
                            data.insertContainer = $aside;
                        }
                    }
                }
            }
        }
        return data;
    }

})(jQuery);
/**
 * 步骤向导组件
 */

if (typeof (BhUIManagers) == "undefined") BhUIManagers = {};
(function ($) {
    $.fn.bhGetWizardManager = function () {
        return BhUIManagers[this[0].id + "_Wizard"];
    };

    //参数命名空间定义
    $.bhDefaults = $.bhDefaults || {};

    //组件参数集合定义
    $.bhDefaults.wizard = {
        items: [], //步骤参数集合 title,stepId,active,finished
        active:'', //当前激活项的stepId
        finished:[], //当前已完成项的stepId数组
        isAddClickEvent:true, //步骤条是否可点
        contentContainer:$("body"), //正文的容器选择器
        change: null
    };

    //函数命名空间
    $.bhWizard = $.bhWizard || {};

    /**
     * 构造一个Jquery的对象级别插件,委托页面的id元素初始化
     * @param options 参数集合
     * @return {*}
     */
    $.fn.bhWizard = function (options) {
        var p = $.extend({}, $.bhDefaults.wizard, options || {});

        this.each(function () {
            $.bhWizard.bhAddWizard(this, p);
        });

        //返回管理器
        if (this.length == 0) return null;
        if (this.length == 1) return $(this[0]).bhGetWizardManager();

        //如果初始化的是个数组，返回管理器的集合
        var managers = [];
        this.each(function () {
            managers.push($(this).bhGetWizardManager());
        });
        return managers;
    };

    /**
     * 构造一个类级别插件
     * @param wizard 初始化的元素对象
     * @param options 参数集合
     */
    $.bhWizard.bhAddWizard = function (wizard, options) {
        //如果已经初始化或者步骤为空则返回
        if (wizard.userWizard) return;

        /**
         * 构造li元素集合
         * @type {Array}
         */
        var wizardHtml = [];

        var g = {
            addItem: function (i, item, total) {
                var newItem = $('<div class="bh-wizard-item" stepid="'+item.stepId+'">'+
                    '<div class="left-arrow"></div>'+
                    '<div class="title"><i></i>'+item.title+'</div>'+
                    '<div class="right-arrow"></div>'+
                    '</div>');
                var itemStatus = {item:newItem,isActive:false,isFinished:false};
                if(i == 0){
                    $(newItem).addClass("bh-wizard-item-first");
                }else if(i == (total - 1)) {
                    $(newItem).addClass("bh-wizard-item-last");
                }
                g.wizardContainer.append(newItem);
            },
            resetActiveItem:function(stepId){
                g.activeItemStepId = stepId;
            },
            resetFinishedItems:function(stepIds){
                g.finishedItemStepIds = stepIds;
                for(var i=0;i<g.finishedItemStepIds.length;i++){
                    var finishedStepId = g.finishedItemStepIds[i];
                    var finishedIndex = po.getIndexByStepId(finishedStepId);
                    po.refreshElementByIndex(finishedIndex);
                }
            },
            activeNextItem: function () {
                //重置上一个激活项的样式
                var prevActiveItemIndex = po.getActiveItemIndex();
                var newActiveItemIndex = prevActiveItemIndex + 1;
                var stepId = g.items[newActiveItemIndex]["stepId"];
                g.changeToActive(stepId);
            },
            /**
             * 把指定的步骤切成active状态
             * @param stepId
             */
            changeToActive:function(stepId){
                //1、取消上一个步骤处于激活状态
                var prevActiveItemStepId = g.activeItemStepId;
                var prevActiveItemIndex = po.getActiveItemIndex();

                g.resetActiveItem(stepId);

                po.refreshElementByIndex(prevActiveItemIndex);
                g.contentContainer.find("#" + prevActiveItemStepId).addClass("bh-hide");

                //2、设置指定的步骤的项为激活状态
                var newActiveItemIndex = po.getActiveItemIndex();
                po.refreshElementByIndex(newActiveItemIndex);
                g.contentContainer.find("#" + g.activeItemStepId).removeClass("bh-hide");

                if(options && typeof options.change !='undefined' && options.change instanceof Function){
                    options.change({"stepId": stepId});
                }
            },
            changeToFinished:function(finishedStepId){
                //1、设置指定的步骤为finished
                if(po.isExistInFinisheds(finishedStepId)) return;
                po.addToFinisheds(finishedStepId);
                var finishedIndex = po.getIndexByStepId(finishedStepId);
                po.refreshElementByIndex(finishedIndex);
            }
        };

        var po = {
            /**
             * 判断步骤项是否在已完成列表中
             * @param stepId
             * @returns {boolean}
             */
            isExistInFinisheds:function(stepId){
                var isExist = false;
                for (var i = 0; i < g.finishedItemStepIds.length; i++) {
                    if (g.finishedItemStepIds[i] == stepId){
                        isExist = true;
                        break;
                    }
                }
                return isExist;
            },
            addToFinisheds:function(finishedStepId){
                if(g.finishedItemStepIds){
                    var maxLen = g.finishedItemStepIds.length;
                    if(maxLen > 0){
                        g.finishedItemStepIds[maxLen] = finishedStepId;
                    }else{
                        g.finishedItemStepIds[0] = finishedStepId;
                    }
                }
            },
            init: function () {
                //激活的区域需要打开区域信息
                g.wizardElement.each(function (i, item) {
                    if ($(item).hasClass("active")) {
                        //打开对应的step的信息区域
                        $("#" + $(item).attr("stepid")).removeClass("bh-hide");
                    } else {
                        $("#" + $(item).attr("stepid")).addClass("bh-hide");
                    }
                });
            },
            isActive:function(index){
                var activeIndex = po.getIndexByStepId(g.activeItemStepId);
                if(activeIndex == index){
                    return true;
                }
                return false;
            },
            isFinished:function(index){
                var finishedCount = g.finishedItemStepIds.length;
                var result = false;
                if(finishedCount>0){
                    for(var i=0;i<finishedCount;i++){
                        if(index == po.getIndexByStepId(g.finishedItemStepIds[i])){
                            result = true;
                            break;
                        }
                    }
                }
                return result;
            },
            refreshElementByIndex:function(index){
                var targetElement = g.wizardElement[index];
                var icon = $("i",$(targetElement));
                icon.removeClass();
                if(po.isFinished(index)){
                    $(targetElement).addClass("finished");
                    icon.addClass("iconfont icon-checkcircle");
                }else{
                    $(targetElement).removeClass("finished");
                }
                if(po.isActive(index)){
                    $(targetElement).addClass("active");
                    icon.addClass("iconfont icon-edit");
                }else{
                    $(targetElement).removeClass("active");
                }
            },
            isActiveItem:function(stepId){
                if(stepId == g.activeItemStepId){
                    return true;
                }else{
                    return false;
                }
            },
            addClickEvent: function () {
                g.wizardElement.unbind("click").click(function () {
                    var thisElement = $(this);
                    var stepId = thisElement.attr("stepid");
                    if(po.isActiveItem(stepId)) return;
                    g.changeToActive(stepId);
                })
            },
            getIndexByStepId:function(stepId){
                var index = 0;
                for(var i=0;i<g.items.length;i++){
                    if(g.items[i]["stepId"] == stepId){
                        index = i;
                        break;
                    }
                }
                return index;
            },
            getActiveItemIndex:function(){
                var index = 0;
                for(var i=0;i<g.items.length;i++){
                    if(g.items[i]["stepId"] == g.activeItemStepId){
                        index = i;
                        break;
                    }
                }
                return index;
            }
        }

        g.items = options.items;
        g.activeItemStepId = options.active;
        g.finishedItemStepIds = options.finished;
        g.wizardContainer = $(wizard);
        g.contentContainer = options.contentContainer;

        $(options.items).each(function (i, item) {
            g.addItem(i, item, options.items.length);
        });

       g.wizardElement = $(g.wizardContainer).children(".bh-wizard-item");

        $(options.items).each(function (i, item) {
            po.refreshElementByIndex(i);
        });

        po.init();

        if(options.isAddClickEvent){
            //绑定点击事件
            po.addClickEvent();
        }

        g.wizardElement.each(function(index,m){
            if(g.wizardElement && g.wizardElement.length>0){
                var itemWidth = $(m).parent("div").width() / g.wizardElement.length - 10;
                $(".title",$(m)).width(itemWidth);
            }
        });

        if (wizard.id == undefined) wizard.id = "BhUI_" + new Date().getTime();
        BhUIManagers[wizard.id + "_Wizard"] = g;

        wizard.userWizard = true;
    }
})
(jQuery);
/**
 * 堆叠对话框
 * 页面结构要求
 *      页面的最外层不能设置背景色，不能设置边框
 *      变化的title要设置成绝对定位，避免title缩小时其对应的内容跟着上移
 */
(function ($) {
    $.bhPaperPileDialog = {
        show: function(options){
            var dialogDefaults = {
                titleContainer: "", //必填，父层的title
                insertContainer: $("#levityPlaceholder"), //可选，想要将dialog插入的容器
                referenceContainer: "", //必填，dialog要参考的容器，主要用于获取容器的宽度和位置
                addDialogFlagClass: "", //可选，想要在弹出框中添加的类名，一般用在有多个弹出框时能做操作，
                toHideContainer: "", //可选，要隐藏的容器，主要用于当弹框内容过少，无法完全遮盖已经存在的内容
                hideCloseIcon: false, //可选，隐藏关闭按钮，false不隐藏
                title: "", //必填，弹出框的title
                content: "", //必填，在弹出框中显示的内容，一般是html标签
                footer: "", //可选，在弹出框页脚中显示的按钮，html标签
                aside: "", //隐藏字段，在固定html结构中存放侧边栏弹框用
                close: null, //可选，当关闭的回调，关闭时自动将弹框销毁
                autoDestroy: true, //可选, 隐藏时自动销毁，默认销毁
                closeBefore: null, //可选，当关闭前的回调
                open: null, //可选，每次打开弹出框后的回调，不包括第一次的初始化
                openBefore: null, //可选，每次打开弹出框前的回调，不包括第一次的初始化
                ready: null //可选，初始化并渲染完成的回调
            };
            options = $.extend({}, dialogDefaults, options);
            showDialog(options);
        },
        resetPageFooter: function(options){
            //当弹出框的高度发生变化时，重设页脚高度
            var dialogDefaults = {
                titleContainer: "", //可选，父层的title
                referenceContainer: "", //可选，想要将dialog插入的容器
                dialogContainer: "", //可选，弹出框容器
                guid: "" //可选，弹出框的guid
            };
            options = $.extend({}, dialogDefaults, options);
            resetPageFooter(options);
        },
        //重设弹框的最小高度
        resetMinHeight: function(options){
            var dialogDefaults = {
                titleContainer: "", //可选，与弹出框关联的title容器
                referenceContainer: "", //可选，与弹出框关联的内容容器
                guid: "" //可选，弹出框的guid
            };
            options = $.extend({}, dialogDefaults, options);
            resetDialogMinHeight(options);
        },
        //重新设置弹框页脚的位置
        resetDialogFooter: function(options){
            var dialogDefaults = {
                titleContainer: "", //可选，与弹出框关联的title容器
                referenceContainer: "" //可选，与弹出框关联的内容容器
            };
            options = $.extend({}, dialogDefaults, options);
            resetDialogFooter(options);
        },
        hide: function(options){
            var dialogDefaults = {
                titleContainer: "", //可选，与弹出框关联的title容器
                referenceContainer: "", //可选，与弹出框关联的内容容器
                guid: "", //可选，弹出框的guid
                isHideAll: false, //可选，true删除所有弹框
                destroy: true //可选，值为true或false； true则在隐藏的同时将弹出框remove
            };
            options = $.extend({}, dialogDefaults, options);
            dialogHide(options);
        },
        destroy: function(options){
            var dialogDefaults = {
                titleContainer: "", //可选，与弹出框关联的title容器
                referenceContainer: "", //可选，与弹出框关联的内容容器
                guid: "" //可选，弹出框的guid
            };
            options = $.extend({}, dialogDefaults, options);
            dialogDestroy(options);
        }
    };

    /**
     * titleContainer 必填，父层的title
     * referenceContainer 必填，想要将dialog插入的容器
     * addDialogFlagClass 可选，想要在弹出框中添加的类名，一般用在有多个弹出框时能做操作
     * title 必填，弹出框的title
     * content 必填，在弹出框中显示的内容，一般是html标签
     * footer 可选，在弹出框页脚中显示的按钮，html标签
     * close 可选，当关闭的回调
     * show 可选，每次打开弹出框后的回调，不包括第一次的初始化
     * ready 可选，初始化并渲染完成的回调
     */
    function showDialog(options){
        var $body = $("body");
        var $dialog = "";
        var $insertToDialog = getTheNewestOpenDialog();

        //重置titleContainer,referenceContainer,toHideContainer，使其兼容固定的html结构
        options = resetOptionContainer(options, $insertToDialog);

        if($insertToDialog.length > 0){
            //如果要加入的父层是paper对话框，将父层弹出框的边框去掉，对于多层弹框有用
            $insertToDialog.find(".bh-paper-pile-closeIcon").hide();
            $insertToDialog.find(".bh-paper-pile-dialog-container").addClass("bh-bg-transparent");
        }

        setTimeout(function(){
            //隐藏父层弹框的内容，避免子级弹框的内容过少，会看到父级的内容
            if($insertToDialog.length > 0){
                $insertToDialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]").hide();
            }else{
                //将内容的border去掉
                var $layoutContainer = "";
                var fixedArticle = getFixedArticle();
                if(fixedArticle){
                    $layoutContainer = fixedArticle;
                }else{
                    $layoutContainer = $("[bh-container-role=container]");
                }
                if($layoutContainer && $layoutContainer.length > 0){
                    $layoutContainer.addClass("bh-border-transparent").addClass("bh-bg-transparent");
                }
            }
        }, getAnimateTime());

        //给要遮盖的dom添加缩小动画，动画时间是基础时间的两倍
        options.titleContainer.addClass("bh-animated-doubleTime")
            .removeClass("bh-paper-pile-dialog-parentTitle-toRestore").addClass("bh-paper-pile-dialog-parentTitle-toSmall");

        setTimeout(function(){
            //动画即将结束时给父层弹出框的title加阴影
            options.titleContainer.addClass("bh-paper-pile-dialog-parentTitle-change");
        }, getAnimateTime() * 2 * 0.8);

        //若弹框之前创建过且没有remove，则直接显示，否则新建一个
        var existGuid = options.titleContainer.attr("bh-paper-pile-dialog-role-title-guid");
        if(existGuid){
            $dialog = $("div[bh-paper-pile-dialog-role-guid="+existGuid+"]");
            $dialog.removeClass("bh-negative-zIndex").show();
            $dialog.find("div.bh-paper-pile-dialog-container").removeClass("bh-paper-pile-dialog-outDown").addClass("bh-paper-pile-dialog-intoUp");

            setTimeout(function(){
                if(typeof options.open !='undefined' && options.open instanceof Function){
                    //执行再次打开的回调
                    options.open();
                }
            }, getAnimateTime() * 2);

            if(typeof options.openBefore !='undefined' && options.openBefore instanceof Function){
                //执行再次打开的回调
                options.openBefore();
            }
        }else{
            //计算弹出框要显示的width、top、left
            var insertContWidth = options.referenceContainer.outerWidth();
            var titleOffset = options.titleContainer.offset();
            var titleTop = titleOffset.top;
            var titleLeft = titleOffset.left;
            //32是迷你头的高度
            var dialogTop = titleTop + 32;
            //设置弹框的位置和宽度
            var dialogStyle = "";
            dialogStyle += 'left:'+titleLeft+'px;';
            dialogStyle += 'top:'+dialogTop+'px;';
            dialogStyle += 'width:'+insertContWidth+'px;';

            //创建guid与绑定的title容器和内容容器关联
            var guid = NewGuid();
            var dialogHtml = getDialogHtml();
            options = getContentHtml(options);
            var footerContentHtml = options.footer ? options.footer : "";
            dialogHtml = dialogHtml.replace("@title", options.title).replace("@footer", footerContentHtml)
                .replace("@content", options.content).replace("@guid", guid).replace("@style", dialogStyle);

            //将弹框添加到body
            $dialog = $(dialogHtml);
            if(options.insertContainer.length === 0){
                options.insertContainer = $body;
            }

            //当title没有的时候，隐藏title的div
            if(!options.title){
                $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogHeader]").hide();
                $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]").css("margin-top", "24px");
            }

            //隐藏关闭按钮
            if(options.hideCloseIcon){
                $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogCloseIcon]").hide();
            }

            //将aside加入弹框结构中
            if(options.aside){
                $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]").before(options.aside);
            }else{
                $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]").before('<aside></aside>');
            }

            options.insertContainer.append($dialog);

            //当出现多重弹框时，将已存在的弹框信息放到body上
            var dialogIndex = 1;
            var existDialogData = $body.data("bh-paper-pile-dialog");
            if(existDialogData){
                dialogIndex = existDialogData.length + 1;
                existDialogData.push({"guid": guid, "index": dialogIndex});
            }else{
                existDialogData = [{"guid": guid, "index": dialogIndex}];
            }
            $body.data("bh-paper-pile-dialog", existDialogData);
            //设置当前弹框的index和高度
            $dialog.attr("bh-paper-pile-dialog-role-index", dialogIndex).css({"height": "calc(100% - "+dialogTop+"px)"});

            //给title和内容容器添加guid
            options.titleContainer.attr("bh-paper-pile-dialog-role-title-guid", guid);
            options.referenceContainer.attr("bh-paper-pile-dialog-role-container-guid", guid);
            //给要隐藏的容器加guid
            if(options.toHideContainer){
                options.toHideContainer.attr("bh-paper-pile-dialog-role-hide-container-guid", guid);
            }

            //若用户有要添加的样式类，则加入到弹框中
            if(options.addDialogFlagClass){
                $dialog.addClass(options.addDialogFlagClass);
            }

            if(options.footer){
                //当有页脚时，添加页脚距离，避免页脚覆盖内容
                var dialogFooterHeigth = $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]").outerHeight();
                var pageFooterHeight = $("[bh-footer-role=footer]").outerHeight();
                var dialogPaddingBottom = dialogFooterHeigth + pageFooterHeight;
                $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]").css({"padding-bottom": dialogPaddingBottom});
            }

            setDialogContentMinHeight($dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]"),dialogTop);

            //弹出框事件绑定
            dialogEventListen($dialog, options);

            setTimeout(function(){
                if(typeof options.ready !='undefined' && options.ready instanceof Function){
                    //获取该弹框的header，section，footer，aside的jquery对象
                    var $dialogHeader = $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogHeader]");
                    var $dialogBody = $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogBody]");
                    var $dialogSection = $dialogBody.children("section");
                    var $dialogAside = $dialogBody.children("aside");
                    var $dialogFooter = $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]").children("footer");

                    //执行初始化完成事件，并将对应节点的jquery对象返回
                    options.ready($dialogHeader, $dialogSection, $dialogFooter, $dialogAside);
                }
            }, getAnimateTime() * 2);
        }

        setTimeout(function(){
            //给弹出框的页脚添加浮动属性
            dialogFooterToFixed($dialog, options);

            //移除弹框动画，避免fixed属性不可用
            $dialog.find("div.bh-paper-pile-dialog-container").removeClass("bh-paper-pile-dialog-intoUp");
            //将要隐藏的容器隐藏
            if(options.toHideContainer){
                options.toHideContainer.hide();
            }
            setCurrentFooterPosition($dialog);

            //给按钮添加水波纹效果
            BH_UTILS.wavesInit();

        }, getAnimateTime() * 2);
    }

    /**
     * 重新设置option的container数据
     * @param options
     * @param $insertToDialog 当存在多层弹框时，该值是最新弹出的弹框层
     * @returns {*}
     */
    function resetOptionContainer(options, $insertToDialog){
        if($insertToDialog){
            options = resetContainerHandle(options, $insertToDialog, true);
        }else{
            var fixedArticle = getFixedArticle();
            if(fixedArticle && fixedArticle.length > 0){
                options = resetContainerHandle(options, fixedArticle, false);
            }
        }
        return options;
    }

    /**
     * 对option进行赋值
     * @param options
     * @param $dom
     * @param isDialogFlag true是存在多层弹框
     * @returns {*}
     */
    function resetContainerHandle(options, $dom, isDialogFlag){
        if($dom && $dom.length > 0){
            if(!options.titleContainer){
                options.titleContainer = isDialogFlag ? $dom.find("[bh-paper-pile-dialog-role=bhPaperPileDialogHeader]") : $dom.children("h2");
            }
            if(!options.referenceContainer){
                options.referenceContainer = isDialogFlag ? $dom.find("[bh-paper-pile-dialog-role=bhPaperPileDialogBody]") : $dom.children("section");
            }
            if(!options.toHideContainer){
                if(isDialogFlag){
                    var $referenceDialog = options.referenceContainer.closest("[bh-paper-pile-dialog-role=bhPaperPileDialog]");
                    options.toHideContainer = $referenceDialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogBody]");
                }else{
                    options.toHideContainer = options.referenceContainer;
                }
            }
        }

        return options;
    }

    //获取固定结构的article
    function getFixedArticle(){
        var fixedArticle = null;
        var $body = $("body");
        if($body.children("main").length > 0){
            var tempFixedArticle = $body.children("main").children("article");
            if(tempFixedArticle.length > 0){
                fixedArticle = tempFixedArticle;
            }
        }
        return fixedArticle;
    }

    //获取传入的content，若传入的content的article下的第一级子节点有h2，则将其移除
    function getContentHtml(options){
        var contentHtml = options.content;
        var $contentHtml = $(contentHtml);
        var $title = $contentHtml.children("h2");
        var $footer = $contentHtml.children("footer");

        if(!options.title){
            if($title.length > 0){
                $title.addClass("bh-paper-pile-dialog-headerTitle").attr("bh-paper-pile-dialog-role", "bhPaperPileDialogHeader");
                options.title = $title[0].outerHTML;
                $title.remove();
            }
        }else{
            //当通过属性传入的title时，默认在外面套上h2标签
            options.title = '<h2 class="bh-paper-pile-dialog-headerTitle" bh-paper-pile-dialog-role="bhPaperPileDialogHeader">'+ options.title +'</h2>';
        }

        if(!options.footer){
            if($footer.length > 0){
                options.footer = $footer[0].outerHTML;
                $footer.remove();
            }
        }else{
            //当通过属性传入的footer时，默认在外面套上footer标签
            options.footer = '<footer>'+ options.footer +'</footer>';
        }

        if($contentHtml[0].localName === "article" && $contentHtml.children("section").length > 0){
            var $dialogAside = $contentHtml.children("aside");
            if($dialogAside.length > 0){
                options.aside = $dialogAside[0].outerHTML;
                $dialogAside.remove();
            }
            options.content = $contentHtml.html();
        }else{
            options.content = '<section>'+ options.content +'</section>';
        }

        return options;
    }

    /**
     * 给容器设定最小高度
     * @param $setContainer 要设置最小高度的容器
     * @param diff 去掉页头和页脚的偏移量
     * @param type type === "resetDialogMinHeight"是手动重设弹框高度时的处理
     */
    function setDialogContentMinHeight($setContainer, diff, type){
        if($setContainer && $setContainer.length > 0){
            var $window = $(window);
            var windowHeight = $window.height();
            var footerHeight = $("[bh-footer-role=footer]").outerHeight();
            var headerHeight = $("[bh-header-role=bhHeader]").outerHeight();
            var minHeight = 0;
            if(type === "resetDialogMinHeight"){
                minHeight = windowHeight - footerHeight - diff;
            }else{
                minHeight = windowHeight - headerHeight - footerHeight - diff;
            }
            $setContainer.css("min-height", minHeight+"px");
        }
    }

    /**
     * 隐藏弹出框
     * titleContainer 可选，与弹出框关联的title容器
     * referenceContainer 可选，与弹出框关联的内容容器
     * guid 可选，弹出框的guid
     * destroy 可选，值为true或false； true则在隐藏的同时将弹出框remove
     */
    function dialogHide(options){
        var $dialog = "";
        var $titleContainer = "";
        var $referenceContainer = "";
        var guid = "";

        if(options.titleContainer){
            $titleContainer = options.titleContainer;
            guid = $titleContainer.attr("bh-paper-pile-dialog-role-title-guid");
        }else if(options.referenceContainer){
            $referenceContainer = options.titleContainer;
            guid = $referenceContainer.attr("bh-paper-pile-dialog-role-container-guid");
        }else if(options.guid){
            guid = options.guid;
        }

        if(!guid){
            var $newestDialog = getTheNewestOpenDialog();
            if($newestDialog){
                $dialog = $newestDialog;
            }else{
                $dialog = $("div[bh-paper-pile-dialog-role=bhPaperPileDialog]");
            }
            guid = $dialog.attr("bh-paper-pile-dialog-role-guid");
        }
        if(!$dialog){
            $dialog = $("div[bh-paper-pile-dialog-role-guid="+guid+"]");
        }

        if($dialog.length > 0){
            var dialogIndex = $dialog.attr("bh-paper-pile-dialog-role-index");
            dialogIndex = parseInt(dialogIndex, 10);
            var existDialogData = $("body").data("bh-paper-pile-dialog");
            if(options.isHideAll){
                dialogIndex = 0;
            }
            var existDialogLen = existDialogData.length;
            if(dialogIndex < existDialogLen){
                for(var i=dialogIndex; i<existDialogLen; i++){
                    var existItem = existDialogData[i];
                    var existGuid = existItem.guid;
                    dialogToHide(existGuid, options);
                }
            }
            dialogToHide(guid, options);
        }

        if(options.toShowContainer){
            options.toShowContainer.show();
        }else{
            $("[bh-paper-pile-dialog-role-hide-container-guid="+guid+"]").show();
        }
    }

    /**
     * 执行隐藏操作
     * @param guid
     * @param options
     */
    function dialogToHide(guid, options){
        options.guid = guid;
        var $dialog = $("[bh-paper-pile-dialog-role-guid="+guid+"]");
        var $titleContainer = $("[bh-paper-pile-dialog-role-title-guid="+guid+"]");
        var $dialogContainer = $dialog.find("div.bh-paper-pile-dialog-container");
        $dialogContainer.removeClass("bh-paper-pile-dialog-intoUp").addClass("bh-paper-pile-dialog-outDown");
        $titleContainer.removeClass("bh-paper-pile-dialog-parentTitle-toSmall").removeClass("bh-paper-pile-dialog-parentTitle-change").addClass("bh-paper-pile-dialog-parentTitle-toRestore");

        var $insertToDialog = $titleContainer.closest("[bh-paper-pile-dialog-role=bhPaperPileDialog]");

        //var isHasParent = false; //判断是否还有上一层，false是没有
        //var $parentDialog = $titleContainer.closest("[bh-paper-pile-dialog-role=bhPaperPileDialog]");
        //var parentGuid = "";
        //if($parentDialog.length > 0){
        //    isHasParent = true;
        //    parentGuid = $parentDialog.attr("bh-paper-pile-dialog-role-guid");
        //}

        setTimeout(function(){
            //将内容的border去掉
            //if(!isHasParent){
            //    var fixedArticle = getFixedArticle();
            //    var $layoutContainer = "";
            //    if(fixedArticle){
            //        $layoutContainer = fixedArticle;
            //    }else{
            //        $layoutContainer = $("[bh-container-role=container]");
            //    }
            //    if($layoutContainer && $layoutContainer.length > 0){
            //        $layoutContainer.removeClass("bh-border-transparent").removeClass("bh-bg-transparent");
            //    }
            //}

            //将父级弹框的内容显示出来
            if($insertToDialog.length > 0){
                $insertToDialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogBody]").show();
            }else{
                //将内容的border去掉
                var fixedArticle = getFixedArticle();
                var $layoutContainer = "";
                if(fixedArticle){
                    $layoutContainer = fixedArticle;
                }else{
                    $layoutContainer = $("[bh-container-role=container]");
                }
                if($layoutContainer && $layoutContainer.length > 0){
                    $layoutContainer.removeClass("bh-border-transparent").removeClass("bh-bg-transparent");
                }
            }

            $dialogContainer.removeClass("bh-bg-transparent");
        }, getAnimateTime());

        //弹出框的头部透明度变成0时，使其隐藏起来，避免出现文字重叠
        setTimeout(function(){
            if($insertToDialog.length > 0){
                $insertToDialog.find(".bh-paper-pile-closeIcon").show();
            }
            $dialog.addClass("bh-negative-zIndex").hide();

            setPageFooterToRelative();
            //if(!isHasParent){
            //    setPageFooterToRelative();
            //}else{
            //    resetPageFooter({guid: parentGuid});
            //}

            if(options.close && options.close instanceof Function){
                options.close();
            }

            //当传入destroy是true，或autoDestroy是false时，将弹框移除
            if((options && options.destroy) || (options && options.autoDestroy)){
                dialogDestroy(options);
            }
        },getAnimateTime() * 2);

        if(options.closeBefore && options.closeBefore instanceof Function){
            options.closeBefore();
        }
    }

    //获取最新打开的弹框对象
    function getTheNewestOpenDialog(){
        var $newestDialog = "";
        var insertToDialogIndex = 0;
        var hasOpenDialogs = $("body").find("div[bh-paper-pile-dialog-role=bhPaperPileDialog]");
        if(hasOpenDialogs.length > 0){
            hasOpenDialogs.each(function(){
                var $itemDialog = $(this);
                var dialogIndex = parseInt($itemDialog.attr("bh-paper-pile-dialog-role-index"), 10);
                if(dialogIndex > insertToDialogIndex){
                    $newestDialog = $itemDialog;
                }
            });
        }
        return $newestDialog;
    }

    function setPageFooterToRelative(){
        var $footer = $("[bh-footer-role=footer]");
        var footerNormalStyle = $footer.attr("bh-footer-role-normal-style");
        $footer.attr("style", footerNormalStyle);
    }

    function resetPageFooter(options){
        $("[bh-footer-role=footer]").css("top", 0);
        var guid = "";
        if(options.titleContainer){
            guid = options.titleContainer.attr("bh-paper-pile-dialog-role-title-guid");
        }else if(options.referenceContainer){
            guid = options.referenceContainer.attr("bh-paper-pile-dialog-role-container-guid");
        }else if(options.guid){
            guid = options.guid;
        }
        var $dialog = "";
        if(!guid){
            if(options.dialogContainer){
                $dialog = options.dialogContainer;
            }else{
                $dialog = $("[bh-paper-pile-dialog-role=bhPaperPileDialog]");
            }
        }else{
            $dialog = $("[bh-paper-pile-dialog-role-guid="+guid+"]");
        }
        var positionAndHeight = getPositionAndHeight($dialog);

        //设置页面页脚style，使其绝对定位到页面底部
        setPageFooterToAbsolute(positionAndHeight);
    }

    /**
     * 动画的执行的基础时间
     * @returns {number}
     */
    function getAnimateTime(){
        return 450;
    }

    /**
     * 将弹框销毁，不传任何值，则将所有的弹出框删除
     * titleContainer 可选，与弹出框关联的title容器
     * referenceContainer 可选，与弹出框关联的内容容器
     * guid 可选，弹出框的guid
     */
    function dialogDestroy(options){
        var guid = getDialogGuid(options);

        if(guid){
            removeDialogAttr(guid);
        }else{
            var $dialogs = $("body").find("div[bh-paper-pile-dialog-role=bhPaperPileDialog]");
            $dialogs.each(function(){
                var guid = $(this).attr("bh-paper-pile-dialog-role-guid");
                removeDialogAttr(guid);
            });
        }
    }

    /**
     * 移除对话框及与其关联的容器属性
     * @param guid
     */
    function removeDialogAttr(guid){
        var $dialog = $("div[bh-paper-pile-dialog-role-guid="+guid+"]");
        if($dialog.length === 0){
            return;
        }
        var dialogIndex = $dialog.attr("bh-paper-pile-dialog-role-index");
        dialogIndex = parseInt(dialogIndex, 10);
        $("[bh-paper-pile-dialog-role-title-guid="+guid+"]").removeAttr("bh-paper-pile-dialog-role-title-guid").off("click");
        $("[bh-paper-pile-dialog-role-container-guid="+guid+"]").removeAttr("bh-paper-pile-dialog-role-container-guid");
        $dialog.remove();

        var existDialogData = $("body").data("bh-paper-pile-dialog");
        var existDialogLen = existDialogData.length;
        if(existDialogLen === 1){
            $("body").removeData("bh-paper-pile-dialog");
        }else{
            var newDialogData = [];
            for(var i= 0; i<existDialogLen; i++){
                var existItem = existDialogData[i];
                var existIndex = existItem.index;
                if(existIndex != dialogIndex){
                    if(existIndex > dialogIndex){
                        existItem.index = existIndex - 1;
                        newDialogData.push(existItem);
                    }else{
                        newDialogData.push(existItem);
                    }
                }
            }
            $("body").data("bh-paper-pile-dialog", newDialogData);
        }
    }

    /**
     * 弹出框的结构html
     * @returns {string}
     */
    function getDialogHtml(){
        var _html =
            '<div class="bh-paper-pile-dialog" style="@style" bh-paper-pile-dialog-role="bhPaperPileDialog" bh-paper-pile-dialog-role-guid="@guid">' +
                '<div class="bh-paper-pile-dialog-container bh-animated-doubleTime bh-paper-pile-dialog-intoUp">' +
                    '<i class="iconfont icon-close bh-pull-right bh-paper-pile-closeIcon" bh-paper-pile-dialog-role="bhPaperPileDialogCloseIcon"></i>' +
                    //'<div class="bh-paper-pile-dialog-headerTitle" bh-paper-pile-dialog-role="bhPaperPileDialogHeader">' +
                        '@title' +
                    //'</div>' +
                    '<div class="bh-paper-pile-body bh-card bh-card-lv1" bh-paper-pile-dialog-role="bhPaperPileDialogBody">' +
                        '@content' +
                    '</div>' +
                    '<div class="bh-paper-pile-dialog-footer bh-border-v" bh-paper-pile-dialog-role="bhPaperPileDialogFooter">@footer</div>' +
                '</div>' +
            '</div>';
        return _html;
    }

    /**
     * 判断弹出框是否有页脚，有则显示页脚
     * @param $dialog
     * @param data
     */
    function dialogFooterToFixed($dialog, data){
        if(data.footer){
            var dialogWidth = $dialog.outerWidth();
            var dialogLeft = $dialog.offset().left;

            $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]")
                .css({"left":dialogLeft+"px", "width":dialogWidth+"px", "position": "fixed", "bottom": "0"}).show();
        }
    }

    /**
     * 获取浏览器和对话框的相关位置和高度等
     * @param $dialog
     * @returns {{}}
     */
    function getPositionAndHeight($dialog){
        var data = {};
        var $window = $(window);
        var $body = $("body");
        var scrollTop = $window.scrollTop();
        var windowHeight = $window.height();

        var bodyHeight = $body.get(0).scrollHeight;

        var footerHeight = $("[bh-footer-role=footer]").outerHeight();

        if($dialog){
            var $dialogBody = $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]");
            var dialogBodyHeight = $dialogBody.outerHeight(true);
            var dialogHeight = $dialog.outerHeight();
            var dialogOffset = $dialog.offset();

            data.dialogBodyHeight = dialogBodyHeight;
            data.dialogOffset = dialogOffset;
            data.dialogHeight = dialogHeight;
        }

        data.windowHeight = windowHeight;
        data.scrollTop = scrollTop;
        data.bodyHeight = bodyHeight;
        data.footerHeight = footerHeight;
        return data;
    }

    /**
     * 设置页面和对话框页脚style
     * @param $dialog
     */
    function setCurrentFooterPosition($dialog){
        //重置页脚前，将页面的页脚top清零，否则有子级弹框时，重设高度无效
        $("[bh-footer-role=footer]").css({"top":0, "z-index": -1});
        var positionAndHeight = getPositionAndHeight($dialog);

        var $dialogFooter = $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]");
        var dialogFooterFixedStyle = $dialogFooter.attr("style");
        $dialogFooter.attr("bh-paper-pile-dialog-role-footer-fixed", dialogFooterFixedStyle);

        //设置页面页脚style，使其绝对定位到页面底部
        setPageFooterToAbsolute(positionAndHeight);
        var footerPositionTop = positionAndHeight.bodyHeight - positionAndHeight.footerHeight;

        //对话框高度小于浏览器高度，则让对话框页脚取消浮动
        var dialogShowHeight = positionAndHeight.dialogBodyHeight + positionAndHeight.dialogOffset.top;
        if(dialogShowHeight < positionAndHeight.windowHeight){
            //如果弹出框的显示高度达不到页脚的top，则将页脚的位置下移，避免出现超出的侧边框线
            if(dialogShowHeight < footerPositionTop){
                setDialogFooterRelative($dialogFooter, "low");
            }else{
                setDialogFooterRelative($dialogFooter);
            }
        }
    }

    function setPageFooterToAbsolute(positionAndHeight){
        //设置页面页脚style，使其绝对定位到页面底部
        var $pageFooter = $("[bh-footer-role=footer]");
        if(!$pageFooter.attr("bh-footer-role-normal-style")){
            var pageFooterNormalStyle = $pageFooter.attr("style");
            if(!pageFooterNormalStyle){
                pageFooterNormalStyle = " ";
            }
            $pageFooter.attr("bh-footer-role-normal-style", pageFooterNormalStyle);
        }
        //当弹出框的高度大于浏览器的高度时，让body的高度再额外增加页脚高度。因为在弹框出现时页脚已经变成了绝对定位，且重设页脚前将页脚的top变为了0
        if(positionAndHeight.dialogBodyHeight + positionAndHeight.dialogOffset.top > positionAndHeight.windowHeight){
            positionAndHeight.bodyHeight = positionAndHeight.bodyHeight + positionAndHeight.footerHeight;
        }
        var footerPositionTop = positionAndHeight.bodyHeight - positionAndHeight.footerHeight;
        var footerPositionLeft = $("header[bh-header-role=bhHeader]").find("div.bh-headerBar-content").offset().left;
        $pageFooter.css({"top": footerPositionTop, "left": footerPositionLeft, "width": "100%", "position": "absolute", "z-index": "9999"});
    }

    /**
     * 滚动条滚动时，设置页脚样式
     * @param $dialog
     */
    function scrollToSetFooterPosition($dialog){
        var positionAndHeight = getPositionAndHeight($dialog);

        var $dialogFooter = $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]");
        if(positionAndHeight.windowHeight + positionAndHeight.scrollTop + positionAndHeight.footerHeight >= positionAndHeight.bodyHeight){
            setDialogFooterRelative($dialogFooter, "low");
        }else{
            var dialogFooterFixedStyle = $dialogFooter.attr("bh-paper-pile-dialog-role-footer-fixed");
            $dialogFooter.attr("style", dialogFooterFixedStyle);
        }
    }

    /**
     * 将对话框页脚设成相对定位
     * @param $dialogFooter
     * @param flag  low
     */
    function setDialogFooterRelative($dialogFooter, flag){
        //当弹出框的页脚没有任何内容时，不做任何处理
        if($dialogFooter.contents().length === 0){
            return;
        }

        var footerHeight = $("[bh-footer-role=footer]").outerHeight();
        var $dialogBody = $dialogFooter.prev("[bh-paper-pile-dialog-role=bhPaperPileDialogBody]");
        var $dialogHeader = $dialogFooter.prevAll("[bh-paper-pile-dialog-role=bhPaperPileDialogHeader]");
        var dialogFooterHeight = $dialogFooter.outerHeight();
        var dialogFooterBottom = dialogFooterHeight + footerHeight;
        if(flag === "low"){
            dialogFooterBottom = dialogFooterHeight;
        }

        var dialogBodyHeight = 0;
        $dialogBody.children().each(function(){
            var $item = $(this);
            var itemHeight = $item.outerHeight(true);
            dialogBodyHeight += itemHeight;
        });
        var dialogBodyPaddingBottom = parseInt($dialogBody.css("padding-bottom"), 10);
        dialogBodyPaddingBottom = dialogBodyPaddingBottom ? dialogBodyPaddingBottom : 0;

        var dialogBodyMinHeight = parseInt($dialogBody.css("min-height"), 10);
        dialogBodyMinHeight = dialogBodyMinHeight ? dialogBodyMinHeight : 0;

        //当弹出框的内容高度比弹出框的最小高度还小的时候，让弹出框的页脚能自适应高度
        if((dialogBodyHeight + dialogBodyPaddingBottom) < dialogBodyMinHeight){
            $dialogFooter.removeAttr("style");
            /**
             * 24是对话框页脚距离内容的间距
             * dialogBodyMinHeight是页面页脚高度和对话框页脚高度的和
             * 页面页脚的高度是32，所以24是安全距离可以直接加
             */
            dialogBodyHeight += 24;
            dialogBodyHeight += $dialogHeader.outerHeight();

            $dialogFooter.css({"top": dialogBodyHeight+"px", "bottom": "initial"});
        }else{
            $dialogFooter.css({"left": 0, "bottom": dialogFooterBottom+"px", "position": "relative"});
        }
        $dialogFooter.show();
    }

    /**
     * 弹出框的关闭事件监听
     * @param $dialog
     * @param data
     */
    function dialogEventListen($dialog, data){
        //点击关闭按钮
        $dialog.on("click", "i[bh-paper-pile-dialog-role=bhPaperPileDialogCloseIcon]", function(){
            var guid = $(this).closest("[bh-paper-pile-dialog-role=bhPaperPileDialog]").attr("bh-paper-pile-dialog-role-guid");
            data.guid = guid;
            dialogHide(data);
        });

        //当关闭按钮不隐藏时，给头部title添加点击事件
        if(!data.hideCloseIcon){
            //点击弹框头部条隐藏弹框
            data.titleContainer.on("click", function(){
                var guid = $(this).attr("bh-paper-pile-dialog-role-title-guid");
                data.guid = guid;
                dialogHide(data);
            });
        }else{
            data.titleContainer.css({"cursor": "default"});
        }

        //监听浏览器滚动事件，设置页脚样式
        $(window).scroll(function (e) {
            scrollToSetFooterPosition($dialog);
        });
    }

    //重新设置弹框页脚的位置
    function resetDialogFooter(options){
        var guid = getDialogGuid(options);
        if(guid){
            setTimeout(function(){
                var $dialog = $("div[bh-paper-pile-dialog-role-guid="+guid+"]");
                var positionAndHeight = getPositionAndHeight($dialog);
                var dialogShowHeight = positionAndHeight.dialogBodyHeight + positionAndHeight.dialogOffset.top;
                //对话框高度小于浏览器高度，则让对话框页脚取消浮动
                if(dialogShowHeight < positionAndHeight.windowHeight){
                    setCurrentFooterPosition($dialog);
                }else{
                    //给弹出框的页脚添加浮动属性
                    dialogFooterToFixed($dialog, {"footer": true});
                }
            },50);
        }
    }

    function NewGuid(){
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
    function S4(){
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

    //重设弹框的最小高度
    function resetDialogMinHeight(options){
        var guid = getDialogGuid(options);
        if(guid){
            var $dialog = $("div[bh-paper-pile-dialog-role-guid="+guid+"]");
            var $dialogBody = $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]");
            var diffTop = $dialogBody.offset().top;
            setDialogContentMinHeight($dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]"),diffTop, "resetDialogMinHeight");
        }
    }

    //获取弹框的guid
    function getDialogGuid(options){
        var guid = "";
        if(options.titleContainer){
            guid = options.titleContainer.attr("bh-paper-pile-dialog-role-title-guid");
        }else if(options.referenceContainer){
            guid = options.referenceContainer.attr("bh-paper-pile-dialog-role-container-guid");
        }else if(options.guid){
            guid = options.guid;
        }
        return guid;
    }
})(jQuery);


(function ($) {
    /**
     * 定义一个插件
     */
    var Plugin;

    /**
     * 这里是一个自运行的单例模式。
     */
    Plugin = (function () {

        /**
         * 插件实例化部分，初始化时调用的代码可以放这里
         */
        function Plugin(element, options) {
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.bhHeader.defaults, options);
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            init(this.settings, this.$element);
        }

        //重置导航高亮位置
        Plugin.prototype.resetNavActive = function (options) {
            options = $.extend({}, {
                activeIndex: NaN  //高亮位置从1开始算起
            }, options);
            resetNavActive(options, this.$element);
        };

        return Plugin;

    })();

    function init(options, dom){
        //初始化头部
        var _html = getHeaderHtml(options);
        dom.html(_html);

        //设置头部菜单
        navigateBarInit(dom);
        //初始化用户详情
        userInfoInit(options);
        //头部事件监听
        headerEventInit(dom);
    }

    function getHeaderHtml(data){
        var headerContent = getHeaderContentHtml(data);
        var _html = '<header class="bh-header sc-animated" bh-header-role="bhHeader">'+headerContent+'</header>';
        _html += '<header class="bh-header-mini sc-animated" bh-header-role="bhHeaderMini">'+headerContent+'</header>';
        _html += '<header class="bh-header-bg sc-animated"></header>';
        _html += getThemePopUpBoxHtml();
        return _html;
    }

    function getHeaderContentHtml(data){
        var _html =
            '<div class="bh-headerBar">' +
                '<div class="bh-headerBar-content">' +
                    '@asideNavIcon'+
                    '@logo' +
                    '@title' +
                    '<div class="bh-headerBar-menu">' +
                        '@userImage' +
                        '@dropMenu' +
                        '<div class="bh-headerBar-iconBlock" bh-theme-role="themeIcon">' +
                            '<i class="iconfont icon-pifu"></i>' +
                        '</div>'+
                        '@icons' +
                        '@navigate' +
                    '</div>'+
                '</div>'+
            '</div>';

        return _html.replace("@logo", getHeaderLogoHtml(data)).replace("@title", getHeaderTitleHtml(data)).replace("@navigate", getHeaderNavigateHtml(data))
            .replace("@icons", getIconHtml(data)).replace("@userImage", getImageHtml(data)).replace("@dropMenu", getAndAddDropMenuBox(data))
            .replace("@asideNavIcon", getAsideNavIcon(data));
    }

    function getAsideNavIcon(data){
        var _html = '';
        if(data.showAsideNav){
            _html = '<div class="bh-headerBar-asideMenu" bh-header-role="bhAsideNavIcon"><i class="iconfont icon-menu"></i></div>';
        }
        return _html;
    }

    function getHeaderLogoHtml(data){
        var _html = '';
        if(data.logo){
            _html =
                '<div class="bh-headerBar-logo">' +
                    '<img src="'+data.logo+'" />' +
                '</div>';
        }
        return _html;
    }

    function getHeaderTitleHtml(data){
        var _html = '';
        if(data.title){
            _html =
                '<div class="bh-headerBar-title">'+data.title+'</div>';
        }
        return _html;
    }

    function getHeaderNavigateHtml(data){
        var _html = '';
        var nav = data.nav;
        if(nav){
            _html =
                '<div class="bh-headerBar-navigate">' +
                    '@content' +
                    '<div class="bh-headerBar-nav-bar bh-single-animate"></div>' +
                '</div>';

            var navContentHtml = "";
            for(var i = 0, navLen = nav.length; i<navLen; i++){
                navContentHtml += getHeaderNavigateItemHtml(nav[i]);
            }

            _html = _html.replace("@content", navContentHtml);
        }
        return _html;
    }

    function getHeaderNavigateItemHtml(data){
        var _html = '<a href="@href"><div class="bh-headerBar-nav-item @active" @attribute>@title</div></a>';
        var active = "";
        var attribute = "";
        var href = "javascript:void(0);";
        if(data.active){
            active = "bh-active";
        }
        if(data.className){
            active += " "+data.className;
        }
        var attributeData = data.attribute;
        if(attributeData){
            var attrLen = attributeData.length;
            if(attrLen > 0){
                for(var i=0; i<attrLen; i++){
                    var key = attributeData[i].key;
                    var value = attributeData[i].value;
                    if(key && value){
                        attribute += key+'="'+value+'" ';
                    }
                }
            }
        }
        if(data.href){
            href = data.href;
        }
        return _html.replace("@active", active).replace("@title", data.title).replace("@href", href).replace("@attribute", attribute);
    }

    function getIconHtml(data){
        var _html = '';
        var icons = data.icons;
        if(icons){
            for(var i= 0, iconLen=icons.length; i<iconLen; i++){
                _html += '<div class="bh-headerBar-iconBlock"><i class="iconfont '+icons[i]+'"></i></div>';
            }
        }
        return _html;
    }

    function getImageHtml(data){
        var _html = '';
        var image = data.userImage;
        if(image){
            _html = '<div class="bh-headerBar-imgBlock"><img src="'+image+'" bh-header-role="bhHeaderUserInfoIcon" /></div>';
        }
        return _html;
    }

    function getThemePopUpBoxHtml(){
        var _html =
            '<div class="bh-header-themelist jqx-dropdownbutton-popup">' +
                '<ul>' +
                    '<li class="selected" title="blue">' +
                        '<span class="bh-header-colorCard-text">蓝色皮肤</span>' +
                        '<span class="bh-header-colorCard-blueTheme"></span>' +
                        '<span class="bh-header-colorCard-bluePrimary"></span>' +
                        '<span class="bh-header-colorCard-blueSuccess"></span>' +
                        '<span class="bh-header-colorCard-blueWarning"></span>' +
                        '<span class="bh-header-colorCard-blueDanger"></span>' +
                    '</li>' +
                    '<li title="purple">' +
                        '<span class="bh-header-colorCard-text">紫色皮肤</span>' +
                        '<span class="bh-header-colorCard-purpleTheme"></span>' +
                        '<span class="bh-header-colorCard-purplePrimary"></span>' +
                        '<span class="bh-header-colorCard-purpleSuccess"></span>' +
                        '<span class="bh-header-colorCard-purpleWarning"></span>' +
                        '<span class="bh-header-colorCard-purpleDanger"></span>' +
                    '</li>' +
                '</ul>' +
            '</div>';
        return _html;
    }

    function userRoleBoxHtml(menuList){
        var _html = "";
        var dropItemsHtml = "";
        var activeData = "";
        if(menuList){
            var menuLen = menuList.length;
            if(menuLen > 0){
                for(var i=0; i<menuLen; i++){
                    var menuItem = menuList[i];
                    var text = menuItem.text;
                    var href = menuItem.href;
                    if(!href){
                        href = "javascript:void(0);";
                    }
                    if(menuItem.active){
                        activeData = menuItem;
                    }
                    dropItemsHtml += '<div class="bh-headerBar-roleBox-title"><a href="'+href+'">'+text+'</a></div>';
                }

                _html =
                    '<div class="bh-headerBar-roleBox bh-card bh-card-lv3 bh-headerBar-popupBox-animate" bh-header-role="roleBox">' +
                        '<div class="bh-headerBar-roleBox-explain bh-headerBar-roleBox-title">选择角色</div>' +
                        dropItemsHtml +
                    '</div>';
            }
        }

        return {"html": _html, "active": activeData};
    }

    function getAndAddDropMenuBox(options){
        var headerRoleHtml = "";
        var menuList = options.dropMenu;
        if(menuList && menuList.length > 0){
            var dropMenuData = userRoleBoxHtml(menuList);
            $("body").append(dropMenuData.html);

            headerRoleHtml =
                '<div class="bh-headerBar-roleSwitch" bh-header-role="roleSwitch">' +
                    dropMenuData.active.text +
                '</div>';
        }

        return headerRoleHtml;
    }

    function headerEventInit(dom){
        //页面滚动时切换头部的normal和mini头
        scrollEvent(dom);
        //头部菜单事件监听
        navigateEvent(dom);
        //主题切换事件
        themePopUpBoxInit(dom);
        //角色切换事件
        roleSwitchEvent(dom);
        //用户详情事件
        userInfoIconEvent(dom);
        //侧边栏导航事件
        asideNavEvent(dom);
    }

    function scrollEvent(dom){
        $(window).scroll(function (e) {
            var $window = $(window);
            var scrollTop = $window.scrollTop();
            var $headerBg = dom.find("header.bh-header-bg");
            var $miniHeader = dom.find("header.bh-header-mini");
            var $normalHeader = dom.find("header.bh-header");
            var operateHeight = 44;
            //使头部的底色高度变化
            if(scrollTop < operateHeight){
                $headerBg.addClass("bh-headerBg-show").removeClass("bh-headerBg-hide");
                $normalHeader.addClass("bh-normalHeader-show").removeClass("bh-normalHeader-hide");
                $miniHeader.addClass("bh-miniHeader-hide").removeClass("bh-miniHeader-show");
            }else if(scrollTop == operateHeight){
                $normalHeader.addClass("bh-normalHeader-show").removeClass("bh-normalHeader-hide");
                $miniHeader.addClass("bh-miniHeader-hide").removeClass("bh-miniHeader-show");
            }else{
                $headerBg.addClass("bh-headerBg-hide").removeClass("bh-headerBg-show");
                $normalHeader.addClass("bh-normalHeader-hide").removeClass("bh-normalHeader-show");
                $miniHeader.addClass("bh-miniHeader-show").removeClass("bh-miniHeader-hide");
            }
        });
    }

    function navigateBarInit(dom){
        var $navigate = dom.find(".bh-headerBar-navigate");
        var $activeItem = $navigate.find(".bh-active");
        if($activeItem.length > 0){
            //设置菜单active条位置
            setHeadNavBarPosition($activeItem, $navigate);
        }
    }

    function navigateEvent(dom){
        var $navigate = dom.find(".bh-headerBar-navigate");
        var $navItems = $navigate.find(".bh-headerBar-nav-item");
        if($navItems.length > 0){
            //鼠标移入菜单单个节点的active条的处理
            $navigate.on("mouseenter", ".bh-headerBar-nav-item", function(){
                var $item = $(this);

                //记录移入前的active所在位置
                var activeIndex = $navigate.data("nav-init-active-index");
                if(!activeIndex){
                    if(activeIndex !== 0){
                        var index = $navigate.find(".bh-active").closest("a").index();
                        $navigate.data("nav-init-active-index", index);
                    }
                }

                $navigate.find(".bh-headerBar-nav-item").removeClass("bh-active");
                $item.addClass("bh-active");

                setHeadNavBarPosition($item, $navigate);
            });
            //点击菜单active条的处理
            $navigate.on("click", ".bh-headerBar-nav-item", function(){
                var index = $(this).closest("a").index();
                $navigate.data("nav-init-active-index", index);
            });

            //鼠标移出菜单块，还原active条的位置
            $navigate.on("mouseleave", function(){
                var index = $navigate.data("nav-init-active-index");
                var $itemList = $navigate.find(".bh-headerBar-nav-item");
                var $activeA = $itemList.closest("a").eq(index);
                var $activeItem = $activeA.find(".bh-headerBar-nav-item");
                $itemList.removeClass("bh-active");
                $activeItem.addClass("bh-active");

                setHeadNavBarPosition($activeItem, $navigate);
            });
        }
    }
    //侧边栏导航栏icon事件监听
    function asideNavEvent(dom){
        dom.on("click", "[bh-header-role=bhAsideNavIcon]", function(){
            $.bhAsideNav.show();
        });
    }

    function setHeadNavBarPosition($item, $navigate){
        var _width = $item.outerWidth();
        var _left = $item.offset().left;
        var navLeft = $navigate.offset().left;
        var barLeft = _left - navLeft;

        $(".bh-headerBar-nav-bar").css({"left": barLeft+"px", "width": _width+"px"});
    }
    //角色切换块事件监听
    function roleSwitchEvent(dom){
        dom.on("click", "[bh-header-role=roleSwitch]", function(){
            var $switch = $(this);
            var switchOffset = $switch.offset();
            var switchWidth = $switch.outerWidth();
            var switchHeight = $switch.outerHeight();
            var $roleBox = $("[bh-header-role=roleBox]");
            var roleBoxWidth = $roleBox.outerWidth();
            var roleBoxLeft = switchOffset.left + switchWidth - roleBoxWidth;
            var roleBoxTop = switchOffset.top + switchHeight + 8;
            $roleBox.css({"left": roleBoxLeft, "top": roleBoxTop}).toggleClass("bh-active");
        });

        $("[bh-header-role=roleBox]").on("click", ".bh-headerBar-roleBox-title", function(){
            var $item = $(this);
            if($item.hasClass("bh-headerBar-roleBox-explain")){
                return;
            }
            dom.find("[bh-header-role=roleSwitch]").text($item.text());
            $item.closest("[bh-header-role=roleBox]").removeClass("bh-active");
        });
    }

    function userInfoIconEvent(dom){
        dom.on("click", "[bh-header-role=bhHeaderUserInfoIcon]", function(){
            var $box = $("[bh-header-role=bhHeaderBarInfoBox]");
            if($box.length === 0){
                return;
            }
            var $item = $(this);
            var itemOffset = $item.offset();
            var itemWidth = $item.outerWidth();
            var itemHeight = $item.outerHeight();
            var boxWidth = $box.outerWidth();
            var boxLeft = itemOffset.left + itemWidth - boxWidth;
            var boxTop = itemOffset.top + itemHeight + 8;
            $box.css({"left": boxLeft, "top": boxTop}).toggleClass("bh-active");
        });
    }

    function themePopUpBoxInit(dom){
        var $icon = dom.find("div[bh-theme-role=themeIcon]");
        var iconWidth = $icon.outerWidth();
        var iconHeight = $icon.outerHeight();
        var iconOffset = $icon.offset();
        var $themeList = dom.find(".bh-header-themelist");
        var themeTop = iconOffset.top + iconHeight;
        var themeLeft = iconOffset.left + iconWidth - 150;
        $themeList.css({"top": themeTop, "left": themeLeft});

        themePopUpBoxEvent($icon, $themeList);
    }

    function themePopUpBoxEvent($icon, $themeList){
        $icon.on("click",function(){
            $themeList.toggle();
        });

        //绑定点击事件,切换皮肤
        $themeList.on("click", "li",function(){
            $themeList.find(".bh-selected").removeClass("bh-selected");
            $(this).addClass("bh-selected");
            changeThemes({themesName:$(this).attr("title"),themesLink:$("#bhThemes")});
            changeThemes({themesName:$(this).attr("title"),themesLink:$("#bhScenceThemes")});
            $themeList.hide();
        });

        $themeList.find("li").hover(function(){
            $(this).addClass("bh-active");
        },function(){
            $(this).removeClass("bh-active");
        });
    }

    function changeThemes(options) {
        var _wisThemes = options.themesLink;
        var newUrl = getUrlByThemesName(options);
        if(newUrl != ""){
            _wisThemes.removeAttr('type');
            _wisThemes.attr('href', newUrl);
            _wisThemes.attr('type','text/css');
        }
    }
    function getUrlByThemesName(options){
        var _wisThemes = options.themesLink;
        var url = _wisThemes.attr('href');
        if(!url) return false;
        var urlArr = url.split("/");
        var newUrl = "";

        if(urlArr && urlArr.length>1){
            urlArr[urlArr.length - 2] = options.themesName;
            newUrl = urlArr.join("/");
        }
        return newUrl;
    }

    //添加用户详情
    function userInfoInit(options){
        var userInfo = options.userInfo;
        //当用户详情不存在时，不予添加
        if($.isEmptyObject(userInfo)){
            return;
        }
        //用户图片
        var image = userInfo.image;
        //显示详情，每条数据显示一行
        var info = userInfo.info;
        //退出登录的链接
        var logoutHtml = userInfo.logoutHref ? '<a class="bh-btn bh-btn-default bh-btn-small" href="'+userInfo.logoutHref+'">退出登录</a>' : '';
        var _html =
            '<div class="bh-headerBar-userIfon bh-headerBar-popupBox-animate bh-card bh-card-lv3" bh-header-role="bhHeaderBarInfoBox">' +
                '<div class="bh-headerBar-userInfo-img">' +
                    '<img src="@image" />' +
                '</div>' +
                '<div class="bh-headerBar-userInfo-detail">' +
                    '@detail' +
                '</div>' +
                    '@logoutHtml'+
            '</div>';

        var detailHtml = "";
        if(info){
            var infoLen = info.length;
            for(var i=0; i<infoLen; i++){
                detailHtml += '<div>'+info[i]+'</div>';
            }
        }
        _html = _html.replace("@image", image).replace("@detail", detailHtml).replace("@logoutHtml", logoutHtml);
        $("body").append(_html);
    }

    function resetNavActive(options, $dom){
        if(options){
            var activeIndex = parseInt(options.activeIndex, 10);
            if(activeIndex){
                activeIndex = activeIndex - 1;
                var $nav = $dom.find(".bh-headerBar-navigate");
                $nav.find(".bh-active").removeClass("bh-active");
                var $activeItem = $nav.children("a").eq(activeIndex).find(".bh-headerBar-nav-item");
                $activeItem.addClass("bh-active");
                $nav.data("nav-init-active-index", activeIndex);

                setHeadNavBarPosition($activeItem, $nav);
            }
        }
    }



    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.bhHeader = function (options, params) {
        var instance;
        instance = this.data('bhHeader');
        /**
         * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
         */
        if (!instance) {
            return this.each(function () {
                //将实例化后的插件缓存在dom结构里（内存里）
                return $(this).data('bhHeader', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        /**
         * 优雅处： 如果插件的参数是一个字符串，则 调用 插件的 字符串方法。
         * 如 $('#id').plugin('doSomething') 则实际调用的是 $('#id).plugin.doSomething();
         * doSomething是刚才定义的接口。
         * 这种方法 在 juqery ui 的插件里 很常见。
         */
        if ($.type(options) === 'string') instance[options](params);
        return this;
    };

    /**
     * 插件的默认值
     */
    $.fn.bhHeader.defaults = {
        showAsideNav: false, //是否显示左侧边导航
        logo: "", //logo路径
        title: "", //页面名称
        icons: [], //右侧的icon， 需传入的是icon-xxx
        img: "", //右侧的小图片
        nav: [], //头部菜单 [{"title":"填写申请表", "active":true}]， active是表示该菜单高亮
        dropMenu: [], //头部的角色下拉菜单
        userInfo: {} //用户详情 {"image": "", "info": ["xx", "xx"]},image:显示的图片， info：要显示的信息，一条信息一行
    };
})(jQuery);