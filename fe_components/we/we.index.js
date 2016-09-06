//生成页面布局
BH_UTILS.genMainLayout();
if(window.location.search.indexOf("min=1") == -1){
	//初始化头部
	BH_UTILS.renderHeader();
	//初始化页脚
	BH_UTILS.initFooter(WIS_CONFIG.FOOTER);
}else{
	$(".sc-container-outerFrame").css(
		"margin", "0 auto 1px"
	);
}
//美化滚动条
$("body").niceScroll({zindex:99999});
$('.jqx-window-content').niceScroll();

$(function(){
    $(window).resize(function(){
        //给外层的container添加最小高度
        BH_UTILS.setContentMinHeight($("[bh-container-role=container]"));
    });
});
