(function () {
	var Plugin,
			_init;
	Plugin = (function () {
		function Plugin(element, options) {
			this.options = $.extend({}, $.fn.emapEditor.defaults, options);
			this.$element = $(element);
			_init(this.$element, this.options);

		}

		// 判空
		Plugin.prototype.isEmpty = function () {
			return this.$element.summernote('isEmpty');
		};

		// 清空
		Plugin.prototype.clear = function () {
			return this.$element.summernote('reset');
		}

		Plugin.prototype.disable = function () {
			return this.$element.summernote('disable');
		};

		Plugin.prototype.enable = function () {
			return this.$element.summernote('enable');
		};

		Plugin.prototype.getValue = function () {
			return this.$element.summernote('code');
		};

		Plugin.prototype.setValue = function (content) {
			return this.$element.summernote('code', content);
		};

		Plugin.prototype.destroy = function () {
			this.$element.summernote('reset');
			return this.$element.summernote('destroy');
		};
		return Plugin;
	})();

	_init = function (element, options) {
		if (!options.contextPath && WIS_EMAP_SERV) {
			options.contextPath = WIS_EMAP_SERV.getContextPath();
		}
		// 判断时是否已加载summernote  若没有  则加载js
		if (!$.fn.summernote) {
			console && console.warn('依赖插件summernote未引入!');
			return;
		}
		// 自定义 按钮
		var HelloButton = function (context) {
		  var ui = $.summernote.ui;
		  
		  // create button
		  var button = ui.button({
		    contents: '<i class="fa fa-child"/> Hello',
		    tooltip: 'hello',
		    click: function () {
		      // invoke insertText method with 'hello' on editor module.
		      context.invoke('editor.insertText', 'hello');
		    }
		  });

		  return button.render();   // return button as jquery object 
		}

		$(element).summernote(options);

		// 上传功能的html
		$(element).after('<div role="emap-editor-upload" style="display: none;"></div>')
		options.uploadDiv = $(element).next('[role="emap-editor-upload"]');
		options.uploadDiv.emapUploadCore({
			contextPath: "/emap"
		})

	};

	$.fn.emapEditor = function (options, param) {
		var instance;
		instance = this.data('emapeditor');
		if (!instance) {
			return this.each(function () {
				return $(this).data('emapeditor', new Plugin(this, options));
			});
		}
		if (options === true) return instance;
		if ($.type(options) === 'string') return instance[options](param);
		return this;
	};

	$.fn.emapEditor.defaults = {
		height: 200,
		disableDragAndDrop: true,
		popover: {
			air: [
				['color', ['color']],
				['font', ['bold', 'underline', 'clear']]
			]
		},
		toolbar: [
			['style', ['style']],
			['font', ['bold', 'underline', 'italic', 'clear']],
			['fontname', ['fontname']],
			['color', ['color']],
			['para', ['ul', 'ol', 'paragraph']],
			['table', ['table']],
			['insert', ['link', 'picture', 'hr', 'hello']],
			['view', ['codeview']]
		],
		callbacks: {
			onImageUpload: function (files) {
				var $self = $(this);
				var options = $(this).data('emapeditor').options;
				var uploadWrap = options.uploadDiv;


				$('input[type=file]', uploadWrap).fileupload('send', {files: files})
						.success(function (result, textStatus, jqXHR) {
							if (result.success) {
								var token = uploadWrap.emapUploadCore('saveTempFile');
								if (token) {
									var imgNode = $('<img src="' + options.contextPath + '/sys/emapcomponent/file/getFileByToken/' + token + '.do" >')[0]
									$self.summernote('insertNode', imgNode);
									//  插入成功后 重载上传 刷新token
									uploadWrap.emapUploadCore('reload')
								}
							}
						})
						.error(function (jqXHR, textStatus, errorThrown) {/* ... */
							console && console.log('图片上传失败')
						})

				// upload image to server and create imgNode...

			}
		}
	};
}).call(this);

