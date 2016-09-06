
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

$.importDialog = function (opt) {
	var fileLayer = layer.open({
		type: 1,
		title: '导入数据',
		closeBtn: 1, //不显示关闭按钮
		area: ['480px', '380px'],
		shift: 2,
		shadeClose: false, //开启遮罩关闭
		content: $("#uploadFileContent").html(),
		success: function (layer, index) {
			if (opt.preCallback && opt.preCallback != "") {
				opt.preCallback();
			}
			opt.layer = index;
			$("#fileInput").importData(opt);
		},
		cancel : function () {
			if ($("#daoru").data("loading")) {
				var fileConfirm = layer.confirm('数据正在传输中，关闭窗口将丢失，确认关闭吗？',
					function () {
						layer.close(fileLayer);
						layer.close(fileConfirm);
					}
				);
				return false;
			}
		}
	});
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

$.fn.importData = function (opt) {
	// 下载导入模板参数
	var downTplData = {
		"app" : opt.app,
		"module" : opt.module,
		"page" : opt.page,
		"action" : opt.action
	};
	var scope, token;

	if (opt.params) {
		$.extend(downTplData, opt.params);
	}
	scope = Date.parse(new Date());
	token = scope + 1;
	$(this).fileupload({
		autoUpload: false,//是否自动上传
		url: contextPath + '/emap/sys/emapcomponent/file/uploadTempFile/' + scope + '/' + token + '.do',//上传地址
		dataType: 'json',
		add: function (e, data) {

			var file = data.files;
			var step1Contents = $(this).closest(".upload-step").find(".upload-step-content");
			if (e.target.files) {
				step1Contents.eq(1).find("span.upload-file-name").text(file[0].name).attr("title", file[0].name);
				step1Contents.eq(1).find("span.upload-file-size").text("(" + file[0].size + "k)");
			}
			step1Contents.eq(0).hide();
			step1Contents.eq(1).show();
			$("#uploadConfirmBtn").unbind("click").bind("click", function(){
				$("#fileInput").data("loading", true);
				var stepContent = $(this).closest(".upload-step-content");
				stepContent.children("a").hide();
				stepContent.prepend('<div class="upload-step1-loading-block bh-pull-right"><div class="sk-spinner sk-spinner-fading-circle bh-pull-right" style="height: 28px; width: 28px;">' +
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
		done: function (e, data) {//设置文件上传完毕事件的回调函数
			if (data.result.success) {
				var mid = data.result.id;
				downTplData.attachment = data.result.id;
				$.ajax({
					type : "post",
					url : contextPath + '/emap/sys/emapcomponent/file/saveAttachment/' + scope + '/' + token + '.do',
					data : JSON.stringify({
						scope : scope,
						fileToken : token,
						attachmentParam : {
							storeId : "normal"
						}
					}),
					success : function (json) {
						$.ajax({
							type : "post",
							url : contextPath + '/sys/emapcomponent/imexport/importRownum.do',
							data : {
								"app" : downTplData.app,
								"attachment" : mid
							},
							success : function (json) {
								$(".upload-step2-count").html('本次共导入数据' + JSON.parse(json).rowNumber + '条');
								$(".upload-step1-content").find("div.upload-step1-loading-block").remove();
								$("div.upload-step:eq(1)").addClass("active");
								$(".upload-loading-bar div").animate({"width" : "87%"}, 3000);
								$.ajax({
									type : "post",
									url : contextPath + '/sys/emapcomponent/imexport/import.do',
									data : downTplData,
									success : function (json) {
										var json = JSON.parse(json);
										if (json.status == 1) {
											$(".upload-loading-bar div").stop().animate({"width": "100%"}, 500, function(){


												if ( opt.importCallback && opt.importCallback != "") {
													var data = opt.importCallback(json.total, json.success);
													importSuccess(data.total, data.success, data.callback);

												}else {
													importSuccess(json.total, json.success, function(a){
														a.attr("href", contextPath + "/sys/emapcomponent/file/getAttachmentFile/" + json.attachment + ".do");
													});
												}
												if (opt.autoClose == true) {
													layer.close(opt.layer);
												}
											});
										} else {
											$("#fileInput").data("loading", false);
											$("div.upload-step-content:eq(2)").html('<p></p>');
											$("div.upload-step:eq(2)").addClass("active").find(".upload-result-detail").html('<span style="color: red">导入失败</span>');
										}



									}
								});
							},
							error : function (e) {
							}
						});
					}
				});
			}
		}
	});
	// 点击重新上传
	$("#reUploadBtn").on("click", function () {
		$("#fileInput").click();
	});

	// 点击确定关闭
	$("#closeConfirmBtn").on("click", function(){
		if (opt.closeCallback && opt.closeCallback != "") {
			opt.closeCallback();
		}
		if (opt.layer) {
			layer.close(opt.layer);
		}
	});

	// 点击下载模板
	$("#downTplBtn").on("click", function(){
		if (opt.tplUrl && opt.Url != "") {
			location.href = opt.tplUrl;
		}else {
			$.ajax({
				type : "post",
				url : contextPath + '/sys/emapcomponent/imexport/importTemplate.do',
				data : downTplData,
				success : function(json){
					location.href = (contextPath + '/sys/emapcomponent/file/getAttachmentFile/' + JSON.parse(json).attachment + '.do');
				},
				error : function(e){console.log(e)}
			});
		}

	});

	function importSuccess (totalNum, successNum, callback) {
		$("#fileInput").data("loading", false);
		$("div.upload-step-content:eq(2)").html('<p>数据导入完成</p>');
		$("div.upload-step:eq(2)").addClass("active").find(".upload-result-detail").html("该文件全部导入数据" + totalNum + "条，其中失败导入" + (totalNum - successNum) + "条");
		callback($("div.upload-step:eq(2)").find(".upload-export"));
	}
};
