(function ($) {
    'use strict';
    $.ampAppDetail = {
        init: function(options){
            var defaults = {
                appId: '',
                rootPath: ''
            };
            options = $.extend({}, defaults, options);
            _init(options)
        },
        show: function(options){
            showAppDetail();
        },
        hide: function(options){
            hideAppDetail();
        }
    };

    function _init(options){
        getAppDetailData(options, addDataToDialog);
    }

    function getAppDetailData(options, callback){
        var appDetailStyle = '.ad-container{display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;background-color:rgba(0,0,0,.65);opacity:1;filter:alpha(opacity=100)}.ad-container.ad-active{display:block}.ad-content{position:absolute;top:104px;right:48px;bottom:48px;left:48px;background-color:#fff}.ad-icon-close{position:absolute;right:0;top:0;margin:16px;cursor:pointer;z-index:1;width:24px;height:24px;color:#ddd}.ad-icon-close:hover{color:#fff;background-color:#ddd}.ad-icon-close:before{content:"+";top:1px;left:3px;position:absolute;font-size:30px;transform:rotate(45deg);-ms-transform:rotate(45deg);-webkit-transform:rotate(45deg);-o-transform:rotate(45deg);-moz-transform:rotate(45deg)}.ad-app-img{float:left;width:32px;height:32px;margin-right:8px}.ad-app-title{font-size:16px;color:#333;line-height:28px}.ad-article{position:absolute;overflow:hidden;padding:24px;width:100%;height:100%}.ad-header{margin-bottom:4px}.ad-header:after{content:"";clear:both;display:table}.ad-body{position:relative;clear:both;overflow:auto;height:-moz-calc(100% - 32px);height:-webkit-calc(100% - 32px);height:calc(100% - 32px);border-bottom:1px solid #F7F8FC}.showSweetAlert{-webkit-animation:showSweetAlert .3s;animation:showSweetAlert .3s}.hideSweetAlert{-webkit-animation:hideSweetAlert .2s;animation:hideSweetAlert .2s}@-webkit-keyframes showSweetAlert{0%{transform:scale(.7);-webkit-transform:scale(.7)}45%{transform:scale(1.05);-webkit-transform:scale(1.05)}80%{transform:scale(.95);-webkit-transform:scale(.95)}100%{transform:scale(1);-webkit-transform:scale(1)}}@keyframes showSweetAlert{0%{transform:scale(.7);-webkit-transform:scale(.7)}45%{transform:scale(1.05);-webkit-transform:scale(1.05)}80%{transform:scale(.95);-webkit-transform:scale(.95)}100%{transform:scale(1);-webkit-transform:scale(1)}}@-webkit-keyframes hideSweetAlert{0%{transform:scale(1);-webkit-transform:scale(1)}100%{transform:scale(.7);-webkit-transform:scale(.7)}}@keyframes hideSweetAlert{0%{transform:scale(1);-webkit-transform:scale(1)}100%{transform:scale(.7);-webkit-transform:scale(.7)}}';
        $('head').append('<style>'+appDetailStyle+'</style>');
        var rootPath = options.rootPath.lastIndexOf('/') === options.rootPath.length - 1 ? options.rootPath : options.rootPath + '/';
        var dataUrl = rootPath + "jsonp/appIntroduction.json?appId="+options.appId;
        $.ajax({
            type: "GET",
            url: dataUrl,
            cache: false,
            dataType: "jsonp",
            jsonp: "amp_jsonp_callback",
            success: function (data) {
                callback(options, data);
            },
            error: function(){
                callback(options, '');
            }
        });
    }

    function addDataToDialog(options, data){
        var dialogHtml = getDialogHtml(data);
        var $dialog = $(dialogHtml);
        $('body').append($dialog);
        eventListen($dialog);
    }

    function getDialogHtml(data){
        var noIntroImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAACQCAYAAADnRuK4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDVBMTZCRjM3Qjg1MTFFNUJGMzY5NzU5RTU2NjBDMzgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDVBMTZCRjQ3Qjg1MTFFNUJGMzY5NzU5RTU2NjBDMzgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowNUExNkJGMTdCODUxMUU1QkYzNjk3NTlFNTY2MEMzOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNUExNkJGMjdCODUxMUU1QkYzNjk3NTlFNTY2MEMzOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsD7p2YAAB3USURBVHja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';
        var introduction =
            '<div style="margin: 150px auto 0 auto; auto;text-align:center;">' +
                '<img src="'+noIntroImg+'"/>' +
                '<div style="font-size:18px;color:#b4b4b4;margin-top: 16px;">暂无服务说明</div>' +
            '</div>';

        var title = '', appImage = '';
        if(data){
            var appInfo = data.appInfo;
            if(appInfo){
                title = appInfo.appName;
                appImage = appInfo.middleIcon ? '<img class="ad-app-img" src="'+appInfo.middleIcon+'" />' : '';
            }
            var appIntroduction = data.introduction;
            if($.trim(appIntroduction).length !== 0){
                introduction = appIntroduction;
            }
        }
        var html =
            '<div class="ad-container" amp-ad-role="appDetail">' +
                '<div class="ad-content showSweetAlert">' +
                    '<div class="ad-icon-close"></div>' +
                    '<div class="ad-article">' +
                        '<div class="ad-header">' +
                            appImage +
                            '<div class="ad-app-title">'+title+'</div>' +
                        '</div>' +
                        '<div class="ad-body">' +
                            introduction+
                        '</div>'+
                    '</div>'+
                '</div>' +
            '</div>';

        return html;
    }

    function eventListen($dialog){
        $dialog.on('click', '.ad-icon-close', function(){
            hideAppDetail();
        });
    }

    function showAppDetail(){
        var $appDetail = $('div[amp-ad-role="appDetail"]');
        var $appDetailContent = $appDetail.children('.ad-content');
        $appDetailContent.removeClass('hideSweetAlert').addClass('showSweetAlert');
        $appDetail.addClass('ad-active');
    }

    function hideAppDetail(){
        var $appDetail = $('div[amp-ad-role="appDetail"]');
        var $appDetailContent = $appDetail.children('.ad-content');
        $appDetailContent.removeClass('showSweetAlert').addClass('hideSweetAlert');
        setTimeout(function(){
            $appDetail.removeClass('ad-active');
        }, 200);
    }
})(jQuery);
(function ($) {
    'use strict';
    $.bhEvaluate = {
        init: function(options){
            var defaults = {
                appId: '', //应用id
                userId: '',
                rootPath: '',
                starSelectAll: true,
                stepNum: 15, //每次加载显示评价的条数
                dataType: 'jsonp',
                jsonp: 'amp_jsonp_callback'
            };
            options = $.extend({}, defaults, options);
            var rootPath = options.rootPath;
            if(!/\/$/.test(rootPath)){
                rootPath += '/';
            }
            if(!/jsonp\/$/.test(rootPath)){
                rootPath += 'jsonp/';
            }
            options.rootPath = rootPath;
            init(options);
        },
        show: function(options){
            var defaults = {
            };
            options = $.extend({}, defaults, options);
            show(options);
        },
        hide: function(options){
            var defaults = {
                destroy: false //隐藏时默认不销毁组件
            };
            options = $.extend({}, defaults, options);
            hide(options);
        },
        destroy: function(options){
            destroy(options);
        }
    };

    function init(options){
        if(!options.appId || !options.userId || !options.rootPath){
            return;
        }
        try{
            doAjax(options.rootPath + 'appInfo.json?appId='+options.appId,{},"get", options).done(function(data){
                var appData = data.data ? data.data : data.result;
                options.appTitle = appData.name ? appData.name : appData.appName;
                options.appImg = appData.middleIcon;
                doAjax(options.rootPath + 'appAssessInfo?appId='+options.appId+'&rangeStart=1&rangeEnd='+parseInt(options.stepNum+1, 10),{},"get", options).done(function(assessData){
                    var html = getContainerHtml(options, assessData);
                    var $html = $(html);
                    var _style = getEvaluateStyle();
                    $('head').append('<style>'+_style+'</style>');
                    $('body').append($html);
                    if(assessData.myAssessment){
                        if(assessData.myAssessment.isAnonymous == 1){
                            $html.find('input[bh-evaluate-role="checkbox"]').prop('checked', true);
                        }
                    }
                    eventListen($html, options);

                    //isOpenAssessPage自动打开评价,0：否；1：是
                    if(assessData.isOpenAssessPage){
                        show();
                    }
                });
            });
        }catch (e){

        }
    }

    function getContainerHtml(options, assessData){
        if(!assessData){
            return;
        }
        assessData = resetKey(assessData);
        var appScoreData = getAppScore(assessData);
        var containerHtml =
            '<div class="bh-evaluate" bh-evaluate-role="bhEvaluate">'+
                '<div class="bh-evaluate-mini bh-animated-fast" bh-evaluate-role="mini">' +
                    '@miniContent'+
                '</div>'+
                '<div class="bh-evaluate-normal bh-animated" bh-evaluate-role="normal">' +
                    '<a class="bh-evaluate-closeIcon" bh-evaluate-role="closeIcon">×</a>' +
                    '<div class="bh-evaluate-left-close" bh-evaluate-role="closeIcon">' +
                        '<div></div>' +
                        '<img src="'+getLeftCloseIconData()+'" />' +
                    '</div>' +
                    '@appInfo'+
                    '@starAnalysis'+
                    '@myEvaluate'+
                    '@evaluateList'+
                '</div>'+
            '</div>';

        containerHtml = containerHtml.replace('@miniContent', getMiniContentHtml(appScoreData, options))
            .replace('@appInfo', getAppInfoHtml(assessData, appScoreData, options))
            .replace('@starAnalysis', getStarAnalysisHtml(appScoreData))
            .replace('@myEvaluate', getMyEvaluateHtml(assessData))
            .replace('@evaluateList', getEvaluateListHtml(assessData, options));
        return containerHtml;
    }

    /**
     * 获取迷你评价的html
     * @param assessData 所有评价数据
     * @param appScoreData 计算后该应用的评价相关数据
     * @returns {string}
     */
    function getMiniContentHtml(appScoreData, options){
        var appImg = options.appImg;
        var appScore = appScoreData.appScore;
        var starHtml = getStarIconHtml(appScore);
        var html =
            '<div><img src="'+appImg+'" alt="应用图标"></div>'+
            '<div class="bh-evaluate-score bh-vertical" bh-evaluate-role="appStar">' +
                starHtml +
            '</div>' +
            '<div class="bh-evaluate-miniScore" bh-evaluate-role="appScore">'+appScore+'</div>';
        return html;
    }

    /**
     * 获取展开后评价的html
     * @param assessData 所有评价数据
     * @param appScoreData 计算后该应用的评价相关数据
     * @returns {string}
     */
    function getAppInfoHtml(assessData, appScoreData, options){
        var appImg = options.appImg;
        var appTitle = options.appTitle;
        var totalAssessCount = assessData.totalAssessCount;
        var appScore = appScoreData.appScore;
        var starHtml = getStarIconHtml(appScore);
        var html =
            '<div class="bh-clearfix">' +
                '<div class="bh-evaluate-appImg">' +
                    '<img src="'+appImg+'" alt="应用图标">' +
                '</div>' +
                '<div class="bh-evaluate-appRecord">' +
                    '<h3 class="bh-evaluate-appRecord-title" title="'+appTitle+'">'+appTitle+'</h3>' +
                    '<div class="bh-color-caption">' +
                        '<span bh-evaluate-role="count">'+totalAssessCount+'</span>人已评价' +
                    '</div>' +
                    '<div class="bh-evaluate-score" bh-evaluate-role="appStar">' +
                        starHtml +
                        '<span class="bh-color-caption" bh-evaluate-role="appScore">'+appScore+'分</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
        return html;
    }

    /**
     * 获取星级评价html
     * @param assessData
     * @returns {string}
     */
    function getStarAnalysisHtml(appScoreData){
        var html =
            '<div class="bh-clearfix">' +
                '<div class="bh-pull-left">' +
                    getAnalysisStarHtml() +
                '</div>' +
                '<div class="bh-evaluate-personPercent" bh-evaluate-role="percent">' +
                    getAnalysisPercentHtml(appScoreData) +
                '</div>' +
            '</div>';

        return html;
    }

    /**
     * 获取我的评价html
     * @param assessData
     * @returns {string}
     */
    function getMyEvaluateHtml(assessData){
        var myAssess = assessData.myAssessment;
        var myScore = 0;
        var myScoreNum = 0;
        var myText = '';
        var isAnonymous = 0;
        if(myAssess){
            myScore = myAssess.score;
            myText = myAssess.assessment;
            isAnonymous = myAssess.isAnonymous;
            myScoreNum = myScore;
        }else{
            myScoreNum = 5;
        }
        var html =
            '<div class="bh-evaluate-own bh-mt-16">' +
                '<div class="bh-clearfix">' +
                    '<h6 class="bh-pull-left">我的评价</h6>' +
                    '<div class="bh-evaluate-myStar">' +
                        getMyEvaluateStarHtml(myScore) +
                    '</div>' +
                    '<div class="bh-evaluate-myScore">' +
                        '<span bh-evaluate-role="myScore" data-score="'+myScoreNum+'">'+myScoreNum+'</span>分' +
                    '</div>' +
                '</div>' +
                '<textarea class="bh-mt-8" rows="4" bh-evaluate-role="textArea" placeholder="" maxlength="170">'+myText+'</textarea>' +
                '<div class="bh-evaluate-submit bh-mt-4 bh-clearfix">' +
                    '<a class="bh-btn bh-btn-primary" bh-evaluate-role="submit" href="javascript:void(0);">提交评价</a>' +
                    '<div class="bh-checkbox">' +
                        '<label>' +
                            '<input type="checkbox" bh-evaluate-role="checkbox" value="">' +
                            '<i class="bh-choice-helper"></i>' +
                            '<span>匿名评价</span>' +
                        '</label>' +
                    '</div>' +
                    '<span class="bh-evaluate-errorPrompt" bh-evaluate-role="errorPrompt"></span>'+
                '</div>' +
            '</div>';

        return html;
    }

    /**
     * 获取我的评价的星星html
     * @param myScore
     * @returns {string}
     */
    function getMyEvaluateStarHtml(myScore){
        var myStarHtml = '';
        for(var i=0; i<5; i++){
            if(myScore){
                if(i+1 <= myScore){
                    myStarHtml += '<i class="iconfont icon-star bh-selected" bh-evaluate-role="myEvaluateStar"></i>';
                }else{
                    myStarHtml += '<i class="iconfont icon-staroutline" bh-evaluate-role="myEvaluateStar"></i>';
                }
            }else{
                myStarHtml += '<i class="iconfont icon-star bh-selected" bh-evaluate-role="myEvaluateStar"></i>';
            }
        }
        return myStarHtml;
    }

    /**
     * 获取评价列表
     * @param assessData
     * @returns {string}
     */
    function getEvaluateListHtml(assessData, options){
        var evaluateList = assessData.assessments;
        var html = getEvaluateItemsHtml(evaluateList);
        var moreBtn = getBtnMoreEvaluateHtml(options, assessData);
        html = '<div class="bh-evaluate-list" bh-evaluate-role="evaluateList">'+ html + moreBtn +'</div>';
        return html;
    }

    function getBtnMoreEvaluateHtml(options, assessData){
        var html = '';
        var step = options.stepNum;
        var evaluateCount = assessData.totalAssessCount;
        if(evaluateCount > step){
            html = '<div class="bh-evaluate-moreBtn" bh-evaluate-role="moreBtn">更多</div>';
        }
        return html;
    }

    function getEvaluateItemsHtml(evaluateList){
        var html = '';
        if(evaluateList){
            var evaluateListLen = evaluateList.length;
            for(var i=0; i<evaluateListLen; i++){
                html += getEvaluateItemHtml(evaluateList[i]);
            }
        }
        return html;
    }

    function getEvaluateItemHtml(evaluateItem){
        var itemHtml = '';
        if(evaluateItem){
            var userImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAO8SURBVEhLnZZraBRXFMf/dzbZNOmaxDQ+sMnGqKWRon4xoqg10SjU6BfxCeZFqyh+USr4STQV/CR+aK0l0FYTFEExPqAYpFDFB9H4wRdY2miSkiar3UqMrzS7M9dzZk83ye7MxOwPLnPOf+bec19z7lV4D2qOdUxWylqllFqmlSpQ0AWsa6hupXW3BXULFs431hV32hU88AxY1/h4kVbGPvqoQiRPNHCHyt7G6uIWkZJwDLj15O/5g2bGD/RyrUhjRF+xTFXnNOKkgDR9JYZPn6NXJSKliA5ZSm1qrCq+IoLNiIAcTBm4phTyRRrCigINq4HXYREEqoCvb4kzEq0RVbC+OFYz/VeRhgLyNEZM/zXHkT38BWjZL44Lu9vESET3GTBLf6r+pJ096l4MXjPXaRwtGHOkXIxEVK6JtFPixALybkx9gwgDr8RIhtqeW9PUsZFtOyBvfX46wmsnaFqUhSuWizc2lMYB+8k/teFDr626cagU0UgE3zeftd1X/f243NyMq5cSfjfXdYxhmVhgcAYR35OGixfEAgLZ2VhTW4vvzpzGwooKbN6xg7oe3w6uGGmopIBqmfiOzMt/CcuyYJqmKEOwvn7LVyj9fDFy88bjo4yIvHGGVqTM4NwoviOPXmRhSlHQXj8vdh74Bn2DaeI5wznY+D8Ru/Ey4sOeQ4fF8yAwCaZOSlwJqKmG1sq7W8SutmKx3Nl/v0gsb2gNdbfYntwOjxMrmdNdyZnQCVqVboPPNPE9OdkxUayR/DuYjhvPcsTzhgdHU4ob4nuSH9DY92ASIv8NiKIQGXiNo3/kYnzWaGsXg75qNfikFt8VOj2wZGYOls8pQP/zEMK9f1HpwovnYZTNKsTSz9ynezimUhfsrtU2dbSRMddWEziyIYgsv4G/+wdxtyeWL7PDd/HmwyCimXm2v2RaDgJ+H9r/GcDBlpCtJaNDwcKuQjs9KG3V29owfDSsn6um2sGYj7P9WPlpLMDFngDuhd7ylQKVJXl2MGbGhA9wdJPzbrW0qq8vL6fzUahrevIbhS4TF9+uL0QgI9bQWPnyRCfvyDhktxcFO2dywHgC5DsIvYgf56kGY2ZPyRLLDhbVFqo4GPvxgHzh0QbW8QcipczWxcP+S21tp7ZbxRsKyPCFh+8gmX6jT6SUyEw3ZGTWluO1038U2Z2mm09n0EnQRgk7Jajun3TOzpfm3h+quJkrSzujQt/2UtlGpmt+ju9SL6gR7m0lFb6BF9AZGrvq0zWfHlxaSeMT+jo9PfYA8A5NP7NmJzMaKQAAAABJRU5ErkJggg==';
            var userName = evaluateItem.assessorName;
            var userId = evaluateItem.assessorId;
            var isAnonymous = evaluateItem.isAnonymous;
            if(isAnonymous && isAnonymous == "1"){
                userName = '匿名用户';
            }
            var score = evaluateItem.score;
            var text = evaluateItem.assessment;

            itemHtml =
                '<div class="bh-pt-4" bh-evaluate-role="item">' +
                    '<div class="bh-evaluate-info bh-pv-8">' +
                        '<div class="bh-evaluate-infoUserImg">' +
                            '<img src="'+userImg+'" alt="">' +
                        '</div>' +
                        '<div class="bh-evaluate-infoUserDetail">' +
                            '<div class="bh-evaluate-userName" data-user-id="'+userId+'">'+userName+'</div>' +
                            '<div class="bh-evaluate-score">' +
                                getStarIconHtml(score) +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="bh-evaluate-commentText bh-color-caption bh-clearfix">' +
                        text +
                    '</div>' +
                '</div>';
        }

        return itemHtml;
    }

    function show(options){
        var $body = $('body');
        var $mini = $body.find('div[bh-evaluate-role="mini"]');
        var $normal = $body.find('div[bh-evaluate-role="normal"]');
        var isIE9 = checkIsIE9();
        if(!isIE9){
            addAndRemoveClass($mini, 'bh-animate-outRight', 'bh-animate-enterFromRight');
            setTimeout(function(){
                addAndRemoveClass($normal, 'bh-animate-enterFromRight', 'bh-animate-outRight');
                $normal.show();

                setTimeout(function(){
                    var $evaluateList = $normal.find('div[bh-evaluate-role="evaluateList"]');
                    try{
                        $evaluateList.niceScroll();
                    }catch(e){
                        $evaluateList.css({'overflow': 'auto'});
                    }

                }, getAnimateTime().normal+50);
            }, getAnimateTime().fast);
        }else{
            $normal.show();
            $mini.hide();
        }

    }

    function hide(options){
        var $body = $('body');
        var $mini = $body.find('div[bh-evaluate-role="mini"]');
        var $normal = $body.find('div[bh-evaluate-role="normal"]');
        var isIE9 = checkIsIE9();
        if(!isIE9){
            addAndRemoveClass($normal, 'bh-animate-outRight', 'bh-animate-enterFromRight');
            setTimeout(function(){
                if(options.destroy){
                    destroy();
                }else{
                    addAndRemoveClass($mini, 'bh-animate-enterFromRight', 'bh-animate-outRight');
                }
            }, getAnimateTime().normal);
        }else{
            $normal.hide();
            $mini.show();
        }
    }

    function checkIsIE9(){
        var isIE9 = false;
        var OsObject = window.navigator.userAgent;
        if (!!window.ActiveXObject || "ActiveXObject" in window){
            if(OsObject.indexOf("MSIE")>0) {
                var version = OsObject.match(/MSIE \d+/i);
                var versionNum = version[0].match(/\d+/i);
                if(parseInt(versionNum) == 9){
                    isIE9 = true;
                }
            }
        }
        return isIE9;
    }

    function destroy(options){
        $('body').find('div[bh-evaluate-role="bhEvaluate"]').remove();
    }

    function eventListen($dom,options){
        //点击迷你块，将评价展开
        $dom.on('click', 'div[bh-evaluate-role=mini]', function(){
            show(options);
        });
        //点击展开的关闭按钮，显示迷你块
        $dom.on('click', '[bh-evaluate-role=closeIcon]', function(){
            hide(options);
        });
        //提交
        $dom.on('click', '[bh-evaluate-role=submit]', function(){
            evaluateSubmit(options);
        });
        //查看更多评论
        $dom.on('click', 'div[bh-evaluate-role=moreBtn]', function(){
            loadMoreEvaluate(options);
        });

        //点击评价的星星
        $dom.on('click', 'i[bh-evaluate-role="myEvaluateStar"]', function(){
            var $starItem = $(this);
            var $assessErrorPrompt = $dom.find('span[bh-evaluate-role="errorPrompt"]');
            var index = $starItem.index();
            setMyEvaluateScore($dom, index);
            $dom.find('span[bh-evaluate-role="myScore"]')
                .html(parseInt(index+1, 10)).attr("data-score",index+1);

            if($assessErrorPrompt.attr("data-err-flag") === "score"){
                $assessErrorPrompt.hide().attr("data-flag","");
            }
        });
        //评价星星鼠标经过监听
        $dom.on('mouseover','i[bh-evaluate-role="myEvaluateStar"]',function(){
            var index = $(this).index();
            setMyEvaluateScore($dom, index);
        });
        //评价星星鼠标离开监听
        $dom.on('mouseout','i[bh-evaluate-role="myEvaluateStar"]',function(){
            var score = $dom.find('[bh-evaluate-role="myScore"]').attr('data-score');
            setMyEvaluateScore($dom, score-1);
        });
    }

    function addAndRemoveClass($dom, addClassName, removeClassName){
        $dom.removeClass(removeClassName).addClass(addClassName);
    }

    function getAnimateTime(){
        return {"normal": 450, "fast": 250};
    }

    //计算该应用的评分
    function getAppScore(data){
        var assessScore = data.assessScore,
            //评论人数
            scoreCountNum = 0,
            //评分总分数
            allScore = 0,
            //应用评分平均分
            appScore  = 0,
            //评分星级百分比
            scorePercent = {};
        if(assessScore){
            for(var i=0;i<5;i++){
                var item = assessScore[i],
                    countNums = parseInt(item.scoreAssessCount),
                    score = parseInt(item.score);
                scoreCountNum += countNums;
                allScore += score*countNums;
                scorePercent[score] = countNums;
            }

            appScore = parseFloat(allScore/scoreCountNum).toFixed(1);
            if(scoreCountNum === 0){
                appScore = 0;
            }
            appScore = appScore.toString().replace(".0","");
        }

        var scoreData = {scoreCountNum: scoreCountNum, scorePercent: getAssessScoreLine(scorePercent, scoreCountNum), appScore: appScore};
        return scoreData;
    }

    /**
     * 获取每个星级评分比例线
     * @param scorePercent
     * @param allScore
     * @returns {string}
     */
    function getAssessScoreLine(scorePercent, allScore){
        var scoreLint = {};
        for(var i=5;i>0;i--){
            var percent = getScorePercent(allScore, scorePercent[i]);
            if(percent === "0.00%" || percent === "0%"){
                scoreLint[i] = 0;
            }else{
                scoreLint[i] = percent;
            }
        }
        return scoreLint;
    }
    /**
     * 获取每个星级评分百分比
     * @param allScore  总评分
     * @param itemScore 单个星级评分
     * @returns {string}
     */
    function getScorePercent(allScore, itemScore){
        if(allScore === 0){
            return "0%";
        }else{
        	var scorePercent = parseFloat(itemScore/allScore)*100;
        	scorePercent = scorePercent.toFixed(2);
        	
            return scorePercent+"%";
        }
    }

    /**
     * 根据应用评分，获取显示星星图标的html
     * @param appScore
     * @returns {string}
     */
    function getStarIconHtml(appScore){
        var html = '';
        appScore = parseInt(appScore, 10);
        for(var i=0; i<5; i++){
            if(i < appScore){
                html += '<i class="iconfont icon-star"></i>';
            }else{
                html += '<i class="iconfont icon-staroutline"></i>';
            }
        }
        return html;
    }

    /**
     * 获取单行评分星级的星星html
     */
    function getAnalysisStarHtml(){
        var lineHtml = '<div class="bh-evaluate-star">@lineStar</div>';
        var starHtml = '<i class="iconfont icon-star @active"></i>';
        var analysisStarHtml = '';
        for(var i=0; i<5; i++){
            var lineStarHtml = '';
            for(var k=0; k<5; k++){
                var activeClass = '';
                if(k >= i){
                    activeClass = 'bh-active';
                }
                lineStarHtml += starHtml.replace('@active', activeClass);
            }
            analysisStarHtml += lineHtml.replace('@lineStar', lineStarHtml);
        }
        return analysisStarHtml;
    }

    /**
     * 获取单行评分星级的百分比html
     */
    function getAnalysisPercentHtml(assessData){
        var percentHtml = '';
        var percentData = assessData.scorePercent;
        for(var i=5; i>0; i--){
            var percent = percentData[i];
            var style = '';
            if(percent === 0){
                style = 'width: '+percent+';border-color:transparent;';
            }else{
                style = 'width: '+percent+';';
            }
            var tip = percent ? percent : '';
            percentHtml += '<div title="'+tip+'"><div class="bh-evaluate-personLine"><div style="'+style+'"></div></div></div>';
        }
        return percentHtml;
    }

    /**
     * ajax请求公共方法-promise方式调用
     * @param  {String} url    请求URL
     * @param  {Object} params 请求参数
     * @param  {String} method 请求方法
     * @return {Promise}
     */
    function doAjax(url, params, method, options){
        var deferred = $.Deferred();
        $.ajax({
            type: method || 'POST',
            url: url,
            //traditional: true,
            data: params || {},
            dataType: options.dataType,
            jsonp: options.jsonp,
            success: function (resp) {
                //如果未登录跳转至登录页面
                try{
                    if(typeof resp == 'string'){
                        resp = JSON.parse(resp);
                    }
                }catch(e){
                }

                deferred.resolve(resp);
            },
            error: function (resp) {
                deferred.reject(resp);
            }
        });
        return deferred.promise();
    }
    
    //评价提交
    function evaluateSubmit(options){
        var $evaluate = $('div[bh-evaluate-role="bhEvaluate"]');
        var myEvaluateScore = $evaluate.find('span[bh-evaluate-role="myScore"]').attr("data-score"),
            evaluateText = $.trim($evaluate.find('textarea[bh-evaluate-role="textArea"]').val()),
            $evaluateErrorPrompt = $evaluate.find('span[bh-evaluate-role="errorPrompt"]');
        if(!myEvaluateScore || myEvaluateScore === "0"){
            $evaluateErrorPrompt.html("请给应用打分").show().attr('data-err-flag', 'score');
            return;
        }else if(evaluateText.length === 0){
            $evaluateErrorPrompt.html("请给应用写评价").show().attr('data-err-flag', 'noContent');
            return;
        }else if(evaluateText.length > 170){
            $evaluateErrorPrompt.html("请保持170个字以内的评价").show().attr('data-err-flag', 'contentMore');
            return;
        }else{
            $evaluateErrorPrompt.html("").hide();
        }

        var appId = options.appId,
            score = myEvaluateScore,
            isAnonymous = $evaluate.find('input[bh-evaluate-role="checkbox"]').prop("checked");
        if(isAnonymous){
            isAnonymous = 1;
        }else{
            isAnonymous = 0;
        }
        //避免快速点击导致重叠
        $("#assessSubmit").attr("data-submit-active", "true");
        var evaluateItemData = {"appId":appId,"score":score,"title":"","content":evaluateText,"isAnonymous":isAnonymous};

        doAjax(options.rootPath + 'assessApp', evaluateItemData, 'get', options).done(function(data){
            addEvaluateToContent(evaluateItemData, options, data);
            $("#assessSubmit").removeAttr("data-submit-active");
        });
    }

    /**
     * 设置我的评分
     * @param $myAssessScore
     * @param index 选中星级的序号
     */
    function setMyEvaluateScore($dom, index){
        $dom.find('i[bh-evaluate-role="myEvaluateStar"]').each(function(i){
            if(i > index){
                $(this).removeClass('bh-selected icon-star').addClass('icon-staroutline');
            }else{
                $(this).addClass("bh-selected icon-star").removeClass('icon-staroutline');
            }
        });
    }

    function addEvaluateToContent(evaluateItemData, options, backData){
        //重组数据的key
        evaluateItemData.assessment = evaluateItemData.content;
        evaluateItemData.assessorId = options.userId;
        evaluateItemData.assessorName = options.userName;
        var evaluateItemHtml = getEvaluateItemHtml(evaluateItemData);
        var $evaluate = $('div[bh-evaluate-role="bhEvaluate"]');
        var $evaluateList = $evaluate.find('div[bh-evaluate-role="evaluateList"]');
        var userId = options.userId;
        $evaluateList.find('[data-user-id="'+userId+'"]').closest('div[bh-evaluate-role="item"]').remove();

        var $evaluateItems = $evaluateList.children('div');
        $evaluateList.scrollTop(0);
        if($evaluateItems.length > 0){
            $evaluateItems.eq(0).before(evaluateItemHtml);
        }else{
            $evaluateItems.append(evaluateItemHtml);
        }

        refreshEvaluate(backData, options);
    }

    function refreshEvaluate(backData, options){
        var assessData = resetKey(backData);
        var appScoreData = getAppScore(assessData);
        var appScore = appScoreData.appScore;
        var totalAssessCount = backData.totalAssessCount;
        var percentHtml = getAnalysisPercentHtml(appScoreData);
        var evaluateList = assessData.assessments;
        var evaluateItemsHtml = getEvaluateItemsHtml(evaluateList);
        var moreBtn = getBtnMoreEvaluateHtml(options, assessData);

        var starHtml = getStarIconHtml(appScore);
        starHtml +='<span class="bh-color-caption" bh-evaluate-role="appScore">'+appScore+'分</span>';
        var $evaluate = $('div[bh-evaluate-role="bhEvaluate"]');
        $evaluate.find('div[bh-evaluate-role="appStar"]').html(starHtml);
        $evaluate.find('div[bh-evaluate-role="appScore"]').html(appScore);

        $evaluate.find('span[bh-evaluate-role="count"]').html(totalAssessCount);
        $evaluate.find('div[bh-evaluate-role="percent"]').html(percentHtml);
        $evaluate.find('div[bh-evaluate-role="evaluateList"]').html(evaluateItemsHtml + moreBtn);

        if(typeof AmpUtils !== 'undefined'){
            AmpUtils.synchronousAppAssess(backData.myAssessment.appId);
        }
    }

    function resetKey(data){
        var assessScore = data.assessScore;
        if(assessScore){
            assessScore = resetKeyListHandle(assessScore,
                {"countNums": "scoreAssessCount", "socre": "score"});
            data.assessScore = assessScore;
        }

        var assessments = data.assessments;
        if(assessments){
            assessments = resetKeyListHandle(assessments,
                {"assessor": "assessorId", "cname":"assessorName",
                    "assContent":"assessment","anonymousFlag":"isAnonymous",
                    "assDate":"assessTime"});
            data.assessments = assessments;
        }

        var myAssessment = data.myAssessment;
        if(myAssessment){
            myAssessment = resetOneKeyHandel(myAssessment, "assessor", "assessorId");
            myAssessment = resetOneKeyHandel(myAssessment, "cname", "assessorName");
            myAssessment = resetOneKeyHandel(myAssessment, "assContent", "assessment");
            myAssessment = resetOneKeyHandel(myAssessment, "anonymousFlag", "isAnonymous");
            myAssessment = resetOneKeyHandel(myAssessment, "assDate", "assessTime");
            data.myAssessment = myAssessment;
        }

        return data;
    }

    function resetKeyListHandle(data, keyValue){
        var dataLen = data.length;
        if(dataLen > 0){
            for(var i=0; i<dataLen; i++){
                var dataItem = data[i];
                for(var key in keyValue){
                    var keyData = dataItem[key];
                    data[i] = resetOneKeyHandel(dataItem, key, keyValue[key]);
                }
            }
        }
        return data;
    }

    function resetOneKeyHandel(data, oldKey, newKey){
        var oldKeyData = data[oldKey];
        if(oldKeyData || oldKeyData === 0){
            data[newKey] = oldKeyData;
        }
        return data;
    }

    function loadMoreEvaluate(options){
        var $evaluate = $('div[bh-evaluate-role="bhEvaluate"]');
        var $evaluateList = $evaluate.find('div[bh-evaluate-role="evaluateList"]');
        var $moreBtn = $evaluateList.find('div[bh-evaluate-role="moreBtn"]');
        var page = $moreBtn.data("page");
        page = page ? page : 2;
        var rangeStart = (page - 1) * options.stepNum + 1;
        var rangeEnd = rangeStart - 1 + options.stepNum;
        $moreBtn.data("page", page+1);
        doAjax(options.rootPath + 'appAssessInfo?appId='+options.appId+'&rangeStart='+rangeStart+'&rangeEnd='+rangeEnd,{},"get", options).done(function(assessData){
            assessData = resetKey(assessData);
            var evaluateList = assessData.assessments;
            var totalAssessCount = assessData.totalAssessCount;
            var isEnd = false;
            if(rangeEnd >= totalAssessCount){
                isEnd = true;
            }
            var evaluateItemsHtml = getEvaluateItemsHtml(evaluateList);
            if(isEnd){
                $moreBtn.remove();
                $evaluateList.append(evaluateItemsHtml);
            }else{
                $moreBtn.before(evaluateItemsHtml);
            }
        }).fail(function(){
        });
    }

    function getEvaluateStyle(){
        var style = '.bh-evaluate{position:relative;z-index:99999}.bh-evaluate-mini{text-align:center;width:40px;height:156px;padding:16px 0;right:0;top:-moz-calc(50% - 78px);top:-webkit-calc(50% - 78px);top:calc(50% - 78px);cursor:pointer}.bh-evaluate-mini:hover{-webkit-box-shadow:0 4px 16px rgba(0,0,0,0.24);box-shadow:0 4px 16px rgba(0,0,0,0.24)}.bh-evaluate-mini img{width:28px;height:28px}.bh-evaluate-normal{width:371px;height:100%;padding:32px 24px;top:0;right:0;display:none}.bh-evaluate-mini,.bh-evaluate-normal{background-color:#fff;position:fixed;-webkit-box-shadow:0 2px 8px rgba(0,0,0,0.28);box-shadow:0 2px 8px rgba(0,0,0,0.28)}.bh-evaluate-mini{z-index:100}.bh-evaluate-closeIcon{z-index:9999;width:24px;height:24px;position:absolute;top:8px;right:8px;text-align:center;font-size:20px;color:#D8DCF0;cursor:pointer}.bh-evaluate-closeIcon:hover{color:#fff;background-color:#F0F1F9}.bh-evaluate-left-close{position:absolute;cursor:pointer;background-color:#fff;width:12px;height:60px;left:-12px;top:-moz-calc(50% - 30px);top:-webkit-calc(50% - 30px);top:calc(50% - 30px);-webkit-box-shadow:0 2px 8px rgba(0,0,0,0.28);box-shadow:0 2px 8px rgba(0,0,0,0.28)}.bh-evaluate-left-close img{position:absolute;top:-moz-calc(50% - 6px);top:-webkit-calc(50% - 6px);top:calc(50% - 6px);left:6px}.bh-evaluate-left-close div{position:absolute;height:inherit;width:6px;right:-6px;top:0;background:#fff}.bh-evaluate-appImg{float:left;width:62px;text-align:center}.bh-evaluate-appImg img{width:48px;height:48px}.bh-evaluate-appRecord{float:left;width:245px;height:56px;margin-left:16px}.bh-evaluate-score{margin:4px 0;color:#F4B865}.bh-evaluate-score .iconfont{float:left;font-size:14px;padding-right:2px}.bh-evaluate-score span{padding-left:8px}.bh-evaluate-score.bh-vertical .iconfont{display:block;float:none;padding-right:0;height:14px}.bh-evaluate-score.bh-vertical span{padding-left:0}.bh-evaluate-miniScore{color:#F4B865}.bh-evaluate-star{width:62px;height:12px;line-height:12px}.bh-evaluate-star .iconfont{font-size:12px;color:#D8DCF0;float:left;height:12px}.bh-evaluate-star .bh-active{color:#3E50B4}.bh-evaluate-personPercent{width:245px;float:left;margin-left:16px}.bh-evaluate-personPercent>div{padding:5px 0}.bh-evaluate-personPercent .bh-evaluate-personLine{position:relative;background-color:#D8DCF0}.bh-evaluate-personPercent .bh-evaluate-personLine>div{border:1px solid #3E50B4}.bh-evaluate-own{padding-bottom:16px;border-bottom:1px solid #ddd}.bh-evaluate-own textarea{border:1px solid #D8DCF0;width:100%}.bh-evaluate-myStar{float:left;margin-left:24px}.bh-evaluate-myStar .iconfont{float:left;font-size:24px;color:#ddd;-webkit-text-stroke-width:0}.bh-evaluate-myStar .bh-selected{color:#F4B865}.bh-evaluate-myScore{float:left;margin-left:4px;color:#E24034;font-size:22px;font-weight:bold}.bh-evaluate-submit .bh-btn{margin-left:0;float:left}.bh-evaluate-submit .bh-checkbox{float:left;margin-left:16px}.bh-evaluate-list{height:-moz-calc(100% - 336px - 32px);height:-webkit-calc(100% - 336px - 32px);height:calc(100% - 336px - 32px);overflow:hidden}.bh-evaluate-info{overflow:hidden}.bh-evaluate-info .bh-evaluate-infoUserImg{float:left;line-height:28px}.bh-evaluate-info .bh-evaluate-infoUserImg img{width:28px;height:28px}.bh-evaluate-info .bh-evaluate-infoUserDetail{float:left;margin-left:8px;height:32px}.bh-evaluate-info .bh-evaluate-infoUserDetail .bh-evaluate-userName{line-height:18px}.bh-evaluate-errorPrompt{color:#E24034;margin-left:8px;padding-top:4px;float:left}.bh-evaluate-moreBtn{padding:4px 0;text-align:center;background:#eee;margin-top:4px;cursor:pointer}.bh-evaluate-moreBtn:hover{background-color:#ddd}.bh-clearfix{clear:both}.bh-clearfix:before,.bh-clearfix:after{content:" ";display:table}.bh-clearfix:after{clear:both}.bh-evaluate h3{margin:0;font-size:16px;line-height:16px;color:#666;font-weight:bold}.bh-evaluate h6{margin:0;font-weight:bold;font-size:12px}.bh-evaluate .bh-color-caption{color:#bbb}.bh-evaluate .bh-mt-16,.bh-evaluate .bh-mv-16{margin-top:16px !important}.bh-evaluate .bh-mt-8,.bh-evaluate .bh-mv-8{margin-top:8px !important}.bh-evaluate .bh-mt-4,.bh-evaluate .bh-mv-4{margin-top:4px !important}.bh-evaluate .bh-pt-4,.bh-evaluate .bh-pv-4{padding-top:4px !important}.bh-evaluate .bh-pb-8,.bh-evaluate .bh-pv-8{padding-bottom:8px !important}.bh-evaluate .bh-pull-left{float:left !important}.bh-evaluate .bh-btn{display:inline-block;margin-left:4px;font-weight:400;vertical-align:middle;touch-action:manipulation;cursor:pointer;border:1px solid transparent;white-space:nowrap;padding:6px 8px;line-height:20px;border-radius:1px;min-width:80px;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-box-shadow:0 1px 4px rgba(0,0,0,0.32);box-shadow:0 1px 4px rgba(0,0,0,0.32);-webkit-transition:all;-o-transition:all;transition:all;-webkit-transition-duration:.3s;transition-duration:.3s;text-align:center}.bh-evaluate .bh-btn:hover{text-decoration:none;-webkit-box-shadow:0 2px 8px rgba(0,0,0,0.28);box-shadow:0 2px 8px rgba(0,0,0,0.28)}.bh-evaluate .bh-btn-primary{color:#fff;background-color:#2196F3;border:none}.bh-evaluate .bh-checkbox{padding-top:4px;position:relative;overflow:hidden;line-height:22px;width:80px}.bh-evaluate .bh-checkbox label{padding-left:24px;padding-right:12px;padding-top:0;padding-bottom:0;font-weight:normal;position:relative}.bh-evaluate .bh-checkbox label.bh-disabled .bh-choice-helper{opacity:.4;filter:alpha(opacity=40)}.bh-evaluate .bh-checkbox label.bh-disabled .bh-choice-helper:before{background-color:#eee}.bh-evaluate .bh-checkbox input[type=checkbox]{width:16px;height:16px;position:absolute;top:0;left:0;margin-left:0 !important;z-index:1;cursor:pointer;opacity:0;filter:alpha(opacity=0);margin-top:0}.bh-evaluate .bh-checkbox input[type=checkbox]:checked+.bh-choice-helper:before{-webkit-transform:scale(0);-ms-transform:scale(0);-o-transform:scale(0);transform:scale(0)}.bh-evaluate .bh-checkbox input[type=checkbox]:checked+.bh-choice-helper:after{-webkit-transform:scale(1) rotate(-50deg);-ms-transform:scale(1) rotate(-50deg);-o-transform:scale(1) rotate(-50deg);transform:scale(1) rotate(-50deg);opacity:1;filter:alpha(opacity=100)}.bh-evaluate .bh-checkbox .bh-choice-helper:before,.bh-evaluate .bh-checkbox .bh-choice-helper:after{-webkit-transition:all;-o-transition:all;transition:all;-webkit-transition-duration:250ms;transition-duration:250ms;-webkit-backface-visibility:hidden;-moz-backface-visibility:hidden;backface-visibility:hidden;position:absolute;content:""}.bh-evaluate .bh-checkbox .bh-choice-helper:before{top:2px;width:16px;height:16px;left:0;border:1px solid #bbb;background-color:#ffffff}.bh-evaluate .bh-checkbox .bh-choice-helper:after{opacity:0;filter:alpha(opacity=0);-webkit-transform:scale(0) rotate(80deg);-ms-transform:scale(0) rotate(80deg);-o-transform:scale(0) rotate(80deg);transform:scale(0) rotate(80deg);width:16px;height:12px;border-bottom:2px solid #60BE29;border-left:2px solid #60BE29;border-bottom-left-radius:2px;left:-1px;top:0}.bh-evaluate .bh-checkbox:hover .bh-choice-helper:before{border-color:#60BE29}.bh-evaluate .bh-checkbox:hover label.bh-disabled .bh-choice-helper:before{border-color:#bbb}.bh-evaluate .bh-checkbox span{width:56px;position:absolute;top:0}.bh-animated{-webkit-animation-duration:.45s;animation-duration:.45s;-webkit-animation-fill-mode:both;animation-fill-mode:both}.bh-animated-fast{-webkit-animation-duration:.2s;animation-duration:.2s;-webkit-animation-fill-mode:both;animation-fill-mode:both}@-webkit-keyframes bh-animate-outRight{0%{-webkit-transform:translate3d(0, 0, 0);transform:translate3d(0, 0, 0)}100%{-webkit-transform:translate3d(100%, 0, 0);transform:translate3d(100%, 0, 0)}}@keyframes bh-animate-outRight{0%{-webkit-transform:translate3d(0, 0, 0);transform:translate3d(0, 0, 0)}100%{-webkit-transform:translate3d(100%, 0, 0);transform:translate3d(100%, 0, 0)}}.bh-animate-outRight{-webkit-animation-name:bh-animate-outRight;animation-name:bh-animate-outRight}@-webkit-keyframes bh-animate-enterFromRight{0%{-webkit-transform:translate3d(100%, 0, 0);transform:translate3d(100%, 0, 0)}100%{-webkit-transform:translate3d(0, 0, 0);transform:translate3d(0, 0, 0)}}@keyframes bh-animate-enterFromRight{0%{-webkit-transform:translate3d(100%, 0, 0);transform:translate3d(100%, 0, 0)}100%{-webkit-transform:translate3d(0, 0, 0);transform:translate3d(0, 0, 0)}}.bh-animate-enterFromRight{-webkit-animation-name:bh-animate-enterFromRight;animation-name:bh-animate-enterFromRight}';
        return style;
    }

    function getLeftCloseIconData() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAMCAYAAABBV8wuAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADWSURBVChTXY+hCgJBFEXvvFlww6JoMmzZIhusBqNgtNitfoTfYPATLII2g8FoNGhcZV0Uq4LKBIPCus+ZZTB4wnA5712Gh/iohnHy6OEPAgsfJMa7g2pbl0Pp+9UHxFZKzPfHe916CPNE52dVftKNyR/pNOqBd8kHBrNNkGsdo4IstX4Dwz55dIhoof+dkXUWeQM4heDqr5EkNz8TzoYFlCu5mTei6OppudTRFSl1g6CsaLVix3ELU10PGdwNw2JslnE4qZG+nv+vJ2b4WYZBWKtMrNMAX2iGTovFK4XzAAAAAElFTkSuQmCC';
    }
})(jQuery);
;(function (AmpFeedback, undefined) {
    var imgUrlArr = [];
    AmpFeedback.defaultOption = {
        rootPath: "",
        uploadUrl: "attachment/feedbackUpload",
        submitUrl:  "jsonp/feedbackSubmit",
        uploadJsUrl : "resources/js/plugins/fileupload/jquery.fileupload.js",
        jsonp: "amp_jsonp_callback"
    };
    var modalHtml = '<div id="feedbackModal">' +
        '<i class="icon icon-drag feedback-drag" id="feedbackDrag">' +
        '<span></span><span></span><span></span>' +
        '</i>' +
        '<i class="feedback-dismiss">+</i>' +
        '<h3>问题反馈 <span amp-feedback-role="myFeedbackBtn">| <a href="javascript:void(0)" data-haspermission="true" data-url="portal/html/feedback.html" data-full-screen="false" data-flag="noOpenEvaluate" data-title="我的反馈" data-appid="myfeedback" class="feedback-my-a appFlag">' +
        '我的反馈' +
        '</a></span>' +
        '</h3>' +

        '<div style="display: none;" class="bh-dialog-success"><div class="bh-dialog-icon bh-dialog-icon-success">' +
        '<span class="bh-dialog-icon-line bh-dialog-icon-tip "></span>' +
        '<span class="bh-dialog-icon-line bh-dialog-icon-long "></span>' +
        '<div class="bh-dialog-success-icon-placeholder"></div>' +
        '<div class="bh-dialog-success-icon-fix"></div>' +
        '</div>' +
        '<p class="feedback-success-msg">您的问题我们已经收到,谢谢</p></div>' +

        '<div class="feedback-edit-div">' +
        '<label class="feedback-label">您反馈的服务</label>' +
        '<p class="feedback-appName">管理一月</p>' +
        '<label class="feedback-label">反馈内容 <span>*</span> <i class="errorMsg"></i></label>' +
        '<textarea class="feedback-text" maxlength="400" placeholder="欢迎提出您在使用过程中遇到的问题或宝贵建议(400字以内),感谢您对网上办事大厅的支持"></textarea>' +
        '<label class="feedback-label">上传图片&nbsp;<i>(支持JPG/BMP/PNG图片格式)</i></label>' +
        '<div class="feedback-upload-container">' +
        '<div class="feedback-upload-block">' +
        '<a href="javascript:void(0)" class="feedback-upload">' +
        '<input data-index="0" type="file" name="file" />' +
        '</a>' +
        '<div class="feedback-img-block">' +
        '<img src="" alt="">' +
        '<i>+</i>' +
        '</div>' +
        '<div class="feedback-fail-block">' +
        '<div class="feedback-fail-img">+</div>' +
        '<a href="javascript: void(0)">重新上传</a>' +
        '<span class="feedback-error-tip"></span>' +
        '</div>' +
        '</div>' +
        '<div class="feedback-upload-block">' +
        '<a href="javascript:void(0)" class="feedback-upload">' +
        '<input data-index="1" type="file" name="file" />' +
        '</a>' +
        '<div class="feedback-img-block">' +
        '<img src="" alt="">' +
        '<i>+</i>' +
        '</div>' +
        '<div class="feedback-fail-block">' +
        '<div class="feedback-fail-img">+</div>' +
        '<a href="javascript: void(0)">重新上传</a>' +
        '<span class="feedback-error-tip"></span>' +
        '</div>' +
        '</div>' +
        '<div class="feedback-upload-block">' +
        '<a href="javascript:void(0)" class="feedback-upload">' +
        '<input data-index="2" type="file" name="file"  />' +
        '</a>' +
        '<div class="feedback-img-block">' +
        '<img src="" alt="">' +
        '<i>+</i>' +
        '</div>' +
        '<div class="feedback-fail-block">' +
        '<div class="feedback-fail-img">+</div>' +
        '<a href="javascript: void(0)">重新上传</a>' +
        '<span class="feedback-error-tip"></span>' +
        '</div>' +
        '</div>' +
        '<div class="feedback-upload-block">' +
        '<a href="javascript:void(0)" class="feedback-upload">' +
        '<input data-index="3" type="file" name="file" />' +
        '</a>' +
        '<div class="feedback-img-block">' +
        '<img src="" alt="">' +
        '<i>+</i>' +
        '</div>' +
        '<div class="feedback-fail-block">' +
        '<div class="feedback-fail-img">+</div>' +
        '<a href="javascript: void(0)">重新上传</a>' +
        '<span class="feedback-error-tip"></span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<label class="feedback-label">联系方式</label>' +
        '<input type="text" class="feedback-tele" maxlength="50" placeholder="请留下您的联系方式,以便我们及时回复您">' +
        '<a href="javascript:void(0)" class="feedback-submit">提交反馈</a>' +
        '</div>' +
        '</div>';
    var modalStyle = '*{box-sizing:border-box;}#feedbackModal{font-family: "Microsoft YaHei", "Arial-normal", "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;position:fixed;left:40px;top:80px;background:#fff;width:288px;z-index:31;box-sizing:border-box;padding:16px;-webkit-box-shadow:0 2px 6px rgba(0,0,0,.2);-moz-box-shadow:0 2px 6px rgba(0,0,0,.2);box-shadow:0 2px 6px rgba(0,0,0,.2);display:none}#feedbackModal h3{font-size:14px;}.feedback-drag{display:inline-block;background:none;width: 18px;height: 12px;position:absolute;left:50%;margin-left:-9px;top:4px;cursor:move}.feedback-drag span{display:block;background:#B5B5B5;height:2px;width:100%;margin-bottom:2px;}.feedback-dismiss{width:24px;height:24px;display:block;position:absolute;right:4px;top:4px;color:#767676;font-size:22px;cursor:pointer;line-height:24px;font-style:normal;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);-o-transform:rotate(45deg);transform:rotate(45deg)}.feedback-my-a{font-size:12px;color:#2196f3;font-weight:400}.feedback-label{font-size:12px;display:block;margin-bottom:8px}.feedback-label span{color:red}.feedback-label i{color:#999;font-style:normal}.feedback-label .errorMsg{font-style:normal;color:red}.feedback-text{resize:none;height:78px;display:block;width:100%;border:#ddd solid 1px;padding:4px 8px;margin-bottom:12px}.feedback-tele:focus,.feedback-text:focus{border-color:#2196f3}.feedback-upload-container{width:100%;overflow:visible}.feedback-upload-container:after{content:"";display:block;clear:both}.feedback-upload-block{width:25%;float:left;height:64px;position:relative}.feedback-modal-mask{position:fixed;width:100%;height:100%;top:0;left:0;background-color:rgba(0,0,0,.65);opacity:0;filter:Alpha(opacity=0);-webkit-transition:opacity .5s;-moz-transition:opacity .5s;-ms-transition:opacity .5s;-o-transition:opacity .5s;transition:opacity .5s;z-index:30}.feedback-modal-mask.active{opacity:1}.feedback-upload{display:block;font-size:12px;border-radius:50%;color:#222;font-weight:400;text-align:center;vertical-align:middle;touch-action:manipulation;cursor:pointer;white-space:nowrap;outline:0!important;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;position:relative;overflow:hidden;width:100%;height:100%;border-style:solid;border-width:12px;border-color:#fff;background:#ddd;z-index:1}.feedback-upload:hover{border-color:#EFEFEF}.feedback-upload:after,.feedback-upload:before{content:"";position:absolute;display:block;width:4px;height:24px;background:#fff;top:8px;left:18px;border-radius:2px;z-index:-1}.feedback-upload:before{-webkit-transform-origin:50% 50%;-moz-transform-origin:50% 50%;-ms-transform-origin:50% 50%;-o-transform-origin:50% 50%;transform-origin:50% 50%;-webkit-transform:rotate(90deg);-moz-transform:rotate(90deg);-ms-transform:rotate(90deg);-o-transform:rotate(90deg);transform:rotate(90deg)}.feedback-upload input[type=file]{position:absolute;font-size:100px;top:0;right:0;opacity:0;filter:alpha(opacity=0)}.feedback-img-block{position:absolute;width:100%;height:100%;top:0;left:0;background:#fff;overflow:visible;z-index:2;padding:6px;display:none}.feedback-img-block img{max-width:100%;max-height:100%;width:100%}.feedback-img-block i{font-style:normal;background:#F2453D;color:#fff;position:absolute;width:16px;height:16px;top:0;right:0;font-size:12px;line-height:15px;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);-o-transform:rotate(45deg);transform:rotate(45deg);text-align:center;border-radius:50%;cursor:pointer}.feedback-fail-block{position:absolute;width:100%;height:100%;top:0;left:0;background:#fff;overflow:visible;z-index:2;padding:6px;display:none}.feedback-fail-img{width:32px;height:32px;margin:0 auto;background:#fff;border:#F17373 solid 2px;text-align:center;border-radius:50%;color:#F17373;font-size:32px;line-height:23px;-webkit-transform-origin:50% 50%;-moz-transform-origin:50% 50%;-ms-transform-origin:50% 50%;-o-transform-origin:50% 50%;transform-origin:50% 50%;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);-o-transform:rotate(45deg);transform:rotate(45deg)}.feedback-tele{display:block;width:100%;height:28px;border:#ddd solid 1px;padding:0 8px;margin-bottom:12px}.feedback-submit{display:block;text-decoration:none;color:#fff;background-color:#2196f3;border:none;margin-bottom:0;font-weight:400;text-align:center;vertical-align:middle;touch-action:manipulation;cursor:pointer;background-image:none;white-space:nowrap;outline:0!important;padding:6px 8px;font-size:14px;line-height:20px;border-radius:2px;min-width:80px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-box-shadow:0 1px 2px rgba(0,0,0,.2);box-shadow:0 1px 2px rgba(0,0,0,.2);-webkit-transition:all;-o-transition:all;transition:all;-webkit-transition-duration:300ms;transition-duration:300ms;under-line:none;}.feedback-submit:hover{text-decoration:none;color:#fff;text-decoration:none;-webkit-box-shadow:0 2px 6px rgba(0,0,0,.2);box-shadow:0 2px 6px rgba(0,0,0,.2)}.feedback-error-tip{font-size:12px;position:absolute;top:-20px;background:red;color:#fff;left:50%;-webkit-transform:translate3d(-50%,0,0);-moz-transform:translate3d(-50%,0,0);-ms-transform:translate3d(-50%,0,0);-o-transform:translate3d(-50%,0,0);transform:translate3d(-50%,0,0);white-space:nowrap;display:none}.feedback-fail-block a{font-size:12px;text-decoration: none;color: #02A8F3;}.feedback-appName{margin:0;margin-bottom:8px;color:#999;}' +
            '.feedback-success-msg{text-align:center;color:#999;}.bh-dialog-icon{display:block;width:80px;height:80px;border:4px solid gray;-moz-border-radius:50%;-webkit-border-radius:50%;border-radius:50%;margin:0 auto 32px auto;padding:0;position:relative;box-sizing:content-box;border-color:#FEC006}.bh-dialog-success .bh-dialog-icon-line{height:5px;background-color:#8BC34A;display:block;-moz-border-radius:2px;-webkit-border-radius:2px;border-radius:2px;position:absolute;z-index:2}.bh-dialog-success .bh-dialog-icon-line.bh-dialog-icon-tip{width:25px;left:14px;top:46px;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);-o-transform:rotate(45deg);transform:rotate(45deg)}.bh-dialog-success .bh-dialog-icon-line.bh-dialog-icon-long{width:47px;right:8px;top:38px;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);-o-transform:rotate(-45deg);transform:rotate(-45deg)}.bh-dialog-success .bh-dialog-success-icon-placeholder{width:80px;height:80px;border:4px solid rgba(165,220,134,.2);-moz-border-radius:50%;-webkit-border-radius:50%;border-radius:50%;box-sizing:content-box;position:absolute;left:-4px;top:-4px;z-index:2}.bh-dialog-success .bh-dialog-success-icon-fix{width:5px;height:90px;background-color:#fff;position:absolute;left:28px;top:8px;z-index:1;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);-o-transform:rotate(-45deg);transform:rotate(-45deg)}.bh-dialog-success .bh-dialog-icon::after,.bh-dialog-success .bh-dialog-icon::before{content:"";-moz-border-radius:50%;-webkit-border-radius:50%;border-radius:50%;position:absolute;width:60px;height:120px;background:#fff;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);-o-transform:rotate(45deg);transform:rotate(45deg)}.bh-dialog-success .bh-dialog-icon::before{-moz-border-radius:120px 0 0 120px;-webkit-border-radius:120px 0 0 120px;border-radius:120px 0 0 120px;top:-7px;left:-33px;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);-o-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:60px 60px;-moz-transform-origin:60px 60px;-ms-transform-origin:60px 60px;transform-origin:60px 60px}.bh-dialog-success .bh-dialog-icon::after{-moz-border-radius:0 120px 120px 0;-webkit-border-radius:0 120px 120px 0;border-radius:0 120px 120px 0;top:-11px;left:30px;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);-o-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:0 60px;-moz-transform-origin:0 60px;-ms-transform-origin:0 60px;transform-origin:0 60px}';
    var loadJsFlag = false;

    // 意见反馈功能初始化
    AmpFeedback.init = function (options) {
        var $body = $('body');
        $body.append(modalHtml);
        if($body.find('header[bh-header-role="bhHeader"]').length > 0){
            $body.find('span[amp-feedback-role="myFeedbackBtn"]').hide();
        }
        $('head').append('<style>' + modalStyle + '</style>');
        dragInit();
        eventBind(options);
    };

    // 弹出意见反馈弹框
    AmpFeedback.window = function (option) {
	    imgUrlArr = [];
        var options = $.extend({}, AmpFeedback.defaultOption, option);
        options.rootPath = options.rootPath.lastIndexOf('/')+1 === options.rootPath.length ? options.rootPath : options.rootPath + '/';

        if ($("#feedbackModal").length == 0) {
            AmpFeedback.init(options);
        }
        var fbModal = $("#feedbackModal");
        var feedbackModalMask = $('<div id="feedbackModalMask" class="feedback-modal-mask"></div>');
        $('body').append(feedbackModalMask);

        if(checkIsIE9()){
            if(typeof JPlaceHolder !== 'undefined'){
                JPlaceHolder.init();
            }
        }

        // 渲染app  名称
        $('.feedback-appName', fbModal).html(getFeedbackSource(option).sourceName);
        feedbackModalMask.addClass('active');
        $("#feedbackModalMask").addClass('active');
        fbModal.css({
            "left": "80px",
            "top": (document.documentElement.clientHeight - 450) + 'px'
        }).fadeIn().find('.errorMsg').hide();
        $("#feedbackModal").find(".feedback-text").val('');
        if (!loadJsFlag) {
            $.getScript(options.rootPath + options.uploadJsUrl, function () {
                loadJsFlag = true;
                initFileUpload(options);
            });
        }
    };

    AmpFeedback.doJsonpAjax = function(url, params, options){
        var deferred = $.Deferred();
        $.ajax({
            type: 'GET',
            url: url,
            traditional: true,
            data: params,
            dataType: 'jsonp',
            jsonp: options.jsonp,
            success: function (resp) {
                if(!resp.hasLogin){
                    AmpUtils.goLoginPage();
                }
                deferred.resolve(resp);
            },
            error: function (resp) {
                deferred.reject(resp);
            }
        });
        return deferred.promise();
    };

    function checkIsIE9(){
        var isIE9 = false;
        var OsObject = window.navigator.userAgent;
        if (!!window.ActiveXObject || "ActiveXObject" in window){
            if(OsObject.indexOf("MSIE")>0) {
                var version = OsObject.match(/MSIE \d+/i);
                var versionNum = version[0].match(/\d+/i);
                if(parseInt(versionNum) == 9){
                    isIE9 = true;
                }
            }
        }
        return isIE9;
    }

    // drag
    function dragInit() {
        var posX;
        var posY;
        fdiv = document.getElementById("feedbackModal");
        var modalW = $(fdiv).outerWidth();
        var modalH = $(fdiv).outerHeight();
        var bodyW = document.body.clientWidth;
        var bodyH = document.body.clientHeight;
        document.getElementById("feedbackDrag").onmousedown = function (e) {
            if (!e) e = window.event;  //IE
            posX = e.clientX - parseInt($(fdiv).offset().left);
            posY = e.clientY - parseInt($(fdiv).offset().top - $("body").scrollTop());
            document.onmousemove = mousemove;
        };
        document.onmouseup = function () {
            document.onmousemove = null;
        };
        function mousemove(ev) {
            ev.preventDefault();
            if (ev == null) ev = window.event;//
            var left = (ev.clientX - posX) > 0 ? (ev.clientX - posX) : 0;
            var top = (ev.clientY - posY) > 0 ? (ev.clientY - posY) : 0;

            if (left > bodyW - modalW) {
                left = bodyW - modalW;
            }
            if (top > bodyH - modalH) {
                top = bodyH - modalH;
            }

            fdiv.style.left = left + "px";
            fdiv.style.top = top + "px";
        }
    }

    // 事件绑定
    function eventBind(options) {
        var $feedbackModal = $("#feedbackModal");
        // 关闭 问题反馈 modal
        $feedbackModal.on("click", "i.feedback-dismiss", function () {
            var modal = $("#feedbackModal");
            $("#feedbackModalMask").removeClass('active');
            setTimeout(function(){
                $("#feedbackModalMask").remove();
            }, 500);
            modal.fadeOut().find("input,textarea").val("");
        });

        // 删除上传的图片
        $feedbackModal.on("click", ".feedback-img-block i", function () {
            $(this).closest(".feedback-img-block").hide();
            var url = $(this).siblings("img").attr('src');
            $(imgUrlArr).each(function (i) {
                if (this == url) {
                    imgUrlArr.splice(i, 1);
                    return false;
                }
            });
        });

        // 反馈文本框非空校验
        $feedbackModal.on("keyup", ".feedback-text", function () {
            if ($.trim($(this).val()) != "") {
                $("#feedbackModal .errorMsg").html("").hide();
                //$("#feedbackModal .errorMsg").html('反馈信息不能为空').show();
            }
        });

        // 重新上传
        $feedbackModal.on("click", ".feedback-fail-block a", function () {
            var block = $(this).closest('.feedback-upload-block');
//        	block.find("input[type=file]").fileupload('destroy');
//        	block.empty().html('' +
//    			'<a href="javascript:void(0)" class="feedback-upload">' +
//    			'<input data-index="0" type="file" name="file"></a>' +
//    			'<div class="feedback-img-block"><img src="" alt=""><i>+</i></div>' +
//    			'<div class="feedback-fail-block">' +
//    			'<div class="feedback-fail-img">+</div>' +
//    			'<a href="javascript: void(0)">重新上传</a>' +
//    			'<span class="feedback-error-tip" style="display: none;"></span>' +
//    			'</div>')
//
//        	initFileUpload(options)
//            block.find("input[type=file]").click();
            block.children(".feedback-img-block").hide();
            block.children(".feedback-fail-block").hide();
        });

        // 提交反馈
        $feedbackModal.on("click", "a.feedback-submit", function () {
            // 反馈内容的非空判断
            var textArea = $("#feedbackModal .feedback-text");
            if ($.trim(textArea.val()) == "") {
                $("#feedbackModal .errorMsg").html('反馈信息不能为空').show();
                return;
            } else {
                $("#feedbackModal .errorMsg").html("").hide();

                var feedbackData = $.extend({}, getFeedbackSource(options), {
                    description: textArea.val(),
                    contact: $("#feedbackModal .feedback-tele").val(),
                    url: imgUrlArr
                });

                AmpFeedback.doJsonpAjax(options.rootPath + options.submitUrl, feedbackData, options).done(function (res) {
                    if (res.result == 'success') {
                        var $feedbackModal = $("#feedbackModal");
                        $feedbackModal.find("img").each(function(){
                            $(this).attr("src","");
                        });
                        $feedbackModal.find(".feedback-img-block, feedback-fail-block").hide();

                        $('.feedback-edit-div', $feedbackModal).hide();
                        $('.bh-dialog-success', $feedbackModal).show();
                        setTimeout(function(){
                            $("#feedbackModalMask").removeClass('active');
                            $feedbackModal.find("i.feedback-dismiss").click();
                            setTimeout(function(){
                                $("#feedbackModalMask").remove();
                                $('.feedback-edit-div', $feedbackModal).show();
                                $('.bh-dialog-success', $feedbackModal).hide();
                            }, 500);
                        }, 2000);
                        //AmpUtils && AmpUtils.showPrompt && AmpUtils.showPrompt("", "提交反馈成功", "");
                    } else {
                        //AmpUtils && AmpUtils.showPrompt && AmpUtils.showPrompt("", "提交反馈失败", "");
                    }
                });
            }
        });

        // 鼠标悬浮显示错误信息
        $feedbackModal.on("mouseover", ".feedback-upload-block", function(){
            var tip = $(this).find(".feedback-error-tip");
            tip.show();
        }).on("mouseout", ".feedback-upload-block", function(){
            var tip = $(this).find(".feedback-error-tip");
            tip.hide();
        });

        window.addEventListener('message', function (e) {
            var data = JSON.parse(e.data);
            var index = data.index;

            var block = $(".feedback-upload-block:eq(" + index + ")");
            var imgBlock = block.children(".feedback-img-block");
            var failBlock = block.children(".feedback-fail-block");
            if (data.result == "success") {
                var url = data.data.url;
                imgBlock.children("img")[0].src = url;
                imgBlock.show();
                failBlock.hide();
                imgUrlArr.push(url);
            } else {
                failBlock.show();
            }
        }, false);
    }

    // 获取问题反馈来源
    function getFeedbackSource(option) {
        if (option.sourceId) {
            return option;
        }
        var headTabActive = $("#headTab .head-tab-item.active");
        if (headTabActive.length > 0) {
            return {
                sourceName: headTabActive.text(),
                sourceId: headTabActive.data("menu-id") || headTabActive.data("appid")
            };
        } else {
            // app的问题反馈
            //return AmpFeedback.currentAppInfo;
            return $('body').data('currentappinfo');
        }
    }


    // 上传图片控件 的初始化
    function initFileUpload(options) {
        $(".feedback-upload input[type=file]").each(function (i) {
            $(this).fileupload({
                forceIframeTransport: true,
                autoUpload: true,
                url: options.rootPath + options.uploadUrl,
                formData: {
                    index: $(this).data('index')
                },
                add: function (e, data) {
                    var fileReader = 'FileReader' in window;
                    var files = data.files[0];
                    var block = $(this).closest(".feedback-upload-block");
                    if (!new RegExp(/jpg|png|bmp/g).test(files.name.toLowerCase())) {
                        block.find(".feedback-error-tip").html("文件格式不正确");
                        block.children(".feedback-img-block").hide();
                        block.children(".feedback-fail-block").show();
                        return;
                    }

                    if (files.size / 1024 > 2048) {
                        block.find(".feedback-error-tip").html("大小不能超过2M");
                        block.children(".feedback-img-block").hide();
                        block.children(".feedback-fail-block").show();
                        return;
                    }
                    data.submit();
                },
                done: function (e, result) {
                    var data = result;
                    var block = $(this).closest(".feedback-upload-block");
                    var imgBlock = block.children(".feedback-img-block");
                    var failBlock = block.children(".feedback-fail-block");
                    if (data.result == "success") {
                        var url = data.data.url;
                        imgBlock.children("img").src = "url";
                        imgBlock.show();
                        failBlock.hide();
                        imgUrlArr.push(url);
                    } else {
                        failBlock.show();
                    }
                },
                fail: function () {
                    $(this).closest(".feedback-upload-block").children(".feedback-fail-block").show();
                }
            });
        });
    }

})(window.AmpFeedback = window.AmpFeedback || {});

