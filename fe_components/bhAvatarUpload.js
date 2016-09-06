/**
 * 图像裁剪上传组件
 * bhAvatarUpload
 * 
$(selector).bhAvatarUpload({
    ratio:295/413,
    width: 100,
    shape:'rect',
    upLimits: 5,//图片上限
    imgWidth: 1280,
    imgHeight: 768,
    type:['png'],
    size:5120,
    defaultAvatar：'',
    displayAvatars:[],//需要展示的图片
    //点击确定的回调
    onSubmit: function(){
        console.log('success')
    }
})
获取裁剪后图片的url方法：
$(selector).bhAvatarUpload('getValue');
 * @return {[type]} [description]
 */
(function($) {
    var Plugin;

    Plugin = (function() {
        function Plugin(element, options) {
            this.options = $.extend({}, $.fn.bhAvatarUpload.defaults, options);
            this.$element = $(element);

            this.options.submitCallBack = function(fileUrl) {
                //this为options
                var src = this.contextPath + fileUrl;
                addImgFrame(src, this, element);

                if (this.onSubmit) {
                    this.onSubmit();
                }
            };

            _init(this.$element, this.options);
        }

        Plugin.prototype.destroy = function() {
            this.options = null;
            $(this.$element).data('bhAvatarUpload', false).empty();
        };
        Plugin.prototype.getValue = function() {
            var value = [];
            var self = this;
            $('.bh-emapAvatar-avatar', this.$element).each(function() {
                value.push($(this).attr('src').replace(self.options.contextPath, ''));
            });
            return value;
        };

        Plugin.prototype.disable = function() {
            $('.bh-emapAvartar-add', this.$element).hide();
        };

        Plugin.prototype.enable = function() {
            $('.bh-emapAvartar-add', this.$element).show();
        };
        return Plugin;
    })();

    //添加展示框
    function addImgFrame(src, options, element) {
        var $img = $('<div class="bh-l-inline bh-emapAvatar-wrap bh-mr-16"><img class="bh-emapAvatar-avatar" src="' + src + '"><a class="bh-emapAvartar-btn" href="javascript:void(0)">删除</a></div>');
        if (options.shape === 'circle') {
            $img.css({
                'height': options.width,
                'width': options.width,
                'border-radius': '50%'
            });
        } else {
            $img.css({
                'height': options.width / options.ratio,
                'width': options.width
            });
        }
        $img.find('.bh-emapAvartar-btn').click(function() {
            var $parent = $(this).parent();
            $parent.parent().find('.bh-emapAvartar-add').show();
            $parent.remove();
        });
        $('.bh-emapAvatar-container', element).prepend($img);
        //超过上限隐藏上传按钮
        if ($('.bh-emapAvatar-avatar', element).length >= options.upLimits) {
            $('.bh-emapAvartar-add', element).hide();
        }
    }

    //生成dom
    function _init($element, options) {
        var addBox = '<a class="bh-emapAvartar-add bh-l-inline bh-border-h bh-border-v bh-bColor-info-3 bh-text-center" href="javascript:void(0)" style="position:relative"><i class="iconfont icon-add bh-color-info-3" style="font-size:48px"></i><input type="file" name="file" multiple style="position: absolute;opacity: 0;left: 0;width: 100%;height: 100%;"></a>';
        var $wrap = $('<div class="bh-emapAvatar-container"><div class="bh-l-inline jqx-top-align">' + addBox + '</div></div>');
        if (options.shape === 'circle') {
            options.ratio = 1;
            $wrap.find('.bh-emapAvartar-add').css({ 'height': options.width, 'width': options.width }).css('border-radius', '50%');
        } else {
            if (options.imgWidth && options.imgHeight) {
                options.ratio = options.imgWidth / options.imgHeight;
            }
            $wrap.find('.bh-emapAvartar-add').css({ 'height': options.width / options.ratio, 'width': options.width });
        }
        $wrap.find('.icon-add').css('line-height', options.width / options.ratio + 'px');

        if (options.disabled) {
            $('.bh-emapAvartar-add', $wrap).hide();
        }

        $element.append($wrap);

        $(options.displayAvatars).each(function() {
            var src = options.contextPath + this;
            addImgFrame(src, options, $element);
        });
        var $input = $element.find('.bh-emapAvartar-add input[type="file"]');
        initUpload($input, options);
        options.$upload = $input.parent();
        _eventBind($element, options);
    }

    function _eventBind($element, options) {
        $('.bh-emapAvatar-avatar', $element).one('error', function() {
            $(this).attr('src', options.defaultAvatar);
        });
    }

    $.fn.bhAvatarUpload = function(options, params) {
        var instance = $(this).data('bhAvatarUpload');
        if (!instance) {
            return this.each(function() {
                if (options === 'destroy') {
                    return this;
                }
                return $(this).data('bhAvatarUpload', new Plugin(this, options));
            });
        }

        if (options === true) {
            return instance;
        }

        if ($.type(options) === 'string') {
            return instance[options](params);
        }

        return this;
    };
    /**
     * contextPath:'' //默认为/appcenter，建议外部传入
     * ratio: num//宽高比
     * width:Int //图像宽度
     * type:[] //上传文件类型，默认只有png
     * imgWidth: Int, //裁剪出来的图片的最小宽度
     * imgHeight: Int, //裁剪出来的图片的最小高度，如果高宽都穿，ratio可不传
     * shape:'' //图像展示为圆还是方
     * size:Int //文件体积上限
     * upLimits: 100,//图片上限
     * disabled:Bollen //上传是否不可用
     * defaultAvatar：url //默认头像路径
     * @type {Object}
     */
    $.fn.bhAvatarUpload.defaults = {
        contextPath: '/appcenter',
        ratio: 1,
        width: 100,
        imgWidth: 0, //裁剪出来的图片的最小宽度
        imgHeight: 0, //裁剪出来的图片的最小高度，如果高宽都穿，ratio可不穿
        canPreview: true,
        canReupload: true,
        cropBoxResizable: true,
        defaultAvatar: '',
        displayAvatars: [],
        type: ['png'],
        upLimits: 100,
        shape: 'rect', //图片形状，circle rect
        size: 5120,
        disabled: false
    };


    function initUpload($input, options) {
        var fileReader = 'FileReader' in window;
        var uploadUrl = options.contextPath + '/appResource/uploadSnapshot';
        //将大小传给后台
        if (options.imgWidth || options.imgHeight) {
            options.imgWidth = options.imgWidth || options.imgHeight * options.ratio;
            options.imgHeight = options.imgHeight || options.imgWidth / options.ratio;
            uploadUrl += '?minWidth=' + options.imgWidth + '&minHeight=' + options.imgHeight;
        }
        $input.fileupload({
            url: uploadUrl,
            dataType: 'json',
            submit: function(e, data) {
                var file = data.files[0];

                // 文件的大小 和类型校验
                if (options.type && options.type.length > 0) {
                    if (!new RegExp(options.type.join('|').toUpperCase()).test(file.name.toUpperCase())) {
                        $.bhDialog({
                            iconType: "warning",
                            title: '文件类型不正确',
                            buttons: [
                                { text: '确认', className: 'bh-btn-warning' }
                            ]
                        });
                        return false;
                    }
                }

                if (fileReader && options.size) {
                    if (file.size / 1024 > options.size) {
                        $.bhDialog({
                            iconType: "warning",
                            title: '文件大小超出限制',
                            buttons: [
                                { text: '确认', className: 'bh-btn-warning' }
                            ]
                        });
                        return false;
                    }
                }
            },
            done: function(e, data) {
                if (data.result.result === 'success') {
                    // 上传成功
                    var avatarsUrl = options.contextPath + data.result.data.url;
                    var dimensions = {
                        width: data.result.data.width,
                        height: data.result.data.height
                    };
                    if ($('#bhAvatarUploadWindow')[0]) {
                        initCrop($('#bhAvatarUploadWindow .bh-avatar-img'), options, avatarsUrl, dimensions);
                        return;
                    }
                    bhAvatarUploadWindow(options, avatarsUrl, dimensions);
                } else {
                    $.bhDialog({
                        iconType: "warning",
                        title: data.result.message,
                        buttons: [
                            { text: '确认', className: 'bh-btn-warning' }
                        ]
                    });
                }
            }
        });
    }

    function initCrop(ele, options, avatarsUrl, dimensions) {
        ele.cropper && ele.cropper('destroy');
        ele.attr('src', avatarsUrl);
        var minCropBoxWidth = 0;
        var minCropBoxHeight = 0;

        var autoCropArea = 0.8;
        if (options.imgWidth || options.imgHeight) {
            var containerHeight = $('.bh-emapAvatar-editArea').height();
            var containerWidth = $('.bh-emapAvatar-editArea').width();
            //图片的宽是否撑满容器
            if (dimensions.width / dimensions.height > containerWidth / containerHeight) {
                autoCropArea = containerWidth / dimensions.width;
                if (options.imgWidth) {
                    minCropBoxWidth = options.imgWidth * autoCropArea;
                }
                if (options.imgHeight) {
                    minCropBoxHeight = options.imgHeight * autoCropArea;
                }
            } else {
                autoCropArea = containerHeight / dimensions.height;
                if (options.imgWidth) {
                    minCropBoxWidth = options.imgWidth * autoCropArea;
                }
                if (options.imgHeight) {
                    minCropBoxHeight = options.imgHeight * autoCropArea;
                }
            }
        }

        var radio = options.ratio;
        if (minCropBoxWidth && minCropBoxHeight) {
            radio = minCropBoxWidth / minCropBoxHeight;
        }
        ele.cropper({
            aspectRatio: radio,
            minCropBoxWidth: minCropBoxWidth,
            minCropBoxHeight: minCropBoxHeight,
            autoCropArea: autoCropArea,
            viewMode: 1,
            movable: false,
            zoomOnWheel: false,
            preview: '.bh-emapAvatar-preview',
            crop: function(e) {
                var $preview = $('.bh-emapAvatar-preview').last().css('position', 'relative');
                $preview.prev('p').text(Math.round(e.width) + '像素*' + Math.round(e.height) + '像素');
                //判断是否需要提供预览功能
                if (e.width > $preview.width()) {
                    if (!$preview.find('div.bh-text-center')[0]) {
                        var $box = $('<div class="bh-text-center bh-color-white cropper-modal" style="opacity:0;background-color:rgba(0,0,0,0.5);cursor:pointer;"><i class="iconfont icon-permmedia bh-mr-4"></i><span class="bh-text-caption-large" style="line-height:' + ($preview.height() + 'px') + '">查看大图</span></div>');
                        $box.hover(function() {
                            $(this).css('opacity', '1');
                        }, function() {
                            $(this).css('opacity', '0');
                        });
                        $box.click(function() {
                            var canvas = $(e.target).cropper('getCroppedCanvas');
                            var src = canvas.toDataURL("image/png");
                            $.bhGallery({
                                dataSource: [{ image: src }],
                                show: 0
                            });
                        });
                        $preview.append($box);
                    }
                } else {
                    $preview.find('div.bh-text-center').remove();
                }
            }
        });
        if (options.shape === 'circle') {
            $('.bh-emapAvatar-preview').css('border-radius', '50%');
        }
    }

    function bhAvatarUploadWindow(options, avatarsUrl, dimensions) {
        var $window = $('<div id="bhAvatarUploadWindow">' +
            '<div>' +
            '<div class="bh-emapAvatar-local"></div>' +
            '</div>');

        $('.bh-emapAvatar-local', $window).html('<div class="bh-emapAvatar-editArea" bh-avatar-role="editArea" style="width:540px;height:320px">' +
            '<div class="bh-emapAvatar-upload-block">' +
            '</div>' +
            '<div class="bh-avatar-img-block" style="display:block">' +
            '<img class="bh-avatar-img" src="' + avatarsUrl + '" style="display: none;">' +
            '</div></div>' +
            '<div class="bh-emapAvatar-display" style="width:156px">' +
            '<div class="sc-title-borderLeft bh-mb-8">图片预览</div>' +
            '<div class="bh-text-caption bh-mb-2 bh-mh-8 bh-ph-4">裁剪后图片实际尺寸：</div>' +
            '<p class="bh-text-caption bh-mb-8 bh-mh-8 bh-ph-4"></p>' +
            '<div class="bh-emapAvatar-preview"><div class="bh-emapAvatar-preview-div"></div></div>' +
            '</div>' +
            '<p class="bh-clearfix bh-str-cut bh-pt-4 bh-emapAvatar-handle-info"><a href="javascript:void(0)" class="bh-emapAvatar-reUpload">重新上传</a> <span class="bh-color-caption"></span>' +
            '</p>');

        if (!options.canPreview) {
            $('.bh-emapAvatar-display', $window).remove();
            $('.bh-emapAvatar-editArea', $window).css('width', '100%');
        } else {
            $('.bh-emapAvatar-display .sc-title-borderLeft', $window).css({
                'font-size': '14px',
                'line-height': '14px',
                'border-left-color': '#EF971C'
            });
        }

        if (!options.canReupload) {
            $('.bh-emapAvatar-handle-info', $window).remove();
        }

        BH_UTILS.bhWindow($window, '图像裁剪', undefined, {
            width: '752px',
            height: (options.canReupload ? '505px' : '495px'),
            zIndex: 8000,
            modalZIndex: 9000,
            close: function() {
                $('.bh-avatar-img', $window).cropper('destroy');
            }
        }, function() {
            submitEdit(options);
            $('.bh-avatar-img', $window).cropper('destroy');
        });

        $('.bh-avatar-img', $window).one('error', function() {
            $(this).attr('src', options.defaultAvatar);
        });

        // 预览窗口 尺寸和文字渲染
        $('.bh-emapAvatar-preview', $window).each(function() {
            var height = parseInt($(this).width() / options.ratio);
            if (height < 248) {
                $(this).css({
                    height: height,
                    top: (248 - height) / 2
                });
            } else {
                $(this).css({
                    width: height * options.ratio,
                    height: 248,
                    top: 0
                });
            }
        });

        initCrop($('.bh-avatar-img', $window), options, avatarsUrl, dimensions);

        // 上传说明渲染
        var typeStr = options.type.join('、').toUpperCase();
        var sizeStr = (options.size > 1024) ? options.size / 1024 + 'M' : options.size + 'K';
        $('.bh-emapAvatar-reUpload', $window).next().html('只支持' + typeStr + '，大小不超过' + sizeStr);

        //初始化loader
        // $('.bh-emapAvatar-loader', $window).jqxLoader({});

        // 重新上传事件绑定
        $('.bh-emapAvatar-reUpload', $window).on('click', function() {
            options.$upload.find('input[type="file"]').click();
        });

        function submitEdit(options) {
            var result = cutTempFile(options, $window);
            if ('success' === result.result && options.submitCallBack) {
                options.submitCallBack(result.data.fileUrl);
            }
        }

        // 裁剪图片
        function cutTempFile(options) {
            var $avatar = $('.bh-avatar-img', $window);
            var param = $avatar.cropper('getData', true);
            $.extend(param, {
                lastWidth: options.imgWidth,
                lastHeight: options.imgHeight
            });
            param.tempFileUrl = $avatar.attr('src').replace(options.contextPath, '');
            return doRequest(options.contextPath + '/appResource/operateImage', param);
        }

        function doRequest(url, param) {
            var result;
            $.ajax({
                type: 'post',
                data: param,
                url: url,
                dataType: 'json',
                async: false
            }).done(function(res) {
                result = res;
            }).fail(function(res) {
                result = res;
            });
            return result;
        }
    }
})(jQuery);
