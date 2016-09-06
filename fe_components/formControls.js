/// <reference path="fe_dataloader.ts" />
// var contextPath = "";
var formControls = {
	init : function($form, contextPath){
		$form = $form || $("form.validate");
        $("input[xtype=text]",$form).each(function(){
			$(this).bind('click', function(){
				$(this).focus();
			});
		});
		$("input[xtype=date-local]",$form).each(function(){
			var fmt = $(this).attr("format") || "yyyy-MM-dd";
			$(this).on("focus", function(){
				WdatePicker({
					dateFmt:fmt,
					onpicked:function(dp){
						$(dp.el).trigger("change");
					}
				});
				// WdatePicker();
				return false;
			});
			$(this).after("<i class='i-calender'></i>");
		});
		$("input[xtype=date-ym]",$form).each(function(){
			$(this).on("focus", function(){
				WdatePicker({
					dateFmt:"yyyy-MM",
					onpicked:function(dp){
						$(dp.el).trigger("change");
					}
				});
				// WdatePicker({dateFmt:"yyyy-MM"});
				return false;
			});
			$(this).after("<i class='i-calender'></i>");
		});
		$("input[xtype=tree]",$form).each(function(){
			var $org_input = $(this);
			
			var _url = $org_input.data("url") || $org_input.attr("url");
			var _displayvalue = $org_input.attr("displayvalue");
			var _onlyLeaf = $org_input.attr("onlyLeaf");
			var _hideRoots = $org_input.attr("hideRoots");
			var _showFullPath = $org_input.attr("showFullPath");
			var _pathSeparator = $org_input.attr("pathSeparator");
			if(_hideRoots === undefined)_hideRoots = false;
			
			
			var $input = $org_input.clone();//原始的隐藏，仅仅用于存值
			$org_input.hide();
			$input.blur(function(){
				$org_input.trigger("blur");
			});
			
			var clazz = $org_input.attr("class"); // 获取所有class
        	var validate = null;
        	if(clazz){
        		var matches = clazz.match(/validate\[.*\]/);
        		if(matches && matches.length > 0){
        			validate = matches[0];
        			clazz = clazz.replace(validate,"");
        			$input.removeAttr("class").attr("class",clazz); // 替换样式
        		}
        	}
			
			$input.removeAttr("name").removeAttr("id").removeAttr("validate").removeAttr("url");
			if(_displayvalue)$input.val(_displayvalue);
			$org_input.after($input);
			$input.after("<i class='tree'></i>");
			
			$input.attr("data-toggle", "dropdown").addClass("dropdown-toggle");
			var treeObj = $("<div></div>");
			$org_input.data("$tree",treeObj);
			
			function createTree(inst){
				
				var ajaxurl = contextPath + _url;
				
				var options = {
					"core" : {
						"strings" : {
							"Loading ..." : "加载中..."
						},
						"data" : function(node, cb){
							var key = $input.data("searchKey") || "";
							var params = {"*tree":1};
							if(key != ""){
								params["searchValue"] = key;
							}else{
								params["pId"] = node.id == "#" ? "" : node.id;
							}
							$.post(ajaxurl,params,function(resp){
								resp = eval("(" + resp + ")");
								if(resp.code == "0"){
									var rows = resp.datas.code.rows;
									if(rows && rows.length > 0){
										var arr = [];
										for(var i=0;i<rows.length;i++){
											if(rows[i]["id"] == node.id)
												continue;
											var _node = {
												id : rows[i]["id"],
												pId : rows[i]["pId"],
												text : rows[i]["name"],
												children : key ?  ((rows[i]["isParent"] == 1) ? true : false) : (rows[i]["isParent"] == 1),
												icon : rows[i]["isParent"] == 1 ? "" : "jstree-leaf"
											};
											arr.push(_node);
										}
										var temps = arr;
										if(key){
											temps = transData(arr, "id", "pId", "children");
										}
										temps = temps || [];
										var results = [];
										if(_hideRoots){
											for(var i=0;i<temps.length;i++){
												var id = temps[i]["id"];
												if($.inArray(id,opts.hideRoots) >= 0){
													continue;
												}
												results.push(temps[i]);
											}
										}else{
											results = temps;
										}
										recursionChildren(results);
										cb(results);
									}else{
										cb([]);
									}
								}else{
									cb([]);
								}
							},"text");
						}
					},
					"plugins":["wholerow"]//, "checkbox"
				};
				inst.jstree(options);//
				
				inst.on("changed.jstree",function(e,data){
//					var opts = inst.options || {};
					var value = data.selected[0];
					var _onlyLeaf = ($input.attr("onlyLeaf") !== false);
					if(_onlyLeaf && !data.instance.is_leaf(value)){
						return false;
					}
					var text = data.instance.get_node(value).text;
					if(_showFullPath){
						text = data.instance.get_path(value,_pathSeparator || "/");
					}
					$org_input.val(value);
					$org_input.attr("displayvalue", text);
					$input.val(text);
					dropdownObj.parent().removeClass("open");
					$org_input.trigger("change");
					$input.trigger("change");
				});
				
				inst.on("click.jstree",function(e,data){
					if(e.target.className.indexOf("jstree-ocl") == -1)
						$(this).jstree(true).toggle_node(e.target);
				});
				
				$input.data("searchKey", "");
				
				return inst;
			}
			
			createTree(treeObj);
			
			var dropdownObj = $("<div class='dropdown-menu dropdown-size'></div>").append(treeObj);
			$input.after(dropdownObj);
			
			$input.keyup(function(){
				$org_input.val("").trigger("change");
				var inputvalue=this.value;
				
				if($input.data("timerId")){
					window.clearTimeout($input.data("timerId"));
				}
				$input.data("timerId", window.setTimeout(function(){
					treeObj.jstree("destroy");
					$input.data("searchKey", inputvalue);
					createTree(treeObj);
				},500));
			});
			dropdownObj.click(function(event){
				event.stopPropagation();
			});
			
		});
		
//		$("select").each(function(){
//			$(this).selectize();
//		});
		//下拉框
		$("input[xtype=select]",$form).each(function(){
			var $input = $(this);
			var url = $input.data("url") || $input.attr("url");
            var params = $input.data("JSONaram");
			
			var _displayvalue = $input.attr("displayvalue");
			var clazz = $input.attr("class"); // 获取所有class
			var multi = $input.data("multi") || $input.attr("multi");
			var readonly = $input.attr("readonly");
        	var validate = null;
        	if(clazz){
        		var matches = clazz.match(/validate\[.*\]/);
        		if(matches && matches.length > 0){
        			validate = matches[0];
        			clazz = clazz.replace(validate,"");
            		$input.removeAttr("class").attr("class",clazz); // 替换样式
        		}
        	}
        	
        	var value = $input.val();
        	$input.removeAttr("value");
			
			$input.selectize({
				delimiter: ',',
				valueField: 'id',
				labelField: 'name',
				searchField: 'name',
				maxItems:(multi?9:1),
				items:[value],
				options:[{"id":value,"name":_displayvalue}],
				onFocus:function(){
					this.load(function(callback){
						if(url){
							$.ajax({
								url: contextPath + url,
                                data: params,
								type: 'GET',
								dataType: 'json',
								success: function(res) {
									var datas = undefined;
									if(res.datas && res.datas.code && res.datas.code.rows)
										datas = res.datas.code.rows;
									if(datas)
										callback(datas);										
								}
							});
						}
					});
				},
				onBlur:function(){
					$input.trigger("blur");
				},
				onChange: function(value){
					if(value == ""){
						$input.attr("displayvalue", "");
					}else{
						var _options = this.options;
						var text = value.split(",").map(function(curValue){
							return _options[curValue].name;
						}).join(",");
						$input.attr("displayvalue", text);
					}
				}
			});
			if(readonly)
				$input[0].selectize.lock();
			if(validate)
				$input.addClass(validate);
		});

		$("input[xtype=selecttable]", $form).each(function(){
	        var $input = $(this);
	        var url = $input.data("url") || $input.attr("url");
			var loader = new DataLoader(window.location.pathname, pageMeta);
			var _column = loader.model(url);
	        // var changeCallback = $input.data("jsonparam").change;

	        var _displayvalue = $input.attr("displayvalue");
	        var clazz = $input.attr("class"); // 获取所有class
	        var multi = $input.data("multi") || $input.attr("multi");
			var readonly = $input.attr("readonly");
	        var validate = null;
	        if(clazz){
	            var matches = clazz.match(/validate\[.*\]/);
	            if(matches && matches.length > 0){
	                validate = matches[0];
	                clazz = clazz.replace(validate,"");
	                $input.removeAttr("class").attr("class",clazz); // 替换样式
	            }
	        }
			var sf = [];
			_column.forEach(function(index){
				sf.push(index.name);
			});

	        var value = $input.val();
	        $input.removeAttr("value");
	        $input.selectize({
	            create : false,
	            valueField: "id",
	            labelField: "id",
	            searchField: sf,
	            maxItems:(multi?9:1),
	            maxOptions: 10,
	            items:[value],
	            options:[{"id":value,"name":_displayvalue}],
				load:function(query, callback){
					if(url){
						
						var datas = loader.data(url, {pageSize:10, pageNumber:1,queryopt:query});
						if(datas){
							callback(datas);
						}
					}
				},
	            render: {
	                option: function (item, escape) {
	                    var trHtml = '';
	                    trHtml += '<tr style="overflow: hidden;">';
						_column.forEach(function(index){
	                        trHtml += '<td style="padding: 4px;word-break: break-all;">' + escape(item[index.name]) + '</td>';
	                    });
	                    trHtml += '</tr>';
	                    return trHtml;
	                }
	            },
	            // onChange : function (val) {
	            //     eval(changeCallback + "(val)");
	            // },
	            onInitialize : function (a,b) {
	                this.$dropdown_content.css({
	                    "display" : "table"
	                });
	            },
				onBlur:function(){
					$input.trigger("blur");
				},
				onChange: function(value){
					var _options = this.options;
					var text = value.split(",").map(function(curValue){
						return _options[curValue].name;
					}).join(",");
					$input.attr("displayvalue", text);
				}
	        });
			if(readonly)
				$input[0].selectize.lock();
			if(validate)
				$input.addClass(validate);
	    });

		
		$("input[xtype=switcher]",$form).each(function(){
			
		});
		
		$("input[xtype=radiolist]",$form).each(function(){
			var $org_input = $(this);
			var name = $org_input.attr("name");
			var vertical = $org_input.attr("vertical");
			var url = $org_input.data("url") || $org_input.attr("url");
			var radiolist = $("<html-radios></html-radios>");
			var data = Utils.codeForOption( Utils.syncAjax(contextPath + url) );
			radiolist.attr("options", JSON.stringify(data));
			radiolist.attr("name", name);
			radiolist[0].selected = $org_input.val();
			if(vertical !== undefined)radiolist.attr("align", "vertical");
			radiolist.on("selected", function(e, data){
				$org_input.val(e.originalEvent.detail.value);
				$org_input.trigger("change");
			});
			$org_input.after(radiolist);
			$org_input.hide();
		});
        
        $("input[xtype=buttonlist]",$form).each(function(){
			var $org_input = $(this);
			var name = $org_input.attr("name");
			var vertical = $org_input.attr("vertical");
			var url = $org_input.data("url") || $org_input.attr("url");
			var radiolist = $("<html-buttons></html-buttons>");
			var data = Utils.codeForOption( Utils.syncAjax(contextPath + url) );
			radiolist.attr("options", JSON.stringify(data));
			radiolist.attr("name", name);
			radiolist[0].selected = $org_input.val();
			radiolist.on("selected", function(e, data){
				$org_input.val(e.originalEvent.detail.value);
				$org_input.trigger("change");
			});
			$org_input.after(radiolist);
			$org_input.hide();
		});
		
		$("input[xtype=checkboxlist]",$form).each(function(){
			var $org_input = $(this);
			var name = $org_input.attr("name");
			var vertical = $org_input.attr("vertical");
			var url = $org_input.data("url") || $org_input.attr("url");
			var radiolist = $("<html-checkboxes></html-checkboxes>");
			var data = Utils.codeForOption( Utils.syncAjax(contextPath + url) );
			radiolist.attr("options", JSON.stringify(data));
			radiolist.attr("name", name);
			radiolist[0].selected = $org_input.val();
			if(vertical !== undefined)radiolist.attr("align", "vertical");
			radiolist.on("selected", function(e, data){
				$org_input.val(e.originalEvent.detail.value);
				$org_input.trigger("change");
			});
			$org_input.after(radiolist);
			$org_input.hide();
		});
		
		// if(!$.validationEngine)$.validationEngine = {};
		// 表单校验规则与样式重写
		$.extend($.validationEngine.defaults,{
			scroll : false,
			validateNonVisibleFields : true,
			validationEventTrigger : "blur change",
			promptPosition:"topRight:0,-2",
			// addFailureCssClassToField:"has-warning",
			prettySelect:true,
			onFieldFailure:function(field){
				if(field)field.parent().addClass("has-warning");
			},
			onFieldSuccess:function(field){
				if(field)field.parent().removeClass("has-warning");	
			}
		});
		// 重写校验规则
		$.extend($.validationEngineLanguage.allRules,{
			"phone":{
				// 1数字开头的11位数字
				"regex":/^(0|86|17951)?1\d{10}$/, 
				"alertText":"* 无效的手机号码"
			},
			"tel" : {
				//"regex" : /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$|(^(0|86|17951)?(13[0-9]|15[012356789]|17[0678]|18[0-9]|14[57])[0-9]{8}$)/,
				"regex" : /^(0[0-9]{2,3}\-?)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$|(^(0|86|17951)?1\d{10}$)/,
				"alertText" : "* 无效的电话号码"
			},
			"email":{
				// Shamelessly lifted from Scott Gonzalez via the Bassistance Validation plugin http://projects.scottsplayground.com/email_address_validation/
				"regex":/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
				//"regex" : /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
				"alertText":"* 无效的邮件地址"
			},
			"mail":{
				// Shamelessly lifted from Scott Gonzalez via the Bassistance Validation plugin http://projects.scottsplayground.com/email_address_validation/
				"regex":/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
				//"regex" : /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
				"alertText":"* 无效的邮件地址"
			}
		});
		// 表单校验初始化
		if($form.validationEngine)$form.validationEngine().css({"z-index":10});
		
		$("input[readonly]",$form).each(function(){
            if(this.name !== "")
                Utils.lockFields(this.name, $form);
		});
	},
	table:function($table, dataId, oParams, oMeta){
		var tb = $table.DataTable($.extend(true, {
			"serverSide": true,
			"ajax": function(data, callback, setting){
				
				var loader = new DataLoader(window.location.pathname, oMeta);
				var iStart = data.start?data.start:0;
				var iLength = data.length?data.length:setting._iDisplayLength;
				var iPageNumber = iStart/iLength + 1;
				
				var params = {pageSize:iLength, pageNumber:iPageNumber};
				if(data.order.length > 0){
					params["*order"] = data.order.map(function(e){
						var str = "";
						if(e.dir == "asc")
							str = "+";
						else
							str = "-";

						//字典表需要去掉_DISPLAY
						var colname = data.columns[e.column].data;
						if(colname !== undefined && colname != null && colname.lastIndexOf('_DISPLAY') > -1){
							colname = colname.substr(0, colname.length - '_DISPLAY'.length);
						}
						str += colname;
						
						return str;
					}).join(",");
				}
					
				if(this.data("searchKey") !== undefined)
					$.extend(params, this.data("searchKey"));
					
				if(params["defaultOrder"] !== undefined){
					params["*order"] += "," + params["defaultOrder"];
				}
				
				var ds = loader.data(dataId, params);
				
				callback({data:ds, recordsFiltered:loader.total});
			}
		},oParams));
		
		return tb;
	}
};


/**   
 * json格式转树状结构   
 * @param   {json}      json数据   
 * @param   {String}    id的字符串   
 * @param   {String}    父id的字符串   
 * @param   {String}    children的字符串   
 * @return  {Array}     数组   
 */    
function transData(a, idStr, pidStr, chindrenStr){    
    var r = [], hash = {}, id = idStr, pid = pidStr, children = chindrenStr, i = 0, j = 0, len = a.length;    
    for(; i < len; i++){    
        hash[a[i][id]] = a[i];    
    }    
    for(; j < len; j++){    
        var aVal = a[j], hashVP = hash[aVal[pid]];    
        if(hashVP){    
            (hashVP[children] === true || hashVP[children] === false) && (hashVP[children] = []);    
            hashVP[children].push(aVal);
            hashVP["state"] = {"opened" : true};
        }else{    
            r.push(aVal);    
        }    
    }    
    return r;    
}

/**
* 递归处理树
*/
function recursionChildren(parent){
	var length = parent.length;
	for(var i = 0; i < length; i++){
		var elemObj = parent[i];
		var tmps = elemObj.text.split("/");
		elemObj.text = tmps[tmps.length - 1];
		var childrens = elemObj.children;
		if(childrens){
			recursionChildren(childrens);
		}
	}
}