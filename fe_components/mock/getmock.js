window.MOCK_CONFIG = {};
/**
 * 获取emap pageMeta数据
 * @param  {String} pagePath 页面地址
 * @return {Object}        pageMeta
 */
WIS_EMAP_SERV.getPageMeta = function(pagePath, params) {

    var params = $.extend({ "*json": "1" }, params);
    var pageMeta = BH_UTILS.doSyncAjax(WIS_EMAP_SERV.getAbsPath(pagePath), params, "GET");
    window._EMAP_PageMeta = window._EMAP_PageMeta || {};
    window._EMAP_PageMeta[pagePath] = pageMeta;
    if (typeof pageMeta.loginURL != 'undefined') {
        window._EMAP_PageMeta = {};
    }
    return pageMeta;
}

function getURLMock(url, settings){
    var models = BH_UTILS.doSyncAjax(url, {}, "GET").models;
    for (var i = 0; i < models.length; i++) {
        if (models[i].name == settings.action) {
            url = models[i].url;
            break;
        }
    }
    return url;
}

function getMethodMock(){
    return 'POST';
}

function getSourceMock(source){
    source.root = "datas>rows";
    return source;
}

function getTotalRecordsMock(data, action){
    return data.datas.totalSize || data.datas.total_size;
}

WIS_EMAP_SERV.getAppPath = function(){
    return '';
}