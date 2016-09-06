(function() {
    var Plugin, _init;
    var _animateTime, _eventBind, _addTime, _cancelAddTime, _renderEasySearch, _renderQuickSearch,
        _renderInputPlace, _renderConditionList, _addToConditionList, _removeFromConditionList,
        _refreshConditionNum, _getSelectedConditionFromForm, _renderAdvanceSearchForm, _getSelectedConditionFromModal,
        _getSearchCondition, _findModel, _getConditionFromForm, _initSchema, _closeSchema, _renderFixedSchema;
    Plugin = (function() {
        function Plugin(element, options) {
            this.options = $.extend({}, $.fn.emapAdvancedQuery.defaults, options);
            this.$element = $(element);
            this.$element.attr("emap-role", "advancedQuery").attr("emap-pagePath", "").attr("emap-action", this.options.data.name);
            this.options._initCount = 0; // 需要初始化的控件的总数
            this.options._initCounter = 0; // 控件初始化计数器
            _init(this.$element, this.options);
        }

        Plugin.prototype.getValue = function() {
            return _getSearchCondition(this.options);
        };

        return Plugin;
    })();

    _init = function(element, options) {

        element.attr("emap", JSON.stringify({
            "emap-url": WIS_EMAP_SERV.url,
            "emap-name": WIS_EMAP_SERV.name,
            "emap-app-name": WIS_EMAP_SERV.appName,
            "emap-model-name": WIS_EMAP_SERV.modelName
        }));
        delete WIS_EMAP_SERV.url;
        delete WIS_EMAP_SERV.name;
        delete WIS_EMAP_SERV.appName;
        delete WIS_EMAP_SERV.modelName;

        var modalData = options.data.controls;
        var easyArray = [];
        var quickArray = [];
        var guid = BH_UTILS.NewGuid();

        _animateTime = function() {
            return 450;
        };

        _eventBind = function(options) {
            var $advanced = options.$advanced;
            var $advancedModal = options.$advancedModal;
            $advanced.on("click", "[bh-advanced-query-role=addTime]", function() {
                _addTime($(this));
            });

            $advanced.on("click", "[bh-advanced-query-role=cancelAddTime]", function() {
                _cancelAddTime($(this));
            });

            // 展开高级搜索
            $advanced.on("click", "[bh-advanced-query-role=advancedOpen]", function() {
                $($advanced).addClass('bh-active');
                options.searchModel = 'advanced';
            });

            // 关闭高级搜索
            $advanced.on("click", "[bh-advanced-query-role=advancedClose]", function() {
                $($advanced).removeClass('bh-active');
                options.searchModel = 'easy';
            });

            // 删除搜索条件
            $advanced.on("click", "[bh-advanced-query-role=conditionDismiss]", function() {
                $(this).closest('.bh-advancedQuery-form-row').remove();
            });

            // 弹出  添加搜索条件 弹框
            $advanced.on("click", "[bh-advanced-query-role=addCondition]", function() {
                _renderConditionList(options);
                $("[bh-advanced-query-role=addDialog][data-guid=" + options.guid + "]").jqxWindow('open');
            });

            // 添加完成 添加搜索条件 弹框
            $advancedModal.on("click", "[bh-advanced-query-role=addDialogConfirm]", function() {
                //获取已选字段
                _renderAdvanceSearchForm(options, _getSelectedConditionFromModal(options));
                $("[bh-advanced-query-role=addDialog]").jqxWindow('close');

                if ($('[bh-paper-pile-dialog-role=bhPaperPileDialog]').length > 0) {
                    $.bhPaperPileDialog.resetPageFooter();
                }
            });

            // 关闭 添加搜索条件弹框
            $advancedModal.on("click", "[bh-advanced-query-role=addDialogCancel]", function() {
                $("[bh-advanced-query-role=addDialog]").jqxWindow('close');
            });

            // 选择添加字段 向右添加按钮
            $advancedModal.on('click', '[bh-advanced-query-role=modalListRightBtn]', function() {
                _addToConditionList();
            });

            // 选择添加字段 向左添加按钮
            $advancedModal.on('click', '[bh-advanced-query-role=modalListLeftBtn]', function() {
                _removeFromConditionList();
            });

            // easy搜索 监听 按键输入
            $advanced.on('keyup', '.bh-advancedQuery-quick-search-wrap input[type=text]', function(e) {
                var easySelectH = $advanced.data('easyarray').length * 28 + 1; // 下拉框高度
                var easySelectW = $(this).outerWidth(); // 下拉框宽度
                var searchValue = $(this).val();
                var pos = $(this).offset();
                var selectDiv = $('.bh-advancedQuery-quick-select[data-guid=' + options.guid + ']');
                pos.top += 28;

                // 回车快速搜索
                if (e.keyCode == 13) {
                    selectDiv.css({
                        'height': 0,
                        'border-width': '0'
                    });
                    element.trigger('search', [_getSearchCondition(options), options]);
                    return;
                }

                if (searchValue == '') {
                    selectDiv.css({
                        'height': 0,
                        'border-width': '0'
                    });
                } else {
                    $('.bh-advancedQuery-easy-query', selectDiv).html(searchValue);
                    selectDiv.css({
                        'height': easySelectH + 'px',
                        'width': easySelectW + 'px',
                        'border-width': '1px',
                        'top': pos.top,
                        'left': pos.left
                    });
                }
            });

            // 点击下拉快速搜索
            // $(document).off('click.emapAdvancedQuery').on('click.emapAdvancedQuery', '[bh-advanced-query-role=advancedEasySelect] p', function(){
            //     var selectDiv = $('.bh-advancedQuery-quick-select[data-guid=' + options.guid + ']');
            //     if (selectDiv.height() > 0) {
            //         selectDiv.css({'height': 0, 'border-width' : '0'});
            //     }
            //     element.trigger('search', [_getSearchCondition(options, $(this).data('name')), options]);
            // });

            $('[bh-advanced-query-role=advancedEasySelect][data-guid=' + options.guid + ']').on('click', 'p', function() {
                var selectDiv = $(this).closest('[bh-advanced-query-role=advancedEasySelect]');
                if (selectDiv.height() > 0) {
                    selectDiv.css({
                        'height': 0,
                        'border-width': '0'
                    });
                }
                element.trigger('search', [_getSearchCondition(options, $(this).data('name')), options]);
            });

            // 点击搜索按钮  easy search
            $advanced.on('click', '[bh-advanced-query-role=easySearchBtn]', function() {
                element.trigger('search', [_getSearchCondition(options), options]);
            });

            // 点击筛选条件  quick search
            $advanced.on('click', '[bh-advanced-query-role=quickSearchForm] .bh-label-radio', function() {
                // radio 的事件冒泡问题
                setTimeout(function() {
                    element.trigger('search', [_getSearchCondition(options), options]);
                }, 200);
            });

            //监听普通搜索里时间选择框selected事件
            $advanced.on('selectedTime', '.bh-advancedQuery-quick div[xtype="date-range"]', function() {
                var searchCondition = _getSearchCondition(options);
                element.trigger('search', [searchCondition, options]);
            });

            // 执行高级搜索
            $advanced.on('click', '[bh-advanced-query-role=advancedSearchBtn]', function() {
                _getSearchCondition(options);
                element.trigger('search', [_getSearchCondition(options), options]);
            });

            $advancedModal.on('click', function(e) {
                var target = e.target;
                if ($(target).closest('.bh-advancedQuery-quick-search-wrap').length == 0) {
                    $('.bh-advancedQuery-quick-select').css({
                        'height': 0,
                        'border-width': '0'
                    });
                }
            });

            // 监听 控件初始化事件  bhInputInitComplete, 根据计数器options._initCounter 判断出发高级搜索组件的 初始化回调
            element.on('bhInputInitComplete', function() {
                options._initCounter++;
                if (options._initCounter == options._initCount) {
                    element.trigger('init', [options]);
                    options.initComplete && options.initComplete();
                }
            });

            // easySearch 下拉框的关闭
            $(document).on('click', function(e) {
                var target = e.target;
                if ($(target).closest('[bh-advanced-query-role=advancedEasySelect]').length == 0) {
                    var selectDiv = $('.bh-advancedQuery-quick-select');
                    // if (selectDiv.height() > 0) {
                    selectDiv.css({
                            'height': 0,
                            'border-width': '0'
                        })
                        // }
                }
            });

            // 点击保存为搜索方案
            $advanced.on('click', '[bh-advanced-query-role=saveSchema]', function() {
                $(this).closest('.bh-schema-btn-wrap').addClass('active');
            });

            // 点击取消保存搜索方案
            $advanced.on('click', '[bh-advanced-query-role=saveSchemaCancel]', function() {
                _closeSchema(options);
            });

            // 点击确认保存搜索方案
            $advanced.on('click', '[bh-advanced-query-role=saveSchemaConfirm]', function() {
                var name = $('.bh-schema-name-input', $advanced).val();
                var conditionData = _getSearchCondition(options);
                element.emapSchema('saveSchema', name, conditionData).done(function () {
                    _closeSchema(options);
                }).fail(function (res) {
                    console.log(2222)
                });
            });

            // 点击方案的 更多按钮 呼出方案列表侧边弹窗
            $advanced.on('click', '[bh-schema-role=more]', function () {
                if ($('main > article aside').length == 0) {
                    $('main > article').append('aside');
                }
                $.bhPropertyDialog.show({
                    // "title": "高级搜索方案", //侧边栏的标题
                    "content": '<h3>高级搜索方案</h3>' +
                    '<section>' +
                    '<div id="schemaDialog">' +
                    '<p class="bh-color-caption">置顶方案(将直接出现在搜索栏上)</p>' +
                    '<ul>' +
                    '<li>' +
                    '<a class="pull-right">删除</a>' +
                    '<a class="pull-right">取消置顶</a>' +
                    '固定的高级搜索方案' +
                    '</li>' +
                    '<li>' +
                    '<a class="pull-right">删除</a>' +
                    '<a class="pull-right">取消置顶</a>' +
                    '固定的高级搜索方案' +
                    '</li>' +
                    '</ul>' +
                    '<p class="bh-color-caption">其他方案(<span>4</span>)</p>' +
                    '<ul></ul>' +
                    '</div>' +
                    '</section>', //侧边栏的内容html
                    "footer": '', //侧边栏的页脚按钮
                    ready: function(){ //初始化完成后的处理
                        options.schemaList
                    }
                });
            })
        };

        _addTime = function($item) {
            var $groupParent = $item.closest(".bh-advancedQuery-addBlock");
            $groupParent.addClass("bh-active");
            var $addTime = $groupParent.children("div[bh-advanced-query-role=addTime]");
            $groupParent.children("div[bh-advanced-query-role=addTimeGroup]").show();
            $addTime.hide();
        };

        _cancelAddTime = function($item) {
            var $groupParent = $item.closest(".bh-advancedQuery-addBlock");
            $groupParent.removeClass("bh-active");
            var $addTimeGroup = $groupParent.children("div[bh-advanced-query-role=addTimeGroup]");
            $addTimeGroup.removeClass("bh-entryLeft").addClass("bh-outLeft");
            $groupParent.children("div[bh-advanced-query-role=addTime]").addClass("bh-entryRight").show();

            setTimeout(function() {
                $addTimeGroup.removeClass("bh-outLeft").addClass("bh-entryLeft").hide();
            }, _animateTime());
        };

        _renderEasySearch = function(easyArray, options) {
            var easySearch = '';
            var easySearchPlaceholder = ''; // easySearch 文本框placeholder
            if (easyArray.length && easyArray.length > 0) {
                easySearchPlaceholder += '请输入';
                $(easyArray).each(function() {
                    easySearchPlaceholder += this.caption + '/';
                    easySearch += '<p data-name="' + this.name + '">搜索 <span class="bh-advancedQuery-easy-caption">' + this.caption + '</span> : <span class="bh-advancedQuery-easy-query"></span></p>';
                });
                $('.bh-advancedQuery-quick-select[data-guid=' + options.guid + ']').html(easySearch);
                easySearchPlaceholder = easySearchPlaceholder.substring(0, easySearchPlaceholder.length - 1);
                $('.bh-advancedQuery-quick-search-wrap input[type=text]', options.$advanced).attr('placeholder', easySearchPlaceholder);
            } else {
                $('.bh-advancedQuery-inputGroup', options.$advanced).hide();
            }
        };

        _renderQuickSearch = function(quickArray) {
            var quickSearchHtml = $('<div></div>');
            $(quickArray).each(function(i) {
                /**
                 * 代码不做 数量显示
                 * 由设计规范控制
                 */
                //if (i >= 3) {
                //    return false;
                //}
                if (this.xtype == 'select' || this.xtype == 'radiolist' || this.xtype == 'checkboxlist') {
                    this.xtype = 'buttonlist';
                }
                quickSearchHtml.append(_renderInputPlace(this));
            });
            return quickSearchHtml;
        };

        _renderInputPlace = function(item, showClose) {
            //showClose  是否显示 关闭按钮
            var _this = item;
            _this.get = function(attr) {
                return _this[attr];
            };
            var xtype = _this.get("xtype");
            var caption = _this.get("caption");
            var builder = _this.get("defaultBuilder");
            var url = _this.get("url");
            var name = _this.get("name");
            var hidden = _this.get("hidden") ? "hidden" : "";
            var placeholder = _this.get("placeholder") ? _this.get("placeholder") : "";
            var checkType = _this.get("checkType");
            var checkSize = _this.get("checkSize");
            var dataSize = _this.get("dataSize");
            var checkExp = _this.get("checkExp");
            //var allOption = _this.get("allOption") !== undefined ? _this.get("allOption") : true; // 是否显示 "全部"  按钮,  仅在 buttonlist使用
            var format = _this.get("format") ? _this.get("format") : 'yyyy-MM-dd';
            var controlHtml = $(' <div class="bh-advancedQuery-form-row bh-advancedQuery-h-28">' +
                '<div class="bh-advancedQuery-groupName">' + caption + '：</div>' +
                '<div class="bh-advancedQuery-groupList bh-label-radio-group">' +
                '</div>' +
                '</div>');

            if (showClose) {
                controlHtml.append('<a class="bh-bh-advancedQuery-group-dismiss" href="javascript:void(0)" bh-advanced-query-role="conditionDismiss"> ' +
                    '<i class="icon-close iconfont"></i>' +
                    '</a>');
            }
            var inputHtml = '';
            switch (xtype) {

                case "tree":
                    inputHtml += '<div xtype="{{xtype}}" data-name="{{name}}" data-builder="{{builder}}" data-caption="{{caption}}" data-url="{{url}}" {{hidden}} ></div>';
                    break;
                case "date-local":
                case "date-range":
                    inputHtml += '<div xtype="{{xtype}}" data-builder="{{builder}}" data-caption="{{caption}}" data-name="{{name}}" data-format="yyyy-MM-dd" {{hidden}}></div>';
                    break;
                case "date-ym":
                    inputHtml += '<div xtype="{{xtype}}" data-builder="{{builder}}" data-caption="{{caption}}" data-name="{{name}}" data-format="yyyy-MM" {{hidden}}></div>';
                    break;
                case "switcher":
                    inputHtml += '<div xtype="{{xtype}}"  data-builder="{{builder}}" data-caption="{{caption}}" data-name="{{name}}" {{hidden}}></div>';
                    break;
                case "radiolist":
                    inputHtml += '<div xtype="{{xtype}}" data-name="{{name}}" class="bh-radio" data-url="{{url}}" data-builder="{{builder}}" data-caption="{{caption}}" {{hidden}}></div>';
                    break;
                case "checkboxlist":
                    inputHtml += '<div xtype="{{xtype}}" data-name="{{name}}" class="bh-checkbox" data-url="{{url}}" data-builder="{{builder}}" data-caption="{{caption}}" {{hidden}}></div>';
                    break;
                case "buttonlist":
                case "select":
                    inputHtml += '<div xtype="{{xtype}}" data-name="{{name}}" data-url="{{url}}" data-builder="{{builder}}" data-alloption={{allOption}} data-caption="{{caption}}" {{hidden}}></div>';
                    break;
                default:
                    inputHtml += '<input class="bh-form-control" data-name="{{name}}" name="{{name}}" data-builder="{{builder}}" data-caption="{{caption}}" xtype="text" type="text" {{hidden}} />';
                    break;
            }
            inputHtml = inputHtml.replace(/\{\{xtype\}\}/g, xtype)
                .replace(/\{\{name\}\}/g, name)
                .replace(/\{\{builder\}\}/g, builder)
                .replace(/\{\{caption\}\}/g, caption)
                .replace(/\{\{url\}\}/g, url)
                .replace(/\{\{hidden\}\}/g, (hidden ? 'style="display:none;"' : ''))
                .replace(/\{\{allOption\}\}/g, options.allowAllOption)


            $('.bh-advancedQuery-groupList', controlHtml).html(inputHtml);
            return controlHtml;
        };

        _getSelectedConditionFromForm = function(options) {
            var selectedForm = $('[bh-advanced-query-role=advanceSearchForm]', options.$advanced);
            var selectedArr = [];
            $('[xtype][data-name]', selectedForm).each(function() {
                selectedArr.push($(this).data('name'));
            });
            return selectedArr;
        };

        _renderConditionList = function(options) {
            var modalArray = options.$advanced.data('modalarray');
            // 获取已选condition 数据
            var selectedArr = _getSelectedConditionFromForm(options);

            if (modalArray.length && modalArray.length > 0) {
                var addList = $('[bh-advanced-query-role=addList]', options.$advancedModal);
                var itemHtml = '';
                $(modalArray).each(function() {
                    if ($.inArray(this.name, selectedArr) > -1) {
                        //已添加字段
                        itemHtml += ' <li>' +
                            '<div class="bh-checkbox"><label><input type="checkbox" name="' + this.name + '" data-caption="' + this.caption + '" checked>' +
                            '<i class="bh-choice-helper"></i>' + this.caption +
                            '</label></div>' +
                            '</li>';
                    } else {
                        //未添加字段
                        itemHtml += ' <li>' +
                            '<div class="bh-checkbox"><label><input type="checkbox" name="' + this.name + '" data-caption="' + this.caption + '">' +
                            '<i class="bh-choice-helper"></i>' + this.caption +
                            '</label></div>' +
                            '</li>';
                    }

                });

                addList.html(itemHtml);
                _refreshConditionNum();
            }

        };

        // 添加搜索字段
        _addToConditionList = function() {
            var addList = $('[bh-advanced-query-role=addList]', options.$advancedModal);
            var addedList = $('[bh-advanced-query-role=addedList]', options.$advancedModal);
            var itemHtml = '';
            var inputArr = $('input[type=checkbox]:checked', addList);

            if (inputArr.length > 0) {
                inputArr.each(function() {
                    var name = $(this).attr('name');
                    var caption = $(this).data('caption');
                    itemHtml += ' <li>' +
                        '<div class="bh-checkbox"><label><input type="checkbox" name="' + name + '" data-caption="' + caption + '">' +
                        '<i class="bh-choice-helper"></i>' + caption +
                        '</label></div>' +
                        '</li>';

                    $(this).closest('li').remove();
                });
                addedList.append(itemHtml);
                _refreshConditionNum();
            }
        };

        // 移除已选字段
        _removeFromConditionList = function() {
            var addList = $('[bh-advanced-query-role=addList]', options.$advancedModal);
            var addedList = $('[bh-advanced-query-role=addedList]', options.$advancedModal);
            var itemHtml = '';
            var inputArr = $('input[type=checkbox]:checked', addedList);

            if (inputArr.length > 0) {
                inputArr.each(function() {
                    var name = $(this).attr('name');
                    var caption = $(this).data('caption');
                    itemHtml += ' <li>' +
                        '<div class="bh-checkbox"><label><input type="checkbox" name="' + name + '" data-caption="' + caption + '">' +
                        '<i class="bh-choice-helper"></i>' + caption +
                        '</label></div>' +
                        '</li>';

                    $(this).closest('li').remove();
                });
                addList.append(itemHtml);
                _refreshConditionNum();
            }
        };

        // 刷新弹框内字段数量展示
        _refreshConditionNum = function() {
            var addList = $('[bh-advanced-query-role=addList]', options.$advancedModal);
            var addedList = $('[bh-advanced-query-role=addedList]', options.$advancedModal);
            var addCount = $('input[type=checkbox]', addList).length;
            var addedCount = $('input[type=checkbox]', addedList).length;
            $('.bh-advancedQuery-dialog-list-head span', addList).html(addCount);
            $('.bh-advancedQuery-dialog-list-head span', addedList).html(addedCount);
        };

        _getSelectedConditionFromModal = function(options) {
            var itemList = $('[bh-advanced-query-role=addList]', options.$advancedModal);
            var inputArr = $('input[type=checkbox]:checked', itemList);
            var item = {};

            $(inputArr).each(function() {
                item[$(this).attr('name')] = "";
            });
            return item;
        };

        // 渲染高级搜索表单
        _renderAdvanceSearchForm = function(options, selectedObj) {
            var advanceForm = $('[bh-advanced-query-role=advanceSearchForm]', options.$advanced);
            var btnWrap = $('[bh-advanced-query-role=dropDownBtnWrap]', advanceForm);
            $(options.$advanced.data('modalarray')).each(function() {
                var _this = this;
                var formItem = $('[data-name=' + this.name + ']', advanceForm);
                //if ($.inArray(this.name, selectedArr) > -1) {
                if (selectedObj[this.name] !== undefined && selectedObj[this.name] != null) {
                    if (formItem.length > 0) {
                        // 表单已有字段
                        return true;
                    } else {
                        // 表单添加字段
                        btnWrap.before(_renderInputPlace(this, true));
                    }
                } else {
                    if (formItem.length > 0) {
                        // 表单删除字段
                        formItem.closest('.bh-advancedQuery-form-row').remove();
                    }
                }
            });
            advanceForm.emapFormInputInit();

            // 表单塞值
            //$(selectedObj).each(function(){
            //    if (!this.value) return true;
            //    _itemSetValue($('[data-name=' + this.name + ']', advanceForm), this.value, this.value_display);
            //});

            for (var v in selectedObj) {
                if (!selectedObj[v]) return true;
                var ele = $('[data-name=' + v + ']', advanceForm);
                var xtype = ele.attr('xtype');
                WIS_EMAP_SERV._setEditControlValue(ele, v, xtype, selectedObj, "");
                //_itemSetValue($('[data-name=' + this.name + ']', advanceForm), selectedObj[v], selectedObj[v + '_DISPLAY']);
            }
        };

        // 生成搜索条件
        _getSearchCondition = function(options, name) {
            var conditionResult = [];
            var easyArray = options.$advanced.data('easyarray');
            var modalarray = options.$advanced.data('modalarray')
            var orCondition = [];
            if (options.searchModel == 'easy') {
                var searchKey = $('.bh-advancedQuery-quick-search-wrap input', options.$advanced).val();
                // 简单搜索
                if ($.trim(searchKey) != "") {
                    if (name) {
                        //简单搜索的下拉框搜索
                        var searchItem = _findModel(name, easyArray);
                        conditionResult.push({
                            "caption": searchItem.caption,
                            "name": searchItem.name,
                            "value": searchKey,
                            // "builder": searchItem.defaultBuilder,
                            "builder": "include",
                            "linkOpt": "AND"
                        });
                    } else {
                        for (var i = 0; i < easyArray.length; i++) {
                            orCondition.push({
                                "caption": easyArray[i].caption,
                                "name": easyArray[i].name,
                                "value": searchKey,
                                // "builder": easyArray[i].defaultBuilder,
                                "builder": "include",
                                "linkOpt": "OR"
                            });
                        }
                        conditionResult.push(orCondition);
                    }
                }
                conditionResult = conditionResult.concat(_getConditionFromForm($('[bh-advanced-query-role=quickSearchForm]', options.$advanced)));
            } else if (options.searchModel == 'advanced') {
                var advancedKeyWord = $('[bh-advanced-query-role=advancedInput]', options.$advanced).val();
                // 高级搜索
                if ($.trim(advancedKeyWord) != '') {
                    for (var i = 0; i < modalarray.length; i++) {
                        if (!modalarray[i].xtype || modalarray[i].xtype == 'text') {
                            orCondition.push({
                                "caption": modalarray[i].caption,
                                "name": modalarray[i].name,
                                "value": advancedKeyWord,
                                // "builder": modalarray[i].defaultBuilder,
                                "builder": "include",
                                "linkOpt": "OR"
                            });
                        }
                    }
                    conditionResult.push(orCondition);
                }
                conditionResult = conditionResult.concat(_getConditionFromForm($('[bh-advanced-query-role=advanceSearchForm]', options.$advanced)));
            }
            return JSON.stringify(conditionResult);
        };

        _getConditionFromForm = function(form) {
            var conditionArray = [];
            var formElement = $('[xtype]', form);
            for (var i = 0; i < formElement.length; i++) {
                var conditionItem = {};
                switch ($(formElement[i]).attr('xtype')) {
                    case 'radiolist':
                        conditionItem.value = $('input[type=radio]:checked', formElement[i]).map(function() {
                            return $(this).val();
                        }).get().join(',');
                        break;
                    case 'checkboxlist':
                        conditionItem.value = $('input[type=checkbox]:checked', formElement[i]).map(function() {
                            return $(this).val();
                        }).get().join(',');
                        break;
                    case 'tree':
                        conditionItem.value = $(formElement[i]).emapDropdownTree('getValue');
                        break;
                    case 'buttonlist':
                        conditionItem.value = $('.bh-label-radio.bh-active', formElement[i]).data('id');
                        break;
                    case 'date-range':
                        conditionItem.value = $(formElement[i]).bhTimePicker('getValue');
                        break;
                    default:
                        conditionItem.value = $(formElement[i]).val();
                        break;
                }
                if (conditionItem.value == 'ALL' || $.trim(conditionItem.value) == '') {
                    continue;
                }
                conditionItem.name = $(formElement[i]).data('name');
                conditionItem.caption = $(formElement[i]).data('caption');
                conditionItem.builder = $(formElement[i]).data('builder');
                conditionItem.linkOpt = 'AND';
                conditionArray.push(conditionItem);
            }
            return conditionArray;
        };

        _findModel = function(name, modelArray) {
            for (var i = 0; i < modelArray.length; i++) {
                if (modelArray[i].name == name) {
                    return modelArray[i];
                }
            }
        };

        // 初始化方案
        _initSchema = function(element, options) {
            $(element).emapSchema($.extend({}, options, {
                schemaType: "aq"
            }));
            _renderFixedSchema(element, options);
        };

        // 关闭搜索方案
        _closeSchema = function (options) {
            var wrap = $('.bh-schema-btn-wrap', options.$advanced);
            wrap.removeClass('active');
            $('.bh-schema-name-input', wrap).val('');
        };

        // 渲染固定的搜索方案
        _renderFixedSchema = function (element, options) {
            options.schemaList = element.emapSchema('getSchemaList');
            var $advanced = options.$advanced;
            var programContainer = $('.bh-rules-program', $advanced);


            options.schemaList =  [{
                "LAST_MODIFY_TIME": "2016-04-27 14:32:20",
                "SCHEMA_TYPE": "高级搜索",
                "APP_NAME": "cs",
                "USER_ID": "admin",
                "CONTENT": "[[{\"caption\":\"学号\",\"name\":\"XH\",\"builder\":\"include\",\"builder_display\":\"包含\",\"value\":\"1\",\"value_display\":\"男`1121212\",\"linkOpt\":\"or\"},{\"caption\":\"姓名\",\"name\":\"XM\",\"builder\":\"include\",\"builder_display\":\"包含\",\"value\":\"111\",\"linkOpt\":\"and\"}],[{\"caption\":\"姓名\",\"name\":\"XM\",\"builder\":\"equal\",\"builder_display\":\"等于\",\"value\":\"2222\",\"linkOpt\":\"or\"},{\"caption\":\"学号\",\"name\":\"XH\",\"builder\":\"equal\",\"builder_display\":\"等于\",\"value\":\"3\",\"value_display\":\"女1\",\"linkOpt\":\"and\"}],[{\"caption\":\"性别\",\"name\":\"XBDM\",\"builder\":\"notEqual\",\"builder_display\":\"不等于\",\"value\":\"1\",\"value_display\":\"男\",\"linkOpt\":\"or\"}]]",
                "PAGE_FLAG": "flag",
                "SCHEMA_NAME": "test"
            }, {
                "LAST_MODIFY_TIME": "2016-04-27 14:32:20",
                "SCHEMA_TYPE": "高级搜索",
                "APP_NAME": "cs",
                "USER_ID": "admin",
                "CONTENT": "[[{\"caption\":\"学号\",\"name\":\"XH\",\"builder\":\"include\",\"builder_display\":\"包含\",\"value\":\"1\",\"value_display\":\"男`1121212\",\"linkOpt\":\"or\"},{\"caption\":\"姓名\",\"name\":\"XM\",\"builder\":\"include\",\"builder_display\":\"包含\",\"value\":\"111\",\"linkOpt\":\"and\"}],[{\"caption\":\"姓名\",\"name\":\"XM\",\"builder\":\"equal\",\"builder_display\":\"等于\",\"value\":\"2222\",\"linkOpt\":\"or\"},{\"caption\":\"学号\",\"name\":\"XH\",\"builder\":\"equal\",\"builder_display\":\"等于\",\"value\":\"3\",\"value_display\":\"女1\",\"linkOpt\":\"and\"}],[{\"caption\":\"性别\",\"name\":\"XBDM\",\"builder\":\"notEqual\",\"builder_display\":\"不等于\",\"value\":\"1\",\"value_display\":\"男\",\"linkOpt\":\"or\"}]]",
                "PAGE_FLAG": "flag",
                "SCHEMA_NAME": "test2"
            }]

            if (options.schemaList.length == 0) {
                programContainer.hide().html('<a bh-schema-role="more" href="javascript:void(0)">更多 ></a>')
            } else {
                $(options.schemaList).each(function () {
                    if (this.FIXED) {
                        var sch = $('<a href="javascript:void(0)">' + this.APP_NAME + '</a>');
                        sch.data('info', this);
                        $('[bh-schema-role=more]', programContainer).before(sch);
                    }
                });
                programContainer.show()
            }
        }


        element.css({
            "position": "relative",
            "z-index": 358
        }).html('<div class="bh-advancedQuery bh-mb-16" bh-advanced-query-role="advancedQuery">' +
            '<div class="bh-advancedQuery-dropDown ">' +
            '<div class="" style="display: table-cell">' +
            '<div class="bh-rules-header bh-clearfix">' +
            '<h4><i class="iconfont icon-search"></i>高级搜索</h4>' +
            '<p class="bh-rules-program">' +
            '<label>构造方案: </label>' +
            '<a bh-schema-role="more" href="javascript:void(0)">更多 ></a>' +
            '</p>' +
            '</div>' +
            '<div class="bh-advancedQuery-form" bh-advanced-query-role="advanceSearchForm" >' +
            '<div class="bh-advancedQuery-form-row bh-advancedQuery-h-28">' +
            '<div class="bh-advancedQuery-groupName">关键词：</div>' +
            '<div class="bh-advancedQuery-groupList">' +
            '<input type="text" bh-advanced-query-role="advancedInput" class="bh-form-control">' +
            '</div>' +
            '</div>' +
            '<div class="bh-advancedQuery-form-row bh-advancedQuery-form-btn-row bh-advancedQuery-h-28" bh-advanced-query-role="dropDownBtnWrap"> ' +
            '<div class="bh-advancedQuery-groupName"></div>' +
            '<div class="bh-advancedQuery-groupList">' +
            '<a class="bh-btn bh-btn-primary bh-btn-small" bh-advanced-query-role="advancedSearchBtn" href="javascript:void(0)">执行高级搜索</a>' +
            '<a class="bh-btn bh-btn-default bh-btn-small" bh-advanced-query-role="addCondition" href="javascript:void(0)">添加搜索字段</a>' +
            '<div class="bh-schema-btn-wrap">' +
            '<div class="bh-schema-edit-div">' +
            '<input type="text" placeholder="请输入方案名称" class="bh-form-control bh-schema-name-input" />' +
            '<a href="javascript:void(0)" class="bh-btn bh-btn-success bh-btn-small"  bh-advanced-query-role="saveSchemaConfirm">保存</a>' +
            '<a href="javascript:void(0)" class="bh-btn bh-btn-default bh-btn-small" bh-advanced-query-role="saveSchemaCancel">取消</a>' +
            '</div>' +
            '<a class="bh-btn bh-btn-default bh-btn-small " bh-advanced-query-role="saveSchema" href="javascript:void(0)">保存为方案</a>' +
            '</div>' +
            '<a class="bh-mh-4" bh-advanced-query-role="advancedClose" href="javascript:void(0)">[关闭高级搜索]</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            //'<div class="bh-advancedQuery-dropDown-program">' +
            //'<ul class="">' +
            //'<li class="bh-advancedQuery-dropDown-program-head">高级搜索方案(<span>12</span>)</li>' +
            //'<li>' +
            //'<a href="javascript:void(0)"><i class="iconfont icon-delete"></i></a>' +
            //'<a href="javascript:void(0)"><i class="iconfont icon-tuding"></i></a>' +
            //'<span>保存的搜索方案</span>' +
            //'</li>' +
            //'<li>' +
            //'<a href="javascript:void(0)"><i class="iconfont icon-delete"></i></a>' +
            //'<a href="javascript:void(0)"><i class="iconfont icon-tuding"></i></a>' +
            //'<span>保存的搜索方案2</span>' +
            //'</li>' +
            //'<li>' +
            //'<a href="javascript:void(0)"><i class="iconfont icon-delete"></i></a>' +
            //'<a href="javascript:void(0)"><i class="iconfont icon-tuding"></i></a>' +
            //'<span>保存的搜索方案1</span>' +
            //'</li>' +
            //'</ul>' +
            //'</div>' +
            '</div>' +
            '<div class="bh-advancedQuery-quick">' +
            '<div class="bh-advancedQuery-inputGroup bh-clearfix">' +
            '<div class="bh-advancedQuery-quick-search-wrap" >' +
            '<input type="text" class="bh-form-control"/>' +
            '<i class="iconfont icon-search" style="position: absolute;left: 6px;top: 6px;"></i>' +
            //'<div class="bh-advancedQuery-quick-select" bh-advanced-query-role="advancedEasySelect">' +
            //'</div>' +
            '</div>' +
            '<a class="bh-btn bh-btn bh-btn-primary bh-btn-small" bh-advanced-query-role="easySearchBtn" href="javascript:void(0);">搜索</a>' +
            '<a href="javascript:void(0);" class="bh-mh-8" bh-advanced-query-role="advancedOpen">[高级搜索]</a>' +
            '</div>' +
            '<div class="bh-advancedQuery-form bh-mt-8" bh-advanced-query-role="quickSearchForm">' +
            '</div>' +
            '</div>' +
            '<div class="bh-advancedQuery-dialog" bh-advanced-query-role="addDialog" data-guid="' + guid + '">' +
            '<div class="bh-advancedQuery-dialog-head">添加搜索字段</div>' +
            '<div class="bh-advancedQuery-dialog-content bh-row">' +
            '<ul class="bh-advancedQuery-dialog-list" bh-advanced-query-role="addList"></ul>' +
            '</div>' +
            '<a href="javascript:void(0)" bh-advanced-query-role="addDialogConfirm" class="bh-btn bh-btn-primary" >添加完成</a>' +
            '<a href="javascript:void(0)" bh-advanced-query-role="addDialogCancel" class="bh-btn bh-btn-default" >取消</a>' +
            '</div>' +
            '</div>');

        options.$advanced = $('div[bh-advanced-query-role=advancedQuery]', element).css({
            'overflow': 'hidden'
        });
        options.guid = guid;

        $('body').append('<div class="bh-advancedQuery-quick-select" bh-advanced-query-role="advancedEasySelect" data-guid="' + guid + '" ></div>');

        // 添加搜索条件弹框 初始化
        $('[bh-advanced-query-role=addDialog]', options.$advanced).jqxWindow({
            resizable: false,
            draggable: false,
            isModal: true,
            modalOpacity: 0.3,
            width: 548,
            height: 400,
            autoOpen: false
        });
        options.$advancedModal = $('[bh-advanced-query-role=addDialog][data-guid=' + options.guid + ']');
        _eventBind(options);
        // 初始化 方案 模块
        _initSchema(element, options);


        var advanceInputPlaceHolder = '';
        $(modalData).each(function(i) {
            //移除 hidden 项
            var index = modalData.indexOf(this);
            if (this.get('hidden')) {
                modalData.splice(index, 1);
                return true;
            }

            if (!this.xtype || this.xtype == 'text') {
                advanceInputPlaceHolder += this.caption + '/'; // 高级搜索关键词输入框placeholder
            } else {
                options._initCount++;
            }

            if (this.quickSearch) {
                if (!this.xtype || this.xtype == 'text') {
                    easyArray.push(this);
                } else {
                    quickArray.push(this);
                }
            }
        });
        // 高级搜索关键词字段添加placeholder
        $('[bh-advanced-query-role=advancedInput]', element).attr('placeholder', advanceInputPlaceHolder.substr(0, advanceInputPlaceHolder.length - 1));

        options.$advanced.data('modalarray', modalData);
        options.$advanced.data('easyarray', easyArray);
        options.$advanced.data('quickarray', quickArray);

        if (options.searchModel == 'easy') {
            options._initCount = quickArray.length;
        }
        if (easyArray.length == 0 && quickArray.length == 0) {
            console.warn("没有配置快速搜索字段,所以高级搜索控件无法展示!");
        }

        // 简单搜索 条件渲染
        _renderEasySearch(easyArray, options);

        // 快速搜索条件渲染
        quickArray = JSON.parse(JSON.stringify(quickArray));
        $('[bh-advanced-query-role=quickSearchForm]', options.$advanced).html(_renderQuickSearch(quickArray))
            .emapFormInputInit({
                root: ''
            });

        _renderAdvanceSearchForm(options, options.defaultItem);
    };



    $.fn.emapAdvancedQuery = function(options) {
        var instance;
        instance = this.data('plugin');
        if (!instance) {
            return this.each(function() {
                return $(this).data('plugin', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') return instance[options]();
        return this;
    };

    $.fn.emapAdvancedQuery.defaults = {
        allowAllOption: true, // 是否显示[全部]选项
        defaultItem: [],
        searchModel: 'easy'
    };

}).call(this);
(function () {
    var Plugin, _eventBind;

    Plugin = (function () {
        function Plugin(element, options) {
            this.options = $.extend({}, $.fn.emapAvatarUpload.defaults, options);
            this.$element = $(element);
            _init(this.$element, this.options);
        }

        Plugin.prototype.destroy = function () {
            this.options = null;
            $(this.$element).data('emapAvatarUpload', false).empty();
        };
        Plugin.prototype.getValue = function () {
        };
        return Plugin;
    })();


    //生成dom
    function _init(element, options) {
        if (options.token && options.token != null) {
            // 已有图片
            options.scope = options.token.substring(0, options.token.length - 1);
            options.displayAvatar = options.contextPath + '/sys/emapcomponent/file/getFileByToken/' + options.token + '.do?date=' + new Date().getTime();
            options.newToken = false;
        } else {
            // 新上传
            options.scope = new Date().getTime() + "" + parseInt(Math.random() * 100).toString();
            options.token = options.scope + 1;
            options.displayAvatar = options.defaultAvatar;
            options.newToken = true;
        }


        options.$wrap = $('<div class="bh-emapAvatar-wrap"><img class="bh-emapAvatar-avatar" src="' + options.displayAvatar + '"><a class="bh-emapAvartar-btn" href="javascript:void(0)">修改头像</a></div>')
            .css({'height': options.width / options.ratio, 'width': options.width});
        element.append(options.$wrap);

        _eventBind(element, options);

    }

    _eventBind = function (element, options) {
        var $wrap = options.$wrap;
        // 点击修改头像
        $wrap.on('click', '.bh-emapAvartar-btn', function(){
            $.emapAvatarUploadWindow(element, options);
        });

        $('.bh-emapAvatar-avatar', element).one('error', function(){
            $(this).attr('src', options.defaultAvatar);
        });
    };


    $.fn.emapAvatarUpload = function (options, params) {
        var instance;
        instance = $(this).data('emapAvatarUpload');
        if (!instance) {
            return this.each(function () {
                if (options == 'destroy') {
                    return this;
                }
                return $(this).data('emapAvatarUpload', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') return instance[options](params);
        return this;
    };

    $.fn.emapAvatarUpload.defaults = {
        storeId: 'image',
        contextPath: "/emap",
        defaultAvatar : "../u20.png",
        ratio: 1,
        width: 100,
        type: ['jpg','png','gif'],
        size: 5120
    };

    $.emapAvatarUploadWindow = function(element, options){
        options.winContent = $('<div id="emapAvatarUploadWindow">' +
            '<ul style="display: none;">' +
            '<li>本地上传</li>' +
            '<li>推荐头像</li>' +
            '</ul>' +
            '<div>' +
            '<div class="bh-emapAvatar-local"></div>' +
            '</div>' +
            '<div>' +
            '</div>');

        var initUpload = function(input, options){
            /***
             * emap 相关逻辑代码
             *
             */
            var fileReader = 'FileReader' in window;
            input.fileupload({
                url: options.uploadUrl,
                autoUpload: true,
                multiple: false,
                dataType: 'json',
                limitMultiFileUploads: 1,
                formData: {
                    size: options.size,
                    type: options.type,
                    storeId: options.storeId
                },
                submit: function (e, data) {
                    var file = data.files[0];
                    $('.bh-emapAvatar-text-info', options.winContent).show();
                    $('.bh-emapAvatar-text-error', options.winContent).hide();

                    // 文件的大小 和类型校验
                    if (options.type && options.type.length > 0) {
                        if (!new RegExp(options.type.join('|').toUpperCase()).test(file.name.toUpperCase())) {
                            $('.bh-emapAvatar-text-info', options.winContent).hide();
                            $('.bh-emapAvatar-text-error', options.winContent).html('文件类型不正确').show();
                            return false;
                        }
                    }

                    if (fileReader && options.size) {
                        if (file.size / 1024 > options.size) {
                            $('.bh-emapAvatar-text-info', options.winContent).hide();
                            $('.bh-emapAvatar-text-error', options.winContent).html('文件大小超出限制').show();
                            return false;
                        }
                    }
                    $('.bh-emapAvatar-loader', options.winContent).jqxLoader('open');

                },
                done: function (e, data) {
                    var file = data.files[0];
                    if (data.result.success) {
                        // 上传成功
                        $('.bh-avatar-img', options.winContent).attr('src', data.result.tempFileUrl).cropper('destroy');
                        initCrop($('.bh-avatar-img', options.winContent), options);
                        $('.bh-avatar-img-block', options.winContent).show();
                        // 上传成功后删除原有的 临时文件图片
                        deleteTempFile(options);

                        options.fileId = data.result.id;
                    } else {
                        // 上传失败
                    }
                    $('.bh-emapAvatar-loader', options.winContent).jqxLoader('close');
                },
                fail: function (e, data) {
                    var file = data.files[0];
                    $('.bh-emapAvatar-loader', options.winContent).jqxLoader('open');
                }
            });
        };

        options.uploadUrl = options.contextPath + '/sys/emapcomponent/file/uploadTempFile/' + options.scope + '/' + options.token + '.do';


        $('.bh-emapAvatar-local', options.winContent).html('<div class="bh-emapAvatar-editArea" bh-avatar-role="editArea">' +
            '<div class="bh-emapAvatar-upload-block">' +
            '<a href="javascript:void(0)" class="bh-btn bh-btn-default bh-emapAvatar-upload">' +
            '<i class="iconfont icon-add"></i>选择图片' +
            '<input type="file">' +
            '</a>' +
            '<p class="bh-text-caption bh-color-caption bh-text-center bh-emapAvatar-text-info"></p>' +
            '<p class="bh-text-caption bh-color-danger bh-text-center bh-emapAvatar-text-error"></p>' +
            '</div>' +
            '<div class="bh-avatar-img-block">' +
            '<img class="bh-avatar-img" src="' + options.displayAvatar + '" style="display: none;">' +
            '<p ><a href="javascript:void(0)" class="bh-emapAvatar-reUpload">重新上传</a> ' +
            //  旋转功能暂未提供
            //'| <a href="javascript:void(0)"><i class="iconfont icon-refresh"></i>90°旋转</a>' +
            '</p>' +
            '</div>' +
            '<div class="bh-emapAvatar-loader"></div>' +
            '</div>' +
            '<div class="bh-emapAvatar-display">' +
            '<div class="bh-emapAvatar-preview-100 bh-emapAvatar-preview"><div class="bh-emapAvatar-preview-div"></div></div>' +
            '<p class="bh-mb-8"></p>' +
            '<div>' +
            '<div class="bh-emapAvatar-preview-40 bh-pull-left bh-emapAvatar-preview" style="margin-right: 8px;"><div class="bh-emapAvatar-preview-div"></div></div>' +
            '<div class="bh-emapAvatar-preview-40 bh-pull-left bh-emapAvatar-preview" style="border-radius: 50%;"><div class="bh-emapAvatar-preview-div"></div></div>' +
            '<p class="bh-clearfix bh-mb-8"></p>' +
            '<div class="bh-emapAvatar-preview-28 bh-pull-left bh-emapAvatar-preview" style="margin-right: 8px;"><div class="bh-emapAvatar-preview-div"></div></div>' +
            '<div class="bh-emapAvatar-preview-28 bh-pull-left bh-emapAvatar-preview" style="border-radius: 50%;"><div class="bh-emapAvatar-preview-div"></div></div>' +
            '<p class="bh-clearfix bh-mb-8"></p>' +
            '</div>' +
            '</div>' +
            '');

        $('.bh-avatar-img', options.winContent).one('error', function(){$(this).attr('src', options.defaultAvatar);})
            .on('load', function(){initCrop ($(this), options);}); // 初始化裁剪插件

        BH_UTILS.bhWindow(options.winContent, '头像上传', undefined, {width: '560px', close : function(){
            $('.bh-avatar-img', options.winContent).cropper('destroy');
        }}, function(){
            submitEdit(options);
        });
        // 预览窗口 尺寸和文字渲染
        $('.bh-emapAvatar-preview', options.winContent).each(function(){
            var width = $(this).width();
            var height = parseInt($(this).width()/options.ratio);
            var p = $(this).next('p');
            $(this).css({
                height: height
            });
            if (p.length > 0) {
                p.html(width + ' * ' + height + 'px');
            }
        });

        // 上传说明渲染
        var typeStr = options.type.join('、').toUpperCase();
        var sizeStr = (options.size > 1024) ? options.size/1024 + 'M' : options.size + 'K';
        $('.bh-emapAvatar-text-info', options.winContent).html('只支持' + typeStr + '，大小不超过' + sizeStr);

        // 初始化tab  添加推荐头像功能时放开注释
        //$('#emapAvatarUploadWindow').jqxTabs({ width: '100%', height: 200, position: 'top'});

        //初始化loader
        $('.bh-emapAvatar-loader', options.winContent).jqxLoader({});




        // 初始化 上传控件
        initUpload($('input[type=file]', options.winContent), options)

        // 重新上传事件绑定
        $('.bh-emapAvatar-reUpload', options.winContent).on('click', function(){
            $('input[type=file]', options.winContent).click();
        });

        function initCrop (ele, options) {
            ele.cropper({
                aspectRatio: options.ratio,
                viewMode: 1,
                movable: false,
                zoomOnWheel: false,
                preview: '.bh-emapAvatar-preview'
            });
        }

        function submitEdit (options){
            if(options.fileId) {
                if (cutTempFile(options).success && deleteTempFile(options).success && deleteFileByToken(options).success && saveAttachment(options).success){
                    options.onSubmit && options.onSubmit(options.token);
                    $('.bh-emapAvatar-avatar', element).attr('src', options.contextPath + '/sys/emapcomponent/file/getFileByToken/' + options.token + '.do?date=' + new Date().getTime());
                    options.displayAvatar = options.contextPath + '/sys/emapcomponent/file/getFileByToken/' + options.token + '.do?date=' + new Date().getTime();
                }
            } else {
                if (options.newToken) {
                    options.onSubmit && options.onSubmit();
                } else {
                    options.onSubmit && options.onSubmit(options.token);
                }
            }

        }

        // 裁剪图片
        function cutTempFile(options){
            return doRequest(
                options.contextPath + '/sys/emapcomponent/file/cutTempFile/' + options.scope + '/' + options.token + '/' + options.fileId + '.do',
                $('.bh-avatar-img', options.winContent).cropper('getData', true)
            );
        }

        // 删除原有的临时文件
        function deleteTempFile(options) {
            if (options.fileId) {
                return doRequest(
                    options.contextPath + '/sys/emapcomponent/file/deleteTempFile/' + options.scope + '/' + options.token + '/' + options.fileId + '.do',
                    {}
                );
            }
            return {success : true};
        }

        function deleteFileByToken(options) {
            return doRequest(
                options.contextPath + '/sys/emapcomponent/file/deleteFileByToken/' + options.token + '.do',
                {}
            );
        }

        function saveAttachment(options) {
            return doRequest(
                options.contextPath + '/sys/emapcomponent/file/saveAttachment/' + options.scope + '/' + options.token + '.do',
                {attachmentParam: JSON.stringify({storeId: options.storeId})}
            );
        }

        function doRequest (url, param) {
            var result;
            $.ajax({
                type: 'post',
                data: param,
                url: url,
                dataType: 'json',
                async: false
            }).done(function(res){
                result = res;
            }).fail(function(res){
                result = res;
            });
            return result;
        }
    }
}).call(undefined);


function getUploadedAttachment() {

}
/**
 * 类似于纵向tab页签
 */
(function($) {
	/**
	 * 定义一个插件
	 */
	var Plugin;

	var gPageNumber = null,
		gPageSize = null,
		gParams = {};

	/**
	 * 这里是一个自运行的单例模式。
	 */
	Plugin = (function() {

		/**
		 * 插件实例化部分，初始化时调用的代码可以放这里
		 */
		function Plugin(element, options) {
			//将插件的默认参数及用户定义的参数合并到一个新的obj里
			this.settings = $.extend({}, $.fn.emapCard.defaults, options);
			//将dom jquery对象赋值给插件，方便后续调用
			this.$element = $(element);
			init(this.settings, this.$element);
		}

		return Plugin;

	})();

	Plugin.prototype = {
		/**
		 * 重新加载数据
		 * @param  {[type]} params [description]
		 * @return {[type]}        [description]
		 */
		reload: function(params) {
			gParams = params || gParams;
			render(this.settings, this.$element, null, null, gParams);
		}
	};

	function init(settings, $element) {
		layout($element);
		render(settings, $element);
	}

	function layout($element) {

		var _html =
			'<div>' +
			'	<div class="bh-emapCard-card-list"></div>' +
			'	<div class="bh-emapCard-card-pagination" style="clear:both;"></div>' +
			'</div>';

		$element.html(_html);
	}

	function render(settings, $element, pageNumber, pageSize) {
		var pageSize = parseInt(pageSize || gParams.pageSize || gPageSize || settings.pageSize || 12);
		var pageNumber = parseInt(pageNumber || gParams.pageNumber || gPageNumber || settings.pageNumber || 0);

		gPageNumber = pageNumber;
		gPageSize = pageSize;

		var params = $.extend({}, settings.params, {
			pageSize: pageSize,
			pageNumber: pageNumber + 1,
			querySetting: gParams.querySetting
		});

		var type = 'post';
		var url = WIS_EMAP_SERV.getAbsPath(settings.pagePath).replace('.do', '/' + settings.action + '.do');

		//mock模式
		if (settings.pagePath.indexOf('.do') == -1) {
			type = 'get';
			url = getMockDataUrl(settings.pagePath, settings.action);
		}

		$.ajax({
			url: url,
			data: params,
			type: type
		}).done(function(res) {
			var total = res.datas[settings.action].totalSize;

			var rows = res.datas[settings.action].rows;
			var pagenum = 1;

			var $cardContainer = $('<div></div>');
			for (var i = 0; i < rows.length; i++) {
				var newRow = settings.cardBeforeRender ? (settings.cardBeforeRender(rows[i]) || rows[i]) : rows[i];
				$cardContainer.append(compile(settings.template, newRow));
			}

			$element.find('.bh-emapCard-card-list').html($cardContainer, true);

			$element.find('.bh-emapCard-card-pagination').pagination({
				pagenum: pageNumber,
				pagesize: pageSize,
				totalSize: total,
				mode: settings.pageMode,
				pageSizeOptions: settings.pageSizeOptions
			});

			settings.cardAfterRender && settings.cardAfterRender();


			$element.find('.bh-emapCard-card-pagination').off('pagersearch').on('pagersearch', function(e, pagenum, pagesize, total) {
				pagesize = parseInt(pagesize);
				render(settings, $element, pagenum + '', pagesize);
				settings.pageSizeOptionsChange && settings.pageSizeOptionsChange(pagesize, pagenum);
			});
		});
	}

	function getMockDataUrl(modelPath, action) {
		var model = null;
		var currentModel = null;

		$.ajax({
			url: modelPath,
			async: false
		}).done(function(res) {
			model = res;
		});

		for (var i = 0; i < model.models.length; i++) {
			if (model.models[i]['name'] == action) {
				currentModel = model.models[i];
				break;
			}
		}

		return currentModel.url;
	}

	function compile(template, data) {

		var compileTemplate = null;

		if (typeof(template) === 'object') {
			compileTemplate = template;
		} else {
			compileTemplate = Hogan.compile(template);
		}

		return compileTemplate.render(data);
	}



	/**
	 * 这里是关键
	 * 定义一个插件 plugin
	 */
	$.fn.emapCard = function(options, params) {
		var instance;
		instance = this.data('emapCard');
		/**
		 * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
		 */
		if (!instance) {
			return this.each(function() {
				//将实例化后的插件缓存在dom结构里（内存里）
				return $(this).data('emapCard', new Plugin(this, options));
			});
		}
		if (options === true) return instance;
		/**
		 * 优雅处： 如果插件的参数是一个字符串，则 调用 插件的 字符串方法。
		 * 如 $('#id').plugin('doSomething') 则实际调用的是 $('#id).plugin.doSomething();
		 * doSomething是刚才定义的接口。
		 * 这种方法 在 juqery ui 的插件里 很常见。
		 */
		if ($.type(options) === 'string') {
			return instance[options](params);
		}
		return this;
	};

	/**
	 * 插件的默认值
	 */
	$.fn.emapCard.defaults = {
		template: 'no template!', //渲染卡片的模板
		pagePath: null, //页面模型
		action: null, //页面动作
		pageMode: 'advanced', //advanced simple
		pageSizeOptions: [12, 24, 48, 96],
		pageSize: 12,
		params: {} //参数
	};
})(jQuery);
/**
 * 将插件封装在一个闭包里面，防止外部代码污染  冲突
 */
(function() {
    /**
     * 定义一个插件
     */
    var Plugin;

    /**
     * 这里是一个自运行的单例模式。 
     */
    Plugin = (function() {

        /**
         * 插件实例化部分，初始化时调用的代码可以放这里
         */
        function Plugin(element, options) {
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.emapdatatable.defaults, options);
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            this.$element.attr("emap-role", "datatable").attr("emap-pagePath", this.settings.pagePath).attr("emap-action", this.settings.action);

            //拼接请求地址
            var url = this.settings.url || WIS_EMAP_SERV.getAbsPath(this.settings.pagePath).replace('.do', '/' + this.settings.action + '.do');

            //前端模拟数据开发时type使用get方式
            var ajaxMethod = this.settings.method || 'POST';
            if (typeof window.MOCK_CONFIG != 'undefined') {
                ajaxMethod = this.settings.method || 'GET';
                if (typeof this.settings.url == 'undefined') {
                    var models = BH_UTILS.doSyncAjax(url, {}, ajaxMethod).models;
                    for (var i = 0; i < models.length; i++) {
                        if (models[i].name == this.settings.action) {
                            url = models[i].url;
                            break;
                        }
                    }
                }
            }
            //数据源
            this.source = {
                root: 'datas>' + this.settings.action + '>rows',
                id: this.settings.pk || 'WID', // id: "WID", 主键字段可配置  //qiyu 2016-1-16
                datatype: 'json',
                url: url,
                data: this.settings.params || {},
                type: ajaxMethod,
                datafields: []
            };

            _create(this);
        }

        /**
         * 插件的公共方法，相当于接口函数，用于给外部调用
         * callback 可以是function 或者是 true，true的话意味着强制跳回第一页
         * _gotoFirstPage 如果callback为回调函数，此时需要调回第一页 则可以设置params._gotoFirstPage为true
         * 
         */
        Plugin.prototype.reload = function(params, callback) {
            /**
             * 方法内容
             */
            var gotoFirstPage = params._gotoFirstPage;
            gotoFirstPage && delete params._gotoFirstPage;
            this.source.data = params;
            if (callback === true || gotoFirstPage === true) {
                if (!this.$element.jqxDataTable('goToPage', 0)) {
                    this.$element.jqxDataTable('updateBoundData');
                }
            } else {
                this.$element.jqxDataTable('updateBoundData');
            }

            var that = this;
            if (typeof callback == 'function') {
                var intervalId = setInterval(function() {
                    if (that.$element.jqxDataTable('isBindingCompleted')) {
                        clearInterval(intervalId);
                        callback();
                        that.$element.jqxDataTable('refresh');
                    }
                }, 10);
            }
        };

        /**
         * 默认刷新表格回到首页
         */
        Plugin.prototype.reloadFirstPage = function (params, callback) {
            this.reload($.extend({}, params, {_gotoFirstPage: true}), callback);
        };

        Plugin.prototype.checkedRecords = function() {
            var selectedArr = [];
            var rowsData = this.$element.jqxDataTable('getRows');
            this.$element.find('tr').each(function(index) {
                var ischecked = $(this).find('input[type="checkbox"]').prop('checked');
                if (ischecked) {
                    selectedArr.push(rowsData[index]);
                }
            });
            return selectedArr;
        };

        Plugin.prototype.getTotalRecords = function() {
            return this.source.totalRecords;
        };

        Plugin.prototype.getResult = function() {
            return this.$element.data('tableResult');
        };

        Plugin.prototype.getSort = function() {
            var args = this.$element.data("sortfield");

            if (args === undefined)
                return;

            var sortObj = {
                direction: args.sortdirection,
                field: args.sortcolumn,
                exp: ""
            };
            var exp = "";
            if (args.sortdirection.ascending == true) {
                sortObj.exp = "+" + args.sortcolumn;
            } else if (args.sortdirection.descending == true) {
                sortObj.exp = "-" + args.sortcolumn;
            }

            return sortObj;
        };

        Plugin.prototype.getModel = function(){
            return this.$element.data('tableDataModel');
        };

        /*
         *自定义显示列
         */
        Plugin.prototype.selectToShowColumns = function() {
            var columns = this.$element.data('columns');
            var newmodel = this.$element.data('newmodel');
            _initSelectColumnsWindow(this, newmodel, columns);
        };

        return Plugin;

    })();

    /**
     * 插件的私有方法
     */
    //生成表格
    function _create(instance) {
        var jqxOptions = $.extend({}, instance.settings);
        try {
            delete jqxOptions.pk; //qiyu 2016-1-16 
            delete jqxOptions.url;
            delete jqxOptions.pagePath;
            delete jqxOptions.params;
            delete jqxOptions.datamodel;
            delete jqxOptions.method;
            delete jqxOptions.action;
            delete jqxOptions.customColumns;
            delete jqxOptions.colHasMinWidth;
            delete jqxOptions.beforeSend;
        } catch (e) {

        }


        var dataAdapter = new $.jqx.dataAdapter(instance.source, {
            formatData: function(data) {
                if (jqxOptions.pageable) {
                    data.pageSize = data.pagesize;
                    data.pageNumber = data.pagenum + 1;
                }

                var sortorder = '+';
                if (jqxOptions.sortable && data.sortdatafield && data.sortorder) {
                    if (data.sortorder == 'asc') {
                        sortorder = '+';
                    } else if (data.sortorder == 'desc') {
                        sortorder = '-';
                    }
                    data['*order'] = sortorder + data.sortdatafield.split('_DISPLAY')[0];
                }

                delete data.pagesize;
                delete data.pagenum;
                delete data.filterslength;
                delete data.sortdatafield;
                delete data.sortorder;
                return data;
            },
            beforeSend: function (xhr) {
                if(typeof instance.settings.beforeSend === 'function'){
                    instance.settings.beforeSend.call(null);
                }
            },
            downloadComplete: function(data, status, xhr) {
                //如果未登录则跳转至登录地址
                // console.log("emapdatatable:------------");
                // console.log(data);
                // console.log(xhr);
                // console.log(status);
                // console.log("-----------:emapdatatable");
                if (typeof data.loginURL != 'undefined' && data.loginURL != '') {
                    window.location.href = data.loginURL;
                    return;
                }
                instance.source.totalRecords = data.datas[instance.settings.action].totalSize || data.datas[instance.settings.action].total_size;
                instance.$element.data('tableResult', data);
            }
        });

        //保存调用组件时传进来的ready和rendered函数。因为后面checkbox会复写此函数
        var custom_ready = jqxOptions.ready;
        var custom_rendered_tmp = jqxOptions.rendered;

        var custom_rendered = jqxOptions.rendered = function() {
            //处理无排序时表格列背景色及排序按钮背景色问题
            _handleSortStyle(instance);
            if (typeof custom_rendered_tmp === 'function') {
                custom_rendered_tmp();
            }
        };

        jqxOptions.columns = _genColums(instance, jqxOptions, custom_ready, custom_rendered);
        jqxOptions.source = dataAdapter;

        instance.$element.jqxDataTable(jqxOptions);

        instance.$element.on('sort', function(event) {
            var args = event.args;
            // column's data field.
            //var sortcolumn = args.sortcolumn;
            instance.$element.data("sortfield", args);
        });

        instance.$element.on('bindingComplete', function(event) {
            _handleSortStyle(instance);
        });
    }

    function _handleSortStyle(instance) {
        //处理无排序时表格列背景色问题
        var sortObj = instance.$element.data("sortfield");
        if (typeof sortObj == 'undefined' || (sortObj.sortdirection.ascending == false && sortObj.sortdirection.descending == false)) {
            instance.$element.find('td.jqx-grid-cell-sort').removeClass('jqx-grid-cell-sort');
        }

        //处理表格排序按钮背景色问题
        instance.$element.find('div.sortasc, div.sortdesc').css('background', 'none');
    }

    /**
     * 生成表格列
     */
    function _genColums(instance, jqxOptions, custom_ready, custom_rendered) {
        var columns = [];

        var datamodel = instance.settings.datamodel ||
            WIS_EMAP_SERV.getModel(instance.settings.pagePath, instance.settings.action, "grid", instance.settings.params);
        //保存datamodel
        instance.$element.data('tableDataModel', datamodel);

        instance.$element.attr("emap", JSON.stringify({
            "emap-pagePath": instance.settings.pagePath,
            "emap-action": instance.settings.action,
            "emap-url": WIS_EMAP_SERV.url,
            "emap-name": WIS_EMAP_SERV.name,
            "emap-app-name": WIS_EMAP_SERV.appName,
            "emap-model-name": WIS_EMAP_SERV.modelName
        }));
        delete WIS_EMAP_SERV.url;
        delete WIS_EMAP_SERV.name;
        delete WIS_EMAP_SERV.appName;
        delete WIS_EMAP_SERV.modelName;

        var cusColLen = 0;
        var customColumns = instance.settings.customColumns;
        if (typeof customColumns != 'undefined' && customColumns != null) {
            cusColLen = customColumns.length;
        }

        //重新组织datamodel
        //type为link时只能为某列快速设置为链接类型，该列必须是模型中已经存在的数据列（此设定为兼容上一版本）
        var newmodel = [];
        var lastcolumn = null;
        var linkCol = [];
        for (var i = 0; i < cusColLen; i++) {
            var colIndex = customColumns[i].colIndex;
            var colField = customColumns[i].colField;
            var type = customColumns[i].type;
            if (colIndex == 'last') {
                lastcolumn = customColumns[i];
            } else if (typeof colField != 'undefined' && colField != '') {
                for (var j = 0; j < datamodel.length; j++) {
                    if (datamodel[j].name == colField) {
                        datamodel[j].custom = customColumns[i];
                    }
                }
            } else if (colIndex != 'undefined') {
                colIndex = colIndex < 0 ? 0 : colIndex;

                //兼容上一版本设定
                if (type != 'link') {
                    newmodel[colIndex] = {
                        custom: customColumns[i]
                    }
                } else {
                    linkCol.push({
                        colIndex: colIndex,
                        column: customColumns[i]
                    });
                }

            }
        }
        //datamodel保存至source的datafields数组中
        for (var m = 0; m < datamodel.length; m++) {
            if (typeof datamodel[m].get == 'function') {
                instance.source.datafields.push({
                    name: datamodel[m].name,
                    type: 'string'
                });
                if (typeof datamodel[m].url != 'undefined') {
                    instance.source.datafields.push({
                        name: datamodel[m].name + '_DISPLAY',
                        type: 'string'
                    });
                }
            }
        }
        for (var k = 0; k < newmodel.length; k++) {
            if (newmodel[k] == undefined) {
                if (datamodel.length > 0) {
                    newmodel[k] = datamodel.shift();
                } else {
                    newmodel.splice(k, 1);
                    k--;
                }
            }
        }

        if (datamodel.length > 0) {
            newmodel = newmodel.concat(datamodel);
        }

        if (lastcolumn != null) {
            newmodel.push({
                custom: lastcolumn
            });
        }

        var datafield;

        for (var n = 0; n < newmodel.length; n++) {
            //设置自定义列类型为link，且指定了colIndex的项
            for (var t = 0; t < linkCol.length; t++) {
                if (n == linkCol[t].colIndex) {
                    newmodel[n].custom = linkCol[t].column;
                }
            }
            //设置数据类型全部是string
            if (typeof newmodel[n].name != 'undefined') {
                instance.source.datafields.push({
                    name: newmodel[n].name,
                    type: 'string'
                });
            }
            if (typeof newmodel[n].url != 'undefined') {
                datafield = newmodel[n].name + '_DISPLAY';
                instance.source.datafields.push({
                    name: datafield,
                    type: 'string'
                });
            } else {
                datafield = newmodel[n].name
            }

            var width = null;
            var widthObj = {};
            var idHidden = newmodel[n].hidden === true || newmodel[n]['grid.hidden'] === true;
            if (typeof newmodel[n].get == 'function') {
                idHidden = idHidden || newmodel[n].get('hidden') === true;
            }
            // 默认列宽为100px
            if (newmodel[n].custom == undefined) {
                width = newmodel[n]['grid.width'] == undefined ? null : newmodel[n]['grid.width'];
                widthObj = _genWidthObj(width, instance.settings.colHasMinWidth);
                columns.push($.extend({}, {
                    text: newmodel[n].caption,
                    datafield: datafield,
                    hidden: idHidden,
                    cellsRenderer: function(row, column, value, rowData) {
                        return '<span title="' + value + '">' + value + '</span>';
                    }
                }, widthObj));
            } else {
                var type = newmodel[n].custom.type;
                var showCheckAll = newmodel[n].custom.showCheckAll;
                width = newmodel[n].custom.width;
                if (width == undefined) {
                    width = newmodel[n]['grid.width'] == undefined ? null : newmodel[n]['grid.width'];
                }
                widthObj = _genWidthObj(width, instance.settings.colHasMinWidth);
                var col = _genCustomColumns(type, instance, jqxOptions, showCheckAll, widthObj, newmodel[n], datafield, custom_ready, custom_rendered);
                columns.push($.extend(col, {
                    hidden: idHidden
                }));
            }
        }

        instance.$element.data('newmodel', newmodel);
        instance.$element.data('columns', columns);
        return columns;
    }

    function _genWidthObj(width, colHasMinWidth){
        if(!colHasMinWidth){
            if (width) {
                return {
                    width: width
                };
            }
            return {};
        }else{
            if(width != null){
                width = width.toString();
                width.replace('px', '');
                if(width.indexOf("%") == -1 && parseInt(width) < 100){
                    width = 100;
                }

                return {
                    width: width,
                    minWidth: 100
                };
            }
            return {
                minWidth: 100
            };
        }
        
    }

    /*
     *   
     */
    function _initSelectColumnsWindow(instance, newmodel, columns) {
        var itemHtml = '';
        var commonList = [];
        var availableList = [];
        $.each(columns, function(i, col) {
            if (!col.datafield) {
                return;
            }
            if (col.hidden) {
                //已隐藏字段
                itemHtml = ' <li class="bh-col-md-4" style="line-height: 32px;">' +
                    '<div class="bh-checkbox"><label><input type="checkbox" name="' + col.datafield + '" data-caption="' + col.text + '">' +
                    '<i class="bh-choice-helper"></i>' + col.text +
                    '</label></div>' +
                    '</li>';
                // commonList.push(itemHtml);
                availableList.push(itemHtml);
            } else {
                //已显示字段
                itemHtml = ' <li class="bh-col-md-4" style="line-height: 32px;">' +
                    '<div class="bh-checkbox"><label><input type="checkbox" name="' + col.datafield + '" data-caption="' + col.text + '" checked>' +
                    '<i class="bh-choice-helper"></i>' + col.text +
                    '</label></div>' +
                    '</li>';
                // commonList.push(itemHtml);
                availableList.push(itemHtml);
            }
            if (newmodel[i].common) {
                commonList.push(itemHtml);
            }
        });
        var dialog = '<div class="bh-emapdatatable-dialog">' +
            '<div><h2>添加/删除字段</h2></div>' +
            '<div class="bh-emapdatatable-dialog-content ">' +
            '<div class="bh-text-caption bh-color-caption">常用字段（' + commonList.length + '）</div>' +
            '<div class="bh-clearfix">' +
            '<ul class="bh-emapdatatable-dialog-list" bh-emapdatatable-role="commonList" style="list-style:none">' + commonList.join('') + '</ul>' +
            '</div>' +
            '<div class="bh-text-caption bh-color-caption">可用字段（' + availableList.length + '）</div>' +
            '<div class="bh-clearfix">' +
            '<ul class="bh-emapdatatable-dialog-list" bh-emapdatatable-role="availableList" style="list-style:none">' + availableList.join('') + '</ul>' +
            '</div>' +
            '<div class="bh-mt-16">' +
            '<button bh-emapdatatable-role="confirmSelecte" class="bh-btn bh-btn-primary">确认</button>' +
            '<button bh-emapdatatable-role="cancel" class="bh-btn bh-btn-default">取消</button>' +
            '</div>' +
            '</div>';
        instance.$element.after(dialog);
        var $dialog = instance.$element.next();
        $dialog.jqxWindow({
            resizable: false,
            draggable: true,
            isModal: true,
            modalOpacity: 0.3,
            width: 548,
            height: 400,
            autoOpen: false
        });
        _bindEvent(instance, $dialog, columns);
        $dialog.jqxWindow('open');
    }

    function _bindEvent(instance, $dialog, columns) {
        var _this = instance;
        var _$dialog = $dialog;
        var _columns = columns;
        _$dialog.on('click', '[bh-emapdatatable-role="confirmSelecte"]', function() {
            _$dialog.find('input[type="checkbox"]').each(function() {
                var name = $(this).attr('name');
                var targetCol = {};
                for (var i = 0; i < _columns.length; i++) {
                    if (_columns[i].datafield == name) {
                        targetCol = _columns[i];
                        break;
                    }
                }
                if ($(this).prop('checked')) {
                    targetCol.hidden = false;
                } else {
                    targetCol.hidden = true;
                }
            });
            _this.$element.jqxDataTable({
                columns: _columns
            });
            _$dialog.jqxWindow('close');
        });

        _$dialog.on('click', '[bh-emapdatatable-role="cancel"]', function() {
            _$dialog.jqxWindow('close');
        });

        _$dialog.on('close', function() {
            _$dialog.jqxWindow('destroy');
        });
    }

    /**
     * 生成自定义列
     * @param  {String} type 自定义列类型
     * @return {Object}       自定义列column
     */
    function _genCustomColumns(type, instance, jqxOptions, showCheckAll, widthObj, model, datafield, custom_ready, custom_rendered) {
        var column = null;
        // checkbox列不可排序
        switch (type) {
            case 'checkbox':
                column = {
                    text: 'checkbox',
                    width: '32px',
                    cellsAlign: 'center',
                    align: 'center',
                    sortable: false,
                    renderer: function(text, align, height) {
                        var checkBox = '<div class="selectAllCheckboxFlag bh-checkbox bh-mh-8"><label><input type="checkbox" value=""><i class="bh-choice-helper"></i></label></div>';
                        if (showCheckAll === false) {
                            return ' ';
                        }
                        return checkBox;
                    },
                    rendered: function(element, align, height) {
                        //头部的checkbox点击事件的绑定
                        element.on("click", "input", function(e) {
                            var $table = instance.$element;
                            var $tableContent = $table.find("table");
                            var $checkboxList = $tableContent.find("div.bh-checkbox");

                            var $input = $(this);
                            if ($input.hasClass("selectFlag")) {
                                $input.prop("checked", false).removeClass("selectFlag");
                                $checkboxList.each(function() {
                                    $(this).find("input").prop("checked", false);
                                });
                            } else {
                                $input.prop("checked", true).addClass("selectFlag");
                                $checkboxList.each(function() {
                                    $(this).find("input").prop("checked", true);
                                });
                            }

                            //触发自定义全选按钮事件
                            $(this).trigger('checkall');
                            e.stopPropagation();
                        });
                        return true;
                    },
                    cellsRenderer: function(row, column, value, rowData) {
                        var checkBox = '<div data-sss="" class="bh-checkbox bh-mh-4" style="margin-left:0 !important;"><label><input type="checkbox" value=""><i class="bh-choice-helper"></i></label></div>';

                        return checkBox;
                    }
                };

                //增加处理函数
                jqxOptions.rendered = function() {
                    //数据加载完成，读取各列的checkbox，判断头部的checkbox是否要勾选
                    var $table = instance.$element;
                    var $tableContent = $table.find("table");
                    var $checkboxList = $tableContent.find("div.bh-checkbox");
                    var isSelectAllFlag = true;
                    if ($checkboxList.length == 0) {
                        isSelectAllFlag = false;
                    }
                    $checkboxList.each(function() {
                        var $itemCheckbox = $(this);
                        if ($itemCheckbox.find("input[checked]").length === 0) {
                            isSelectAllFlag = false;
                            return;
                        }
                    });
                    var $selectAllCheckbox = $table.find("div.selectAllCheckboxFlag").find("input");
                    // if(isSelectAllFlag){
                    //     $selectAllCheckbox.prop("checked", true).addClass("selectFlag");
                    // }else{
                    //     $selectAllCheckbox.prop("checked", false).removeClass("selectFlag");
                    // }
                    if ($selectAllCheckbox.hasClass('selectFlag')) {
                        $checkboxList.find('input').attr('checked', true);
                    }

                    //调用外部定义的rendered函数
                    if (typeof custom_rendered === 'function') {
                        custom_rendered();
                    }
                };

                jqxOptions.ready = function() {
                    //初始化完成后，绑定checkbox的点击事件
                    instance.$element.on("click", "div.bh-checkbox", function() {
                        _scenesTableContentCheckboxClick($(this).find("input"), instance);
                        //触发自定义事件
                        $(this).trigger('checkone');
                    });

                    //调用外部定义的rendered函数
                    if (typeof custom_ready === 'function') {
                        custom_ready();
                    }

                };
                break;

            case 'link':
                var default_column = {
                    text: model.caption,
                    datafield: datafield
                }
                var cus_column = {
                    cellsRenderer: function(row, column, value, rowData) {
                        if (!isNaN(value)) {
                            value = value.toString();
                        }
                        return '<a href="javascript:void(0);" class="j_link_' + column + '">' + value + '</a>';
                    }
                }
                column = $.extend(default_column, cus_column, widthObj);
                break;
            case 'tpl':
                var default_column = {
                    text: model.caption,
                    datafield: datafield,
                    sortable: false //自定义显示列默认不能排序
                }
                column = $.extend(default_column, model.custom.column, widthObj);
        }
        return column;
    }


    /**
     * 点击tbody上的checkbox，处理头部的checkbox是否要勾选
     * @param $input
     */
    function _scenesTableContentCheckboxClick($input, instance) {
        if (!$input.hasClass("selectAllCheckboxFlag")) {
            var $table = instance.$element;
            var $selectAllCheckbox = $table.find("div.selectAllCheckboxFlag").find("input");
            var $tableContent = $table.find("table");
            var $checkboxList = $tableContent.find("div.bh-checkbox");
            if ($input.prop("checked")) {
                var isSelectAllFlag = true;
                $checkboxList.find("input").each(function() {
                    if (!$(this).prop("checked")) {
                        isSelectAllFlag = false;
                    }
                });

                if (isSelectAllFlag) {
                    $selectAllCheckbox.prop("checked", true).addClass("selectFlag");
                } else {
                    $selectAllCheckbox.prop("checked", false).removeClass("selectFlag");
                }
            } else {
                $selectAllCheckbox.prop("checked", false).removeClass("selectFlag");
            }
        }
    }

    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.emapdatatable = function(options, params, callback, flag) {
        var instance, initParams;
        instance = this.data('emapdatatable');
        initParams = this.data('initParams') || {};
        /**
         * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
         */
        if (!instance) {
            $(this).data('initParams', options.params);
            return this.each(function() {
                //将实例化后的插件缓存在dom结构里（内存里）
                return $(this).data('emapdatatable', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        /**
         * 优雅处： 如果插件的参数是一个字符串，则 调用 插件的 字符串方法。
         * 如 $('#id').plugin('doSomething') 则实际调用的是 $('#id).plugin.doSomething();
         * doSomething是刚才定义的接口。
         * 这种方法 在 juqery ui 的插件里 很常见。
         */
        if ($.type(options) === 'string') {
            var paramsObj = $.extend({}, initParams, params);
            var querySetting = [];
            //默认如果请求参数中有高级搜索的参数 会把其他参数合并进高级搜索参数querySetting
            //如果flag为false则不合并。
            if (typeof paramsObj.querySetting == 'undefined') {

            }
            if (typeof paramsObj.querySetting != 'undefined' && flag !== false) {
                querySetting = JSON.parse(paramsObj.querySetting);
                $.each(paramsObj, function(k, v) {
                    if (k != 'querySetting' && ($.type(v) == 'number' || $.type(v) == 'string' || $.type(v) == 'boolean')) {
                        querySetting.push({
                            name: k,
                            value: v,
                            linkOpt: 'and',
                            builder: 'equal'
                        });
                    }
                });
                paramsObj.querySetting = JSON.stringify(querySetting);
            }
            return instance[options](paramsObj, callback);
        }
        return this;
    };

    /**
     * 插件的默认值
     */
    var height = null;
    if (typeof BH_UTILS != 'undefined') {
        height = BH_UTILS.getTableHeight(10);
    }

    var localization = null;
    if (typeof Globalize != 'undefined') {
        localization = Globalize.culture("zh-CN");
    }

    $.fn.emapdatatable.defaults = {
        width: '100%',
        height: height,
        pageable: true,
        pagerMode: 'advanced',
        serverProcessing: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        localization: localization,
        sortable: false,
        selectionMode: "custom",
        enableBrowserSelection: true,
        columnsResize: true,
        colHasMinWidth: true, // 列宽是否有默认最小值100px
        beforeSend: null
    };

}).call(this);
'use strict';
(function () {
    var Plugin, _eventBind, _renderItem;

    Plugin = (function () {
        function Plugin(element, options) {
            this.options = $.extend({}, $.fn.emapDropdownTable.defaults, options);
            this.$element = $(element);
            _init(this.$element, this.options);
        }

        Plugin.prototype.getValue = function () {
            return this.$element.val()
        };

        Plugin.prototype.setValue = function (val) {
            var element = this.$element;
            if (val[0] == '') {
                element.val('');
            }
            if (!element.jqxComboBox('getItemByValue', val[0])) {
                element.jqxComboBox('addItem', {
                    "id": val[0],
                    "name": val[1],
                    "_displayData": (function () {
                        var display = {};
                        display.name = val[1];
                        display.id = val[0];
                        return JSON.stringify(display);
                    })()
                });
            }
            element.jqxComboBox('selectItem', val[0]);
        };

        Plugin.prototype.destroy = function () {
            this.$element.jqxComboBox('destroy');
        };
        return Plugin;
    })();


    //生成dom
    function _init(element, options) {
        // options.cols = options.searchMember.length;
        options.eleWidth = element.width();
        var urlArr = options.url.split('/');
        options.actionName = urlArr[urlArr.length - 1].split('.')[0];
        var source =
        {
            datatype: "json",
            root: "datas>" + options.actionName + ">rows",
            url: options.url,
            type: "POST",
            async: true
        };
        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                beforeLoadComplete: function (data) {

                    $(data).each(function () {
                        this._displayData = JSON.stringify(this);
                    });
                    return data;
                },
                formatData: function (data) {
                    if (element.jqxComboBox('searchString') != undefined) {
                        data.queryopt = element.jqxComboBox('searchString');
                        data.pageSize = 10;
                        data.pageNumber = 1;
                        return data;
                    }
                }
            }
        );
        element.addClass('bh-edt').jqxComboBox({
                remoteAutoComplete: true,
                // autoDropDownHeight: true,
                source: dataAdapter,
                // selectedIndex: 0,
                //dropDownWidth: 100,
                displayMember: "_displayData",
                valueMember: "id",
                renderer: function (index, label, value, data) {
                    var rowHtml = '';
                    //rowHtml += '<div class="bh-clearfix">';
                    var rowData = JSON.parse(label);
                    if (!options.searchMember) {
                        options.searchMember = [];
                        for (var v in rowData) {
                            if (v == 'uid') continue;
                            options.searchMember.push(v);
                        }
                    }
                    for (var v in rowData) {
                        if (v == 'uid') continue;
                        rowHtml += '<div class="bh-mh-8" style="display: inline-block;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: ' + options.eleWidth/options.searchMember.length + 'px;" title="' + rowData[v] + '">' + rowData[v] + '</div>';
                    }
                    //rowHtml += '</div>';
                    return rowHtml;
                },
                renderSelectedItem: function (index, item) {
                    return JSON.parse(item.label).id;
                },
                search: function (searchString) {
                    dataAdapter.dataBind();
                }
            })
            .on('open', function () {
                if (!element.data('datainit')) {
                    dataAdapter.dataBind();
                    element.data('datainit', true);
                }
            });
        _eventBind(element, options);
    }

    _eventBind = function (element, options) {
    };

    _renderItem = function (element, options, data) {
        $(data).each(function () {
            element.jqxComboBox('addItem', this);
        });
    };

    $.fn.emapDropdownTable = function (options, params) {
        var instance;
        instance = this.data('emapdropdowntable');
        if (!instance) {
            return this.each(function () {
                return $(this).data('emapdropdowntable', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') return instance[options](params);
        return this;
    };

    $.fn.emapDropdownTable.defaults = {
        valueMember: 'id',
        displayMember: 'name',
        width: 300
    };
}).call(undefined);
(function() {
    var Plugin,
        _create, _renderTree,
        _getRecords, _getFullPath, _del_ID_PID, _treeBind; //插件的私有方法
    Plugin = (function() {
        function Plugin(element, options) {
            this.settings = $.extend({}, $.fn.emapDropdownTree.defaults, options);
            this.$element = $(element);
            _create(this.$element, this.settings);
        }
        Plugin.prototype.getValue = function() {
            return $(this.$element.data('values')).map(function() {
                return this.value;
            }).get().join(',');
        };
        Plugin.prototype.getText = function() {
            return $(this.$element.data('values')).map(function() {
                return this.label;
            }).get().join(',');
        };

        Plugin.prototype.setValue = function(params) {
            var val = params[0];
            var display_val = params[1];
            this.$element.jqxDropDownButton('setContent', display_val);
            // this.settings.$tree.jqxTree('checkItem', $('#' + val, this.settings.$tree), true);
            this.$element.data('values', [{
                value: val,
                label: display_val
            }]);
            this.$element.trigger('change');
        };

        Plugin.prototype.disable = function() {
            this.$element.jqxDropDownButton({
                disabled: true
            });
        };
        Plugin.prototype.enable = function() {
            this.$element.jqxDropDownButton({
                disabled: false
            });
        };
        return Plugin;

    })();

    /**
     * 插件的私有方法
     */
    _create = function($dom, setting) {
        // var _tpl = '<input id="searchInput" placeHolder="请查找" type="text" class="jqx-widget jqx-listbox-filter-input jqx-input jqx-rc-all">';
        // $dom.append(_tpl);

        //var $inputGroup = $("#input", $dom);
        // var $searchInput = $("#searchInput", $dom);
        //var $searchBtn = $("#searchBtn", $dom);
        //var $tree = $('#jqxTree', $dom);
        var Num = "";
        for (var i = 0; i < 6; i++)
            Num += Math.floor(Math.random() * 10);

        setting.$tree = $('<div style="border: none;" class="dropdown-tree"></div>');
        setting.$tree.attr("id", "tree_" + Num);
        $dom.attr("id", "content_" + Num);
        $dom.append(setting.$tree);

        if (setting.checkboxes) {
            setting.$tree.on('checkChange', function(event) {
                var $tree = $(this);
                var Num = $tree.attr("id").substr("tree_".length);
                var $dom = $("#content_" + Num);
                var args = event.args;
                var item = $tree.jqxTree('getCheckedItems', args.element);
                var values = [];
                var dropDownContent = item.map(function(cv) {
                    values.push({
                        "label": cv.label,
                        "value": cv.value
                    });
                    return cv.label;
                }).join(",");
                $dom.jqxDropDownButton('setContent', dropDownContent);
                $dom.data({
                    "values": values
                });
                this.$element.trigger('change');
            });
        } else {
            setting.$tree.on('select', function(event) {
                var $tree = $(this);
                var args = event.args;
                var Num = $tree.attr("id").substr("tree_".length);
                var $dom = $("#content_" + Num);
                var item = $tree.jqxTree('getItem', args.element);
                var values = [];
                // var dropDownContent = item.label;
                var dropDownContent = _getFullPath(item, setting.$tree).reverse().join("/");
                var dropDownValue = item.value;
                values.push({
                    "label": dropDownContent,
                    "value": dropDownValue
                });
                $dom.jqxDropDownButton('setContent', dropDownContent);
                $dom.data({
                    "values": values
                });
                $dom.trigger("select", [values]);
                $dom.jqxDropDownButton('close');
            });
        }
        //$inputGroup.jqxInput($.extend({width: "100%", minLength: 1}, setting.placeHolder));
        //$searchInput.jqxInput($.extend({width: "100%", minLength: 1}, setting.placeHolder));
        $dom.jqxDropDownButton({
            width: "100%"
        });

        $dom.on('close', function() {
            $(this).trigger('change');
        }).on('open', function() {
            if (!setting.treeInit) {
                _treeBind($dom, setting);
                setting.treeInit = true;
            }
        });

        // $searchInput.data('originalParam', setting.params);
    };

    _renderTree = function(setting) {
        if (setting.url) {
            var data = $.extend({
                'pId': '',
            }, setting.params);
            if (setting.params && setting.params.searchValue) {
                data = setting.params;
            }
            var source = {
                datatype: "json",
                root: "datas>code>rows",
                datafields: [{
                    name: 'id'
                }, {
                    name: 'pId'
                }, {
                    name: 'name'
                }, {
                    name: 'isParent'
                }],
                id: 'id',
                url: setting.url,
                data: data
            };
            var dataAdapter = new $.jqx.dataAdapter(source, {
                beforeLoadComplete: function(loaded_data, original_data) {
                    var new_data = [{
                        name: "请选择...",
                        pId: "...",
                        value: ""
                    }];
                    for (var i = 0; i < loaded_data.length; i++) {
                        var item = loaded_data[i];
                        new_data.push({
                            id: item.id,
                            name: item.name,
                            pId: "...",
                            value: item.id
                        });
                        if (item.isParent === 1) {
                            var sub_item = {
                                id: item.id + '_load',
                                name: "加载中...",
                                pId: item.id,
                                value: item.id
                            };
                            new_data.push(sub_item);
                        }
                    }
                    return new_data;
                },
                loadComplete: function() {
                    // dataAdapter.records
                    var records = dataAdapter.getRecordsHierarchy('id', 'pId', 'items', [{
                        name: 'name',
                        map: 'label'
                    }]);
                    _del_ID_PID(records);
                    var treeParams = $.extend({
                        width: "100%",
                        height: 220,
                        hasThreeStates: false,
                        source: records,
                        checkSize: 16
                    }, {
                        "checkboxes": setting.checkboxes
                    });

                    setting.$tree.on('expand', function(event) {
                        // console.log(2)
                        var $tree = $(this);
                        var $element = $(event.args.element);
                        // var label = $tree.jqxTree('getItem', $element).label;
                        var loader = false;
                        var loaderItem = null;
                        var children = $element.find('ul:first').children();
                        $.each(children, function() {
                            var item = $tree.jqxTree('getItem', this);
                            if (item && item.label == '加载中...') {
                                loaderItem = item;
                                loader = true;
                                return false
                            }
                        });
                        if (loader) {
                            var unblind = setting.unblind;
                            $.ajax({
                                url: setting.url,
                                data: {
                                    pId: loaderItem.value.replace(".fake", "")
                                },
                                success: function(data, status, xhr) {
                                    var items = data;
                                    if (items.datas && items.datas.code && items.datas.code.rows) {
                                        var nodes = items.datas.code.rows;
                                        var treenodes = [];
                                        for (var i = nodes.length - 1; i >= 0; i--) {
                                            var itemLabel = nodes[i].name;
                                            if (unblind)
                                                itemLabel = itemLabel.substring(itemLabel.lastIndexOf(setting.unblind) + 1, itemLabel.length);
                                            var treenode = {
                                                label: itemLabel,
                                                value: nodes[i].id
                                            };

                                            if (nodes[i].isParent === 1) {
                                                treenode.items = [{
                                                    "value": nodes[i].id,
                                                    label: "加载中..."
                                                }];
                                            }
                                            treenodes.push(treenode);
                                        }
                                        $tree.jqxTree('addTo', treenodes, $element[0]);
                                        $tree.jqxTree('removeItem', loaderItem.element);
                                    }
                                }
                            });
                        }
                    });
                    setting.$tree.jqxTree(treeParams);
                }
            });
            dataAdapter.dataBind();
        } else {
            var records = _getRecords(setting.datas);
            var treeParams = $.extend({
                width: "100%",
                height: 220,
                hasThreeStates: false,
                source: records,
                checkSize: 16
            }, {
                "checkboxes": setting.checkboxes
            });
            setting.$tree.jqxTree(treeParams);
        }
    };

    _treeBind = function($dom, setting) {
        // setting.$tree.jqxTree({ width: "100%" });//.jqxTree('addTo', { label: '请选择', value: "" });
        setting.$tree.niceScroll();
        if (setting.search) {
            var $searchInput = $('<input style="height: 21px; top: 3px; left: 3px;  width: calc(100% - 4px); margin: 2px 0 2px 2px; border-radius: 2px;" class="treeSearchInput jqx-widget jqx-listbox-filter-input jqx-input jqx-rc-all" type="text" placeHolder="搜索..."/>');
            setting.$tree.before($searchInput);
            $searchInput.keyup(function() {
                window.clearTimeout($searchInput.data('timerId'));
                $searchInput.data('timerId', window.setTimeout(
                    function() {
                        var value = $searchInput.val();
                        if (value) {
                            var source = {
                                '*tree': "1",
                                searchValue: value
                            };
                            setting.$tree.jqxTree("clear");
                            setting.params = $.extend({}, setting.params, source);
                            _renderTree(setting);
                        } else {
                            setting.$tree.jqxTree("clear");
                            setting.params = $searchInput.data('originalParam');
                            _renderTree(setting);
                        }
                    }, 500));
            });
        }
        _renderTree(setting);
    }

    _getRecords = function(datas) {
        var source = {
            datatype: "json",
            // root:"datas>code>rows",
            datafields: [{
                name: 'id'
            }, {
                name: 'pId'
            }, {
                name: 'name'
            }],
            id: 'id',
            localdata: datas
        };
        var dataAdapter = new $.jqx.dataAdapter(source);
        dataAdapter.dataBind();
        var records = dataAdapter.getRecordsHierarchy('id', 'pId', 'items', [{
            name: 'name',
            map: 'label'
        }, {
            name: 'id',
            map: 'value'
        }]);
        return records;
    }

    _getFullPath = function(treeNode, domTree) {
        var path = [];
        path.push(treeNode.label);
        if (domTree.jqxTree('getItem', treeNode.parentElement) != null) {
            path = path.concat(_getFullPath(domTree.jqxTree('getItem', treeNode.parentElement), domTree));
        }
        return path;
    }

    _del_ID_PID = function(arr_data) {
        for (var i = 0; i < arr_data.length; i++) {
            delete arr_data[i].id;
            delete arr_data[i].pId;
            if (arr_data[i].items)
                _del_ID_PID(arr_data[i].items);
        }
    }

    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.emapDropdownTree = function(options, params) {
        var instance;
        instance = this.data('emapDropdownTree');
        if (!instance) {
            return this.each(function() {
                return $(this).data('emapDropdownTree', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') return instance[options](params);
        return this;
    };

    /**
     * 插件的默认值
     */
    $.fn.emapDropdownTree.defaults = {
        width: "100%",
        checkboxes: false,
        search: false
            // property2: 'value'
    };
}).call(this);
/**
 * 类似于纵向tab页签
 */
(function($) {
	/**
	 * 定义一个插件
	 */
	var Plugin;

	/**
	 * 这里是一个自运行的单例模式。
	 */
	Plugin = (function() {

		/**
		 * 插件实例化部分，初始化时调用的代码可以放这里
		 */
		function Plugin(element, options) {
			//将插件的默认参数及用户定义的参数合并到一个新的obj里
			this.settings = $.extend({}, $.fn.emapEditableTable.defaults, options);
			//将dom jquery对象赋值给插件，方便后续调用
			this.$element = $(element);
			init.call(this, this.settings, this.$element);
		}

		return Plugin;

	})();

	Plugin.prototype = {

	};

	function init(settings, $element) {

		this.models = getModels.call(this);
		this.dataPath = getDataPath.call(this);
		this.dataFields = getDataFields.call(this, this.models);
		this.source = getSource.call(this);
		this.columns = getColumns.call(this);

		render.call(this);
	}

	function render() {
		var params = $.extend({}, this.settings);
		params.source = this.source;
		params.columns = this.columns;

		delete params.pagePath;
		delete params.action;
		delete params.checkbox;
		delete params.editableFields;
		delete params.filter;

		this.$element.jqxDataTable(params);
	}

	function getColumns() {

		var columns = [];
		var checkboxColumn = null;
		var models = this.models;
		var self = this;

		if (this.settings.checkbox) {
			checkboxColumn = getCheckboxColumn.call(this);
			columns.push(checkboxColumn);
		}

		for (var i = 0; i < this.models.length; i++) {
			(function() {
				var model = self.models[i];
				var editable = self.settings.editable && _.contains(self.settings.editableFields, model.name);
				var column = generateColumnByModel.call(self, model, editable);
				columns.push(column);
			})();
		}

		return columns;
	}

	function createCombo(model, editor, width, height) {
		var source = {
			datatype: "json",
			datafields: [{
				name: 'id'
			}, {
				name: 'name'
			}],
			url: model.url
		};
		var dataAdapter = new $.jqx.dataAdapter(source, {
			async: false,
			downloadComplete: function(data, status, xhr) {
				try {
					var d = [{
						id: '',
						name: "请选择…"
					}];
					data.data = d.concat(data.datas.code.rows);
					delete data.datas;
					delete data.code;
					return data;
				} catch (e) {
					source.totalRecords = data.recordsTotal;

				}
			}
		});
		editor.jqxDropDownList({
			placeHolder: '请选择…',
			source: dataAdapter,
			displayMember: "name",
			valueMember: "id",
			width: width - 10,
			height: 25
		});
	}

	function generateColumnByModel(model, editable) {

		var columnWidth = getColumnWidth(model);
		var self = this;

		var column = {
			text: model.caption,
			dataField: model.name,
			hidden: model.hidden,
			width: columnWidth,
			cellsRenderer: function(row, column, value, rowData) {
				if (model.url) {
					value = rowData[column + "_DISPLAY"]
				}

				return '<span title="' + value + '">' + value + '</span>';
			}
		};

		if (editable) {
			column['createEditor'] = function(row, cellvalue, editor, cellText, width, height) {
				var newEditor = editor;
				if (model.url) {
					var newEditor = $("<div class='dropDownList'></div>");
					editor.after(newEditor);
					editor.hide();
				}
				createField.call(self, model, newEditor, width, height);
			};

			column['initEditor'] = function(row, cellvalue, editor, celltext, width, height) {
				var _this = this;
				if (model.url) {
					editor = editor.parent().find('.dropDownList');
					editor.jqxDropDownList({
						width: width - 10,
						height: height
					}).off("select").on("select", function(event) {
						var args = event.args;
						if (args) {
							var item = args.item;
							var label = item.label;
							_this.displayValue = {
								row: row,
								display: label
							};
							var rowData = self.$element.jqxDataTable('getRows')[row];
							rowData[model.name] = args.item.value;
							rowData[model.name + '_DISPLAY'] = args.item.label;
							editor.jqxDropDownList('selectItem', item);
						}
					});
					var items = editor.jqxDropDownList('getItems');
					editor.jqxDropDownList('clearSelection');
					var selectedIndex = null;
					for (var i = 0; i < items.length; i++) {
						if (items[i].value == cellvalue) {
							selectedIndex = items[i].index;
							//editor.jqxDropDownList('selectItem', items[i]);
							break;
						}
					}
					editor.jqxDropDownList('selectIndex', selectedIndex);

				} else {
					var inputField = editor.find('input');
					inputField.val(cellvalue);
				}
			};
			column['getEditorValue'] = function(row, cellvalue, editor) {
				if (model.url) {
					editor = editor.parent().find('.dropDownList');
				}
				return getEditorValue(model, editor);
			};
		} else {
			column['editable'] = false;
		}

		return column;
	}

	function createField(model, editor, width, height) {
		if (model.url) {
			createCombo(model, editor, width, height);
		} else if (model.dataType == "int") {
			this.createNumber(model, editor, width, height);
		} else {
			var inputElement = $("<input style='padding-left: 4px; border: none;'/>").appendTo(editor);
			inputElement.jqxInput({
				source: getEditorDataAdapter.call(this, model.name),
				displayMember: model.name,
				width: width,
				height: height
			});
		}
	}

	function getEditorDataAdapter(datafield) {
		var dataFields = this.dataFields;
		var source = {
			localData: this.source.records,
			dataType: "array",
			dataFields: dataFields
		};
		var dataAdapter = new $.jqx.dataAdapter(source, {
			uniqueDataFields: [datafield]
		});
		return dataAdapter;
	}

	function getEditorValue(model, editor) {
		if (model.url) {
			var selectItem = editor.jqxDropDownList("getSelectedItem");
			if (selectItem) {
				return selectItem.value;
			} else {
				return "";
			}
		} else {
			return editor.find('input').val();
		}
	}

	function getColumnWidth(model) {
		var url = model.url;
		var width = model["grid.width"];
		if (width) {
			return width;
		}
		var size = 1;
		if (url) { //说明有字典表
			size = 10;
		}
		return null;
		width = (model.dataSize * size);
		if (width < 100) {
			width = 100;
		} else if (width < 200) {
			width = 200;
		} else {
			width = 300;
		}
		return width;
	}

	function getCheckboxColumn() {
		var self = this;
		var checkboxColumn = {
			text: 'checkbox',
			width: '32px',
			cellsAlign: 'center',
			align: 'center',
			editable: false,
			renderer: function(text, align, height) {
				var checkBox = '<div class="selectAllCheckboxFlag bh-checkbox bh-mh-8"><label><input type="checkbox" value=""><i class="bh-choice-helper"></i></label></div>';
				return checkBox;
			},
			cellsRenderer: function(row, column, value, rowData) {
				var checkBox = '<div data-sss="" class="bh-checkbox bh-mh-4" style="margin-left:0 !important;"><label><input type="checkbox" value=""><i class="bh-choice-helper"></i></label></div>';
				return checkBox;
			},
			rendered: function(element, align, height) {
				element.on("click", "input", function(e) {
					var $table = self.$element;
					var $tableContent = $table.find("table");
					var $checkboxList = $tableContent.find("div.bh-checkbox");
					var $input = $(this);
					if ($input.hasClass("selectFlag")) {
						$input.prop("checked", false).removeClass("selectFlag");
						$checkboxList.each(function() {
							$(this).find("input").prop("checked", false);
						});
					} else {
						$input.prop("checked", true).addClass("selectFlag");
						$checkboxList.each(function() {
							$(this).find("input").prop("checked", true);
						});
					}
					$(this).trigger('checkall');
					e.stopPropagation();
				});
				return true;
			}
		};
		return checkboxColumn;
	}

	/**
	 * *
	 * @return {[type]} [获取数据源]
	 */
	function getSource() {
		var self = this;
		var source = {
			datatype: "json",
			datafields: this.dataFields,
			id: 'WID',
			url: this.dataPath
		};
		var dataAdapter = new $.jqx.dataAdapter(source, {
			formatData: function(data) {
				var pageSize = data.pagesize;
				var pageNumber = data.pagenum + 1;
				var querySetting = [];
				if (data.querySetting) {
					if (data.querySetting.length > 0) {
						var q = eval(data.querySetting);
						if (q.length > 0) {
							querySetting = querySetting.concat(q);
						}
					}
				}
				if (querySetting) {
					querySetting.push(eval(self.settings.filter.querySetting));
				}
				data.querySetting = JSON.stringify(querySetting);
				data.pageSize = pageSize;
				data.pageNumber = pageNumber;
				delete data.pagesize;
				delete data.pagenum;
				delete data.filterslength;
				return data;
			},
			downloadComplete: function(data, status, xhr) {
				var action = self.settings.action;
				try {
					source.totalRecords = data.datas[action].totalSize;
					data.recordsTotal = data.datas[action].totalSize;
					data.data = data.datas[action].rows;
					delete data.datas;
					delete data.code;
					return data;
				} catch (e) {
					source.totalRecords = data.recordsTotal;
				}
			}
		});

		return dataAdapter;
	}

	function getModels() {

		var models = WIS_EMAP_SERV.getModel(this.settings.pagePath, this.settings.action, "grid");

		return models;
	}

	function getDataPath() {
		var pagePath = this.settings.pagePath;
		var action = this.settings.action;

		var dataPath = pagePath.replace(".do", "/" + action + ".do");
		var dataPath = 'http://res.wisedu.com/fe_components/mock/table.json'

		return WIS_EMAP_SERV.getAbsPath(dataPath);
	}

	function getDataFields(models) {
		var datafields = [];
		for (var i = 0; i < models.length; i++) {
			if (models[i].url) {
				datafields.push({
					name: models[i].name + '_DISPLAY',
					type: 'string'
				});
			}
			datafields.push({
				name: models[i].name,
				type: 'string'
			});
		}
		return datafields;
	}

	/**
	 * 这里是关键
	 * 定义一个插件 plugin
	 */
	$.fn.emapEditableTable = function(options, params) {
		var instance;
		instance = this.data('emapEditableTable');
		/**
		 * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
		 */
		if (!instance) {
			return this.each(function() {
				//将实例化后的插件缓存在dom结构里（内存里）
				return $(this).data('emapEditableTable', new Plugin(this, options));
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
	$.fn.emapEditableTable.defaults = {

		/**
		 * [pagePath 页面模型]
		 * @type {String}
		 */
		pagePath: '',

		/**
		 * [action 动作]
		 * @type {String}
		 */
		action: '',

		/**
		 * [editableFields 可编辑的列，未配置在此则表示不可编辑]
		 * @type {Array}
		 */
		editableFields: [],

		/**
		 * [checkbox 是否显示复选框]
		 * @type {Boolean}
		 * @default  true
		 */
		checkbox: true,

		/**
		 * [pageable 是否可分页]
		 * @type {Boolean}
		 */
		pageable: true,

		/**
		 * [filter 查询条件]
		 * @type {String}
		 */
		filter: '',

		editable: true,

		width: '100%'
	};
})(jQuery);
//下载
(function () {
    var Plugin, _init;

    Plugin = (function () {
        function Plugin(element, options) {
            if (options.mode) {options.model = options.mode;}
            this.options = $.extend({}, $.fn.emapFileDownload.defaults, options);
            this.$element = $(element);
            _init(this.$element, this.options);
        }

        return Plugin;
    })();

    _init = function (element, options) {
        //if (!options.token || options.token == "") { return; }
        $.ajax({
            type: "post",
            url: options.contextPath + '/sys/emapcomponent/file/getUploadedAttachment/' + options.token + '.do',
            dataType: "json",
            success: function (res) {
                if (res.success) {
                    var fileHtml = '';
                    if (!res.items || res.items.length == 0) {
                        fileHtml += ' 无';
                        $(element).append(fileHtml);
                        return;
                    }
                    if (options.model == 'file') {
                        $(res.items).each(function () {
                            fileHtml += '<div class="bh-pull-left bh-file-upload-file" data-fileId="' + this.id + '" data-fileurl="' + this.fileUrl + '">' +
                                '<div class="bh-file-upload-file-icon bh-pull-left"><i class="iconfont icon-insertdrivefile"></i></div>' +
                                '<div class="bh-file-upload-file-info bh-pull-left">' +
                                '<span class="bh-file-upload-filename" title="' + this.name + '">' + this.name + '</span>' +
                                '<p><a class="bh-file-upload-download" href="javascript:void(0)">下载</a></p>' +
                                '</div>' +
                                '</div>';
                        });
                        $(element).append(fileHtml).find('.bh-file-upload-download').on("click", function () {
                            var fileBlock = $(this).closest(".bh-file-upload-file");
                            window.location.href = fileBlock.data('fileurl');
                        });
                    } else if (options.model == 'image') {
                        var imgWidth = parseInt(options.width) - 6;
                        var imgHeight = parseInt(options.height) - 6;

                        $(res.items).each(function () {
                            fileHtml += '<div data-fileid="' + this.id + '" data-name="' + this.name + '" class="bh-file-img-block success" style="width: ' + options.width + 'px;height: ' + options.height + 'px;">' +
                                '<div class="bh-file-img-table" style="width: ' + imgWidth + 'px;height: ' + imgHeight + 'px;">' +
                                '<span style="width: ' + imgWidth + 'px;height: ' + imgHeight + 'px;">' +
                                '<img style="max-width: ' + imgWidth + 'px;max-height: ' + imgHeight + 'px;" src="' + this.fileUrl + '" alt="' + this.name + '" />' +
                                '</span>' +
                                '</div>' +
                                '</div>';
                        });
                        $(element).css('overflow', 'hidden').append(fileHtml);
                    }

                }
            }
        });

    };

    $.fn.emapFileDownload = function (options) {
        var instance;
        instance = this.data('plugin');
        if (!instance) {
            return this.each(function () {
                return $(this).data('emapfiledownload', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') return instance[options]();
        return this;
    };

    $.fn.emapFileDownload.defaults = {
        model : 'file',
        width : 200,
        height : 150
    };

}).call(this);
//上传头像
(function () {
    var Plugin, _init, defaultPhoto;
    var _imgLoad;
    var fileReader = 'FileReader' in window;
    defaultPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAABYCAMAAABGS8AGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURQAAACagliejmSWnmyeimCqkmSilnECmiCmlmSikmiilmyinnCeimCekmieilyimmiagliiimCimmyikmiikmiikmieglielnCimnCilmyehlyekmSijmSalnCimmyikmyilmiaglvanL9ymUCeglt2pWuejQOqXMvaRItytXuOoTO+lO96pVnmmcPaVKPOcK+6pOd6hSeaeSO6oPYmqd2qgdu6rQd+rTtyeRuaZOueVMeesRieglimmnEgrG/aOH/qiHOrAp/LXvOvIrezBqPbZviWnnj8hEkkmFkgrHP2hFujLseK5oCapnx6mov+NGEgoGCWlm/qjHCaupUcqGkoiEf+hGR+kmyqmnPHXvRuhnfeOHv+iEiesoh6flUksHPbKtPmeHUsgD/HUue/Fq+nIrUBIOiehlym2SUYvIPTZvvrfw0ojEzCEeOnAp//bv/rDqTweD0YoGPmNG/LIr/WOH/yNGzB/cxqimhielfLWu/vMryKgmOq/puK/pyajmkynmS+hlem9oiqUif359P///+/KsTO0RkU2JySflfTCqCaxqC2Og0M7LKiDbVCwo/zZvkElFTCJfT2nmNK8o/uiGle0Sz21SDR0aCqbkZx9aGWqm49xXTGonb65pDN5bezEq+vWuyOmnv/ny3q1pfWlJs2VM/qNHeqkIdbDlimjmreaTWugdf+QGzpfUnZXRFehg2BCMPORJeTSuGxOPPXj0bepWfv18HqyoImzoJ26cEm0Qx22RsOnKManSlU3JjtaTNLQt6rFsJ+0ocLMtd61nLqXgOzPtVo8K8Kiij+ija6aUzxWSF+pit3Dp+rEqOmSJ/mOHYmnOGu1XnutOzdqXf+lIdGnP2ipgpepaummMFCqkZbBrveUJ4Cda7ONd2a2psGbhFmypGK1pfTax//9/NuUKUSqdpyiOuPDm4S3YGquP72bLLO/gn+baf6mKYVqVWxhUfLo2nNuXIyuRqaqL+bHoV6sX/qeHUo8LW+qis3LsIiob0QlFfieIdrSudHUgI4AAAA8dFJOUwDtjRAiCvsDGoPPFpni2DzeT+t5a6PGuvavuFYwyEVgc/zoIfczmdfsVYN3FPzn7NtfCsN1f+K4yIiAzsFKH5gAAAhNSURBVFjDpdn3XxPZGgfgkAAhVGmiItLsuvX2ezOTEDGF3RQkCSXEZCkhkICGEhAXkKIgAhqpIiqKiuva69pXd63rqqvu3bu93O3l9vbjnZn0nDMzwf3+AU/ez3vec2ZyhsGgS1BYVDInPiE0IiYmICAgInIWMyUxkMVm/KywQ6JSZkYEI3ikWq1Q2MIlEjCdEx0Y9MRs2BxmqB1FEGGOtH1rZU+ZtMxOc8umhSeGPBEbGJcwA3FGmtNzt7e8vPfuVmfReKZzZk+d5YQi7ki1u8qLVGKxuah8JLvMLXMjmVOjg1IiEc9oK1GVUoKiEqVKUu8lc6dxptCQOUnBXq70oKEIY/FIigzbWrheiUz2d82YMxDvaLeiCtQRhbIy2xvmpsYH+uNGJSG+0Y6oUFdUI0KubyKjaeeanRwDuptGnJ3AezGSkw3Ic2NppjqIE+zLSjcdrDSI3bDYUL9R2gLQ4WFULiseKDdHW29AxahHxKihPhtsxyyKRofNBN1tr0tUXi4mm9G77VJAnk4qsyDu1l5f1k73VgrL/JWDwD5oK7vMShQWc7nPRiG6Ae0zmwNxy8UoScTl9WCfw2GzEZcH9KGni9TF5K4eUI6F7AtgfrUHDWYJOSwxGzYCUzc3GhgIcL9tetesQCmiEL8rBdo8zXcBmeBAtFM1grQZ8T7n2Qxgw+UcIRkId8nmI+DMpXqddUFJkJ3Ra4Z71a7fM/e2Qw4kz/M5Nhjs8C4FvBNKnc4pixW7wA3IZbrdkEjAlUqPqOAFi8aO2py/oXq9BTyOprmfVpw8cG+UGYpgs6azHG/71AlLVIZt4BHKDXcVHIqAcHsXbIh1IuUN/fXjNp1jlGFz4S45DuwwdvrAdrNOZOurLakdtbj2dSUE5nIceyMBgcCVqOfu0OkkqA6ttqCYm1Fy/ZbIXrJCUQ+Dp4eQzDABK1ywstomIoKe+hxzMzJr+0TVjs0HhVMTiVONiVDCSpvtytGx0bG/jY3eaKrNzMBS0nbUoqSo2H7KwZYOf+Lbe6xTiq6M3hOYTKblpsYmgsVSe/uKhaLH9hNjTjAUbndsPMvxgQlThaBRIKh44UUnnKn/VCnCt15XTzYM5mKHHDsFgcJc+xyLbg1M4KrAC24a14/aRDqSOcbngs0ImgmFpdojRVgbq219ExX5Al84o6mktk9nge88Yi5YjJAIKIydFSJLNWq7dW+iWADCuPz5KYsIdlYQb+aBjKhgOKxt/2ffcZvoVKOpEQZnVI3XXu/7ezu8E1xuIiMZ7iINf949cVtnOSow5UNhbAVLVjdvX0MCpzA4cDd3x5urKkw3lFjFZDCW1TtbV8JhJiOeBP5i95Z8gen22E0KuKq7eR0JPIuRQAJ/tmU5hpnynUsHrTizezsJHMkIpYQFywU0MEmTIxgk05a7GW+FV6bUigBGDPni0cPki0cKIw2f5a+qoIYzu6tIx40czs7de3U3JVzVPLB95cYpw5i8Y/PV5eRw987+VlIXgyMQ0mQ3fOTZZ58t3X1uzUoulxwOJYfzsjfnV+TD4arM5nUbyV1s3BIQimRfc5Xc2Cg42dzU1OQaiDeoXGyDhFPB7mmuwHKyeXx8nHaCnVuaQ1lx7kf2mSs+3dHRcRZLR34bMWmrz1G62CGUjFCWjO0TAv6yYz2RszfbqI81R+JID3rnPtl8cpWj5K/Wr//qbHEb3uXVA+vWULrY0zQsAqGWvzhJdKO44vQ/Tn853kb0gdbFHk0kD1PPmq+uwvdJY/ELL7bZ3Z10Lv4wJXn8u4cZaei/Rixgxc1mYo4z3+inc/HHPyNqBk3JSG7etS1En50DvJLOxV9YGCFJdDDSsHdtsRO+v/Y12nodf8o4tHDu3rWlN4tx+H5p6drX6AsOZ5O+xgJwaemyDePjpX7BqdFktwk+y1dAwI740QrHizf0r4Kb3SMT5p3zhM+1thS8TAnHUvy5cbJCmaz/m0f3Nrjh2oH/fnOngIp2/5+ODSZrgkz29pl/DQ/9xwPe8MqFC9++dayggOIAcv31JykZZw8UXurs/EnvhvXnjcNfyx9gdANdwfAuY8398Mw+tVp9YMj4qMRVsv67IeMPGqtVfuKtO9B+pHI8/6RDniOyHe/vK1QP8vnqfxs7z+s3LMPZZfqS743DP8rreJpJ+YNPDkL6Ecryul8BZlnWf7kwi49HzX+Myff1RL77vtP40Krh4bEefrW1gO6OhQO47xUO8u1RH/jBaHz00ytYzg9dND6um+TZ844clMN979y8Twyh7H1HvXb5YedF4/DQ0PDFi8Pf8uQOl1dnlX9SQHFbQWS214G/J+9yId8d9eClxxc6jcbOCw/3y608V+rkr5Z5LWDAHPAaK9GzzbIPP/CE+Wo1/8ClSz/ufzApn6zzhPe3vuz9qINc6MV6wn/6Yxaf702r1Yfl1kmeV6wfH/PsBRN6jcz2eMWQPeVaOldW/E+j4flEc/iQBzyTRXu5KT1TyAfgl3hANPK/5LpfUkg/AwQ5axYil/2D8dWjdzHZccUgzHvPX3i/cyziKa+82bHEbOxZ94HfMNcOM1k0t/+J+DzL3v5rlp/w13dwOCCO/nPZ7ARi2gb9gnk1Hx/DTs/QKH8+hLA4MbJDar5/MD5vc8P9/SoUlQAZYzjMkx9Kip7CB8Jfpq3IyqKHNTW8p3/FmtL3sXnzn/WlARhjF8yfN+UvevMW/2JflqftDdfU1JxYsHjqLJ70RfOfxe3BQR9Yo6mxnlgw/7n0J/5q+nz6osV/SNu3YrAQ0+1wTc07dScWLvjdovTnf+aH3qVLFy1Z8ptfp6WlPbNw4cKnn/nt75c8l76Udj/8H1/k4P/j+w/zAAAAAElFTkSuQmCC';
    Plugin = (function () {
        function Plugin(element, options) {
            this.settings = $.extend({}, $.fn.emapFilePhoto.defaults, options);
            this.$element = $(element);
            _init(this.$element, this.settings);
        }

        return Plugin;
    })();

    _init = function (element, options) {

        if (options.token && options.token != "" && options.token != null) {
            options.defaultPhoto = options.contextPath + '/sys/emapcomponent/file/getFileByToken/' + options.token + '.do?date=' + new Date().getTime();
            options.scope = options.token.substring(0, options.token.length - 1);
            options.newToken = false;
        } else {
            options.scope = new Date().getTime() + "" + parseInt(Math.random() * 100).toString();
            options.token = options.scope + 1;
            options.newToken = true;
        }
        options.uploadUrl = options.contextPath + '/sys/emapcomponent/file/uploadTempFile/' + options.scope + '/' + options.token + '.do';


        $(element).addClass('bh-file-photo').append('<div class="bh-file-photo-block"></div>' +
            '<p class="bh-file-photo-info">' +
            '<span class="icon icon-spinner icon-pulse bh-file-photo-loading"></span>' +
            '<span class="bh-file-photo-error"></span>' +
            '<span class="bh-file-photo-success">上传成功</span>' +
            '</p>' +
            '<a class="bh-file-upload" href="javascript:void(0)"><input name="bhFile" type="file">上传</a>');

        _imgLoad((options.defaultPhoto ? options.defaultPhoto : defaultPhoto), function (img) {
            var w = img.width, h = img.height;
            if (w > h) {
                $(img).css({
                    'position': 'absolute',
                    'height': '88px',
                    'top': 0,
                    'left': '50%',
                    'margin-left': '-' + w / 2 / h * 88 + 'px'
                });
            } else {
                $(img).css({
                    'position': 'absolute',
                    'width': '88px',
                    'left': 0,
                    'top': '50%',
                    'margin-top': '-' + h / 2 / w * 88 + 'px'
                });
            }

            $(element).find('.bh-file-photo-block').html(img);
        });

        $(element).find('input[type=file][name=bhFile]').fileupload({
            url: options.uploadUrl,
            autoUpload: true,
            dataType: 'json',
            formData: {storeId: 'image'},
            submit: function (e, data) {
                var file = data.files[0];

                $(element).addClass('loading');
                // 文件的大小 和类型校验
                if (options.type && options.type.length > 0) {
                    if (!new RegExp(options.type.join('|').toUpperCase()).test(file.name.toUpperCase())) {
                        $(element).removeClass('loading').addClass('error').find('.bh-file-photo-error').html('文件类型不正确');
                        return false;
                    }
                }

                if (fileReader && options.size) {
                    if (file.size / 1024 > options.size) {
                        $(element).removeClass('loading').addClass('error').find('.bh-file-photo-error').html('文件大小超出限制');
                        return false;
                    }
                }

                if (options.submit) {
                    options.submit(e, data);
                }
            },
            done: function (e, data) {
                if (data.result.success) {



                    // 上传成功
                    $(element).removeClass('loading').addClass('success')
                    //.find('.bh-file-photo-block img').attr('src', data.result.tempFileUrl);
                    options.tempUrl = data.result.tempFileUrl;
                    options.fileUrl = data.result.fileUrl;

                    _imgLoad(data.result.tempFileUrl, function (img) {
                        var w = img.width, h = img.height;
                        if (w > h) {
                            $(img).css({
                                'position': 'absolute',
                                'height': '88px',
                                'top': 0,
                                'left': '50%',
                                'margin-left': '-' + w / 2 / h * 88 + 'px'
                            });
                        } else {
                            $(img).css({
                                'position': 'absolute',
                                'width': '88px',
                                'left': 0,
                                'top': '50%',
                                'margin-top': '-' + h / 2 / w * 88 + 'px'
                            });
                        }

                        $(element).find('.bh-file-photo-block').html(img);
                        if (options.done) {
                            options.done(e, data);
                        }
                    })

                } else {
                    // 上传失败
                    $(element).removeClass('loading').addClass('error').find('.bh-file-photo-error').html((data.result.error ? data.result.error : '上传失败'));
                    if (options.fail) {
                        options.fail(e, data);
                    }
                }


            },
            fail: function (e, data) {
                $(element).removeClass('loading').addClass('error').find('.bh-file-photo-error').html('上传失败');
                if (options.fail) {
                    options.fail(e, data);
                }
            }
        });

        options.attachmentParams = {
            storeId: "image",
            scope: options.scope,
            fileToken: options.token
        };
    };

    _imgLoad = function (url, cb) {
        var img = new Image();
        img.src = url;
        if (img.conplete) {
            cb(img.width, img.height);
        } else {
            img.onload = function () {
                cb(img);
                img.onload = null;
            }
        }
    };
    // 公共方法

    // 保存临时文件
    Plugin.prototype.saveTempFile = function () {
        var resultFlag = false, self = this;
        if (!this.settings.tempUrl || this.settings.tempUrl.length < 1) {
            return resultFlag;
        }
        $.ajax({
            type: "post",
            url: this.settings.contextPath + '/sys/emapcomponent/file/deleteFileByToken/' + this.settings.token + '.do',
            async: false,
            dataType: "json",
            success: function (data) {
            }
        });
        $.ajax({
            type: "post",
            async: false,
            url: this.settings.contextPath
            + "/sys/emapcomponent/file/saveAttachment/"
            + this.settings.scope + "/" + this.settings.token + ".do",
            data: {
                attachmentParam: JSON.stringify(this.settings.attachmentParams)
            },
            dataType: "json",
            success: function (data) {
                self.settings.tempFileSaved = true;
                resultFlag = data;
            }
        });
        return resultFlag;
    };
    // 获取文件地址
    Plugin.prototype.getFileToken = function () {
        if (this.settings.newToken && (!this.settings.tempUrl || this.settings.tempUrl.length == 0)) {
            return null;
        } else {
            return this.settings.token;
        }
    };

    // 销毁实例
    Plugin.prototype.destroy = function () {
        this.settings = null;
        $(this.$element).data('plugin', false).removeClass('success error loading').empty().attr('class', 'bh-file-photo');
    };


    // 插件
    $.fn.emapFilePhoto = function (options) {
        var instance;
        instance = this.data('plugin');

        if (!instance) {
            return this.each(function () {
                if (options == 'destroy') {
                    return this;
                }
                return $(this).data('plugin', new Plugin(this, options));
            });
        }

        if (options === true) return instance;

        if ($.type(options) === 'string') return instance[options]();
        return this;

    };

    $.fn.emapFilePhoto.defaults = {
        storeId: 'image',
        type: ['jpg', 'png', 'bmp'],
        size: 2048
    };

}).call(this);
/**
 *
 * @params rootPath
 * emap跟路径
 *
 * @params storeId
 * 上传文件的类型
 * String : file image
 *
 *
 * @params multiple
 * 是否支持多选(ie9) 不支持
 * Boolean  默认 false
 *
 * @params limit
 * 上传文件个数限制
 * Int
 *
 * @param type
 * 上传文件的类型限制
 * Array
 *
 * @param size
 * 上传文件的大小限制 KB
 * Int
 *
 * @params add
 * 选择文件的回调
 * func
 *
 * @params submit
 * 文件上传的回调
 * func
 *
 * @params done
 * 文件上传后的回调
 * func
 *
 * @params fail
 * 文件上传失败的回调
 * func
 *
 * @params formData
 * 附带参数
 * Object
 *
 */

// 文件上传
(function () {
    var EmapFileUpload;
    var fileReader = 'FileReader' in window;
    var _init, _getLimitInfo; //私有方法

    EmapFileUpload = (function () {
        // 实例化部分
        function EmapFileUpload(element, options) {
            this.options = $.extend({}, $.fn.emapFileUpload.defaults, options);
            this.$element = $(element);

            //if (this.options.token && this.options.token != '') {
            //    this.options.scope = this.options.token.substring(0, this.options.token.length - 1);
            //    this.options.newToken = false;
            //} else {
            //    this.options.scope = new Date().getTime() + "" + parseInt(Math.random() * 100).toString();
            //    this.options.token = this.options.scope + 1;
            //    this.options.newToken = true;
            //}

            _init(this.$element, this.options);
            //this.options.uploadUrl = this.options.contextPath + '/sys/emapcomponent/file/uploadTempFile/' + this.options.scope + '/' + this.options.token + '.do';
            //fileInput.fileupload({
            //    url: self.options.uploadUrl,
            //    autoUpload: true,
            //    multiple: self.options.multiple,
            //    dataType: 'json',
            //    limitMultiFileUploads: 2,
            //    formData: {
            //        size: self.options.size,
            //        type: self.options.type,
            //        storeId: self.options.storeId
            //    },
            //    add: function (e, data) {
            //        var files = data.files;
            //        var tmp = new Date().getTime();
            //        $(files).each(function (i) {
            //            data.files[i].bhId = tmp + i;
            //            self.options.loadingCon.add(this.name, tmp + i);
            //        });
            //
            //        if (self.options.add) {
            //            self.options.add(e, data);
            //        }
            //        data.submit();
            //
            //    },
            //    submit: function (e, data) {
            //        var file = data.files[0];
            //
            //        // 文件数量限制的校验
            //        if (self.options.limit) {
            //            var currentCount = self.options.loadingCon.getFileNum() + self.options.loadedCon.getFileNum();
            //            if (currentCount > self.options.limit) {
            //                self.options.loadingCon.error('文件数量超出限制', file.bhId);
            //                return false;
            //            }
            //        }
            //
            //        // 文件的大小 和类型校验
            //        if (self.options.type && self.options.type.length > 0) {
            //            if (!new RegExp(self.options.type.join('|').toUpperCase()).test(file.name.toUpperCase())) {
            //                self.options.loadingCon.error('文件类型不正确', file.bhId);
            //                return false;
            //            }
            //        }
            //
            //        if (fileReader && self.options.size) {
            //            if (file.size / 1024 > self.options.size) {
            //                self.options.loadingCon.error('文件大小超出限制', file.bhId);
            //                return false;
            //            }
            //        }
            //
            //        self.options.loadingCon._findFile(file.bhId).data('xhr', data);
            //
            //        if (self.options.submit) {
            //            self.options.submit(e, data);
            //        }
            //    },
            //    done: function (e, data) {
            //        var file = data.files[0];
            //        if (data.result.success) {
            //            // 上传成功
            //            self.options.loadingCon.remove(file.bhId);
            //            if (self.options.storeId == 'image') {
            //                self.options.loadedCon.addImage(file.name, file.bhId, data.result.id, data.result.tempFileUrl, function (item) {
            //                    item.data('deleteurl', data.result.deleteUrl);
            //                });
            //            } else {
            //                self.options.loadedCon.add(file.name, file.bhId, data.result.id, data.result.tempFileUrl, function (item) {
            //                    item.data('deleteurl', data.result.deleteUrl);
            //                });
            //            }
            //            if (self.options.done) {
            //                self.options.done(e, data)
            //            }
            //            self.$element.trigger('bh.file.upload.done', data);
            //        } else {
            //            // 上传失败
            //            self.options.loadingCon.error((data.result.error ? data.result.error : '上传失败'), file.bhId);
            //            if (self.options.fail) {
            //                self.options.fail(e, data)
            //            }
            //        }
            //
            //
            //    },
            //    fail: function (e, data) {
            //        var file = data.files[0];
            //        self.options.loadingCon.error('上传失败', file.bhId);
            //        if (self.options.fail) {
            //            self.options.fail(e, data)
            //        }
            //    }
            //});
        }

        // 获取token
        EmapFileUpload.prototype.getFileToken = function () {
            return this.options.fileInput.emapUploadCore('getFileToken');
        };

        // 返回token下已有的正式文件的url数组
        EmapFileUpload.prototype.getFileUrl = function () {
            return  this.options.fileInput.emapUploadCore('getFileToken');


            //var options = this.options;
            //var fileArr;
            //$.ajax({
            //    type: "post",
            //    url: options.contextPath + '/sys/emapcomponent/file/getUploadedAttachment/' + options.token + '.do',
            //    dataType: "json",
            //    async: false,
            //    success: function (res) {
            //        if (res.success) {
            //            var fileHtml = '';
            //            fileArr = $(res.items).map(function () {
            //                return this.fileUrl;
            //            }).get();
            //        }
            //    }
            //});
            //
            //return fileArr;
        };

        EmapFileUpload.prototype.saveTempFile = function () {
            var options = this.options;
            var result = options.fileInput.emapUploadCore('saveTempFile');
            // 将临时文件下载地址替换为正式文件下载地址
            $('.bh-file-upload-name-a', this.options.loadedCon).each(function(){
                var href = $(this).attr('href');
                if (new RegExp('getTempFile').test(href)) {
                    var fileBlock = $(this).closest('.bh-file-upload-file').data('save', true);
                    var fileId = fileBlock.data('fileid');
                    $(this).attr('href', options.contextPath + '/sys/emapcomponent/file/getAttachmentFile/' + fileId + '.do');
                }
            });
            return result;
        };

        EmapFileUpload.prototype.getFileNum = function () {
            return this.options.loadedCon.getFileNum();
        };

        EmapFileUpload.prototype.destroy = function () {
            this.options = null;
            $(this.$element).data('plugin', false).empty();
        };

        // 私有方法
        _init = function (element, options) {

            $(element).css('line-height', '28px').append('<a class="bh-file-upload" href="javascript:void(0)">' +
                '<input name="bhFile" type="file" ' + (options.multiple ? 'multiple' : '') + ' />上传' +
                '</a>' +
                '<span class="bh-text-caption bh-color-caption bh-mh-8 bh-file-upload-info">(' + _getLimitInfo(options) + ')</span>' +
                '<div class="bh-file-upload-loading-wrap bh-clearfix"></div>' +
                '<div class="bh-file-upload-loaded-wrap bh-clearfix"></div>' +
                '<input type="hidden" class="file-array" value="" />');

            options.fileInput = $('input[type=file]', element).parent();
            options.loadingCon = $(element).find('.bh-file-upload-loading-wrap').bhFileUploadingList({
                onDelete: function (item) {
                    if (item.hasClass('bh-error')) {
                        // 删除上传失败的文件
                        item.remove();
                    } else {
                        // 删除正在上传的文件
                        item.data('xhr').abort();
                        item.remove();
                    }
                }
            });
            options.loadedCon = $(element).find('.bh-file-upload-loaded-wrap').bhFileUploadedList({
                // 删除已上传文件
                onDelete: function (item) {
                    var fileBlock = $(item).closest('.bh-file-upload-file');

                    if (fileBlock.data('save')) {
                        // 删除正式文件
                        options.fileInput.emapUploadCore('deleteArrAdd', fileBlock.data('fileid'))

                        fileBlock.remove();
                    } else {
                        // 删除临时文件
                        options.fileInput.emapUploadCore('deleteTempFile', {
                            url: fileBlock.data('deleteurl'),
                            fileId: fileBlock.data('fileid'),
                            done: function (data) {
                                fileBlock.remove();
                            }
                        });
                    }
                    element.trigger('bh.file.upload.delete');
                }
            });

            // 获取token下已有的文件
            if (!options.newToken) {
                $.ajax({
                    type: "post",
                    url: options.contextPath + '/sys/emapcomponent/file/getUploadedAttachment/' + options.token + '.do',
                    dataType: "json",
                    success: function (res) {
                        if (res.success) {
                            if (options.storeId == 'image') {
                                $(res.items).each(function () {
                                    options.loadedCon.addImage(this.name, '', this.id, this.fileUrl, function (item) {
                                        item.data('save', true);
                                    });
                                });
                            } else {
                                $(res.items).each(function () {
                                    options.loadedCon.add(this.name, '', this.id, this.fileUrl, function (item) {
                                        item.data('save', true);
                                    });
                                });
                            }
                            element.trigger('bh.file.upload.done', res);
                        }
                    }
                });
            }

            options.fileInput.emapUploadCore($.extend({}, options, {
                add: function (e, data) {
                    var files = data.files;
                    var tmp = new Date().getTime();
                    $(files).each(function (i) {
                        data.files[i].bhId = tmp + i;
                        options.loadingCon.add(this.name, tmp + i);
                    });

                    if (options.add) {
                        options.add(e, data);
                    }
                },
                submit: function (e, data) {
                    var file = data.files[0];

                    // 文件数量限制的校验
                    if (options.limit) {
                        var currentCount = options.loadingCon.getFileNum() + options.loadedCon.getFileNum();
                        if (currentCount > options.limit) {
                            options.loadingCon.error('文件数量超出限制', file.bhId);
                            return false;
                        }
                    }

                    // 文件的大小 和类型校验
                    if (options.type && options.type.length > 0) {
                        if (!new RegExp(options.type.join('|').toUpperCase()).test(file.name.toUpperCase())) {
                            options.loadingCon.error('文件类型不正确', file.bhId);
                            return false;
                        }
                    }

                    if (fileReader && options.size) {
                        if (file.size / 1024 > options.size) {
                            options.loadingCon.error('文件大小超出限制', file.bhId);
                            return false;
                        }
                    }

                    options.loadingCon._findFile(file.bhId).data('xhr', data);
                    if (options.submit) {
                        options.submit(e, data);
                    }
                },
                done: function (e, data) {
                    var file = data.files[0];
                    // 上传成功
                    options.loadingCon.remove(file.bhId);
                    if (options.storeId == 'image') {
                        options.loadedCon.addImage(file.name, file.bhId, data.result.id, data.result.tempFileUrl, function (item) {
                            item.data('deleteurl', data.result.deleteUrl);
                        });
                    } else {
                        options.loadedCon.add(file.name, file.bhId, data.result.id, data.result.tempFileUrl, function (item) {
                            item.data('deleteurl', data.result.deleteUrl);
                        });
                    }
                    if (options.done) {
                        options.done(e, data);
                    }
                },
                fail: function (e, data) {
                    // 上传失败
                    var file = data.files[0];
                    options.loadingCon.error((data.result.error ? data.result.error : '上传失败'), file.bhId);
                    if (options.fail) {
                        options.fail(e, data)
                    }
                }
            }));
        };

        // 生成描述信息
        _getLimitInfo = function (options) {
            var infoHtml = '请上传附件';
            if (options.size) {
                infoHtml += ',文件最大为' + (options.size < 1024 ? options.size + 'K' : options.size / 1024 + 'M');
            }
            if (options.type && options.type.length > 0) {
                infoHtml += ',格式限制为' + options.type.join(",").toUpperCase();
            }
            return infoHtml;
        };


        // 定义插件
        $.fn.emapFileUpload = function (options) {
            var instance;
            instance = this.data('plugin');

            // 判断是否已经实例化
            if (!instance) {
                return this.each(function () {
                    if (options == 'destroy') {
                        return this;
                    }
                    return $(this).data('plugin', new EmapFileUpload(this, options));
                });
            }
            if (options === true) {
                return instance;
            }
            if ($.type(options) === 'string') {
                return instance[options]();
            }
        };

        // 插件的默认设置
        $.fn.emapFileUpload.defaults = {
            multiple: false,
            dataType: 'json',
            storeId: 'file',
            type: [],
            size: 0
        };


    })();

}).call(this);

// 上传中列表
$.fn.bhFileUploadingList = function (opt) {
    // 删除按钮的点击事件
    $(this).on("click", "a.bh-file-upload-delete", function () {
        if (opt.onDelete) {
            opt.onDelete($(this).closest('.bh-file-upload-file'));
        }
    });
    this.add = function (fileName, bhId, fileId) {
        $(this).append('<div class="bh-pull-left bh-file-upload-file" data-bhid="' + bhId + '" data-fileid="' + (fileId ? fileId : 0) + '">' +
            '<span class="bh-file-upload-filename" title="' + fileName + '">' + fileName + '</span>' +
            '<span class="bh-file-upload-error-msg"></span>' +
            '<i class="icon icon-spinner icon-pulse bh-file-uploading-icon"></i>' +
            '<a class="bh-file-upload-delete" href="javascript:void(0)">删除</a>' +
            '</div>');
    };

    this._findFile = function (bhId, fileId) {
        var id = fileId ? fileId : bhId;
        var selector = fileId ? 'fileid' : 'bhid';
        return $(this).find(".bh-file-upload-file[data-" + selector + "=" + id + "]");

    };

    this.error = function (errorMsg, bhId, fileId) {
        var block = this._findFile(bhId, fileId);
        if (block.length > 0) {
            block.addClass('bh-error').find('.bh-file-upload-error-msg').text(errorMsg);
        }
    };

    this.remove = function (bhId, fileId) {
        var block = this._findFile(bhId, fileId);
        if (block.length > 0) {
            block.remove();
        }
    };

    // 获取文件个数
    this.getFileNum = function () {
        return $(this).find(".bh-file-upload-file:not(.bh-error)").length;
    };

    return this;
};

//已上传列表
/**
 *
 * @param delete
 * 点击删除 的回调
 * func
 */
$.fn.bhFileUploadedList = function (opt) {
    //删除按钮的点击事件
    $(this).on("click", "a.bh-file-upload-delete", function () {
        if (opt.onDelete) {
            opt.onDelete($(this).closest('.bh-file-upload-file'));
        }
    });

    this.add = function (fileName, bhId, fileId, fileSrc, cb) {
        var item = $('<div class="bh-pull-left bh-file-upload-file" data-bhid="' + bhId + '" data-fileId="' + (fileId ? fileId : 0) + '">' +
            '<div class="bh-file-upload-file-icon bh-pull-left"><i class="iconfont icon-insertdrivefile"></i></div>' +
            '<div class="bh-file-upload-file-info bh-pull-left">' +
            '<a class="bh-file-upload-name-a" href="' + fileSrc + '" style="color:#333;"><span class="bh-file-upload-filename" title="' + fileName + '">' + fileName + '</span></a>' +
            '<p><span class="bh-file-upload-success-info">上传成功</span> <a class="bh-file-upload-delete" href="javascript:void(0)">删除</a></p>' +
            '</div>' +
            '</div>');
        $(this).append(item);
        if (cb) {
            cb(item);
        }
    };

    this.addImage = function (fileName, bhId, fileId, fileSrc, cb) {
        var item = $('<div class="bh-pull-left bh-file-upload-file bh-file-upload-img" data-bhid="' + bhId + '" data-fileId="' + (fileId ? fileId : 0) + '">' +
            '<div class="bh-file-upload-img-block"><span><img src="' + fileSrc + '" /></span></div>' +
            '<div class="bh-file-upload-file-info">' +
            '<span class="bh-file-upload-filename" title="' + fileName + '">' + fileName + '</span>' +
            '<p><span class="bh-file-upload-success-info">上传成功</span> <a class="bh-file-upload-delete" href="javascript:void(0)">删除</a></p>' +
            '</div>' +
            '</div>');
        $(this).append(item);
        if (cb) {
            cb(item)
        }
    };

    this._findFile = function (bhId, fileId) {
        var id = fileId ? fileId : bhId;
        var selector = fileId ? 'fileid' : 'bhid';
        return $(this).find(".bh-file-upload-file[data-" + selector + "=" + id + "]");

    };

    this.remove = function (bhId, fileId) {
        var block = this._findFile(bhId, fileId);
        if (block.length > 0) {
            block.remove();
        }
    };

    // 获取文件个数
    this.getFileNum = function () {
        return $(this).find(".bh-file-upload-file").length;
    };

    return this;
};



(function () {
    var Plugin,
        _render, _renderFormWrap, _setValue,
        _renderReadonlyFormStructure, _renderEditFormStructure, _sortModel, _getAttr, _emapFormDo, _renderTableFormStructure,
        _renderReadonlyInputPlace, _renderEditInputPlace;  //插件的私有方法
    var _defaultValues = {};

    Plugin = (function () {

        function Plugin(element, options) {
            // 旧版 option 参数的兼容处理
            if (options.mode) {
                options.model = options.mode;
            }
            if (options.model == 'L' || options.model == 'horizontal') {
                options.model = 'h';
            }
            if (options.model == 'S' || options.model == 'vertical') {
                options.model = 'v';
            }
            if (options.rows) {
                options.cols = options.rows;
            }

            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.options = $.extend({}, $.fn.emapForm.defaults, options);
            if (!this.options || this.options == null || this.options == "") {
                this.options = WIS_EMAP_SERV.getContextPath();
            }
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);

            this.$element.attr("emap-role", "form");

            this.$element.attr("emap", JSON.stringify({
                "emap-url": WIS_EMAP_SERV.url,
                "emap-name": WIS_EMAP_SERV.name,
                "emap-app-name": WIS_EMAP_SERV.appName,
                "emap-model-name": WIS_EMAP_SERV.modelName
            }));
            delete WIS_EMAP_SERV.url;
            delete WIS_EMAP_SERV.name;
            delete WIS_EMAP_SERV.appName;
            delete WIS_EMAP_SERV.modelName;

            _renderFormWrap(this.$element, this.options);


            //初始化控件
            if (!this.options.readonly && this.options.data) {
                this.$element.emapFormInputInit(this.options);
                if(!$.isEmptyObject(_defaultValues))_setValue(_defaultValues, this.$element, this.options);
                if (this.options.validate) {
                    this.$element.emapValidate(options);
                }
            }
        }

        /**
         * 插件的公共方法，相当于接口函数，用于给外部调用
         */

        Plugin.prototype.disableItem = function (ids) {
            var self = this.$element;
            _emapFormDo(ids, _disable);
            self.emapForm('reloadValidate');
            function _disable(id) {
                var item = $('[data-name=' + id + ']', self);
                switch (item.attr('xtype')) {

                    case 'select':
                        item.jqxDropDownList({disabled: true});
                        break;
                    case 'date-local':
                    case 'date-ym':
                    case 'date-full':
                        item.jqxDateTimeInput({disabled: true});
                        break;
                    case 'tree':
                        item.emapDropdownTree('disable');
                        break;
                    case 'radiolist':
                    case 'checkboxlist':
                        $('input[type=radio], input[type=checkbox]', item).prop('disabled', true);
                        break;
                    case 'switcher' :
                        item.jqxSwitchButton('disable');
                        break;
                    case 'multi-select':
                    case 'selecttable':
                        item.jqxComboBox({disabled: true});
                        break;
                    case 'uploadfile':
                    case 'uploadphoto':
                    case 'uploadsingleimage':
                    case 'uploadmuiltimage':
                        $('input[type=file]', item).attr('disabled', true);
                        break;
                    default:
                        item.attr('disabled', true);
                        break;
                }
                item.closest('.bh-form-group').addClass('bh-disabled');
            }
        };

        Plugin.prototype.enableItem = function (ids) {
            var self = this.$element;
            _emapFormDo(ids, _enable);
            self.emapForm('reloadValidate');
            function _enable(id) {
                var item = $('[data-name=' + id + ']', self);
                switch (item.attr('xtype')) {
                    case 'text':
                    case 'textarea':
                        item.attr('disabled', false);
                        break;
                    case 'select':
                        item.jqxDropDownList({disabled: false});
                        break;
                    case 'date-local':
                    case 'date-ym':
                        item.jqxDateTimeInput({disabled: false});
                        break;
                    case 'tree':
                        item.emapDropdownTree('enable');
                        break;
                    case 'radiolist':
                    case 'checkboxlist':
                        $('input[type=radio], input[type=checkbox]', item).prop('disabled', false);
                        break;
                    case 'switcher' :
                        item.jqxSwitchButton('enable');
                        break;
                    case 'multi-select':
                    case 'selecttable':
                        item.jqxComboBox({disabled: false});
                        break;
                    case 'uploadfile':
                    case 'uploadphoto':
                    case 'uploadsingleimage':
                    case 'uploadmuiltimage':
                        $('input[type=file]', item).attr('disabled', false);
                        break;
                }
                item.closest('.bh-form-group').removeClass('bh-disabled');
            }
        };

        Plugin.prototype.saveUpload = function () {
            var items = $('[xtype=uploadphoto], [xtype=uploadfile], [xtype=uploadsingleimage], [xtype=uploadmuiltimage]', this.$element);
            items.each(function () {
                switch ($(this).attr('xtype')) {
                    case 'uploadphoto':
                        $(this).emapFilePhoto('saveTempFile');
                        break;
                    case 'uploadfile':
                        $(this).emapFileUpload('saveTempFile');
                        break;
                    case 'uploadsingleimage':
                        $(this).emapSingleImageUpload('saveTempFile');
                        break;
                    case 'uploadmuiltimage':
                        $(this).emapImageUpload('saveTempFile');
                        break;
                }
            });
        };

        Plugin.prototype.showItem = function (ids) {
            var self = this.$element;
            _emapFormDo(ids, _show);
            self.emapForm('reloadValidate');
            function _show(id) {
                //$('[data-name=' + id + ']', self).closest('.bh-form-group').show();
                $('[data-name=' + id + ']', self).closest('.bh-row').show().attr('hidden', false);
            }
        };

        Plugin.prototype.hideItem = function (ids) {
            var self = this.$element;
            _emapFormDo(ids, _hide);
            self.emapForm('reloadValidate');
            function _hide(id) {
                //$('[data-name=' + id + ']', self).closest('.bh-form-group').hide();
                $('[data-name=' + id + ']', self).closest('.bh-row').hide().attr('hidden', true);
            }
        };

        Plugin.prototype.getValue = function () {
            var options = this.options;
            if (options.readonly) {
                return options.formValue;
            } else {
                var formData = {};
                this.$element.find('[xtype]').each(function () {
                    var itemVal = "";

                    // 表格表单静态展示项
                    if ($(this).hasClass('bh-form-static')) {

                        if ($.inArray($(this).attr('xtype'), ['radiolist', 'checkboxlist', 'tree', 'multi-select', 'select']) > -1) {
                            formData[$(this).data('name') + "_DISPLAY"] = $(this).text();
                            itemVal = $(this).data('value');
                        } else {
                            itemVal = $(this).val();
                        }
                    } else {
                        switch ($(this).attr('xtype')) {
                            case 'radiolist':
                                itemVal = $(this).find('input[type=radio]:checked').map(function () {
                                    return $(this).val();
                                }).get().join(',');
                                var itemText = $(this).find('input[type=radio]:checked').map(function () {
                                    return $(this).text();
                                }).get().join(',');
                                formData[$(this).data('name') + "_DISPLAY"] = itemText;
                                break;
                            case 'checkboxlist':
                                itemVal = $(this).find('input[type=checkbox]:checked').map(function () {
                                    return $(this).val();
                                }).get().join(',');
                                var itemText = $(this).find('input[type=checkbox]:checked').map(function () {
                                    return $(this).text();
                                }).get().join(',');
                                formData[$(this).data('name') + "_DISPLAY"] = itemText;
                                break;
                            case 'tree' :
                                itemVal = $(this).emapDropdownTree('getValue');
                                formData[$(this).data('name') + "_DISPLAY"] = $(this).emapDropdownTree('getText');
                                break;
                            case 'uploadfile':
                                // 取值前 保存
                                itemVal = $(this).emapFileUpload('getFileToken');
                                break;
                            case 'uploadsingleimage':
                                itemVal = $(this).emapSingleImageUpload('getFileToken');
                                break;
                            case 'uploadmuiltimage':
                                itemVal = $(this).emapImageUpload('getFileToken');
                                break;
                            case 'uploadphoto':
                                itemVal = $(this).emapFilePhoto('getFileToken');
                                break;
                            case 'switcher':
                                itemVal = ($(this).val() ? 1 : 0);
                                formData[$(this).data('name') + "_DISPLAY"] = (itemVal ? "是" : "否");
                                break;
                            case 'multi-select':
                                var valueArray = [], displayArray = [];
                                $($(this).jqxComboBox('getSelectedItems')).each(function () {
                                    valueArray.push(this.value);
                                    displayArray.push(this.label);
                                });
                                itemVal = valueArray.join(',');
                                formData[$(this).data('name') + "_DISPLAY"] = displayArray.join(',');
                                // itemVal = $(this).jqxComboBox('getSelectedItems').map(function (item) {
                                //     return item.value;
                                // }).join(',');
                                // formData[$(this).data('name') + "_DISPLAY"] = itemVal;
                                break;
                            case 'select':
                                var item = $(this).jqxDropDownList('getSelectedItem');
                                if(item)formData[$(this).data('name') + "_DISPLAY"] = item.label;
                                itemVal = $(this).val();
                                break;
                            default :
                                itemVal = $(this).val();
                                break;
                        }
                    }


                    //formData[$(this).data('name')] = itemVal ? WIS_EMAP_SERV._html2Escape(itemVal.toString()) : itemVal;
                    formData[$(this).data('name')] = itemVal;
                });
                return formData;
            }
        };

        //qiyu 2016-3-17
        //如果不传参数，则清空表单中所有值
        //如果传入参数是个数组，则清空该数组中为字段名称的控件值
        Plugin.prototype.clear = function (val) {
            var options = this.options;

            if (options.readonly) {// clear只读表单
                if (val == undefined) {
                    this.$element.find('[xtype]').each(function () {
                        $(this).html("");
                    });
                } else {
                    for (var i = 0; i < val.length; i++) {
                        this.$element.find('[data-name=' + val[i] + '][xtype]').html("");
                    }
                }
            } else {
                if (val === undefined) {
                    this.$element.find('[xtype]').each(function () {
                        var name = $(this).data('name');
                        var xtype = $(this).attr('xtype');
                        var _this = $(this);
                        WIS_EMAP_SERV._setEditControlValue(_this, name, xtype, "", options.root);
                    });
                } else {
                    for (var i = 0; i < val.length; i++) {
                        var name = val[i];
                        var _this = this.$element.find('[data-name=' + name + '][xtype]');
                        var xtype = _this.attr('xtype');
                        var val = {};
                        val[name] = "";
                        WIS_EMAP_SERV._setEditControlValue(_this, name, xtype, val, options.root);
                    }
                }
            }
        };

        Plugin.prototype.setValue = function (val) {
            var options = this.options;
            _setValue(val, this.$element, options);
        }



        Plugin.prototype.destroy = function () {
            // 遍历销毁单个控件 确保控件在body底部插入的dom元素被销毁
            $('[xtype]', this.$element).each(function () {
                var _this = $(this);
                var xtype = _this.attr('xtype');
                switch (xtype) {
                    case 'select':
                        _this.jqxDropDownList('destroy');
                        break;
                    case 'multi-select':
                        _this.jqxComboBox('destroy');
                        break;
                    case 'date-local' :
                    case 'date-ym' :
                    case 'date-full' :
                        _this.jqxDateTimeInput('destroy');
                        break;
                    case 'tree':
                        _this.jqxDropDownButton('destroy');
                        break;
                }
            });

            this.options = null;
            $(this.$element).removeAttr("emap-role");
            $(this.$element).data('emapform', false).empty();
        };

        // 校验重载
        Plugin.prototype.reloadValidate = function () {
            this.$element.emapValidate('destroy');
            this.$element.emapValidate({});
        };

        // 添加字段的必填校验
        Plugin.prototype.requireItem = function (ids) {
            var self = this.$element;
            _emapFormDo(ids, _required);
            function _required(id) {
                var $formGroup = $('[data-name=' + id + ']', self).closest('.bh-form-group');
                if (!$formGroup.hasClass('bh-required')) {
                    $formGroup.addClass('bh-required');
                    self.emapForm('reloadValidate');
                }
            }
        };

        // 取消字段的必填校验
        Plugin.prototype.unRequireItem = function (ids) {
            var self = this.$element;
            _emapFormDo(ids, _required);
            function _required(id) {
                var $formGroup = $('[data-name=' + id + ']', self).closest('.bh-form-group');
                if ($formGroup.hasClass('bh-required')) {
                    $formGroup.removeClass('bh-required');
                    self.emapForm('reloadValidate');
                }
            }
        };

        Plugin.prototype.getModel = function (sort) { // sort 是否自动分组
            if (this.options.hasGroup && sort) {
                return _sortModel(this.options.data);
            } else {
                return this.options.data;
            }
        };
        return Plugin;
    })();


    _setValue = function(val, $element, options){
            if (options.readonly) {
                options.formValue = val;
                $element.find('[xtype]').each(function () {
                    var name = $(this).data('name');
                    var _this = $(this);
                    var nameDisplay = null;
                    if (val[name] !== undefined && val[name] !== null) {
                        switch ($(this).attr('xtype')) {
                            case 'multi-select':
                            case 'select':
                                if (val[name + '_DISPLAY']) {
                                    setItemVal(val[name + '_DISPLAY'], val[name]);
                                } else {
                                    WIS_EMAP_SERV._getInputOptions(_this.data("url"), function (res) {
                                        _this.data('model', res);
                                        var valueArr = val[name].split(',');
                                        var nameArr = [];
                                        $(res).each(function () {
                                            if ($.inArray(this.id, valueArr) > -1) {
                                                nameArr.push(this.name);
                                            }
                                        });
                                        setItemVal(nameArr.join(','), val[name]);
                                    });
                                }
                                break;
                            case 'radiolist':
                                if (val[name + '_DISPLAY']) {
                                    setItemVal(val[name + '_DISPLAY'], val[name]);
                                } else {
                                    WIS_EMAP_SERV._getInputOptions(_this.data("url"), function (res) {
                                        _this.data('model', res);
                                        $(res).each(function () {
                                            if (this.id == val[name]) {
                                                nameDisplay = this.name;
                                                return false;
                                            }
                                        });
                                    });
                                }
                                break;

                            case 'checkboxlist':
                                if (val[name + '_DISPLAY']) {
                                    setItemVal(val[name + '_DISPLAY'], val[name]);
                                } else {
                                    WIS_EMAP_SERV._getInputOptions(_this.data("url"), function (res) {
                                        _this.data('model', res);
                                        var valueArr = val[name].split(',');
                                        var nameArr = [];
                                        $(res).each(function () {
                                            if ($.inArray(this.id, valueArr) > -1) {
                                                nameArr.push(this.name);
                                            }
                                        });
                                        setItemVal(nameArr.join(','), val[name]);
                                    });
                                }

                                break;
                            case 'tree':
                                if (val[name + '_DISPLAY']) {
                                    setItemVal(val[name + '_DISPLAY'], val[name]);
                                } else {
                                    WIS_EMAP_SERV._getInputOptions(_this.data("url"), function (res) {
                                        _this.data('model', res);
                                        var valueArr = val[name].split(',');
                                        var nameArr = [];
                                        $(res).each(function () {
                                            if ($.inArray(this.id, valueArr) > -1) {
                                                nameArr.push(this.name);
                                            }
                                        });
                                        setItemVal(nameArr.join(','), val[name]);
                                    });
                                }
                                break;
                            case 'uploadfile':
                                $(this).emapFileDownload($.extend({}, {
                                    contextPath: options.root,
                                    token: val[name]
                                }, JSON.parse(decodeURI($(this).data('jsonparam')))));
                                break;
                            case 'uploadsingleimage':
                            case 'uploadmuiltimage':
                                $(this).emapFileDownload($.extend({}, {
                                    model: 'image',
                                    contextPath: options.root,
                                    token: val[name]
                                }, JSON.parse(decodeURI($(this).data('jsonparam')))));
                                break;
                            case 'uploadphoto':
                                $(this).emapFilePhoto('destroy');
                                $(this).emapFilePhoto($.extend({}, {
                                    token: val[name],
                                    contextPath: options.root
                                }, JSON.parse(decodeURI($(this).data('jsonparam')))));
                                $('a', this).hide();
                                break;
                            case 'switcher':
                                val[name + 'DISPLAY'] = parseInt(val[name]) ? '是' : '否';
                                setItemVal(val[name + 'DISPLAY'], val[name]);
                                break;
                            default:
                                setItemVal(val[name]);
                        }
                    }
                    function setItemVal(val_dis, val) {
                        if (val_dis != null) {
                            _this.text(val_dis).attr('title', val_dis).data('value', val);
                        }
                    }
                });
            } else {
                $element.find('[xtype]').each(function () {
                    var name = $(this).data('name');
                    var _this = $(this);
                    var xtype = _this.attr('xtype');
                    //qiyu 2016-1-2 清空表单时，传入字段值为空，需要重置该控件
                    //qiyu 2016-3-17 清空表单请使用clear方法，以下这句话将被注释掉
                    //if (val[name] == null) {val[name] = ""}

                    // 为表格表单中的 只读字段赋值
                    if (options.model == 't' && _this.hasClass('bh-form-static')) {
                        if (val[name] != null) {
                            if (val[name + '_DISPLAY'] !== undefined && val[name + '_DISPLAY'] !== null) {
                                _this.text(val[name + '_DISPLAY']).attr('title', val[name + '_DISPLAY']).data('value', val[name]);
                            } else {
                                _this.text(val[name]).attr('title', val[name]);
                            }
                        }
                    }

                    if (val === undefined) {

                    } else if (val[name] !== undefined && val[name] !== null) {
                        WIS_EMAP_SERV._setEditControlValue(_this, name, xtype, val, options.root);
                    }
                });
            }
        };


    // 渲染表单外框
    _renderFormWrap = function (element, options) {
        if (!options.data) return; // 为兼容孟斌的特殊样式表单 此处实现表单的假实例化功能
        var readOnly = options.readonly ? options.readonly : false;
        var $form = $('<div class="bh-form-horizontal" bh-form-role="bhForm" ></div>');
        if (readOnly || options.model == "t") {
            $form.addClass('bh-form-readonly');
            if (options.model == "t") {
                $form.addClass('bh-table-form');
            }
        } else {
            if (options.model == "v") {
                $form.addClass('bh-form-S');
            }
        }

        options.hasGroup = options.data.filter(function (val) {
                return !!val.groupName && val.groupName != "";
            }).length > 0;

        if (options.hasGroup && options.renderByGroup) {
            // 分组表单
            var sortedModel = _sortModel(options.data);
            for (var i = 0; i < sortedModel.length; i++) {

                var groupContainer = $('<div bh-form-role=groupContainer>' +
                    '<div class="bh-col-md-12 bh-form-groupname sc-title-borderLeft bh-mb-16" bh-role-form-outline="title" title="' + sortedModel[i].groupName + '">' +
                    '' + sortedModel[i].groupName + '' +
                    '</div>' +
                    '<div class="bh-form-block bh-mb-24" bh-role-form-outline="container" style="margin-left: 12px;"></div>' +
                    '</div>');
                var formBlock = $('[bh-role-form-outline=container]', groupContainer);
                var visibleItem = sortedModel[i].items.filter(function (val) {
                    return !val.get('hidden');
                });
                if (!sortedModel[i].groupName || visibleItem.length == 0) {
                    // 隐藏未分组的字段
                    groupContainer.css('display', 'none');
                    $('.bh-form-groupname', groupContainer).removeAttr('bh-role-form-outline');
                    $('.bh-form-block', groupContainer).attr('bh-role-form-outline', 'hidden');
                }
                if (options.model == 't') {
                    // 表格表单
                    _renderTableFormStructure(formBlock, sortedModel[i].items, options);
                } else if (readOnly) {
                    _renderReadonlyFormStructure(formBlock, sortedModel[i].items, options);
                } else {
                    _renderEditFormStructure(formBlock, sortedModel[i].items, options.model);
                }
                $form.append(groupContainer);
            }
        } else {
            // 不分组表单
            if (options.model == 't') {
                // 表格表单
                _renderTableFormStructure($form, options.data, options);
            } else if (readOnly) {
                _renderReadonlyFormStructure($form, options.data, options);
            } else {
                _renderEditFormStructure($form, options.data, options.model);
            }
        }
        element.append($form);
    };

    // model 分组排序
    _sortModel = function (model) {
        var result = [];
        for (var i = 0; i < model.length; i++) {
            var groupItem = result.filter(function (val) {
                return val.groupName == model[i].groupName;
            });
            if (groupItem.length == 0) {
                result.push({
                    "groupName": model[i].groupName,
                    "items": [model[i]]
                });
            } else {
                groupItem[0].items.push(model[i]);
            }
        }
        return result;
    };

    // 渲染只读表单结构
    _renderReadonlyFormStructure = function (form, data, options) {
        options.cols = options.cols ? options.cols : 3;
        options.colWidth = 12 / options.cols;

        var itemHtml = '';
        $(data).each(function () {
            var attr = _getAttr(this);
            itemHtml += '<div class="bh-form-group  bh-col-md-' + attr.col * options.colWidth + '" ' + (attr.hidden ? 'style="display: none;"' : '') + ' >' +
                '<label class="bh-form-label bh-form-readonly-label" title="' + attr.caption + '">' + attr.caption + '</label>' +
                '<div class="bh-form-readonly-input">';
            itemHtml += _renderReadonlyInputPlace(this, options);
            itemHtml += '</div></div>';
        });
        form.append(itemHtml).addClass('bh-form-block');
    };



    // 渲染表格表单结构
    _renderTableFormStructure = function (form, data, options) {
        var itemHtml = '';
        options.cols = options.cols ? options.cols : 3;
        options.colWidth = 12 / options.cols;

        $(data).each(function () {
            var attr = _getAttr(this);
            if (attr.xtype == "textarea") attr.col = options.cols;
            itemHtml += '<div class="form-validate-block bh-col-md-' + attr.col * options.colWidth + '"><div class="bh-form-group ' + attr.required + '" ' + (attr.hidden ? 'style="display: none;"' : '') + ' >' +
                '<label class="bh-form-label bh-form-readonly-label" title="' + attr.caption + '">' + attr.caption + '</label>' +
                '<div class="bh-ph-8 bh-form-readonly-input">';
            if (attr.inputReadonly) {
                // 只读字段
                itemHtml += _renderReadonlyInputPlace(this, options);
            } else {
                // 可编辑字段
                itemHtml += _renderEditInputPlace(this);
                if (attr.xtype == undefined || attr.xtype == 'text') {
                    // 为 文本框 添加右边的编辑图标
                    itemHtml += '<i class="iconfont icon-edit bh-table-form-icon"></i>';
                }
            }
            itemHtml += '<div class="bh-form-placeholder bh-form-flow">' + attr.placeholder + '</div>';
            itemHtml += '</div></div></div>';
        });
        form.append(itemHtml).addClass('bh-form-block');
        $(".form-validate-block", form).hover(function(){
            $(this).toggleClass("bh-actived");
        });
    };

    // 渲染编辑表单结构
    _renderEditFormStructure = function (form, data, model) {
        $(data).each(function () {
            var attr = _getAttr(this);
            var rowHtml = "";
            var controlHtml = _renderEditInputPlace(this);

            if (model == 'h') {
                rowHtml = '<div class="bh-row form-validate-block" {{hidden}} data-field=' + attr.name + ' >' +
                    '<div class="bh-form-group bh-col-md-6 ' + attr.required + ' {{inputReadonly}}">' +
                    '<label class="bh-form-label bh-form-h-label bh-pull-left" title="' + attr.caption + '">' + attr.caption + '</label>' +
                    '<div class="bh-ph-8" style="margin-left: 115px;">' +
                    controlHtml +
                    '</div>' +
                    '</div>' +
                    '<div class="bh-form-group bh-col-md-3 bh-color-caption bh-form-placeholder">' + attr.placeholder + '</div>' +
                    '</div>';
            } else if (model == 'v') {
                rowHtml = '<div class="bh-row form-validate-block" {{hidden}} data-field=' + attr.name + '>' +
                    '<div class="bh-form-group bh-col-md-12 ' + attr.required + ' {{inputReadonly}}" style="padding: 0 4px 0 12px;">' +
                    '<label class="bh-form-label  ">' + attr.caption + '</label>' +
                    '<div class="">' +
                    controlHtml +
                    '</div>' +
                    '</div>' +
                    '<div class="bh-form-group bh-col-md-12 bh-color-caption bh-form-placeholder">' + attr.placeholder + '</div>' +
                    '</div>';
            }
            rowHtml = rowHtml.replace(/\{\{hidden\}\}/g, (attr.hidden ? 'style="display: none;" hidden=true' : ''))
                .replace(/\{\{inputReadonly\}\}/g, (attr.inputReadonly ? 'bh-disabled' : ''));
            form.append(rowHtml);
            if (form.attr('bh-role-form-outline') != "hidden") {
                form.attr('bh-role-form-outline', 'container');
            }
        });
    };


    _renderReadonlyInputPlace = function (ele, options) {
        var itemHtml = '';
        var attr = _getAttr(ele);
        if (attr.xtype == "textarea") attr.col = options.cols;

        switch (attr.xtype) {
            case "uploadfile":
            case "uploadphoto":
            case "uploadsingleimage":
            case "uploadmuiltimage":
                itemHtml += '<div xtype="' + attr.xtype + '" class="" data-name="' + attr.name + '" data-JSONParam="' + encodeURI(JSON.stringify(attr.JSONParam)) + '"></div>';
                break;
            case "textarea" :
                itemHtml += '<textarea xtype="textarea" data-name="' + attr.name + '" class="bh-form-control" rows="3" maxlength="' + attr.dataSize + '" readOnly placeholder="' + (attr.placeholder ? attr.placeholder : '') + '" style="background: #fff;resize: none;border: none!important;box-shadow: none!important;" ></textarea>';
                break;
            default :
                itemHtml += '<p data-name="' + attr.name + '" data-url="' + attr.url + '" xtype="' + attr.xtype + '" class="bh-form-static bh-ph-8"></p>';
        }

        return itemHtml;
    }

    _renderEditInputPlace = function (ele) {
        var attr = _getAttr(ele);
        var controlHtml = "";
        switch (attr.xtype) {
            case undefined:
            case "text" :
                attr.xtype = "text";
                controlHtml = '<input class="bh-form-control" data-caption="{{caption}}" data-type="{{dataType}}" data-name="{{name}}" name="{{name}}" xtype="{{xtype}}" type="{{xtype}}" {{checkType}}  {{dataSize}} {{checkSize}} {{checkExp}} ' + (attr.inputReadonly ? 'readOnly' : '') + '  />';
                break;
            case "textarea" :
                controlHtml = '<textarea xtype="{{xtype}}" data-caption="{{caption}}" data-type="{{dataType}}" class="bh-form-control" rows="3" data-name="{{name}}" {{checkType}} {{dataSize}} {{checkSize}} {{checkExp}} ' + (attr.inputReadonly ? 'readOnly' : '') + ' ></textarea>';
                break;
            case "selecttable" :
            case "select" :
            case "tree" :
            case "date-local" :
            case "date-ym" :
            case "date-full" :
            case "switcher" :
            case "uploadfile":
            case "uploadphoto":
            case "uploadsingleimage":
            case "uploadmuiltimage":
            case "buttonlist":
            case "multi-select" :
            case "div":
                controlHtml = '<div xtype="{{xtype}}" data-caption="{{caption}}" data-type="{{dataType}}" data-name="{{name}}" {{url}} {{format}} {{checkType}} {{JSONParam}} {{checkSize}} data-disabled={{inputReadonly}}></div>';
                break;
            case "radiolist" :
                controlHtml = '<div xtype="{{xtype}}" data-caption="{{caption}}" data-type="{{dataType}}" class="bh-radio jqx-radio-group" data-name="{{name}}" {{url}} {{checkSize}} data-disabled={{inputReadonly}}></div>';
                break;
            case "checkboxlist" :
                controlHtml = '<div xtype="{{xtype}}" data-caption="{{caption}}" data-type="{{dataType}}" class="bh-checkbox" data-name="{{name}}" {{checkType}} {{url}} {{checkSize}} data-disabled={{inputReadonly}}></div>';
                break;
        }
        controlHtml = controlHtml.replace(/\{\{xtype\}\}/g, attr.xtype)
            .replace(/\{\{name\}\}/g, attr.name)
            .replace(/\{\{dataType\}\}/g, attr.dataType)
            .replace(/\{\{inputReadonly\}\}/g, attr.inputReadonly)
            .replace(/\{\{caption\}\}/g, attr.caption);
        controlHtml = controlHtml.replace(/\{\{url\}\}/g, attr.url ? ('data-url="' + attr.url + '"') : '');
        controlHtml = controlHtml.replace(/\{\{format\}\}/g, attr.format ? ('data-format="' + attr.format + '"') : '');
        controlHtml = controlHtml.replace(/\{\{JSONParam\}\}/g, attr.JSONParam ? ('data-jsonparam="' + encodeURI(JSON.stringify(attr.JSONParam)) + '"') : '');
        controlHtml = controlHtml.replace(/\{\{checkType\}\}/g, attr.checkType ? ('data-checktype="' + encodeURI(JSON.stringify(attr.checkType)) + '"') : '');
        controlHtml = controlHtml.replace(/\{\{dataSize\}\}/g, attr.dataSize ? ('data-size="' + attr.dataSize + '"') : '');
        controlHtml = controlHtml.replace(/\{\{checkSize\}\}/g, attr.checkSize ? ('data-checksize="' + attr.checkSize + '"') : '');
        controlHtml = controlHtml.replace(/\{\{checkExp\}\}/g, attr.checkExp ? ('data-checkexp=' + encodeURI(attr.checkExp)) : '');
        return controlHtml;
    }


    _getAttr = function (item) {

        if(item.get("defaultValue")){
            _defaultValues[item.get("name")] = item.get("defaultValue");
        }

        return {
            xtype: item.get("xtype"),
            dataType: item.get("dataType"),
            caption: item.get("caption"),
            col: item.get("col") ? item.get("col") : 1,
            url: item.get("url"),
            name: item.get("name"),
            hidden: item.get("hidden"),
            placeholder: item.get("placeholder") ? item.get("placeholder") : '',
            inputReadonly: item.get("readonly") ? true : false,
            required: item.get("required") ? "bh-required" : "",
            checkType: item.get("checkType") ? item.get("checkType") : false,
            checkSize: item.get("checkSize"),
            dataSize: item.get("dataSize") ? item.get("dataSize") : 99999,
            checkExp: item.get("checkExp"),
            JSONParam: item.get("JSONParam") ? item.get("JSONParam") : {},
            format: item.get("format"),
            defaultValue: item.get("defaultValue")
        }
    };


    _emapFormDo = function (ids, cb) {
        if ($.isArray(ids)) {
            $(ids).each(function () {
                cb(this);
            })
        } else {
            cb(ids);
        }
    };


    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.emapForm = function (options, params) {
        var instance;
        instance = this.data('emapform');
        /**
         *判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
         */
        if (!instance) {
            return this.each(function () {
                if (options == 'destroy') {
                    return this;
                }
                return $(this).data('emapform', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') return instance[options](params);
        return this;
    };

    /**
     * 插件的默认值
     */
    $.fn.emapForm.defaults = {
        readonly: false, // 是否只读
        model: 'h', // 编辑表单样式  h  v
        size: 'M', // 表单尺寸
        cols: '3', // 只读表单 列数
        root: "", // emap根路径
        validate: true, // 是否开启校验
        renderByGroup: true // 按照分组渲染表单
    };
}).call(this);

$.fn.emapFormInputInit = function (opt) {
    //控件初始化

    var options = $.extend({}, {
        'root': ''
    }, opt);


    var ROOT = options.root;


    $(this).find('[xtype]:not(.bh-form-static)').each(function () {
        var _this = $(this);
        var dataAdapter;
        var inputOptions;
        var jsonParam;
        var inputParam = options.defaultOptions ? (options.defaultOptions[_this.attr('xtype')] || {}) : {};
        var xtype = _this.attr('xtype');
        switch (xtype) {
            case "select":
                inputOptions = $.extend({}, {
                    placeHolder: '请选择…',
                    source: [{
                        id: '',
                        name: '请选择...',
                        uid: ''
                    }],
                    displayMember: "name",
                    valueMember: "id",
                    itemHeight: 28,
                    // autoDropDownHeight: true,
                    filterable: true,
                    width: "100%",
                    filterPlaceHolder: "请查找",
                    searchMode: 'containsignorecase',
                    //checkboxes : true,    //qiyu 2016-1-2 默认的下拉不要多选
                    disabled: _this.data('disabled') ? true : false
                }, inputParam);
                _this.jqxDropDownList(inputOptions).on('open', function () {
                    var _this = $(this);
                    if (!_this.data('loaded')) {
                        var curVal = _this.val();
                        var selectDataAdapter = new $.jqx.dataAdapter({
                            url: _this.data("url"),
                            datatype: "json",
                            async: false,
                            root: "datas>code>rows",
                            formatData: function (data) {
                                if (_this.data('jsonparam')) {
                                    data = _this.data('jsonparam');
                                }
                                return data;
                            }
                        }, {
                            beforeLoadComplete: function (records) {
                                records.unshift({
                                    id: '',
                                    name: '请选择...',
                                    uid: ''
                                });
                            },
                            loadComplete: function (data) {
                                _this.data('loaded', true);
                            }
                        });
                        _this.jqxDropDownList({source: selectDataAdapter});
                        //2016-3-31 qiyu，重复加载数据了
                        //selectDataAdapter.dataBind();
                    }
                });
                break;
            case "multi-select":
                dataAdapter = new $.jqx.dataAdapter({
                    url: _this.data("url"),
                    datatype: "json",
                    root: "datas>code>rows",
                    beforeLoadComplete: function (records) {
                        if (!_this.data('initdata')) {
                            _this.data('initdata', records);
                        }
                        return records;
                    },
                    formatData: function (data) {
                        data.pageSize = 10;
                        data.pageNumber = 1;
                        data.queryopt = JSON.stringify({
                            "name": "name",
                            "value": _this.jqxComboBox('searchString'),
                            "builder": "include",
                            "linkOpt": "AND"
                        });
                        return data;
                    }

                });
                inputOptions = $.extend({}, {
                    placeHolder: '请选择…',
                    source: dataAdapter,
                    displayMember: "name",
                    multiSelect: true,
                    remoteAutoComplete: true,
                    autoDropDownHeight: true,
                    valueMember: "id",
                    width: "100%",
                    height: "26px",
                    disabled: _this.data('disabled') ? true : false,
                    search: function (searchString) {
                        dataAdapter.dataBind();
                    }
                }, inputParam);
                _this.jqxComboBox(inputOptions)
                    .on('keyup', 'input.jqx-combobox-input', function () {
                        var value = $(this).val();
                        if (value == "" && _this.jqxComboBox('getItems').length == 0) {
                            var initData = _this.data('initdata');
                            $(initData).each(function () {
                                _this.jqxComboBox('addItem', this);
                            });
                        }
                    });
                dataAdapter.dataBind();
                break;
            case "selecttable":
                inputOptions = $.extend({}, {
                    url: _this.data('url'),
                    width: '100%'
                }, inputParam);
                _this.emapDropdownTable(inputOptions);
                break;
            case "date-ym":
            case "date-local":
            case "date-full":
                inputOptions = $.extend({}, {
                    width: "100%",
                    disabled: _this.data('disabled'),
                    value: null,
                    formatString: 'yyyy-MM',
                    culture: 'zh-CN',
                    showFooter: true,
                    clearString: '清除',
                    todayString: '今天'
                }, inputParam)
                if (xtype == 'date-local') {
                    inputOptions.formatString = 'yyyy-MM-dd';
                } else if (xtype == 'date-full') {
                    inputOptions.formatString = _this.data('format') ? _this.data('format') : 'yyyy-MM-dd HH:mm';
                    inputOptions.showTimeButton = true;
                }
                inputOptions.formatString = _this.data('format') || inputOptions.formatString;
                _this.jqxDateTimeInput(inputOptions);
                if (xtype != 'date-full') {
                    _this.on("click", function () {
                        var disabled = $(this).jqxDateTimeInput('disabled');
                        if(!disabled)$(this).jqxDateTimeInput('open');
                    });
                }
                break;
            case "date-range":

                _this.bhTimePicker({
                    // range: {//可选，设置时间可选的范围
                    //     max: 'today',  //可选，设置时间的最大可选范围，可传入'today'表示今天，或传入时间字符串，格式如'2015/02/05'
                    //     min: '2015/02/05' //可选，设置时间的最小可选范围，可传入'today'表示今天，或传入时间字符串，格式如'2015/02/05'
                    // },
                    // time:{//可选，初始化时显示的时间范围
                    //     start: '2015/01/05', //必填，时间字符串，格式如'2015/02/05'
                    //     end: '2015/06/01'//必填，时间字符串，格式如'2015/02/05'
                    // },
                    // selected: function(startTime, endTime){ //可选，选择时间后的回调，返回的参数startTime是选择的开始时间，endTime是选择的结束时间，返回的是时间字符串格式如'2015/02/05'
                    // }
                });
                break;
            case "radiolist":

                /**
                 * 使用原生的控件实现
                 */
                if (_this.data('init')) {
                    break;
                }
                dataAdapter = new $.jqx.dataAdapter({
                    url: _this.data("url"),
                    datatype: "json",
                    async: false,
                    root: "datas>code>rows"
                }, {
                    loadComplete: function (records) {
                        var listHtml = '';
                        var random = '_' + parseInt(Math.random() * 1000);
                        $(records.datas.code.rows).each(function () {
                            //                                    listHtml += '<div xtype=""></div>';
                            listHtml += '<label>' +
                                '<input type="radio" name="' + _this.data('name') + '" value="' + this.id + '" />' +
                                '<i class="bh-choice-helper"></i>' + this.name +
                                '</label>';
                        });
                        _this.html(listHtml).data('init', true);
                    }
                });
                dataAdapter.dataBind();

                break;
            case "checkboxlist":

                /**
                 * 使用原生的控件实现
                 */
                if (_this.data('init')) {
                    break;
                }
                dataAdapter = new $.jqx.dataAdapter({
                    url: _this.data("url"),
                    datatype: "json",
                    async: false,
                    root: "datas>code>rows"
                }, {
                    loadComplete: function (records) {
                        var listHtml = '';
                        var random = '_' + parseInt(Math.random() * 1000);
                        $(records.datas.code.rows).each(function () {
                            //                                    listHtml += '<div xtype=""></div>';
                            listHtml += '<label>' +
                                '<input type="checkbox" name="' + _this.data('name') + '" value="' + this.id + '" />' +
                                '<i class="bh-choice-helper"></i>' + this.name +
                                '</label>';
                        });
                        _this.html(listHtml).data('init', true);
                    }
                });
                dataAdapter.dataBind();

                break;
            case "tree":
                inputOptions = $.extend({}, {
                    url: _this.data('url'),
                    checkboxes: false
                }, inputParam);
                _this.emapDropdownTree(inputOptions);
                if (_this.data('disabled')) {
                    _this.emapDropdownTree('disable');
                    var formGroup = _this.closest('.bh-form-group');
                    if (formGroup.length > 0) {
                        formGroup.addClass('disabled')
                    }
                }
                break;
            case "switcher":
                inputOptions = $.extend({}, {
                    checked: false,
                    onLabel: '是',
                    offLabel: '否'
                }, inputParam);
                _this.jqxSwitchButton(inputOptions);
                //_this.jqxSwitchButton('uncheck');
                break;
            //qiyu 2016-1-2 增加上传组件类型
            case "uploadfile":
            case "uploadphoto":
            case "uploadsingleimage":
            case "uploadmuiltimage":
                jsonParam = JSON.parse(decodeURI(_this.data('jsonparam')));
                inputOptions = $.extend({}, {contextPath: ROOT}, inputParam);
                $.extend(inputOptions, jsonParam);
                if (xtype == 'uploadfile') {
                    _this.emapFileUpload(inputOptions);

                } else if (xtype == 'uploadphoto') {
                    _this.emapFilePhoto(inputOptions);
                } else if (xtype == 'uploadsingleimage') {
                    _this.emapSingleImageUpload(inputOptions);
                } else if (xtype == 'uploadmuiltimage') {
                    _this.emapImageUpload(inputOptions);
                }
                if (_this.data('disabled') == true) {
                    $('input[type=file]', _this).attr('disabled', true);
                }
                break;
            case "buttonlist":
                inputOptions = $.extend({}, {
                    url: _this.data('url'),
                    allOption: _this.data('alloption')
                    //initComplete:
                }, inputParam);
                _this.bhButtonGroup(inputOptions);
                break;
            case "div":
            case "textarea":
                break;
            default:
                _this.jqxInput({width: '100%'});
                break;
        }
    });
};

/**
 * 类似于纵向tab页签
 */
(function($) {
	/**
	 * 定义一个插件
	 */
	var Plugin;

	var currentView = 'table';
	var gParams = {};
	var gPageNumber = null;
	var gPageSize = null;

	/**
	 * 这里是一个自运行的单例模式。
	 */
	Plugin = (function() {

		/**
		 * 插件实例化部分，初始化时调用的代码可以放这里
		 */
		function Plugin(element, options) {
			//将插件的默认参数及用户定义的参数合并到一个新的obj里
			this.settings = $.extend({}, $.fn.emapGrid.defaults, options);
			//将dom jquery对象赋值给插件，方便后续调用
			this.$element = $(element);
			init(this.settings, this.$element);
		}

		return Plugin;

	})();

	Plugin.prototype = {
		/**
		 * 重新加载数据
		 * @param  {[type]} params [description]
		 * @return {[type]}        [description]
		 */
		reload: function(params, callback) {
			gParams = params || gParams;
			if (callback === true) {
				gPageNumber = 0;
			}
			switchGrid(currentView, this.settings, this.$element, params);
		},

		getTable: function() {
			return this.$element.find('.bh-grid-table');
		},

		getCard: function() {
			return this.$element.find('.bh-grid-card');
		},

		getType: function() {
			return currentView;
		}
	};

	function init(settings, $element) {
		layout($element);
		switchGrid('list', settings, $element);
		bindEvent(settings, $element);
	}

	function bindEvent(settings, $element) {
		$element.find('.bh-switch-item').click(function(event) {
			var type = $(event.currentTarget).attr('data-x-type');
			$('.bh-switch-item').removeClass('bh-active');
			$(event.currentTarget).addClass('bh-active');
			switchGrid(type, settings, $element);
			settings.gridAfterSwitch && settings.gridAfterSwitch(type);
		});
		$element.find('.bh-grid-table').on('pageSizeChanged', function(event) {
			var args = event.args;
			gPageNumber = args.pagenum;
			gPageSize = args.pageSize;
		});

		$element.find('.bh-grid-table').on('pageChanged', function(event) {
			var args = event.args;
			gPageNumber = args.pagenum;
			gPageSize = args.pageSize;
		});
	}

	function switchGrid(type, settings, $element, callback) {
		currentView = type;
		if (type == 'list') {
			if ($element.find('.bh-grid-table').prop('rendered')) {
				$element.find('.bh-grid-table').jqxDataTable({
					pageSize: gPageSize || 12
				});
				$element.find('.bh-grid-table').jqxDataTable('goToPage', gPageNumber || 0);
				$element.find('.bh-grid-table').emapdatatable(true).source.data = gParams;
				$element.find('.bh-grid-table').jqxDataTable('updateBoundData');
				//$element.find('.bh-grid-table').emapdatatable('reload', gParams);

			} else {
				renderTable(settings, $element);
			}
			$element.find('.bh-grid-table').show();
			$element.find('.bh-grid-card').hide();
			settings.afterCardRender && settings.afterCardRender();
		} else if (type == 'card') {
			gParams.pageSize = gPageSize;
			gParams.pageNumber = gPageNumber === 0 ? gPageNumber + '' : gPageNumber;
			if ($element.find('.bh-grid-card').prop('rendered')) {
				$element.find('.bh-grid-card').emapCard('reload', gParams);
			} else {
				renderCard(settings, $element);
			}
			$element.find('.bh-grid-table').hide();
			$element.find('.bh-grid-card').show();
		}
	}

	function layout($element) {

		var _html =
			'<div class="bh-grid-container">' +
			'	<div class="bh-switch-card-view">' +
			'   	<span class="bh-switch-item bh-switch-list bh-active" data-x-type="list"><i class="iconfont icon-viewlist"></i><span>列表</span></span>' +
			'   	<span class="bh-switch-item bh-switch-card" data-x-type="card"><i class="iconfont icon-viewmodule"></i><span>卡片</span></span>' +
			'	</div>' +
			'	<div class="bh-grid-table"></div>' +
			'	<div class="bh-grid-card"></div>' +
			'</div>';

		$element.html(_html);
	}

	function renderTable(settings, $element) {
		var tableOptions = $.extend({}, settings);
		delete tableOptions.template;
		delete tableOptions.cardAfterRender;
		delete tableOptions.gridAfterSwitch;
		delete tableOptions.cardBeforeRender;
		tableOptions.pageSize = gPageSize || 12;
		tableOptions.pageSizeOptions = [12, 24, 48, 96];
		$element.find('.bh-grid-table').prop('rendered', true);
		$element.find('.bh-grid-table').emapdatatable(tableOptions);
	}

	function renderCard(settings, $element) {
		settings.params = gParams;
		settings.pageSize = gPageSize;
		settings.pageNumber = gPageNumber;
		settings.pageSizeOptionsChange = function(pageSize, pageNumber) {
			gPageSize = pageSize;
			gPageNumber = pageNumber;
		}
		$element.find('.bh-grid-card').prop('rendered', true);
		$element.find('.bh-grid-card').emapCard(settings);
	}

	/**
	 * 这里是关键
	 * 定义一个插件 plugin
	 */
	$.fn.emapGrid = function(options, params, callback) {
		var instance;
		instance = this.data('emapGrid');
		/**
		 * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
		 */
		if (!instance) {
			return this.each(function() {
				//将实例化后的插件缓存在dom结构里（内存里）
				return $(this).data('emapGrid', new Plugin(this, options));
			});
		}
		if (options === true) return instance;
		/**
		 * 优雅处： 如果插件的参数是一个字符串，则 调用 插件的 字符串方法。
		 * 如 $('#id').plugin('doSomething') 则实际调用的是 $('#id).plugin.doSomething();
		 * doSomething是刚才定义的接口。
		 * 这种方法 在 juqery ui 的插件里 很常见。
		 */
		if ($.type(options) === 'string') {
			return instance[options](params, callback);
		}
		return this;
	};

	/**
	 * 插件的默认值
	 */
	$.fn.emapGrid.defaults = {
		/**
		 * [cardBeforeRender 每个card渲染前执行的事件(此事件中可以在渲染前对数据做处理，入参为row)]
		 * @type {[type]}
		 */
		cardBeforeRender: null,

		/**
		 * [cardAfterRender card渲染结束后执行的事件]
		 * @type {[type]}
		 */
		cardAfterRender: null,

		/**
		 * [gridAfterSwitch card list 切换后执行的事件]
		 * @type {[type]}
		 */
		gridAfterSwitch: null


	};
})(jQuery);
//  多图上传
(function () {
    var Plugin;
    var fileReader = 'FileReader' in window;
    var _init, _getLimitInfo, _refreshFileInput; //私有方法

    Plugin = (function () {
        // 实例化部分
        function Plugin(element, options) {
            this.options = $.extend({}, $.fn.emapImageUpload.defaults, options);
            this.$element = $(element);

            _init(this.$element, this.options);

        }

        // 公共方法
        Plugin.prototype.getFileToken = function () {
            return this.options.fileInput.emapUploadCore('getFileToken');
        };

        // 返回token下已有的正式文件的url数组
        Plugin.prototype.getFileUrl = function () {
            return  this.options.fileInput.emapUploadCore('getFileToken');
        };

        Plugin.prototype.saveTempFile = function () {
            var options = this.options;
            var result = this.options.fileInput.emapUploadCore('saveTempFile');
            // 将临时文件下载地址替换为正式文件下载地址
            $('.bh-file-img-block img', this.$element).each(function(){
                var src = $(this).attr('src');
                var imgBlock = $(this).closest('.bh-file-img-block');
                if (new RegExp('getTempFile').test(src)) {
                    var fileId = imgBlock.data('fileid');
                    $(this).attr('src', options.contextPath + '/sys/emapcomponent/file/getAttachmentFile/' + fileId + '.do');
                }
            });
            return result;
        };
        Plugin.prototype.destroy = function () {
            this.options = null;
            $(this.$element).data('plugin', false).empty();
        };

        // 私有方法
        _init = function (element, options) {
            var imgWidth = parseInt(options.width) - 6;
            var imgHeight = parseInt(options.height) - 6;

            $(element).addClass('bh-clearfix').append('<p class="bh-file-img-info"></p>' +
                '<div class="bh-file-img-container">' +
                '<div class="bh-file-img-input bh-file-img-block" style="width: ' + options.width + 'px;height: ' + options.height + 'px;">' +
                '<span>' +
                '<span class="bh-file-img-plus">+</span>' +
                '<span class="bh-file-img-text">点击上传</span>' +
                '</span>' +
                '<input type="file" ' + (options.multiple ? 'multiple' : '') + '>' +
                '</div>' +
                '</div>');

            options.fileInput = $('input[type=file]', element).parent();

            // 生成描述信息
            var introText = '请上传图片';
            if (options.type && options.type.length > 0) {
                introText += ', 支持' + options.type.join(',').toUpperCase() + '类型';
            }

            if(options.size && options.size > 0) {
                introText += ',大小在' + options.size + 'K以内';
            }

            if(options.limit && options.limit > 0) {
                introText += ',数量在' + options.limit + '以内';
            }


            $('.bh-file-img-info', element).html(introText);

            if (options.height <= 100) {
                $('.bh-file-img-text', element).hide();
            }


            // 获取token下已有的文件
            if (!options.newToken) {
                $.ajax({
                    type: "post",
                    url: options.contextPath + '/sys/emapcomponent/file/getUploadedAttachment/' + options.token + '.do',
                    dataType: "json",
                    success: function (res) {
                        if (res.success) {
                            // console.log(res)
                            var itemHtml = '';
                            $(res.items).each(function(){
                                itemHtml += '<div class="bh-file-img-block saved" data-fileid="' + this.id + '" style="width: ' + options.width + 'px;height: ' + options.height + 'px;">' +
                                    '<div class="bh-file-img-loading" style="line-height: ' + imgHeight + 'px;">上传中...</div>' +
                                    '<div class="bh-file-img-fail"></div>' +
                                    '<div class="bh-file-img-table" style="width: ' + imgWidth + 'px;height: ' + imgHeight + 'px;">' +
                                    '<span style="width: ' + imgWidth + 'px;height: ' + imgHeight + 'px;">' +
                                    '<img src="' + this.fileUrl + '" style="max-width: ' + imgWidth + 'px;max-height: ' + imgHeight + 'px;" />' +
                                    '</span>' +
                                    '</div>' +
                                    '<a href="javascript:void(0)" class="bh-file-img-delete">删除</a>' +
                                    '</div>';
                            });
                            $('.bh-file-img-input', element).before(itemHtml);
                        }
                    }
                });
            }


            options.fileInput.emapUploadCore($.extend({}, options, {
                add: function (e, data) {
                    var files = data.files;
                    var tmp = new Date().getTime();

                    $(files).each(function (i) {
                        data.files[i].bhId = tmp + i;

                        $('.bh-file-img-input', element).before('<div class="bh-file-img-block loading" data-bhid="' + data.files[i].bhId + '" style="width: ' + options.width + 'px;height: ' + options.height + 'px;">' +
                            '<div class="bh-file-img-loading" style="line-height: ' + imgHeight + 'px;">上传中...</div>' +
                            '<div class="bh-file-img-fail"></div>' +
                            '<div class="bh-file-img-table" style="width: ' + imgWidth + 'px;height: ' + imgHeight + 'px;">' +
                            '<span style="width: ' + imgWidth + 'px;height: ' + imgHeight + 'px;">' +
                            '<img style="max-width: ' + imgWidth + 'px;max-height: ' + imgHeight + 'px;" />' +
                            '</span>' +
                            '</div>' +
                            '<a href="javascript:void(0)" class="bh-file-img-delete">删除</a>' +
                            '</div>');
                    });

                    if (options.add) {
                        options.add(e, data);
                    }
                    data.submit();

                },
                submit: function (e, data) {
                    var file = data.files[0];
                    var imgBlock = $('.bh-file-img-block[data-bhid=' + file.bhId + ']', element);

                    // 文件数量限制的校验
                    if (options.limit) {
                        var currentCount = $('.bh-file-img-block', element).length - 1;
                        if (currentCount > options.limit) {
                            imgBlock.removeClass('loading').addClass('error').find('.bh-file-img-fail').html('文件数量超出限制');
                            return false;
                        }
                    }

                    // 文件的大小 和类型校验
                    if (options.type && options.type.length > 0) {
                        if (!new RegExp(options.type.join('|').toUpperCase()).test(file.name.toUpperCase())) {
                            imgBlock.removeClass('loading').addClass('error').find('.bh-file-img-fail').html('文件类型不正确');
                            return false;
                        }
                    }

                    if (fileReader && options.size) {
                        if (file.size / 1024 > options.size) {
                            imgBlock.removeClass('loading').addClass('error').find('.bh-file-img-fail').html('文件大小超出限制');
                            return false;
                        }
                    }
                    imgBlock.data('xhr', data);

                    if (options.submit) {
                        options.submit(e, data);
                    }
                },
                done: function (e, data) {
                    var file = data.files[0];
                    var imgBlock = $('.bh-file-img-block[data-bhid=' + file.bhId + ']', element);

                        // 上传成功
                        imgBlock.removeClass('loading').addClass('success');

                        $('img', imgBlock).attr('src', data.result.tempFileUrl);
                        imgBlock.data({
                            'fileid' : data.result.id,
                            'deleteurl' : data.result.deleteUrl
                        });
                    if (options.done) {
                        options.done(e, data)
                    }
                },
                fail: function (e, data) {
                    var file = data.files[0];
                    var imgBlock = $('.bh-file-img-block[data-bhid=' + file.bhId + ']', element);
                    imgBlock.removeClass('loading').addClass('error').find('.bh-file-img-fail').html(data.result.error ? data.result.error : '上传失败');
                    if (options.fail) {
                        options.fail(e, data)
                    }
                }
            }));


            // 删除事件绑定
            $(element).on('click', '.bh-file-img-delete', function(){
                var imgBlock = $(this).closest('.bh-file-img-block');
                if (imgBlock.hasClass('success')) {
                    // 删除临时文件
                    options.fileInput.emapUploadCore('deleteTempFile', {
                        url: imgBlock.data('deleteurl'),
                        fileId: imgBlock.data('fileid'),
                        done: function (data) {
                            imgBlock.remove();
                        }
                    });

                } else if(imgBlock.hasClass('error')) {
                    // 错误文件直接删除
                    imgBlock.remove();
                } else if(imgBlock.hasClass('loading')) {
                    //  删除正在上传的文件
                    imgBlock.data('xhr').abort();
                    imgBlock.remove();
                } else if(imgBlock.hasClass('saved')){
                    // 删除正式文件
                    options.fileInput.emapUploadCore('deleteArrAdd', imgBlock.data('fileid'));

                    imgBlock.remove();
                }

            });
        };

        // 刷新上传控件的显示或隐藏
        _refreshFileInput = function(element, options) {
            var currentCount = $('.bh-file-img-block', element).length - 1;
            var fileInput = $('.bh-file-img-input', element);
            if (currentCount >= options.limit) {
                // 数量达到上限 上传控件隐藏
                fileInput.hide();
            } else {
                // 数量未达到上限 上传控件显示
                fileInput.show();
            }
        };

        // 定义插件
        $.fn.emapImageUpload = function (options, params) {
            var instance;
            instance = this.data('plugin');

            // 判断是否已经实例化
            if (!instance) {
                return this.each(function () {
                    if (options == 'destroy') {
                        return this;
                    }
                    return $(this).data('plugin', new Plugin(this, options));
                });
            }
            if (options === true) {
                return instance;
            }
            if ($.type(options) === 'string') {
                return instance[options](params);
            }
        };

        // 插件的默认设置
        $.fn.emapImageUpload.defaults = {
            multiple: false,
            dataType: 'json',
            storeId: 'image',
            width: 200,
            height: 150,
            type: ['jpg', 'png', 'bmp'],
            size: 0
        };


    })();

}).call(this);
/**
 * opt
 *
 * app
 * module
 * page
 * action
 * preCallback
 * importCallback
 * closeCallback
 * autoClose
 * tplUrl
 *
 */

$.emapImport = function(opt) {
    opt.content = '<div class="bh-import-content">' +
        '<div class="bh-import-step active">' +
        '<h5 class="bh-import-step-title">' +
        '<span>1</span>' +
        '上传文件' +
        '</h5>' +

        '<div class="bh-import-step-content bh-import-step1-content">' +
        '<a href="javascript:void(0)" class="bh-btn bh-btn-primary bh-import-input-a">' +
        '开始上传' +
        '<input type="file" role="fileInput"/>' +
        '</a>' +

        '<p class="bh-color-caption bh-import-p bh-import-step1-intro">如果您是初次使用，建议您<a role="downTplBtn" href="javascript:void(0)">下载导入模板</a>进行查看。' +
        '</p>' +
        '</div>' +
        '<div class="bh-import-step-content bh-import-step1-content" style="display: none;">' +
        '<a href="javascript:void(0)" role="importConfirmBtn" class="bh-btn bh-btn-primary bh-pull-right">' +
        '确认上传' +
        '</a>' +
        '<a href="javascript:void(0)" class="bh-pull-right bh-import-reload-a" role="reImportBtn">重新上传</a>' +

        '<p class="bh-color-caption bh-import-p  bh-import-step1-file">' +
        '<span class="bh-import-file-name">2015级教职工统计表.docx</span>' +
        '<span class="bh-import-file-size"></span>' +
        '</p>' +

        '</div>' +
        '</div>' +
        '<div class="bh-import-step ">' +
        '<h5 class="bh-import-step-title">' +
        '<span>2</span>' +
        '导入数据' +
        '</h5>' +

        '<div class="bh-import-step-content">' +
        '<p class="bh-import-step2-intro">等待文件上传完毕后自动导入数据</p>' +

        '<div class="bh-import-step2-content">' +
        '<div class="bh-import-loading-bar">' +
        '<div></div>' +
        '</div>' +
        '<p class="bh-import-step2-count"></p>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<div class="bh-import-step ">' +
        '<h5 class="bh-import-step-title">' +
        '<span>3</span>' +
        '完成' +
        '</h5>' +

        '<div class="bh-import-step-content bh-import-step3-content">' +
        '<button role="closeConfirmBtn" class="bh-btn bh-btn-primary bh-pull-right">确定关闭</button>' +
        '<p class="bh-import-result-detail">该文件全部导入数据10000条，其中失败导入2条</p>' +
        '<p>具体结果可查看<a class="bh-import-export" href="javascript:void(0)">下载导入结果</a>查看明细。</p>' +
        '</div>' +
        '</div>' +
        '</div>';



    // var fileLayer = layer.open({
    //     type: 1,
    //     title: '导入数据',
    //     closeBtn: 1, //不显示关闭按钮
    //     area: ['480px', '380px'],
    //     shift: 2,
    //     shadeClose: false, //开启遮罩关闭
    //     content: opt.content,
    //     success: function(layer, index) {
    //         if (opt.preCallback && opt.preCallback != "") {
    //             opt.preCallback();
    //         }
    //         opt.layer = index;
    //         $("#fileInput").emapImportData(opt);
    //     },
    //     cancel: function() {
    //         if ($("#daoru").data("loading")) {
    //             var fileConfirm = layer.confirm('数据正在传输中，关闭窗口将丢失，确认关闭吗？',
    //                 function() {
    //                     layer.close(fileLayer);
    //                     layer.close(fileConfirm);
    //                 }
    //             );
    //             return false;
    //         }
    //     }
    // });

    BH_UTILS.bhWindow(opt.content, '导入数据', {}, {
        close: function(){
            if (opt.closeCallback && opt.closeCallback != "") {
                opt.closeCallback();
            }
        }
    });
    if (opt.preCallback && opt.preCallback != "") {
        opt.preCallback();
    }
    $("[role=fileInput]").emapImportData(opt);
};

/**
 * opt
 *
 * app
 * module
 * page
 * action
 * importCallback
 * closeCallback
 *
 */

$.fn.emapImportData = function(opt) {
    // 下载导入模板参数
    var $element = $(this).closest('.bh-import-content');
    var downTplData = {
        "app": opt.app, // *
        "module": opt.module, // *
        "page": opt.page, // *
        "action": opt.action, // *
        "storeId": opt.storeId ? opt.storeId : 'imexport'
    };
    var contextPath = opt.contextPath;
    var scope, token;

    if (opt.params) {
        $.extend(downTplData, opt.params);
    }
    scope = Date.parse(new Date());
    token = scope + 1;
    $(this).fileupload({
        autoUpload: false, //是否自动上传
        url: contextPath + '/sys/emapcomponent/file/uploadTempFile/' + scope + '/' + token + '.do', //上传地址
        dataType: 'json',
        formData: {
            storeId: (opt.storeId ? opt.storeId : 'file')
        },
        add: function(e, data) {

            var file = data.files;
            var step1Contents = $(this).closest(".bh-import-step").find(".bh-import-step-content");
            if (e.target.files) {
                step1Contents.eq(0).hide();
                step1Contents.eq(1).show();
                //类型校验  必须为excel文件
                var fileType = file[0].name.split('.');
                if (!new RegExp('xlsx|xlsm|xltx|xltm|xlsb|xlam|xls').test(fileType[fileType.length -1].toLowerCase())) {
                    step1Contents.eq(1).find("span.bh-import-file-name").html('<span class="bh-color-danger">请上传正确的Ecxel文件</span>').attr("title", file[0].name);
                    $("[role=importConfirmBtn]", $element).attr('disabled', true);
                    return false;
                }
                step1Contents.eq(1).find("span.bh-import-file-name").text(file[0].name).attr("title", file[0].name);
                step1Contents.eq(1).find("span.bh-import-file-size").text("(" + parseInt(file[0].size / 1024) + "k)");
                $("[role=importConfirmBtn]", $element).attr('disabled', false);
            }

            $("[role=importConfirmBtn]", $element).unbind("click").bind("click", function() {
                $("[role=fileInput]", $element).data("loading", true);
                var stepContent = $(this).closest(".bh-import-step-content");
                stepContent.children("a").hide();
                stepContent.prepend('<div class="bh-import-step1-loading-block bh-pull-right"><div class="sk-spinner sk-spinner-fading-circle bh-pull-right" style="height: 28px; width: 28px;">' +
                    '<div class="sk-circle1 sk-circle"></div>' +
                    '<div class="sk-circle2 sk-circle"></div>' +
                    '<div class="sk-circle3 sk-circle"></div>' +
                    '<div class="sk-circle4 sk-circle"></div>' +
                    '<div class="sk-circle5 sk-circle"></div>' +
                    '<div class="sk-circle6 sk-circle"></div>' +
                    '<div class="sk-circle7 sk-circle"></div>' +
                    '<div class="sk-circle8 sk-circle"></div>' +
                    '<div class="sk-circle9 sk-circle"></div>' +
                    '<div class="sk-circle10 sk-circle"></div>' +
                    '<div class="sk-circle11 sk-circle"></div>' +
                    '<div class="sk-circle12 sk-circle"></div>' +
                    '</div>' +
                    '<p class="bh-pull-right" style="margin-right: 12px;line-height:28px;">上传中……</p></div>');
                data.submit();
            });
        },
        done: function(e, data) { //设置文件上传完毕事件的回调函数
            if (data.result.success) {
                var mid = data.result.id;
                downTplData.attachment = data.result.id;
                $.ajax({
                    type: "post",
                    url: contextPath + '/sys/emapcomponent/file/saveAttachment/' + scope + '/' + token + '.do',
                    data: {
                        attachmentParam: JSON.stringify({
                            scope: scope,
                            fileToken: token,
                            attachmentParam: {
                                storeId: downTplData.storeId
                            }
                        })
                    },
                    success: function(json) {
                        $.ajax({
                            type: "post",
                            url: contextPath + '/sys/emapcomponent/imexport/importRownum.do',
                            data: $.extend(downTplData, {
                                "app": downTplData.app,
                                "attachment": mid
                            }),
                            success: function(json) {
                                $(".bh-import-step2-count", $element).html('本次共导入数据' + JSON.parse(json).rowNumber + '条');
                                $(".bh-import-step1-content", $element).find("div.bh-import-step1-loading-block").remove();
                                $("div.bh-import-step:eq(1)", $element).addClass("active");
                                $(".bh-import-loading-bar div", $element).animate({
                                    "width": "87%"
                                }, 3000);
                                $.ajax({
                                    type: "post",
                                    url: contextPath + '/sys/emapcomponent/imexport/import.do',
                                    data: downTplData,
                                    success: function(json) {
                                        var json = JSON.parse(json);
                                        if (json.status == 1) {
                                            $(".bh-import-loading-bar div", $element).stop().animate({
                                                "width": "100%"
                                            }, 500, function() {
                                                if (opt.importCallback && opt.importCallback != "") {
                                                    var data = $.extend({
                                                        "total": json.total,
                                                        "success": json.success,
                                                        "callback": null
                                                    }, opt.importCallback(json.total, json.success));
                                                    importSuccess(data.total, data.success, data.callback);

                                                } else {
                                                    importSuccess(json.total, json.success, function(a) {
                                                        //a.attr("href", contextPath + "/sys/emapcomponent/file/getAttachmentFile/" + json.attachment + ".do");
                                                    });
                                                }
                                                $("div.bh-import-step:eq(2)", $element).find(".bh-import-export").attr("href", contextPath + "/sys/emapcomponent/file/getAttachmentFile/" + json.attachment + ".do");
                                                if (opt.autoClose == true) {
                                                    BH_UTILS.bhWindow.close();
                                                }
                                            });
                                        } else {
                                            $("[role=fileInput]", $element).data("loading", false);
                                            $("div.bh-import-step-content:eq(2)", $element).html('<p></p>');
                                            $("div.bh-import-step:eq(2)", $element).addClass("active").find(".bh-import-result-detail").html('<span style="color: red">导入失败</span>');
                                        }
                                    }
                                });
                            },
                            error: function(e) {}
                        });
                    }
                });
            }
        }
    });
    // 点击重新上传
    $("[role=reImportBtn]", $element).on("click", function() {
        $("[role=fileInput]", $element).click();
    });

    // 点击确定关闭
    $("[role=closeConfirmBtn]", $element).on("click", function() {
        //if (opt.closeCallback && opt.closeCallback != "") {
        //    opt.closeCallback();
        //}
        BH_UTILS.bhWindow.close();
    });

    // 点击下载模板
    $("[role=downTplBtn]", $element).on("click", function() {
        if (opt.tplUrl && opt.Url != "") {
            location.href = opt.tplUrl;
        } else {
            $.ajax({
                type: "post",
                url: contextPath + '/sys/emapcomponent/imexport/importTemplate.do',
                data: downTplData,
                success: function(json) {
                    location.href = (contextPath + '/sys/emapcomponent/file/getAttachmentFile/' + JSON.parse(json).attachment + '.do');
                },
                error: function(e) {
                    console.log(e)
                }
            });
        }

    });

    function importSuccess(totalNum, successNum, callback) {
        $("[role=fileInput]", $element).data("loading", false);
        $("div.bh-import-step-content:eq(2)", $element).html('<p>数据导入完成</p>');
        $("div.bh-import-step:eq(2)", $element).addClass("active").find(".bh-import-result-detail").html("该文件全部导入数据" + totalNum + "条，其中失败导入" + (totalNum - successNum) + "条");
        if (callback && callback != "") {
            callback($("div.bh-import-step:eq(2)", $element).find(".bh-import-export"));
        }
    }
};

/**
 * 将插件封装在一个闭包里面，防止外部代码污染  冲突
 */
(function () {
    /**
     * 定义一个插件
     */
    var Plugin,
        _render;  //插件的私有方法

    /**
     * 这里是一个自运行的单例模式。
     *
     */
    Plugin = (function () {

        /**
         * 插件实例化部分，初始化时调用的代码可以放这里
         */
        function Plugin(element, options) {
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.emapRepeater.defaults, options);
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            _render(this.$element, this.settings);
        }

        /**
         * 插件的公共方法，相当于接口函数，用于给外部调用
         */
        Plugin.prototype.getValue = function () {
            /**
             * 方法内容
             */
            var returnValue = [];
            $(this.$element).find(".repeateritem").each(function(){
                var v = $(this).data("value");
                if(v !== undefined)
                  returnValue.push($(this).data("value"));
            });
            this.$element.val(returnValue);
        };

        Plugin.prototype.setValue = function (valueArray) {
            /**
             * 方法内容
             */
            //this.$element.val(valueArray);
            $(this.$element).find(".repeateritem").each(function(){
                //var v = $(this).data("value");
                $(this).trigger("setValue", [valueArray]);
            });

        };

        return Plugin;

    })();

    /**
     * 插件的私有方法
     */
    _render = function (element, options) {
        var $element = element;
        var source =
        {
            datatype: "json",
            root:"datas>code>rows",
            datafields: [
                { name: 'id' },
                { name: 'name' }
            ],
            id: 'id',
            url: options.url,
            data: options.params
        };
        var dataAdapter = new $.jqx.dataAdapter(source, {
            loadComplete: function () {
                var records = dataAdapter.records;
                for (var i = 0; i < records.length; i++) {
                    var item = records[i];
                    var itemDOM = $("<div class='repeateritem'></div>");
                    if(options.align == "horizontal")itemDOM.css({"float":"left"});
                    options.render(itemDOM, item);
                    $element.append(itemDOM);
                }
            }
        });
        dataAdapter.dataBind();
    };

    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.emapRepeater = function (options, params) {
        var instance;
        instance = this.data('emapRepeater');
        /**
         *判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
         */
        if (!instance) {
            return this.each(function () {
                //将实例化后的插件缓存在dom结构里（内存里）
                return $(this).data('emapRepeater', new Plugin(this, options));
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
    $.fn.emapRepeater.defaults = {
        align: "vertical",
        itemWidth: '50%'
    };
}).call(this);

'use strict';
(function () {
    //定义html和css

    var tpl = '<div class="bh-ers-j-condition"></div>' +
        '<div class="bh-ers-add bh-ph-8 bh-ers-j-add-btn">' +
        '<i class="iconfont icon-addcircle"></i>' +
        '<span>添加条件</span>' +
        '</div>';

    var Plugin;

    Plugin = (function () {
        function Plugin(element, options) {
            this.options = $.extend({}, $.fn.emapRuleSetting.defaults, options);
            this.$element = $(element);
            _create(this.$element, this.options);
        }

        Plugin.prototype.getValue = function () {
            return getCondition(this.$element, this.options);
        };

        Plugin.prototype.setValue = function (val) {
            var value;
            var _this = this;
            $('.bh-ers-j-condition', _this.$element).empty();
            if (!val || val == null || val == "") {return}
            if (typeof val == 'string') {
                value = JSON.parse(val);
            } else {
                value = val;
            }
            if (value.length && value.length > 0) {
                $(value).each(function () {
                    addCondition(_this.$element, _this.options, this);
                });
            }
        };
        return Plugin;
    })();


    //生成dom
    function _create(element, options) {
        element.html(tpl);
        _eventListener(element, options);
    }

    //事件注册
    function _eventListener(element, options) {
        //  添加条件
        $('.bh-ers-j-add-btn', element).on('click', function () {
            addCondition(element, options);
        });

        // 删除
        element.on('click', '.bh-ers-close', function () {
            var $this = $(this);
            BH_UTILS.bhDialogWarning({
                title: '确定要删除该条件吗？',
                buttons: [{
                    text: '确定', className: 'bh-btn-warning',
                    callback: function callback() {
                        $this.parent().remove();
                    }
                }, {text: '取消', className: 'bh-btn-default'}]
            });
        });

        // select change
        element.on('change', '.bh-ers-select .bh-ers-nice-select', function () {
            var row = $(this).closest('.bh-ers-row');
            var model = options.data.controls;
            var value = $(this).val();
            var selectedModel = model.filter(function (item) {
                return item.name == value;
            })[0];
            renderRow(options, selectedModel, row);
        });
    }

    // 添加一个搜索条件
    function addCondition(element, options, value) {
        var row = $('<div class="bh-clearfix bh-ers-row" ></div>');
        var selectModel = options.data.controls;
        row.append('<div class="' + (options.showBuilder ? 'bh-ers-col-3' : 'bh-ers-col-2') + '"><div class="bh-ers-select"></div></div>');
        if (options.showBuilder) {
            row.append('<div class="bh-ers-col-3"><div class="bh-ers-builder"></div></div>');
        }
        row.append('<div class="' + (options.showBuilder ? 'bh-ers-col-3' : 'bh-ers-col-2') + '"><div class="bh-ers-option"></div></div>');
        row.append('<i class="iconfont icon-close bh-ers-close"></i>');

        renderSelect({
            dom: $('.bh-ers-select', row),
            source: selectModel
        });
        $('.bh-ers-j-condition', element).append(row);
        if (value) {
            var valueModel = selectModel.filter(function (val) {
                return val.name == value.name;
            })[0];
            $('.bh-ers-select select', row).val(value.name);
            renderRow(options, valueModel, row);
        } else {
            renderRow(options, selectModel[0], row);
        }
        if (value) {
            $('.bh-ers-builder select', row).val(value.builder);
            $('.bh-ers-option select, .bh-ers-option input', row).val(value.value);
        }
    }

    // 渲染 字段下拉框
    function renderSelect(opt) {
        var select = $('<select class="bh-ers-nice-select"></select>');
        $(opt.source).each(function () {
            select.append('<option value="' + this.name + '">' + this.caption + '</option>');
        });
        opt.dom.html(select);
        opt.dom.append('<i class="iconfont icon-arrowdropdown bh-ers-nice-select-arrow"></i>');
    }

    // 渲染赋值下拉框
    function renderOptionSelect(opt) {
        var select = $('<select class="bh-ers-nice-select"></select>');
        $(opt.source).each(function () {
            select.append('<option value="' + this.id + '">' + this.name + '</option>');
        });
        opt.dom.html(select);
        opt.dom.append('<i class="iconfont icon-arrowdropdown bh-ers-nice-select-arrow"></i>');
    }

    function renderRow(options, model, dom) {
        var builderList = model.builderList;

        renderSelect({
            dom: $('.bh-ers-builder', dom),
            source: options.data.builderLists[builderList]
        });


        switch (model.xtype) {
            case 'select' :
            case 'radiolist' :
            case 'checkboxlist' :
                _getItemModel(model.url, function (data) {
                    renderOptionSelect({
                        dom: $('.bh-ers-option', dom),
                        source: data
                    });
                });
                break;
            case 'date-local':
            case 'date-ym':
            case 'date-full':
                $('.bh-ers-option', dom).empty().append('<div class="bh-ers-control"></div>');
                $('.bh-ers-option div', dom).jqxDateTimeInput({
                    width: "100%",
                    value: null,
                    formatString: 'yyyy-MM-dd',
                    culture: 'zh-CN'
                });
                break;
            default :
                $('.bh-ers-option', dom).html('<input class="bh-form-control bh-ers-control" type="text">')
        }
    }

    function _getItemModel(url, callback) {
        var dataAdapter = new $.jqx.dataAdapter({
            url: url,
            datatype: "json",
            async: false,
            root: "datas>code>rows"
        }, {
            loadComplete: function (records) {
                callback(records.datas.code.rows);
            }
        });
        dataAdapter.dataBind();
    };

    function getCondition(element, options) {
        var result = [];
        $('.bh-ers-row', element).each(function () {
            var _this = $(this);
            var optionValue;
            if ($('.bh-ers-option .bh-ers-control', _this).length == 0) {
                optionValue = $('.bh-ers-option .bh-ers-nice-select', _this).val();
            } else {
                optionValue = $('.bh-ers-option .bh-ers-control', _this).val();
            }
            if (!optionValue || $.trim(optionValue) == "") {
                return true;
            }
            var resultItem = {
                "name": $('.bh-ers-select .bh-ers-nice-select', _this).val(),
                "value": optionValue,
                "linkOpt": "AND"
            };
            if ($('.bh-ers-builder .bh-ers-nice-select', _this).length > 0) {
                resultItem.builder = $('.bh-ers-builder .bh-ers-nice-select', _this).val();
            } else {
                resultItem.builder = $('bh-.ers-control', _this).val();
            }

            result.push(resultItem);
        });
        return JSON.stringify(result);
    }


    $.fn.emapRuleSetting = function (options, params) {
        var instance;
        instance = this.data('emapRuleSetting');
        if (!instance) {
            return this.each(function () {
                return $(this).data('emapRuleSetting', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') return instance[options](params);
        return this;
    };

    $.fn.emapRuleSetting.defaults = {
        showBuilder: true,
        builderData: [{
            name: "等于",
            id: "equal"
        }]
    };
}).call(undefined);
(function () {
    var Plugin, _init;
    var _animateTime, _eventBind, _renderEasySearch, _renderQuickSearch, _initConstructorEditor, _popOver, _getConditionFromEditor,
        _renderInputPlace, _getSearchCondition, _findModel, _getConditionFromForm, _bindEditorEvent, _renderInput3Place, _validateEditor,
        _renderOneTag, _addOrFilter, _addAndFilter, _resetRowIndent;
    Plugin = (function () {
        function Plugin(element, options) {
            this.options = $.extend({}, $.fn.emapRulesConstructor.defaults, options);
            this.$element = $(element);
            this.$element.attr("emap-role", "advancedQuery").attr("emap-pagePath", "").attr("emap-action", this.options.data.name);
            this.options._initCount = 0;  // 需要初始化的控件的总数
            this.options._initCounter = 0; // 控件初始化计数器
            _init(this.$element, this.options);
        }

        Plugin.prototype.getValue = function () {
            return _getSearchCondition(this.options);
        };

        Plugin.prototype.setValue = function (val) {
            this.$element.emapRulesConstructor('clear');
            var value = (typeof val == "string") ? JSON.parse(val) : val;
            var $advanced = this.options.$advanced;
            var block = $('.bh-rules-block', $advanced);
            $($advanced).addClass('bh-active');
            this.options.searchModel = 'advanced';
            $('.bh-rules-block', $advanced).show();
            $('.bh-rules-body > .bh-rules-editor', $advanced).hide();
            for (var i = 0; i < value.length; i ++) {
                if ($.isArray(value[i])) {
                    for (var j = 0; j < value[i].length; j ++) {
                        if (j == 0) {
                            // 添加行
                            _addOrFilter(this.options,  value[i][j]);
                        } else {
                            // 添加tag
                            _addAndFilter(this.options, value[i][j], $('.bh-rules-row:eq(' + i + ')', block))
                        }
                    }
                }
            }
        };

        Plugin.prototype.clear = function () {
            var $advanced = this.options.$advanced;
            $('.bh-rules-row:not([rules-role=addOrRow])').remove();
            _resetRowIndent(this.options);
        };

        return Plugin;
    })();

    _init = function (element, options) {

        element.attr("emap", JSON.stringify({
            "emap-url": WIS_EMAP_SERV.url,
            "emap-name": WIS_EMAP_SERV.name,
            "emap-app-name": WIS_EMAP_SERV.appName,
            "emap-model-name": WIS_EMAP_SERV.modelName
        }));
        delete WIS_EMAP_SERV.url;
        delete WIS_EMAP_SERV.name;
        delete WIS_EMAP_SERV.appName;
        delete WIS_EMAP_SERV.modelName;

        var modalData = options.data.controls;
        var easyArray = [];
        var quickArray = [];
        var guid = BH_UTILS.NewGuid();

        _animateTime = function () {
            return 450;
        };

        _eventBind = function (options) {
            var $advanced = options.$advanced;
            // var $advancedModal = options.$advancedModal;

            // 展开高级搜索
            $advanced.on("click", "[bh-advanced-query-role=advancedOpen]", function () {
                $($advanced).addClass('bh-active');
                options.searchModel = 'advanced';
            });

            // 关闭高级搜索
            $advanced.on("click", "[bh-advanced-query-role=advancedClose]", function () {
                $($advanced).removeClass('bh-active');
                options.searchModel = 'easy';
            });

            // easy搜索 监听 按键输入
            $advanced.on('keyup', '.bh-advancedQuery-quick-search-wrap input[type=text]', function (e) {
                var easySelectH = $advanced.data('easyarray').length * 28 + 1; // 下拉框高度
                var easySelectW = $(this).outerWidth(); // 下拉框宽度
                var searchValue = $(this).val();
                var pos = $(this).offset();
                var selectDiv = $('.bh-advancedQuery-quick-select[data-guid=' + options.guid + ']');
                pos.top += 28;

                // 回车快速搜索
                if (e.keyCode == 13) {
                    selectDiv.css({'height': 0, 'border-width': '0'});
                    element.trigger('search', [_getSearchCondition(options), options]);
                    return;
                }

                if (searchValue == '') {
                    selectDiv.css({'height': 0, 'border-width': '0'});
                } else {
                    $('.bh-advancedQuery-easy-query', selectDiv).html(searchValue);
                    selectDiv.css({
                        'height': easySelectH + 'px',
                        'width': easySelectW + 'px',
                        'border-width': '1px',
                        'top': pos.top,
                        'left': pos.left
                    });
                }
            });

            //  点击下拉框选项
            $('[bh-advanced-query-role=advancedEasySelect][data-guid=' + options.guid + ']').on('click', 'p', function () {
                var selectDiv = $(this).closest('[bh-advanced-query-role=advancedEasySelect]');
                if (selectDiv.height() > 0) {
                    selectDiv.css({'height': 0, 'border-width': '0'});
                }
                element.trigger('search', [_getSearchCondition(options, $(this).data('name')), options]);
            });

            // 点击搜索按钮  easy search
            $advanced.on('click', '[bh-advanced-query-role=easySearchBtn]', function () {
                element.trigger('search', [_getSearchCondition(options), options]);
            });

            // 点击筛选条件  quick search
            $advanced.on('click', '[bh-advanced-query-role=quickSearchForm] .bh-label-radio', function () {
                // radio 的事件冒泡问题
                setTimeout(function () {
                    element.trigger('search', [_getSearchCondition(options), options]);
                }, 200);
            });

            // 执行高级搜索
            $advanced.on('click', '[bh-advanced-query-role=advancedSearchBtn]', function () {
                element.trigger('search', [_getSearchCondition(options), options]);
            });


            // 监听 控件初始化事件  bhInputInitComplete, 根据计数器options._initCounter 判断出发高级搜索组件的 初始化回调
            element.on('bhInputInitComplete', function () {
                options._initCounter++;
                if (options._initCounter == options._initCount) {
                    element.trigger('init', [options]);
                    options.initComplete && options.initComplete();
                }
            });

            // easySearch 下拉框的关闭
            $(document).on('click', function (e) {
                var target = e.target;
                if ($(target).closest('[bh-advanced-query-role=advancedEasySelect]').length == 0) {
                    var selectDiv = $('.bh-advancedQuery-quick-select');
                    // if (selectDiv.height() > 0) {
                    selectDiv.css({'height': 0, 'border-width': '0'})
                    // }
                }
            });

            // 点击 新增且条件 按钮
            $advanced.on('click', '[rules-role=addAndBtn]', function () {
                var row = $(this).closest('.bh-rules-row');
                _popOver(options, "+ 新增[且]条件", $(this), function (e, ele) {
                    var editorData = _getConditionFromEditor(ele);
                    if (editorData) {
                        _addAndFilter(options, editorData, row)
                    } else {
                        return false;
                    }

                })
            });

            // 点击新增或条件按钮
            $advanced.on('click', '[rules-role=addOrBtn]', function () {
                _popOver(options, "+ 新增[或]条件", $(this), function (e, ele) {
                    var editorData = _getConditionFromEditor(ele);
                    if (editorData) {
                        _addOrFilter(options, editorData);
                    } else {
                        return false;
                    }
                })
            });

            // 页面初始editor 的确定按钮
            $advanced.on('click', '.bh-rules-body > .bh-rules-editor [rules-role=editorAddBtn]', function () {
                var editorData = _getConditionFromEditor($(this).closest('.bh-rules-editor'));
                if (editorData) {
                    _addOrFilter(options, editorData);
                    $('.bh-rules-block', $advanced).show();
                    $('.bh-rules-body > .bh-rules-editor', $advanced).hide();
                }
            });
            // 页面初始editor 的关闭按钮  点击后清空editor
            $advanced.on('click', '.bh-rules-body > .bh-rules-editor [rules-role=editorCloseBtn]', function () {
                var editor = $(this).closest('.bh-rules-editor');
                $('[rules-role^=editorInput]', editor).each(function (i) {
                    if (i == 2) {
                        switch ($(this).attr('xtype')) {
                            case 'select' :
                                $(this).jqxDropDownList("clearSelection");
                                break;
                            default :
                                $(this).val("");
                        }
                    } else {
                        $(this).jqxDropDownList("clearSelection");
                    }
                });
            });

            // tag点击删除
            $advanced.on('click', '[rules-role=closeTag]', function () {
                var tag = $(this).parent();
                var andSPan = tag.prev('.bh-rules-and-text');
                if  (andSPan.length > 0) {
                    //删除tag
                    andSPan.remove();
                    tag.remove();
                } else {
                    var row = tag.closest('.bh-rules-row');
                    if ($('.bh-tag', row).length > 1) {
                        tag.next('.bh-rules-and-text').remove();
                        tag.remove();
                    } else {
                        // 该行只剩一个tag  所以删除整行
                        row.remove();
                        _resetRowIndent(options);
                    }
                }
            })
        };

        _renderEasySearch = function (easyArray, options) {
            var easySearch = '';
            var easySearchPlaceholder = ''; // easySearch 文本框placeholder

            if (easyArray.length && easyArray.length > 0) {
                easySearchPlaceholder += '请输入';
                $(easyArray).each(function () {
                    easySearchPlaceholder += this.caption + '/';
                    easySearch += '<p data-name="' + this.name + '">搜索 <span class="bh-advancedQuery-easy-caption">' + this.caption + '</span> : <span class="bh-advancedQuery-easy-query"></span></p>';
                });
                $('.bh-advancedQuery-quick-select[data-guid=' + options.guid + ']').html(easySearch);
                easySearchPlaceholder = easySearchPlaceholder.substring(0, easySearchPlaceholder.length - 1);
                $('.bh-advancedQuery-quick-search-wrap input[type=text]', options.$advanced).attr('placeholder', easySearchPlaceholder);
            } else {
                $('.bh-advancedQuery-quick-search-wrap', options.$advanced).hide();
                $('[bh-advanced-query-role=easySearchBtn]', options.$advanced).hide();
            }
        };

        _renderQuickSearch = function (quickArray) {
            var quickSearchHtml = $('<div></div>');
            $(quickArray).each(function (i) {
                /**
                 * 代码不做 数量显示
                 * 由设计规范控制
                 */
                //if (i >= 3) {
                //    return false;
                //}
                if (this.xtype == 'select' || this.xtype == 'radiolist' || this.xtype == 'checkboxlist') {
                    this.xtype = 'buttonlist';
                }
                quickSearchHtml.append(_renderInputPlace(this));
            });
            return quickSearchHtml;
        };

        _renderInputPlace = function (item, showClose) {
            //showClose  是否显示 关闭按钮
            var _this = item;
            _this.get = function (attr) {
                return _this[attr];
            };
            var xtype = _this.get("xtype");
            var caption = _this.get("caption");
            var builder = _this.get("defaultBuilder");
            var url = _this.get("url");
            var name = _this.get("name");
            var hidden = _this.get("hidden") ? "hidden" : "";
            var placeholder = _this.get("placeholder") ? _this.get("placeholder") : "";
            var checkType = _this.get("checkType");
            var checkSize = _this.get("checkSize");
            var dataSize = _this.get("dataSize");
            var checkExp = _this.get("checkExp");
            //var allOption = _this.get("allOption") !== undefined ? _this.get("allOption") : true; // 是否显示 "全部"  按钮,  仅在 buttonlist使用
            var format = _this.get("format") ? _this.get("format") : 'yyyy-MM-dd';
            var controlHtml = $(' <div class="bh-advancedQuery-form-row bh-advancedQuery-h-28">' +
                '<div class="bh-advancedQuery-groupName">' + caption + '：</div>' +
                '<div class="bh-advancedQuery-groupList bh-label-radio-group">' +
                '</div>' +
                '</div>');

            if (showClose) {
                controlHtml.append('<a class="bh-bh-advancedQuery-group-dismiss" href="javascript:void(0)" bh-advanced-query-role="conditionDismiss"> ' +
                    '<i class="icon-close iconfont"></i>' +
                    '</a>');
            }
            var inputHtml = '';
            switch (xtype) {

                case "tree" :
                    inputHtml += '<div xtype="{{xtype}}" data-name="{{name}}" data-builder="{{builder}}" data-caption="{{caption}}" data-url="{{url}}" {{hidden}} ></div>';
                    break;
                case "date-local" :
                    inputHtml += '<div xtype="{{xtype}}" data-builder="{{builder}}" data-caption="{{caption}}" data-name="{{name}}" data-format="yyyy-MM-dd" {{hidden}}></div>';
                    break;
                case "date-ym" :
                    inputHtml += '<div xtype="{{xtype}}" data-builder="{{builder}}" data-caption="{{caption}}" data-name="{{name}}" data-format="yyyy-MM" {{hidden}}></div>';
                    break;
                case "switcher" :
                    inputHtml += '<div xtype="{{xtype}}"  data-builder="{{builder}}" data-caption="{{caption}}" data-name="{{name}}" {{hidden}}></div>';
                    break;
                case "radiolist" :
                    inputHtml += '<div xtype="{{xtype}}" data-name="{{name}}" class="bh-radio" data-url="{{url}}" data-builder="{{builder}}" data-caption="{{caption}}" {{hidden}}></div>';
                    break;
                case "checkboxlist" :
                    inputHtml += '<div xtype="{{xtype}}" data-name="{{name}}" class="bh-checkbox" data-url="{{url}}" data-builder="{{builder}}" data-caption="{{caption}}" {{hidden}}></div>';
                    break;
                case "buttonlist" :
                case "select" :
                    inputHtml += '<div xtype="{{xtype}}" data-name="{{name}}" data-url="{{url}}" data-builder="{{builder}}" data-alloption={{allOption}} data-caption="{{caption}}" {{hidden}}></div>';
                    break;
                default:
                    inputHtml += '<input class="bh-form-control" data-name="{{name}}" name="{{name}}" data-builder="{{builder}}" data-caption="{{caption}}" xtype="text" type="text" {{hidden}} />';
                    break;
            }
            inputHtml = inputHtml.replace(/\{\{xtype\}\}/g, xtype)
                .replace(/\{\{name\}\}/g, name)
                .replace(/\{\{builder\}\}/g, builder)
                .replace(/\{\{caption\}\}/g, caption)
                .replace(/\{\{url\}\}/g, url)
                .replace(/\{\{hidden\}\}/g, (hidden ? 'style="display:none;"' : ''))
                .replace(/\{\{allOption\}\}/g, options.allowAllOption)


            $('.bh-advancedQuery-groupList', controlHtml).html(inputHtml);
            return controlHtml;
        };


        // 生成搜索条件
        _getSearchCondition = function (options, name) {
            var conditionResult = [];
            var easyArray = options.$advanced.data('easyarray');
            var modalarray = options.$advanced.data('modalarray')
            var orCondition = [];
            if (options.searchModel == 'easy') {
                var searchKey = $('.bh-advancedQuery-quick-search-wrap input', options.$advanced).val();
                // 简单搜索
                if ($.trim(searchKey) != "") {
                    if (name) {
                        //简单搜索的下拉框搜索
                        var searchItem = _findModel(name, easyArray);
                        conditionResult.push({
                            "caption": searchItem.caption,
                            "name": searchItem.name,
                            "value": searchKey,
                            // "builder": searchItem.defaultBuilder,
                            "builder": "include",
                            "linkOpt": "AND"
                        });
                    } else {
                        for (var i = 0; i < easyArray.length; i++) {
                            orCondition.push({
                                "caption": easyArray[i].caption,
                                "name": easyArray[i].name,
                                "value": searchKey,
                                // "builder": easyArray[i].defaultBuilder,
                                "builder": "include",
                                "linkOpt": "OR"
                            });
                        }
                        conditionResult.push(orCondition);
                    }
                }
                conditionResult = conditionResult.concat(_getConditionFromForm($('[bh-advanced-query-role=quickSearchForm]', options.$advanced)));
            } else if (options.searchModel == 'advanced') {
                var block = $('.bh-rules-block', options.$advanced);
                $('.bh-rules-row', block).each(function () {
                    var rowData = [];
                    var tags = $('.bh-tag', $(this));
                    if (tags.length > 0) {
                        tags.each(function () {
                            var tagData = $(this).data('data');
                            tagData.linkOpt = 'and';
                            rowData.push(tagData)
                        });
                        rowData[0].linkOpt = 'or';
                        conditionResult.push(rowData);
                    }
                });

            }
            return JSON.stringify(conditionResult);
        };

        _getConditionFromForm = function (form) {
            var conditionArray = [];
            var formElement = $('[xtype]', form);
            for (var i = 0; i < formElement.length; i++) {
                var conditionItem = {};
                switch ($(formElement[i]).attr('xtype')) {
                    case 'radiolist' :
                        conditionItem.value = $('input[type=radio]:checked', formElement[i]).map(function () {
                            return $(this).val();
                        }).get().join(',');
                        break;
                    case 'checkboxlist' :
                        conditionItem.value = $('input[type=checkbox]:checked', formElement[i]).map(function () {
                            return $(this).val();
                        }).get().join(',');
                        break;
                    case 'tree' :
                        conditionItem.value = $(formElement[i]).emapDropdownTree('getValue');
                        break;
                    case 'buttonlist' :
                        conditionItem.value = $('.bh-label-radio.bh-active', formElement[i]).data('id');
                        break;
                    default :
                        conditionItem.value = $(formElement[i]).val();
                        break;
                }
                if (conditionItem.value == 'ALL' || $.trim(conditionItem.value) == '') {
                    continue;
                }
                conditionItem.name = $(formElement[i]).data('name');
                conditionItem.caption = $(formElement[i]).data('caption');
                conditionItem.builder = $(formElement[i]).data('builder');
                conditionItem.linkOpt = 'AND';
                conditionArray.push(conditionItem);
            }
            return conditionArray;
        };

        _findModel = function (name, modelArray) {
            for (var i = 0; i < modelArray.length; i++) {
                if (modelArray[i].name == name) {
                    return modelArray[i];
                }
            }
        };

        // 初始化构造器编辑框
        _initConstructorEditor = function (options, ele) {
            // 字段名称下拉
            var modalOptions = options.$advanced.data('modalarray');
            // builder下拉
            var builderOptions = options.data.builderLists.cbl_String;

            $('[rules-role=editorInput1]', ele).jqxDropDownList({
                placeHolder: "选择查询项目...",
                width: 200,
                source: modalOptions,
                displayMember: "caption",
                filterable: true,
                searchMode: "containsignorecase",
                filterPlaceHolder: "请查找",
                valueMember: "name"
            })
            $('[rules-role=editorInput2]', ele).jqxDropDownList({
                placeHolder: "选择条件...",
                width: 100,
                source: builderOptions,
                filterable: true,
                searchMode: "containsignorecase",
                displayMember: "caption",
                filterPlaceHolder: "请查找",
                valueMember: "name"
            })
            _bindEditorEvent(options, ele);
        };

        // 弹出气泡弹窗
        _popOver = function (options, title, ele, cb) {
            /************************
             * jqxPopover 深坑
             *
             */
            var pop = $('<div style="display: none" id="bhRulesPopover">' + options.editorHtml + '</div>');
            $('body').append(pop);

            // 计算popover 水平位置
            var docWidth = document.documentElement.clientWidth;
            var selectLeft = $(ele).offset().left;
            var popWidth = 728; // popover的宽度为 728 ,我量出来的
            var offsetLeft = 0;
            if (selectLeft - popWidth/2 < 24) {
                offsetLeft = Math.abs(selectLeft - popWidth/2 - 24)
            }
            if (selectLeft + popWidth/2 > docWidth - 24) {
                offsetLeft = docWidth - 100 - selectLeft - popWidth/ 2;
            }

            pop.jqxPopover({
                offset: {left: offsetLeft, top: 0},
                arrowOffsetValue: -offsetLeft,
                showArrow: false,
                autoClose: true,
                title: title,
                selector: ele
            });
            // 实例化editor
            _initConstructorEditor(options, $('#bhRulesPopover'));
            setTimeout(function () {  // 自动打开
                pop.jqxPopover('open')
                var popWindow = $('#bhRulesPopover');
                popWindow.on('close', function () {  // 气泡弹窗关闭时 自动销毁
                        // 取消 对下拉框事件冒泡的阻止
                        $(document).off('click.bhRules.stop')
                        // 销毁editor内的下拉框
                        $('div[rules-role=editorInput1],div[rules-role=editorInput2],div[rules-role=editorInput3]', popWindow).jqxDropDownList('destroy');
                        // 销毁popover
                        $(this).jqxPopover('destroy');
                    })
                    .on('click', '[rules-role=editorCloseBtn]', function () {
                        // 关闭气泡弹窗事件
                        popWindow.jqxPopover('close')
                    })
                    .on('click', '[rules-role=editorAddBtn]', function (e) {
                        if (cb(e, popWindow) !== false) {
                            popWindow.jqxPopover('close');
                        }
                    });

                // 阻止下拉框的事件冒泡  防止点击下拉后 poppver 自动关闭
                $(document).on('click.bhRules.stop', '.jqx-listbox, .jqx-calendar', function (e) {
                    e.stopPropagation();
                })

            }, 0)
        }

        _getConditionFromEditor = function (editor) {
            if (_validateEditor(editor)) {
                var select1Val = $('[rules-role=editorInput1]', editor).jqxDropDownList('getSelectedItem');
                var select2Val = $('[rules-role=editorInput2]', editor).jqxDropDownList('getSelectedItem');
                var select3 = $('[rules-role=editorInput3]', editor);
                var select3Val = select3.val();
                var conData = {
                    caption: select1Val.label,
                    name: select1Val.value,
                    builder: select2Val.value,
                    builder_display: select2Val.label,
                    value: select3Val
                };
                if (select3.attr('xtype') == 'select') {
                    conData.value_display = select3.jqxDropDownList('getSelectedItem').label;
                }
                return conData;
            }
            return false;
        };
        
        _validateEditor = function (editor) {
            var select1 = $('[rules-role=editorInput1]', editor);
            var select2 = $('[rules-role=editorInput2]', editor);
            var input3Wrap = $('.bh-rules-input-wrap3', editor);
            if (!select1.val()) {
                select1.addClass('bh-error');
                return false;
            }
            if (!select2.val()) {
                select2.addClass('bh-error');
                return false;
            }
            if(!$('[xtype]',input3Wrap).val()) {
                $('[xtype]',input3Wrap).addClass('bh-error');
                return false;
            }
            return true;
        };

        // editor内下拉框联动事件绑定
        _bindEditorEvent = function (options, editor) {
            var select1 = $('[rules-role=editorInput1]', editor);
            var select2 = $('[rules-role=editorInput2]', editor);
            var input3Wrap = $('.bh-rules-input-wrap3', editor);
            var select3 = $('[xtype]', input3Wrap);
            select1.on('select', function (e) {
                var name = e.args.item.value;
                var modalItem = options.data.controls.filter(function (item) {
                    return item.name == name;
                })[0];

                if (select1.val()) {
                    select1.removeClass('bh-error');
                }

                // 条件选择下拉框的联动
                select2.jqxDropDownList({source: options.data.builderLists[modalItem.builderList]})

                // 搜索value 的控件联动
                input3Wrap.html(_renderInput3Place(modalItem)).emapFormInputInit();
                $('[xtype]', input3Wrap).attr('rules-role', 'editorInput3');

            });
            select2.on('select', function () {
                if (select2.val()) {
                    select2.removeClass('bh-error');
                }
            });

            input3Wrap.on('select, input', '[xtype]', function () {

                if ($(this).val()) {
                    $(this).removeClass('bh-error');
                }
            });
        };
        
        _renderInput3Place = function (modalItem) {
            var attr = WIS_EMAP_SERV._getAttr(modalItem);
            var controlHtml = "";
            attr.xtype = attr.xtype ? attr.xtype : 'text';
            if (attr.xtype == 'checkboxlist' || attr.xtype == 'radiolist') {
                attr.xtype = 'select';
            }


            switch (attr.xtype) {
                case undefined:
                case "text" :
                    attr.xtype = "text";
                    controlHtml = '<input class="bh-form-control" data-type="{{dataType}}" data-name="{{name}}" name="{{name}}" xtype="{{xtype}}" type="{{xtype}}" {{checkType}}  {{dataSize}} {{checkSize}} {{checkExp}} ' + (attr.inputReadonly ? 'readOnly' : '') + '  />';
                    break;
                case "textarea" :
                    controlHtml = '<textarea xtype="{{xtype}}" data-type="{{dataType}}" class="bh-form-control" rows="3" data-name="{{name}}" {{checkType}} {{dataSize}} {{checkSize}} {{checkExp}} ' + (attr.inputReadonly ? 'readOnly' : '') + ' ></textarea>';
                    break;
                case "selecttable" :
                case "select" :
                case "tree" :
                case "date-local" :
                case "date-ym" :
                case "date-full" :
                case "switcher" :
                case "uploadfile":
                case "uploadphoto":
                case "uploadsingleimage":
                case "uploadmuiltimage":
                case "buttonlist":
                case "multi-select" :
                case "div":
                    controlHtml = '<div xtype="{{xtype}}" data-type="{{dataType}}" data-name="{{name}}" {{url}} {{format}} {{checkType}} {{JSONParam}} {{checkSize}} data-disabled={{inputReadonly}}></div>';
                    break;
                case "radiolist" :
                    controlHtml = '<div xtype="{{xtype}}" data-type="{{dataType}}" class="bh-radio jqx-radio-group" data-name="{{name}}" {{url}} {{checkSize}} data-disabled={{inputReadonly}}></div>';
                    break;
                case "checkboxlist" :
                    controlHtml = '<div xtype="{{xtype}}" data-type="{{dataType}}" class="bh-checkbox" data-name="{{name}}" {{checkType}} {{url}} {{checkSize}} data-disabled={{inputReadonly}}></div>';
                    break;
            }
            controlHtml = controlHtml.replace(/\{\{xtype\}\}/g, attr.xtype)
                .replace(/\{\{name\}\}/g, attr.name)
                .replace(/\{\{dataType\}\}/g, attr.dataType)
                .replace(/\{\{inputReadonly\}\}/g, attr.inputReadonly);
            controlHtml = controlHtml.replace(/\{\{url\}\}/g, attr.url ? ('data-url="' + attr.url + '"') : '');
            controlHtml = controlHtml.replace(/\{\{format\}\}/g, attr.format ? ('data-format="' + attr.format + '"') : '');
            controlHtml = controlHtml.replace(/\{\{JSONParam\}\}/g, attr.JSONParam ? ('data-jsonparam="' + encodeURI(JSON.stringify(attr.JSONParam)) + '"') : '');
            controlHtml = controlHtml.replace(/\{\{checkType\}\}/g, attr.checkType ? ('data-checktype="' + encodeURI(JSON.stringify(attr.checkType)) + '"') : '');
            controlHtml = controlHtml.replace(/\{\{dataSize\}\}/g, attr.dataSize ? ('data-size="' + attr.dataSize + '"') : '');
            controlHtml = controlHtml.replace(/\{\{checkSize\}\}/g, attr.checkSize ? ('data-checksize="' + attr.checkSize + '"') : '');
            controlHtml = controlHtml.replace(/\{\{checkExp\}\}/g, attr.checkExp ? ('data-checkexp=' + encodeURI(attr.checkExp)) : '');
            return controlHtml;
        };

        // 渲染一个tag
        _renderOneTag = function (data) {
            var tag = $('<label class="bh-tag"><span></span><a rules-role="closeTag" href="javascript:void(0)"><i class="iconfont icon-close"></i></a></label>');
            tag.data('data', data);
            $('span', tag).text('"' + data.caption + '" ' + data.builder_display + ' "' + (data.value_display ? data.value_display : data.value) + '"');
            return tag;
        };
        
        // 添加 且 条件
        _addAndFilter =  function (options, data, row) {
            var andBtn = $('[rules-role=addAndBtn]', row);
            andBtn.before(options.andSpan).before(_renderOneTag(data));
        };

        // 添加或条件
        _addOrFilter = function (options, data) {
            var row = $('<div class="bh-rules-row">' +
                '<div class="bh-rules-row-indent">或</div>' +
                '<a rules-role="addAndBtn" href="javascript:void(0)">+ 新增[且]条件</a>' +
                '</div>');
           $('[rules-role=addAndBtn]', row).before(_renderOneTag(data));
            $('[rules-role=addOrRow]', options.$advanced).before(row);
            _resetRowIndent(options);
        };

        // 重置 row indent 
        _resetRowIndent = function (options) {
            var $advanced = options.$advanced;
            var rows = $('.bh-rules-row', $advanced);
            rows.each(function (i) {
                if (i > 0) {
                    $(this).css('margin-left', (i-1)*20)
                }
            })
        };


        options.editorHtml = '<div class="bh-rules-editor bh-clearfix bh-mb-16">' +
            '<div class="bh-rules-input-wrap"><div rules-role="editorInput1"></div></div>' +
            '<div class="bh-rules-input-wrap"><div rules-role="editorInput2"></div></div>' +
            '<div class="bh-rules-input-wrap bh-rules-input-wrap3"><input rules-role="editorInput3" class="bh-form-control" type="text" placeholder="多值请用逗号隔开"></div>' +
            '<div class="bh-rules-input-wrap bh-rules-input-wrap4">' +
            '<a class="bh-btn bh-btn-small bh-btn-primary" rules-role="editorAddBtn" href="javascript:void(0)"><i class="iconfont icon-check"></i></a>' +
            '<a class="bh-btn bh-btn-small bh-btn-default" rules-role="editorCloseBtn" href="javascript:void(0)"><i class="iconfont icon-close"></i></a>' +
            '</div>' +
            '</div>';

        options.andSpan = '<span class="bh-rules-and-text">且</span>';
        options.orSpan = '<span class="bh-rules-or-text">或</span>';
        options.tag = '<label class="bh-tag"><span></span><a rules-role="closeTag" href="javascript:void(0)"><i class="iconfont icon-close"></i></a></label>';

        element.css({
            "position": "relative",
            "z-index": 358
        }).html('<div class="bh-advancedQuery bh-mb-16" bh-advanced-query-role="advancedQuery">' +
            '<div class="bh-advancedQuery-dropDown ">' +
            '<div class="" style="display: table-cell">' +
            '<div class="bh-advancedQuery-form" bh-advanced-query-role="advanceSearchForm" >' +

            '<div class="bh-rules-container">' +
            '<div class="bh-rules-header bh-clearfix">' +
            '<h4>' +
            '<i class="iconfont icon-search"></i>条件构造器' +
            '</h4>' +
            // '<p class="bh-rules-program">' +
            // '<label>构造方案: </label>' +
            // '<a href="javascript:void(0)">保存的方案1</a>' +
            // '<a href="javascript:void(0)">保存的方案1</a>' +
            // '<a href="javascript:void(0)">保存的方案1</a>' +
            // '</p>' +
            '</div>' +


            '<div class="bh-rules-body">' +
            options.editorHtml +

            '<div class="bh-rules-block">' +


            '<div class="bh-rules-row" rules-role="addOrRow">' +
            '<div class="bh-rules-row-indent"></div>' +
            '<a rules-role="addOrBtn" href="javascript:void(0)">+ 新增[或]条件</a>' +

            '</div>' +

            '</div>' +
            '</div>' +

            '</div>' +


            '<div class="bh-advancedQuery-form-row bh-advancedQuery-form-btn-row bh-advancedQuery-h-28" bh-advanced-query-role="dropDownBtnWrap"> ' +
            '<div class="bh-advancedQuery-groupList">' +
            '<a class="bh-btn bh-btn-primary" bh-advanced-query-role="advancedSearchBtn" href="javascript:void(0)">执行条件搜索</a>' +
            // '<a class="bh-btn bh-btn-default" href="javascript:void(0)">保存为方案</a>' +
            '<a class="bh-mh-4" bh-advanced-query-role="advancedClose" href="javascript:void(0)">[关闭条件构造器]</a>' +
            '</div>' +
            '</div>' +
            '</div>' +

            '</div>' +
            '</div>' +
            '<div class="bh-advancedQuery-quick">' +
            '<div class="bh-advancedQuery-inputGroup bh-clearfix">' +
            '<div class="bh-advancedQuery-quick-search-wrap" >' +
            '<input type="text" class="bh-form-control"/>' +
            '<i class="iconfont icon-search" style="position: absolute;left: 6px;top: 6px;"></i>' +
            '</div>' +
            '<a class="bh-btn bh-btn bh-btn-primary bh-btn-small" bh-advanced-query-role="easySearchBtn" href="javascript:void(0);">搜索</a>' +
            '<a href="javascript:void(0);" class="bh-mh-8" bh-advanced-query-role="advancedOpen">[条件构造器]</a>' +
            '</div>' +
            '<div class="bh-advancedQuery-form bh-mt-8" bh-advanced-query-role="quickSearchForm">' +
            '</div>' +
            '</div>' +
            '</div>');

        options.$advanced = $('div[bh-advanced-query-role=advancedQuery]', element).css({'overflow': 'hidden'});
        options.guid = guid;
        if (options.searchModel == 'advanced') {
            options.$advanced.addClass('bh-active');
        }

        $('body').append('<div class="bh-advancedQuery-quick-select" bh-advanced-query-role="advancedEasySelect" data-guid="' + guid + '" ></div>');
        if (options.formType) {
            element.addClass('bu-rules-form-type');
        }



            var advanceInputPlaceHolder = '';
        _eventBind(options);
        $(modalData).each(function (i) {
            //移除 hidden 项
            var index = modalData.indexOf(this);
            if (this.get('hidden')) {
                modalData.splice(index, 1);
                return true;
            }

            if (!this.xtype || this.xtype == 'text') {
                advanceInputPlaceHolder += this.caption + '/'; // 高级搜索关键词输入框placeholder
            } else {
                options._initCount++;
            }

            if (this.quickSearch) {
                if (!this.xtype || this.xtype == 'text') {
                    easyArray.push(this);
                } else {
                    quickArray.push(this);
                }
            }
        });
        // 高级搜索关键词字段添加placeholder
        $('[bh-advanced-query-role=advancedInput]', element).attr('placeholder', advanceInputPlaceHolder.substr(0, advanceInputPlaceHolder.length - 1));

        options.$advanced.data('modalarray', modalData);
        options.$advanced.data('easyarray', easyArray);
        options.$advanced.data('quickarray', quickArray);

        if (options.searchModel == 'easy') {
            options._initCount = quickArray.length;
        }
        if (easyArray.length == 0 && quickArray.length == 0) {
            // console.warn("没有配置快速搜索字段,所以高级搜索控件无法展示!");
        }

        // 简单搜索 条件渲染
        _renderEasySearch(easyArray, options);

        // 快速搜索条件渲染
        quickArray = JSON.parse(JSON.stringify(quickArray));
        $('[bh-advanced-query-role=quickSearchForm]', options.$advanced).html(_renderQuickSearch(quickArray))
            .emapFormInputInit({root: ''});

        // 初始化构造器默认的 editor
        _initConstructorEditor(options, $('.bh-rules-editor', element));
    };


    $.fn.emapRulesConstructor = function (options, params) {
        var instance;
        instance = this.data('plugin');
        if (!instance) {
            return this.each(function () {
                return $(this).data('plugin', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') return instance[options](params);
        return this;
    };

    $.fn.emapRulesConstructor.defaults = {
        allowAllOption: true, // 是否显示[全部]选项
        defaultItem: [],
        searchModel: 'easy',
        formType: false // 表单中使用的模式, 开启后,隐藏简单搜索的文本框与搜索按钮,隐藏高级模式的按钮
    };

}).call(this);

;(function (WIS_EMAP_SERV, undefined) {
    /**
     * 获取emap pageMeta数据
     * @param  {String} pagePath 页面地址
     * @return {Object}        pageMeta
     */
    WIS_EMAP_SERV.getPageMeta = function (pagePath, params) {

        var params = $.extend({"*json": "1"}, params);
        var pageMeta = BH_UTILS.doSyncAjax(WIS_EMAP_SERV.getAbsPath(pagePath), params);
        window._EMAP_PageMeta = window._EMAP_PageMeta || {};
        window._EMAP_PageMeta[pagePath] = pageMeta;
        if (typeof pageMeta.loginURL != 'undefined') {
            window._EMAP_PageMeta = {};
        }
        return pageMeta;
    }

    /**
     * 获取emap模型
     * @param  {String} pagePath    页面地址
     * @param  {String} actionID  [description]
     * @param  {String}           [description]
     * @return {Object}           [description]
     */
    WIS_EMAP_SERV.getModel = function (pagePath, actionID, type, params) {
        // window.sessionStorage.setItem();
        // window._EMAP_PageMeta = window._EMAP_PageMeta || {};

        // var pageMeta = window._EMAP_PageMeta[pagePath];
        // if (pageMeta === undefined) {
        //     pageMeta = this.getPageMeta(pagePath);
        // }
        var pageMeta = this.getPageMeta(pagePath, params);
        var model;

        if (type == "search") {
            var url = WIS_EMAP_SERV.getAbsPath(pagePath).replace('.do', '/' + actionID + '.do');
            pageMeta = BH_UTILS.doSyncAjax(url, $.extend({"*searchMeta": "1"}, params));
            model = pageMeta.searchMeta;

        } else {
            var getData = pageMeta.models.filter(function (val) {
                return val.name == actionID
            });
            model = getData[0];
        }
        WIS_EMAP_SERV.modelName = model.modelName;
        WIS_EMAP_SERV.appName = model.appName;
        WIS_EMAP_SERV.url = model.url;
        WIS_EMAP_SERV.name = model.name;

        return this.convertModel(model, type);
    }

    WIS_EMAP_SERV.convertModel = function (model, type) {

        if (model === undefined || model == null) {
            //getData = {code: 0,msg: "没有数据",models:[],datas:{}};
            return undefined;
        } else {

            if (type === undefined)
                return model.controls;
            else {
                model.controls.map(function (item) {
                    item.get = function (field) {
                        if (this[type + "." + field] !== undefined)
                            return this[type + "." + field];
                        else
                            return this[field];
                    }
                });
                if (type == "search")
                    return model;
                else
                    return model.controls;
            }
        }
    };


    WIS_EMAP_SERV.getData = function (pagePath, actionID, queryKey) {
        window._EMAP_PageMeta = window._EMAP_PageMeta || {};
        var pageMeta = window._EMAP_PageMeta[pagePath];
        if (pageMeta === undefined)
            pageMeta = this.getPageMeta(pagePath);

        var model = pageMeta.models.filter(function (val) {
            return val.name == actionID
        });


        var modelPath = pagePath.substring(0, pagePath.indexOf("/")) + "/" + model[0].url;
        var getData = BH_UTILS.doSyncAjax(WIS_EMAP_SERV.getAbsPath(modelPath), queryKey);
        if (getData === undefined || getData == null) {
            getData = {
                code: 0,
                msg: "没有数据",
                datas: {}
            };
            return {rows: []};
        } else {
            if (getData.result !== undefined && getData.result.datas !== undefined)
                getData = getData.result;
            return getData.datas[actionID];
        }
    }

    WIS_EMAP_SERV.getCode = function (url, id, name, pid, searchValue) {
        var params = {};
        if (id) params["id"] = id;
        if (name) params["name"] = name;
        if (pid) params["pid"] = pid;
        if (searchValue) params["searchValue"] = searchValue;
        var codeData = BH_UTILS.doSyncAjax(url, params);
        if (codeData === undefined || codeData == null) {
            return undefined;
        } else {
            return codeData.datas.code.rows;
        }
    };

    //name 传入的是string，则只返回一个参数的查询条件
    //name 传入的是array，结构是：[{name:"", value:""},{name:"", value:""}]，则返回多个参数的查询条件
    WIS_EMAP_SERV.buildCodeSearchParam = function (name, value) {
        if ($.isArray(name)) {
            var list_map = name;
            var result = [];
            for (var i = list_map.length - 1; i >= 0; i--) {
                result.push({name: list_map[i].name, value: list_map[i].value, linkOpt: "and", builder: "equal"});
            }
            ;
            return {
                searchValue: JSON.stringify(result)
            };
        } else {
            return {
                searchValue: JSON.stringify([{name: name, value: value, linkOpt: "and", builder: "equal"}])
            };
        }
    };

    WIS_EMAP_SERV.getContextPath = function () {
        var contextPath = "";
        var path = window.location.pathname;
        var end = path.indexOf('/sys/');

        return path.substring(0, end) || '/emap';
    };

    WIS_EMAP_SERV.getAppPath = function () {
        var path = window.location.pathname;
        var start = path.indexOf('/sys/') + '/sys/'.length;

        var tmpPath = path.substring(start, path.length);
        var app_path = tmpPath.substring(0, tmpPath.indexOf("/"));
        return WIS_EMAP_SERV.getContextPath() + "/sys/" + app_path;
    };

    WIS_EMAP_SERV.getAbsPath = function (page_path) {
        if (page_path.substring(0, 7) == "http://" || page_path.substring(0, 8) == "https://") {
            return page_path;
        }
        if (page_path.substring(0, 1) == '/') {
            page_path = page_path.substring(1, page_path.length);
        }
        // if(page_path.substring(0, '*default/'.length) == '*default/'){
        //     page_path = page_path;
        // }

        //访问的是页面.do
        var page_found = page_path.match(/module*(.*?)\//);
        if (page_found == null) {
            // //路由的绝对路径
            // if(page_path.substring(0, 8) != 'modules/'){
            //     page_path = 'modules/' + page_path;
            // }

            // if(page_path.substring(0, 16) == 'modules/modules/'){
            //     page_path = page_path.slice(8);
            // }
            // if(page_path.substring(0, 15) == 'modules/http://' || page_path.substring(0, 16) == 'modules/https://'){
            //     page_path = page_path.slice(8);
            // }
        }

        var absPath = WIS_EMAP_SERV.getAppPath() + "/" + page_path;
        return absPath;
    }

    // 表单控件赋值
    WIS_EMAP_SERV._setEditControlValue = function (_this, name, xtype, val, root) {
        switch (xtype) {
            case 'multi-select':
                if (val[name + '_DISPLAY']) {
                    var currentArr = _this.jqxComboBox('getItems').map(function (val) {
                        return val.value;
                    });
                    var displayVal = val[name + '_DISPLAY'].split(',');
                    val[name].split(',').map(function (v, i) {
                        if ($.inArray(v, currentArr) < 0) {
                            _this.jqxComboBox('addItem', {
                                id: v,
                                name: displayVal[i]
                            });
                        }
                        _this.jqxComboBox('selectItem', v);
                    });


                } else {
                    WIS_EMAP_SERV._getInputOptions(_this.data("url"), function (res) {
                        _this.data('model', res);
                        var valueArr = val[name].split(',');
                        var nameArr = [];
                        var currentArr = _this.jqxComboBox('getItems').map(function (val) {
                            return val.value;
                        });
                        $(res).each(function () {
                            if ($.inArray(this.id, valueArr) > -1) {
                                if ($.inArray(this.id, currentArr) < 0) {
                                    _this.jqxComboBox('addItem', this);
                                }
                                _this.jqxComboBox('selectItem', this.id);
                            }
                        });
                    });
                }

                break;
            case 'select' :
                if (_this.jqxDropDownList('getItemByValue', val[name])) {
                    setSelectValue(_this, val[name])
                } else {
                    if (val[name + '_DISPLAY']) {
                        _this.jqxDropDownList('addItem', {
                            id: val[name],
                            name: val[name + '_DISPLAY']
                        });
                        setSelectValue(_this, val[name]);
                    } else {
                        WIS_EMAP_SERV._getInputOptions(_this.data("url"), function (res) {
                            $(res).each(function () {
                                _this.jqxDropDownList('addItem', this);
                            });
                            setSelectValue(_this, val[name])
                        });
                    }
                }
                break;

            case 'selecttable':
                _this.emapDropdownTable('setValue', [val[name], val[name + '_DISPLAY']]);
                break;
            case 'radiolist' :
                if (val[name] !== undefined && val[name] !== null && val[name] !== "") {
                    $('input[type=radio][value=' + val[name] + ']', _this).prop('checked', true);
                } else {
                    $('input[type=radio]', _this).prop('checked', false);
                }
                break;
            case 'checkboxlist' :
                if (val[name] !== undefined && val[name] !== null && val[name] !== "") {
                    $(val[name].split(',')).each(function () {
                        $('input[type=checkbox][value="' + this + '"]', _this).prop('checked', true);
                    });
                } else {
                    $('input[type=checkbox]', _this).prop('checked', false);
                }


                _this.emapRepeater('setValue', val[name]);
                break;
            case 'switcher' :
                _this.jqxSwitchButton({checked: val[name] * 1});
                //$(this).val(val[name]);
                break;
            case "uploadfile":
                _this.emapFileUpload('destroy');
                _this.emapFileUpload($.extend({}, JSON.parse(decodeURI(_this.data('jsonparam'))), {
                    contextPath: root,
                    token: val[name]
                }));
                break;
            case "uploadphoto":
                _this.emapFilePhoto('destroy');
                _this.emapFilePhoto($.extend({}, JSON.parse(decodeURI(_this.data('jsonparam'))), {
                    contextPath: root,
                    token: val[name]
                }));
                break;
            case "uploadsingleimage":
                _this.emapSingleImageUpload('destroy');
                _this.emapSingleImageUpload($.extend({}, JSON.parse(decodeURI(_this.data('jsonparam'))), {
                    contextPath: root,
                    token: val[name]
                }));
                break;
            case "uploadmuiltimage":
                _this.emapImageUpload('destroy');
                _this.emapImageUpload($.extend({}, JSON.parse(decodeURI(_this.data('jsonparam'))), {
                    contextPath: root,
                    token: val[name]
                }));
                break;
            case 'tree':    //qiyu 2016-1-16
                if (val[name + '_DISPLAY']) {
                    _this.emapDropdownTree("setValue", [val[name], val[name + "_DISPLAY"]]);
                } else {
                    WIS_EMAP_SERV._getInputOptions(_this.data("url"), function (res) {
                        _this.data('model', res);
                        $(res).each(function () {
                            if (this.id == val[name]) {
                                _this.emapDropdownTree("setValue", [this.id, this.name]);
                                return false;
                            }
                        });
                    });
                }
                break;
            default :
                _this.val((val[name] !== null && val[name] !== undefined) ? val[name] : "");
        }

        function setSelectValue(ele, val) {
            if (typeof val == "object") {
                ele.jqxDropDownList('addItem', val[0])
                ele.jqxDropDownList('checkAll');
            } else {
                //qiyu 2016-1-2 判断为空时，清空所有选项
                if (val === "") {
                    ele.jqxDropDownList('clearSelection');
                } else {
                    ele.val(val);
                }

                //$(this).jqxDropDownList('addItem', val[name]);
            }
        }
    };

    // 获取表单选项数据
    WIS_EMAP_SERV._getInputOptions = function (url, callback) {
        var dataAdapter = new $.jqx.dataAdapter({
            url: url,
            datatype: "json",
            //async: false,
            root: "datas>code>rows"
        }, {
            loadComplete: function (records) {
                callback(records.datas.code.rows);
            }
        });
        dataAdapter.dataBind();
    };

    WIS_EMAP_SERV._html2Escape = function (sHtml) {
        return sHtml.replace(/[<>&"]/g, function (c) {
            return {'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'}[c];
        });
    };

    WIS_EMAP_SERV._getAttr = function (item) {
        return {
            xtype: item.get("xtype"),
            dataType: item.get("dataType"),
            caption: item.get("caption"),
            col: item.get("col") ? item.get("col") : 1,
            url: item.get("url"),
            name: item.get("name"),
            hidden: item.get("hidden"),
            placeholder: item.get("placeholder") ? item.get("placeholder") : '',
            inputReadonly: item.get("readonly") ? true : false,
            required: item.get("required") ? "bh-required" : "",
            checkType: item.get("checkType") ? item.get("checkType") : false,
            checkSize: item.get("checkSize"),
            dataSize: item.get("dataSize") ? item.get("dataSize") : 99999,
            checkExp: item.get("checkExp"),
            JSONParam: item.get("JSONParam") ? item.get("JSONParam") : {},
            format: item.get("format")
        }
    };

    if (window.WIS_CONFIG != undefined && (WIS_CONFIG.ROOT_PATH === undefined || WIS_CONFIG.ROOT_PATH == ""))
        WIS_CONFIG.ROOT_PATH = WIS_EMAP_SERV.getAppPath();

})(window.WIS_EMAP_SERV = window.WIS_EMAP_SERV || {});

//  多图上传
(function () {
    var Plugin;
    var fileReader = 'FileReader' in window;
    var _init, _renderSize; //私有方法

    Plugin = (function () {
        // 实例化部分
        function Plugin(element, options) {
            this.options = $.extend({}, $.fn.emapSingleImageUpload.defaults, options);
            this.$element = $(element);

            //if (this.options.token && this.options.token != null && this.options.token != '') {
            //    this.options.token = this.options.token.toString();
            //    this.options.scope = this.options.token.substring(0, this.options.token.length - 1);
            //    this.options.newToken = false;
            //} else {
            //    this.options.scope = new Date().getTime() + "" + parseInt(Math.random() * 100).toString();
            //    this.options.token = this.options.scope + 1;
            //    this.options.newToken = true;
            //}

            _init(this.$element, this.options);

        }

        // 公共方法
        Plugin.prototype.getFileToken = function () {
            return this.options.fileInput.emapUploadCore('getFileToken');
        };

        // 返回token下已有的正式文件的url数组
        Plugin.prototype.getFileUrl = function () {
            return  this.options.fileInput.emapUploadCore('getFileToken');

            //var options = this.options;
            //var fileArr;
            //$.ajax({
            //    type: "post",
            //    url: options.contextPath + '/sys/emapcomponent/file/getUploadedAttachment/' + options.token + '.do',
            //    dataType: "json",
            //    async: false,
            //    success: function (res) {
            //        if (res.success) {
            //            var fileHtml = '';
            //            fileArr = $(res.items).map(function () {
            //                return this.fileUrl;
            //            }).get();
            //        }
            //    }
            //});
            //
            //return fileArr;
        };

        Plugin.prototype.saveTempFile = function () {
            return this.options.fileInput.emapUploadCore('saveTempFile');

            //var resultFlag = false;
            //
            //if (!this.options.tempUpload) {
            //    return resultFlag;
            //}
            ////  删除已有的正式文件
            //$.ajax({
            //    type: "post",
            //    url: this.options.contextPath + '/sys/emapcomponent/file/deleteFileByToken/' + this.options.token + '.do',
            //    dataType: "json",
            //    async: false,
            //    success: function (data) {
            //    }
            //});
            //
            //
            //$.ajax({
            //    type: "post",
            //    async: false,
            //    url: this.options.contextPath
            //    + "/sys/emapcomponent/file/saveAttachment/"
            //    + this.options.scope + "/" + this.options.token + ".do",
            //    data: {
            //        attachmentParam: JSON.stringify(this.options.attachmentParams)
            //    },
            //    dataType: "json",
            //    success: function (data) {
            //        resultFlag = data;
            //    }
            //});
            //return resultFlag;
        };

        Plugin.prototype.destroy = function () {
            this.options = null;
            $(this.$element).data('plugin', false).empty();
        };
        
        _renderSize = function (options) {
            if (options.size < 1024) {
                return options.size + 'K';
            } else {
                return parseInt(options.size/1024*100)/100 + 'M';
            }
        }

        // 私有方法
        _init = function (element, options) {
            var imgWidth = parseInt(options.width) - 6;
            var imgHeight = parseInt(options.height) - 6;

            $(element).addClass('bh-clearfix').append('<p class="bh-file-img-info"></p>' +
                '<div class="bh-file-img-container" style="width: ' + options.width + 'px;">' +
                '<div class="bh-file-img-input bh-file-img-block bh-file-img-single-block" style="width: ' + options.width + 'px;height: ' + options.height + 'px;">' +
                '<span class="bh-file-img-single-info">' +
                '<span class="bh-file-img-plus">+</span>' +
                '<span class="bh-file-img-text">点击上传</span>' +
                '</span>' +
                '<input type="file">' +
                '<div class="bh-file-img-loading" style="line-height: ' + imgHeight + 'px;">上传中...</div>' +
                '<div class="bh-file-img-fail"></div>' +
                '<div class="bh-file-img-table" style="width: ' + imgWidth + 'px;height: ' + imgHeight + 'px;">' +
                '<span style="width: ' + imgWidth + 'px;height: ' + imgHeight + 'px;">' +
                '<img style="max-width: ' + imgWidth + 'px;max-height: ' + imgHeight + 'px;" />' +
                '</span>' +
                '</div>' +
                '</div>' +
                '<div class="bh-file-img-single-edit">' +
                '<a href="javascript:void(0)" class="bh-file-img-retry">重新上传</a>' +
                '<a href="javascript:void(0)" class="bh-file-img-delete">删除</a>' +
                '</div>' +
                '</div>');

            // 生成描述信息
            var introText = '请上传图片';
            if (options.type && options.type.length > 0) {
                introText += ', 支持' + options.type.join(',').toUpperCase() + '类型';
            }

            if (options.size && options.size > 0) {
                introText += ',大小在' + _renderSize(options) + '以内';
            }

            $('.bh-file-img-info', element).html(introText);

            if (options.height <= 100) {
                $('.bh-file-img-text', element).hide();
            }

            // 获取token下已有的文件
            if (!options.newToken) {
                $.ajax({
                    type: "post",
                    url: options.contextPath + '/sys/emapcomponent/file/getUploadedAttachment/' + options.token + '.do',
                    dataType: "json",
                    success: function (res) {
                        if (res.success && res.items && res.items.length > 0) {
                            // console.log(res)
                            var imgBlock = $('.bh-file-img-container', element);
                            $('.bh-file-img-table img', imgBlock).attr('src', res.items[0].fileUrl);
                            imgBlock.addClass('saved').data({
                                'fileid': res.items[0].id
                            });


                        }
                    }
                });
            }

            options.fileInput = $('input[type=file]', element).parent();

            options.fileInput.emapUploadCore($.extend({}, options, {
                add: function (e, data) {
                    var file = data.files[0];
                    $('.bh-file-img-container', element).addClass('loading');
                    if (options.add) {
                        options.add(e, data);
                    }
                    data.submit();

                },
                submit: function (e, data) {
                    var file = data.files[0];
                    var imgBlock = $('.bh-file-img-container', element);
                    // 文件的大小 和类型校验
                    if (options.type && options.type.length > 0) {
                        if (!new RegExp(options.type.join('|').toUpperCase()).test(file.name.toUpperCase())) {
                            imgBlock.removeClass('loading').addClass('error').find('.bh-file-img-fail').html('文件类型不正确');
                            return false;
                        }
                    }

                    if (fileReader && options.size) {
                        if (file.size / 1024 > options.size) {
                            imgBlock.removeClass('loading').addClass('error').find('.bh-file-img-fail').html('文件大小超出限制');
                            return false;
                        }
                    }
                    imgBlock.data('xhr', data);
                    if (options.submit) {
                        options.submit(e, data);
                    }
                },
                done: function (e, data) {
                    var file = data.files[0];
                    var imgBlock = $('.bh-file-img-container', element);

                    // 上传成功
                    imgBlock.removeClass('loading').addClass('success');
                    options.tempUpload = true;
                    $('img', imgBlock).attr('src', data.result.tempFileUrl);
                    imgBlock.data({
                        'fileid': data.result.id,
                        'deleteurl': data.result.deleteUrl
                    });
                    if (options.done) {
                        options.done(e, data)
                    }
                },
                fail: function (e, data) {
                    var file = data.files[0];
                    var imgBlock = $('.bh-file-img-container', element);
                    imgBlock.removeClass('loading').addClass('error').find('.bh-file-img-fail').html(data.result.error ? data.result.error : '上传失败');
                    if (options.fail) {
                        options.fail(e, data)
                    }
                }
            }));


            // 删除事件绑定
            $(element).on('click', '.bh-file-img-delete', function () {
                var imgBlock = $(this).closest('.bh-file-img-container');
                if (imgBlock.hasClass('success')) {
                    // 删除临时文件
                    options.fileInput.emapUploadCore('deleteTempFile', {
                        url: imgBlock.data('deleteurl'),
                        fileId: imgBlock.data('fileid'),
                        done: function (data) {
                            imgBlock.removeClass('success');
                            $('.bh-file-img-table img', imgBlock).attr('src', '');
                        }
                    });

                } else if (imgBlock.hasClass('error')) {
                    // 错误文件直接删除
                    imgBlock.removeClass('error');
                } else if (imgBlock.hasClass('loading')) {
                    //  删除正在上传的文件
                    imgBlock.data('xhr').abort();
                    imgBlock.removeClass('loading');
                } else if (imgBlock.hasClass('saved')) {
                    // 删除正式文件
                    // 在保存时  正式图片才被删除
                    options.fileInput.emapUploadCore('deleteArrAdd', imgBlock.data('fileid'));
                    imgBlock.removeClass('saved');
                    $('.bh-file-img-table img', imgBlock).attr('src', '');
                    options.tempUpload = true;
                }
            });

            // 重新上传事件绑定
            $(element).on('click', '.bh-file-img-retry', function () {
                var imgBlock = $('.bh-file-img-container', element);
                options.fileInput.emapUploadCore('deleteArrAdd', imgBlock.data('fileid'));
                imgBlock.removeClass('saved success fail loading');
                $('.bh-file-img-table img', imgBlock).attr('src', '');
                $('input[type=file]', imgBlock).click();
            });

        };

        // 定义插件
        $.fn.emapSingleImageUpload = function (options) {
            var instance;
            instance = this.data('plugin');

            // 判断是否已经实例化
            if (!instance) {
                return this.each(function () {
                    if (options == 'destroy') {
                        return this;
                    }
                    return $(this).data('plugin', new Plugin(this, options));
                });
            }
            if (options === true) {
                return instance;
            }
            if ($.type(options) === 'string') {
                return instance[options]();
            }
        };

        // 插件的默认设置
        $.fn.emapSingleImageUpload.defaults = {
            tempUpload: false,
            multiple: false,
            dataType: 'json',
            storeId: 'image',
            width: 200,
            height: 150,
            type: ['jpg', 'png', 'bmp'],
            size: 0
        };


    })();

}).call(this);
// 文件上传
(function () {
    var Plugin;
    var fileReader = 'FileReader' in window;
    var _init, _deleteFormalFile; //私有方法

    Plugin = (function () {
        // 实例化部分
        function Plugin(element, options) {
            this.options = $.extend({}, $.fn.emapUploadCore.defaults, options);
            this.$element = $(element);

            if (this.options.token && this.options.token != '') {
                this.options.scope = this.options.token.substring(0, this.options.token.length - 1);
                this.options.newToken = false;
            } else {
                this.options.scope = new Date().getTime() + "" + parseInt(Math.random() * 100).toString();
                this.options.token = this.options.scope + 1;
                this.options.newToken = true;
            }
            this.options.arrToDelete = [];
            this.options.uploadUrl = this.options.contextPath + '/sys/emapcomponent/file/uploadTempFile/' + this.options.scope + '/' + this.options.token + '.do';
            _init(this.$element, this.options);

        }

        // 获取token
        Plugin.prototype.getFileToken = function () {
            return this.options.token;
        };

        // 返回token下已有的正式文件的url数组
        Plugin.prototype.getFileUrl = function () {
            var options = this.options;
            var fileArr;
            $.ajax({
                type: "post",
                url: options.contextPath + '/sys/emapcomponent/file/getUploadedAttachment/' + options.token + '.do',
                dataType: "json",
                async : false,
                success: function (res) {
                    if (res.success) {
                        fileArr = $(res.items).map(function(){
                            return this.fileUrl;
                        }).get();
                    }
                }
            });
            return fileArr;
        };

        // 将正式文件添加到待删除 数组中
        Plugin.prototype.deleteArrAdd = function (id) {
            if (this.options.arrToDelete.indexOf(id) == -1) {
                this.options.arrToDelete.push(id);
            }
        };

        // 将正式文件从待删除数组中  剔除
        Plugin.prototype.deleteArrRemove = function (id) {
            var index = this.options.arrToDelete.indexOf(id);
            if (index > -1) {
                this.options.arrToDelete.splice(index, 1);
            }
        };

        // 保存token
        Plugin.prototype.saveTempFile = function () {
            // 删除 已经删除的正式文件
            var options = this.options;
            //_deleteFormalFile(this.$element, options);
            this.$element.emapUploadCore('deleteFormalFile');
            //if (options.loadedCon.getFileNum() == 0) {
            //    return;
            //}
            var result = false;
            $.ajax({
                type: "post",
                async: false,
                url: options.contextPath
                + "/sys/emapcomponent/file/saveAttachment/"
                + options.scope + "/" + options.token + ".do",
                data: {
                    attachmentParam: JSON.stringify(this.options.attachmentParams)
                },
                dataType: "json",
                success: function (data) {
                    if (data.success) {
                        result = options.token;
                    }
                }
            });
            return result;
        };

        // 删除正式文件
        Plugin.prototype.deleteFormalFile = function (id) {
            var options = this.options;
            if (id) {
                deleteAjax(id);
            } else {
                var delArr = this.options.arrToDelete;
                if (delArr.length > 0) {
                    for (var i = 0; i < delArr.length; i ++) {
                        deleteAjax(delArr[i]);
                    }
                }
            }

            function deleteAjax(id) {
                var idArr = [id, id + '_1', id + '_2'];
                idArr.map(function(val){
                    $.ajax({
                        type: "post",
                        url: options.contextPath + '/sys/emapcomponent/file/deleteFileByWid/' + val + '.do',
                        dataType: "json",
                        success: function (data) {}
                    });
                })
            }
        };

        // 删除临时文件
        Plugin.prototype.deleteTempFile = function (params) {
            var options = this.options;
            $.ajax({
                type: "post",
                url: params.url,
                dataType: "json",
                data: {
                    attachmentParam: JSON.stringify({
                        storeId: options.storeId,
                        scope: options.scope,
                        fileToken: options.token,
                        items: [{
                            id: params.fileId,
                            status: 'Delete'
                        }]
                    })
                },
                success: function (data) {
                    if (data.success) {
                        params.done && params.done(data);
                    }
                }
            });
        };

        // 删除token下的所有正式文件
        Plugin.prototype.deleteFileByToken = function () {
            var options = this.options;

            $.ajax({
                type: "post",
                url: options.contextPath + '/sys/emapcomponent/file/deleteFileByToken/' + options.token + '.do',
                async: false,
                dataType: "json"
            }).done(function(res){});
        };

        Plugin.prototype.destroy = function () {
            this.options = null;
            $(this.$element).data('plugin', false).empty();
        };

        Plugin.prototype.reload = function () {
            var options = this.options;
            options.newToken = true;
            options.scope = new Date().getTime() + "" + parseInt(Math.random() * 100).toString();
            options.token = this.options.scope + 1;
            options.uploadUrl = this.options.contextPath + '/sys/emapcomponent/file/uploadTempFile/' + this.options.scope + '/' + this.options.token + '.do';
            options.arrToDelete = [];

            options.attachmentParams = {
                storeId: options.storeId,
                scope: options.scope,
                fileToken: options.token,
                params: options.params
            };
            $('input[type=file]', this.$element).fileupload({url: options.uploadUrl})
        };

        // 私有方法
        _init = function (element, options) {

            options.attachmentParams = {
                storeId: options.storeId,
                scope: options.scope,
                fileToken: options.token,
                params: options.params
            };

            if ($('input[type=file]', element).length == 0) {
                element.append('<input type="file" name="bhFile" />')
            }

            $('input[type=file]', element).fileupload({
                url: options.uploadUrl,
                autoUpload: true,
                multiple: options.multiple,
                dataType: 'json',
                limitMultiFileUploads: 2,
                formData: {
                    size: options.size,
                    type: options.type,
                    storeId: options.storeId
                },
                add: function (e, data) {
                    var addResult = true;
                    if (options.add) {
                        addResult = options.add(e, data);
                    }
                    if (addResult === false) {return false}
                    data.submit();
                },
                submit: function (e, data) {
                    var submitResult = true;
                    if (options.submit) {
                        submitResult = options.submit(e, data);
                    }
                    if (submitResult === false) {return false}
                },
                done: function (e, data) {
                    var file = data.files[0];
                    if (data.result.success) {
                        // 上传成功
                        if (options.done) {
                            options.done(e, data)
                        }
                        element.trigger('bh.file.upload.done', data);
                    } else {
                        // 上传失败
                        if (options.fail) {
                            options.fail(e, data)
                        }
                    }


                },
                fail: function (e, data) {
                    if (options.fail) {
                        options.fail(e, data)
                    }
                }
            });
        };

        // 删除 待删除数组中的 正式文件
        _deleteFormalFile = function (element, options) {
            var delArr = options.arrToDelete;
            if (delArr.length > 0) {
                for (var i = 0; i < delArr.length; i ++) {
                    deleteAjax(delArr[i]);
                    deleteAjax(delArr[i] + '_1');
                    deleteAjax(delArr[i] + '_2');
                }
            }

            function deleteAjax(id) {
                $.ajax({
                    type: "post",
                    url: options.contextPath + '/sys/emapcomponent/file/deleteFileByWid/' + id + '.do',
                    dataType: "json",
                    success: function (data) {}
                });
            }
        };

        // 定义插件
        $.fn.emapUploadCore = function (options, params) {
            var instance;
            instance = this.data('emapuploadcore');

            // 判断是否已经实例化
            if (!instance) {
                return this.each(function () {
                    if (options == 'destroy') {
                        return this;
                    }
                    return $(this).data('emapuploadcore', new Plugin(this, options));
                });
            }
            if (options === true) {
                return instance;
            }
            if ($.type(options) === 'string') {
                return instance[options](params);
            }
        };

        // 插件的默认设置
        $.fn.emapUploadCore.defaults = {
            multiple: false,
            dataType: 'json',
            storeId: 'file',
            type: [],
            size: 0
        };


    })();

}).call(this);
(function () {
    var Plugin,
        _init,
        _getValidateCondition,
        _getValueLength;  //插件的私有方法

    Plugin = (function () {

        function Plugin(element, options) {
            if ($.fn.emapValidate.rules) {
                $.fn.emapValidate.allRules = $.extend({}, $.fn.emapValidate.defaultRules, $.fn.emapValidate.rules);
            } else {
                $.fn.emapValidate.allRules = $.fn.emapValidate.defaultRules;
            }
            this.options = $.extend({}, $.fn.emapValidate.defaults, options);
            this.$element = $(element);
            _init($(element), options);

        }

        Plugin.prototype.validate = function () {
            return this.$element.jqxValidator('validate');
        };

        Plugin.prototype.destroy = function () {
            this.options = null;
            $(this.$element).data('validate', false)
                .find('.jqx-validator-error-info').remove();// 修复jqx destroy方法 对日期控件的bug
            return this.$element.jqxValidator('destroy');
        };
        return Plugin;
    })();

    _init = function (element, options) {
        var validateRules = _getValidateCondition(element, options);
        if (options.callback) {
            options.callback(validateRules);
        }
        element.jqxValidator({
            useHintRender: true,
            rules: validateRules
        });
    };

    _getValidateCondition = function (element, options) {
        var rules = [];
        $('[xtype]', element).each(function () {
            var _this = $(this);
            var itemRules;
            // 跳过隐藏字段 跳过disable 字段
            if (_this.closest('.bh-row').attr('hidden') || _this.closest('.bh-form-group').hasClass('bh-disabled')) {
                return true
            }
            //2016-04-20 qiyu 表格表单
            // var row = _this.closest('.bh-row');
            var row = _this.closest('.form-validate-block');
            
            var name = _this.data('name');
            var label = $('label.bh-form-label', row).text();
            var xtype = _this.attr('xtype');
            var dataType = _this.data('type');

            //  必填校验
            if ($('.bh-required', row).length > 0) {
                itemRules = {
                    input: '[data-name=' + name + ']',
                    message: label + '不能为空',
                    action: 'change, blur, valuechanged',
                    rule: 'required'
                };
                if (xtype == 'select' || xtype == 'date-local' || xtype == 'date-ym' || xtype == 'date-full' || xtype == 'selecttable') {
                    itemRules.rule = function () {
                        return _this.val() != '';
                    }
                }
                if (xtype == 'tree') {
                    itemRules.rule = function () {
                        return _this.emapDropdownTree('getValue') != '';
                    }
                }
                if (xtype == 'multi-select') {
                    itemRules.rule = function () {
                        return _this.jqxComboBox('getSelectedItems').map(function (item) {
                                return item.value;
                            }).join(',') != '';
                    }
                }
                // 上传的必填校验
                if (xtype == 'uploadfile' || xtype =='uploadsingleimage' || xtype == 'uploadmuiltimage') {
                    itemRules.rule = function () {
                        return _this.emapFileUpload('getFileNum') != 0;
                    }
                }

                rules.push(itemRules);
            }

            // 内容长度校验
            // var maxLength = _this.attr('maxlength');
            var maxLength = _this.data('checksize');
            if (!maxLength) {
                if (options.easyCheck) {
                    //  bi~bi~bi~ 开启简单长度校验模式,所有字符 都算三个长度
                    if (dataType == 'String' && (!xtype || xtype == 'text' || xtype == 'textarea')) {
                        maxLength = _this.data('size') ? Math.floor(_this.data('size')/3) : 0;
                    } else {
                        maxLength = _this.data('size') ? _this.data('size') : 0;
                    }
                } else {
                    // 默认:  严格校验模式 , 只有汉字算三个长度
                    maxLength = _this.data('size') ? _this.data('size') : 0;
                }



            }

            if (maxLength) {
                itemRules = {
                    input: '[data-name=' + name + ']',
                    message: label + '长度超出限制',
                    action: 'change, blur, valuechanged',
                    rule: function () {
                        return _getValueLength(_this.val()) <= maxLength;
                    }
                };

                if (options.easyCheck) {
                    itemRules.message = label + '长度不能超过' + maxLength + '个字';
                    itemRules.rule = function () {
                        return _this.val().length <= maxLength;
                    }
                }

                if (xtype == 'multi-select') {
                    itemRules.message = '最多选择' + maxLength*3 + '项';
                    itemRules.rule = function () {
                        return _this.jqxComboBox('getSelectedItems').length <= (maxLength*3);
                    }
                }
                rules.push(itemRules);
            }

            // 正则校验

            var exp = decodeURI(_this.data('checkexp'));
            if(exp && exp != "undefined") {
                rules.push({
                    input: '[data-name=' + name + ']',
                    message: label + '不正确',
                    action: 'change, blur, valuechanged',
                    rule: function () {
                        if (_this.val() == "") {return true;}  // 空值不做校验
                        return eval(exp).test(_this.val());
                    }
                });
            }

            // 类型校验
            var checkType = decodeURI(_this.data('checktype'));
            checkType = checkType.replace(/\[|\]|\"|custom/g, "");
            if ($.fn.emapValidate.allRules[checkType]) {
                itemRules = {
                    input: '[data-name=' + name + ']',
                    message: $.fn.emapValidate.allRules[checkType].alertText,
                    action: 'change, blur, valuechanged'
                };
                if ($.fn.emapValidate.allRules[checkType].regex) {
                    itemRules.rule = function () {
                        if (_this.val() == "") {return true;}  // 空值不做校验
                        return new RegExp($.fn.emapValidate.allRules[checkType].regex).test(_this.val());
                    }
                } else if ($.fn.emapValidate.allRules[checkType].func) {
                    itemRules.rule = function () {
                        if (_this.val() == "") {return true;}  // 空值不做校验
                        return $.fn.emapValidate.allRules[checkType].func(_this.val());
                    }
                }
                rules.push(itemRules);
            }
        });
        return rules;
    };

    // 获取取值长度   中文为 2个字符
    _getValueLength = function (val) {
        return val.replace(/[\u4E00-\u9FA5]/g, '***').length;
    };

    $.fn.emapValidate = function (options) {
        var instance;
        instance = this.data('validate');
        if (!instance) {
            return this.each(function () {
                return $(this).data('validate', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') return instance[options]();
        return this;
    };

    $.fn.emapValidate.defaults = {
        easyCheck: false
    };


    $.fn.emapValidate.defaultRules = {
        "dateRange": {
            "regex": "none",
            "alertText": "* 无效的 ",
            "alertText2": " 日期范围"
        },
        "dateTimeRange": {
            "regex": "none",
            "alertText": "* 无效的 ",
            "alertText2": " 时间范围"
        },
        "minSize": {
            "regex": "none",
            "alertText": "最少 ",
            "alertText2": " 个字符"
        },
        "maxSize": {
            "regex": "none",
            "alertText": "最多 ",
            "alertText2": " 个字符"
        },
        "groupRequired": {
            "regex": "none",
            "alertText": "* 至少填写其中一项"
        },
        "min": {
            "regex": "none",
            "alertText": "* 最小值为 "
        },
        "max": {
            "regex": "none",
            "alertText": "* 最大值为 "
        },
        "past": {
            "regex": "none",
            "alertText": "* 日期需在 ",
            "alertText2": " 之前"
        },
        "future": {
            "regex": "none",
            "alertText": "* 日期需在 ",
            "alertText2": " 之后"
        },
        "maxCheckbox": {
            "regex": "none",
            "alertText": "* 最多选择 ",
            "alertText2": " 个项目"
        },
        "minCheckbox": {
            "regex": "none",
            "alertText": "* 最少选择 ",
            "alertText2": " 个项目"
        },
        "equals": {
            "regex": "none",
            "alertText": "* 两次输入的密码不一致"
        },
        "creditCard": {
            "regex": "none",
            "alertText": "* 无效的信用卡号码"
        },
        "phone": {
            // credit:jquery.h5validate.js / orefalo
            "regex": /^([\+][0-9]{1,3}[ \.\-])?([\(]{1}[0-9]{2,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
            "alertText": "无效的电话号码"
        },
        "email": {
            // Shamelessly lifted from Scott Gonzalez via the Bassistance Validation plugin http://projects.scottsplayground.com/email_address_validation/
            "regex": /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
            "alertText": "无效的邮件地址"
        },
        "integer": {
            "regex": /^[\-\+]?\d+$/,
            "alertText": "只能填写整数"
        },
        "number": {
            // Number, including positive, negative, and floating decimal. credit:orefalo
            "regex": /^[\-\+]?((([0-9]{1,3})([,][0-9]{3})*)|([0-9]+))?([\.]([0-9]+))?$/,
            "alertText": "只能填写数字"
        },
        "date": {
            "regex": /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/,
            "alertText": "无效的日期，格式必需为 YYYY-MM-DD"
        },
        "ipv4": {
            "regex": /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/,
            "alertText": "无效的 IP 地址"
        },
        "url": {
            "regex": /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
            "alertText": "无效的网址"
        },
        "onlyNumberSp": {
            "regex": /^[0-9\ ]+$/,
            "alertText": "只能填写数字"
        },
        "onlyLetterSp": {
            "regex": /^[a-zA-Z\ \']+$/,
            "alertText": "只能填写英文字母"
        },
        "onlyLetterNumber": {
            "regex": /^[0-9a-zA-Z]+$/,
            "alertText": "只能填写数字与英文字母"
        },
        //tls warning:homegrown not fielded
        "dateFormat": {
            "regex": /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|1\d|2[0-8]))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(0?2(\/|-)29)(\/|-)(?:(?:0[48]00|[13579][26]00|[2468][048]00)|(?:\d\d)?(?:0[48]|[2468][048]|[13579][26]))$/,
            "alertText": "无效的日期格式"
        },
        //tls warning:homegrown not fielded
        "dateTimeFormat": {
            "regex": /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1}$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^((1[012]|0?[1-9]){1}\/(0?[1-9]|[12][0-9]|3[01]){1}\/\d{2,4}\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1})$/,
            "alertText": "* 无效的日期或时间格式",
            "alertText2": "可接受的格式： ",
            "alertText3": "mm/dd/yyyy hh:mm:ss AM|PM 或 ",
            "alertText4": "yyyy-mm-dd hh:mm:ss AM|PM"
        },

        /**
         * 正则验证规则补充
         * Author: ciaoca@gmail.com
         * Date: 2013-10-12
         */
        "chinese": {
            "regex": /^[\u4E00-\u9FA5]+$/,
            "alertText": "* 只能填写中文汉字"
        },
        "chinaId": {
            /**
             * 2013年1月1日起第一代身份证已停用，此处仅验证 18 位的身份证号码
             * 如需兼容 15 位的身份证号码，请使用宽松的 chinaIdLoose 规则
             * /^[1-9]\d{5}[1-9]\d{3}(
             *    (
             *        (0[13578]|1[02])
             *        (0[1-9]|[12]\d|3[01])
             *    )|(
             *        (0[469]|11)
             *        (0[1-9]|[12]\d|30)
             *    )|(
             *        02
             *        (0[1-9]|[12]\d)
             *    )
             * )(\d{4}|\d{3}[xX])$/i
             */
            "regex": /^[1-9]\d{5}[1-9]\d{3}(((0[13578]|1[02])(0[1-9]|[12]\d|3[0-1]))|((0[469]|11)(0[1-9]|[12]\d|30))|(02(0[1-9]|[12]\d)))(\d{4}|\d{3}[xX])$/,
            "alertText": "* 无效的身份证号码"
        },
        "chinaIdLoose": {
            "regex": /^(\d{18}|\d{15}|\d{17}[xX])$/,
            "alertText": "* 无效的身份证号码"
        },
        "chinaZip": {
            "regex": /^\d{6}$/,
            "alertText": "* 无效的邮政编码"
        },
        "qq": {
            "regex": /^[1-9]\d{4,10}$/,
            "alertText": "* 无效的 QQ 号码"
        },
        "maxLength": {
            func: function (field, rules, i, options) {
                var max = rules[i + 2];
                var val = field.val();
                var len = 0;
                for (var index = 0; index < val.length; index++) {
                    if (val[index].match(/[^\x00-\xff]/ig) != null) {
                        len += 3;
                    } else {
                        len++;
                    }
                }
                options.allrules.maxLength.alertText = "* 内容过长，超过 " + (len - max) + " 个字符";
                return max >= len;
            }//,
            // "alertText":"* 内容过长"
        },
        "before": {
            "func": function (field, rules, i, options) {
                var title = $.trim(field.closest(".form-group").find(".control-label").text());
                var title1 = "";
                var p = rules[i + 2];
                var $form = field.closest("form");
                var fieldAlt = $form.find("*[name='" + p.replace(/^#+/, '') + "']");
                if (fieldAlt.size() > 0) {
                    fieldAlt.validationEngine("hide");
                }
                if (!field.val()) {
                    return true;
                }
                var pdate = null;
                if (p.toLowerCase() == "now") {
                    pdate = new Date();
                    title1 = "当前时间";
                } else if (fieldAlt.size() > 0) {
                    if (fieldAlt.val()) {
                        pdate = $.parseDate(fieldAlt.val());
                    }
                    title1 = $.trim(fieldAlt.closest(".form-group").find(".control-label").text());
                } else {
                    pdate = $.parseDate(p);
                    title1 = p;
                }
                if (!pdate) {
                    return true;
                }
                var vdate = $.parseDate(field.val());
                if (vdate > pdate) {
                    options.allrules.before.alertText = title + "不能晚于" + title1;
                    return false;
                }
                return true;
            }
        },
        "after": {
            "func": function (field, rules, i, options) {
                var title = $.trim(field.closest(".form-group").find(".control-label").text());
                var title1 = "";
                var p = rules[i + 2];
                var $form = field.closest("form");
                var fieldAlt = $form.find("*[name='" + p.replace(/^#+/, '') + "']");
                if (fieldAlt.size() > 0) {
                    fieldAlt.validationEngine("hide");
                }
                if (!field.val()) {
                    return true;
                }
                var pdate = null;

                if (p.toLowerCase() == "now") {
                    pdate = new Date();
                    title1 = "当前时间";
                } else if (fieldAlt.size() > 0) {
                    if (fieldAlt.val()) {
                        pdate = $.parseDate(fieldAlt.val());
                    }
                    title1 = $.trim(fieldAlt.closest(".form-group").find(".control-label").text());
                } else {
                    pdate = $.parseDate(p);
                    title1 = p;
                }
                if (!pdate) {
                    return true;
                }
                var vdate = $.parseDate(field.val());
                if (vdate < pdate) {
                    options.allrules.after.alertText = title + "不能早于" + title1;
                    return false;
                }
                return true;
            }
        }
    }

}).call(this);
