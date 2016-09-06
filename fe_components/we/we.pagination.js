'use strict';

/**
 * 将插件封装在一个闭包里面，防止外部代码污染  冲突
 */
(function () {
    var html_advanced =  '<div class="bh-pager bh-hide">'+
                    '<div class="bh-pull-left">'+
                        '<a href="javascript:void(0);" class="bh-pager-btn waves-effect" pager-flag="prev">'+
                            '<i class="iconfont icon-keyboardarrowleft"></i>'+
                        '</a>'+
                        '<a href="javascript:void(0);" class="bh-pager-btn waves-effect" pager-flag="next">'+
                            '<i class="iconfont icon-keyboardarrowright"></i>'+
                        '</a>'+
                        '<span class="bh-pager-num" pager-flag="pageInfo"></span>'+
                        '<label class="bh-pager-label">跳转至</label>'+
                        '<input type="text" class="bh-form-control bh-pager-input" pager-flag="gotoPage"/>'+
                        '<span>页</span>'+
                    '</div>'+
                    '<div class="bh-pull-right">'+
                        '<div pager-flag="pagerOptionSel" class="bh-pull-right"></div>'+
                        '<label class="bh-pull-right bh-pager-label">每页显示</label>'+
                    '</div>'+
                '</div>';

    var html_simple = '<div class="bh-pager bh-hide">'

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
            this.settings = $.extend({}, $.fn.pagination.defaults, options);
            //定位pageSizeOptions的selectedIndex
            var pagesize = options.pagesize;
            var pageSizeOptions = this.settings.pageSizeOptions;
            for(var i = 0; i < pageSizeOptions.length; i++){
                if(pageSizeOptions[i] == pagesize){
                    this.settings.selectedIndex = i;
                }
            }
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            _create(this);
        }

        return Plugin;
    })();

    Plugin.prototype.getPagenum = function () {
        /**
         * 方法内容
         */
        return parseInt(this.$element.find('[pager-flag="gotoPage"]').val());
    };

    Plugin.prototype.getPagesize = function () {
        /**
         * 方法内容
         */
        return this.$element.find('[pager-flag="pagerOptionSel"]').jqxDropDownList('val');
    };

    Plugin.prototype.getTotal = function () {
        /**
         * 方法内容
         */
         return this.settings.totalSize;
    };

    /**
     * 插件的私有方法
     */
    
    //生成dom
    function _create(instance) {
        var $element = instance.$element;
        var settings = instance.settings;
        switch(settings.mode){
            case 'simple':
            case 'advanced': 
                $element.html(html_advanced);
                break;
        }
        //生成每页显示条数下拉选择
        $element.find('[pager-flag="pagerOptionSel"]').jqxDropDownList({ 
            source: settings.pageSizeOptions, selectedIndex: settings.selectedIndex, width: '60', height: '26'
        });
        //跳转到第几页赋值
        $element.find('[pager-flag="gotoPage"]').val(settings.pagenum + 1);
        //当前分页条数及总条数
        _setCurrentPageRecordInfo(instance);
        $element.children('.bh-pager').removeClass('bh-hide');
        _eventListener(instance);
    }

    //事件监听
    function _eventListener(instance){
        var $element = instance.$element;
        //点击上一页
        $element.off('click', '[pager-flag="prev"]').on('click', '[pager-flag="prev"]', function(){
            var pagenum = instance.getPagenum();
            if(pagenum <= 1) return;
            _setPagenum(pagenum - 1, instance);
            _setCurrentPageRecordInfo(instance);
            _triggerEvent(instance, $(this));
        });
        //点击下一页
        $element.off('click', '[pager-flag="next"]').on('click', '[pager-flag="next"]', function(){
            var pagenum = instance.getPagenum();
            if(pagenum >= _getLastpagenum(instance)) return;
            _setPagenum(pagenum + 1, instance);
            _setCurrentPageRecordInfo(instance);
            _triggerEvent(instance, $(this));
        });
        //跳转第几页
        $element.off('blur', '[pager-flag="gotoPage"]').on('blur', '[pager-flag="gotoPage"]', function(){
            var pagenum = instance.getPagenum();
            if(pagenum < 1 || pagenum > _getLastpagenum(instance)){
                _setPagenum(1, instance);
                return;
            } 
            _setPagenum(pagenum, instance);
            _setCurrentPageRecordInfo(instance);
            _triggerEvent(instance, $(this));
        });
        //每页显示条数下拉选择框
        $element.off('select', '[pager-flag="pagerOptionSel"]').on('select', '[pager-flag="pagerOptionSel"]', function(e){
            // var pagenum = instance.getPagenum();
            // if(pagenum < 1 || pagenum > _getLastpagenum(instance)) return;
            _setPagenum(0, instance);
            _setCurrentPageRecordInfo(instance);
            _triggerEvent(instance, $(this));
        });
    }
    //生成当前页条数信息
    function _genCurrentPageRecordInfo(instance){
        var start = 1;
        var end = 1;
        var pagenum = instance.getPagenum();
        var total = instance.getTotal();
        var pagesize = instance.getPagesize();
        if(pagenum * pagesize < total){
            end = pagenum * pagesize;
        }else{
            end = total;
        }
        start = pagesize * (pagenum - 1) + 1;
        if(total == 0){
            start = 0;
            end = 0;
        }
        return start + '-' + end;
    }

    //设置当前分页条数和总条数信息
    function _setCurrentPageRecordInfo(instance){
        //当前分页条数及总条数
        var currPageInfo = _genCurrentPageRecordInfo(instance);
        instance.$element.find('[pager-flag="pageInfo"]').html(currPageInfo + ' of ' + instance.settings.totalSize);
    }

    //设置当前页码
    function _setPagenum(pagenum, instance){
        if(isNaN(pagenum) || pagenum < 1){
            pagenum = 1;
        }
        var lastPagenum = _getLastpagenum(instance);
        if(pagenum > lastPagenum){
            pagenum = lastPagenum;
        }
        instance.$element.find('[pager-flag="gotoPage"]').val(pagenum);
    }

    //获取最后一页页码
    function _getLastpagenum(instance){
        var total = instance.getTotal();
        var pagesize = instance.getPagesize();
        return Math.ceil(total / pagesize);
    }

    //触发事件
    function _triggerEvent(instance, $selector){
        var pagenum = instance.getPagenum() - 1;
        var pagesize = instance.getPagesize();
        var total = instance.getTotal();
        $selector.trigger('pagersearch', [pagenum, pagesize, total]);
    }

    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.pagination = function (options, params) {
        var instance = new Plugin(this, options);
        
        if (options === true) return instance;
        return this;
    };

    /**
     * 插件的默认值
     */
    $.fn.pagination.defaults = {
        mode: 'advanced',
        pagesize: 10,
        pageSizeOptions: [10, 20, 50, 100],
        selectedIndex: 0,
        pagenum: 0,
        totalSize: 0,
    };
}).call(undefined);