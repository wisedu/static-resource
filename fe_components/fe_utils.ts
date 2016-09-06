/// <reference path="def/jquery.d.ts" />
/// <reference path="fe_dataloader.ts" />

class Utils{
    static ajax(url, params, success, fail) {
        jQuery.ajax({
            url: url,
            data: params,
            type: 'POST',
            dataType: 'json',
            cache: false,
            success: function(data) {
                success(data);
            },
            error: function(resp) {
                if(resp.status == 401 || resp.status == 403)
                    window.location.reload();
            }
        });
    }
    static syncAjax(url, params):any {
        var result = null;
        var resp = jQuery.ajax({
            url: url,
            async: false,
            data: params,
            type: 'POST',
            dataType: 'json',
            cache: false,
            error: function(resp) {
                if(resp.status == 401 || resp.status == 403)
                    window.location.reload();
            }
        });
        return eval("("+resp.responseText+")");
    }
    static isEmptyObj(obj){
        for ( var name in obj )
            return false;
        return true;
    }
    static codeForOption(codeData){
        var result = [];
        var datas = codeData.datas.code.rows;
        for (var index = 0; index < datas.length; index++) {
            var element = datas[index];
            result.push([element.id, element.name]);
        }
        return result;
    }
    /**
     * 根据控件ID设置值
     */
    static setValue(emap_control:any, obj_data:any):void{
            
        var tagName = emap_control.tagName;
        var xtype = (emap_control.attributes.xtype?emap_control.attributes.xtype.value:"");
        var type = emap_control.type;
        var id:string = emap_control.name;//this.getId(emap_control.id);
        
        if(id === undefined)return;
        // if(obj_data[id] == undefined)obj_data[id] = "";
        // if(obj_data[id+"_DISPLAY"] == undefined)obj_data[id+"_DISPLAY"] = "";
        
        if(xtype == "" || xtype == "text"){
            emap_control.value = obj_data[id];
        }else if(xtype == "select"){
            var selectObj = emap_control.selectize;
            
            var valueItems = obj_data[id].split(",");
            var textItems = obj_data[id+"_DISPLAY"].split(",");
                
            if(this.isEmptyObj(selectObj.options)){
                var vf = selectObj.settings.valueField;
                var lf = selectObj.settings.labelField;
                for (let i = 0; i < valueItems.length; i++){
                    var vo = {};
                    vo[vf] = valueItems[i];
                    vo[lf] = textItems[i];
                    selectObj.addOption(vo);
                }
            }
            selectObj.setValue(obj_data[id].split(","));
        }else if(xtype == "tree"){
            var value = obj_data[id];
            var text = obj_data[id+"_DISPLAY"];
            emap_control.value = value;
            $(emap_control).attr("displayvalue", text);
            $(emap_control).next().val(text);
        }else if(xtype == "date-ym" || xtype == "date-local"){
            emap_control.value = obj_data[id];
        }else if(xtype == "hidden"){
            emap_control.value = obj_data[id];
        }else if(xtype == "radiolist"){
            $("html-radios[name=" + id + "]")[0].selected = obj_data[id];
        }else if(xtype == "checkboxlist"){
            // $(emap_control).attr("selected", obj_data[id]);
            // emap_control.selected = obj_data[id];
            $("html-checkboxes[name=" + id + "]")[0].selected = obj_data[id];
        }else if(tagName == "TEXTAREA"){
            emap_control.value = obj_data[id];
        }
    }
    
    static buildForm(model:Array<Object>, rowValue:any, isRead:boolean = false):string{
        var defaultGroup = "";
        var index = 0;
        return model.map(function (input:any) {
            if(input.get === undefined){
                input.get = function(field){
                    if(input["form."+field] !== undefined)
                        return input["form."+field];
                    else
                        return input[field];
                }
            }
            var xtype = input.get("xtype");
            var validFlag = "<div class='validFlag'><i class='md md-warning'></i></div>";
            var tpl = '<html-col {col} {label} {hidden} {required} field="{name}"><input type="text" name="{name}" class="{checkField}" {format} {xtype} {JSONParam} {url} {value} {placeholder} {displayvalue} {readonly} {onlyLeaf}>' + validFlag + '</html-col>';
            if(isRead){
                if(xtype == "textarea")
                    tpl = '<html-col {col} {label} {hidden} field="{name}"><div class="textarea" title="{text}"><pre>{text}</pre></div></html-col>';
                else
                    tpl = '<html-col {col} {label} {hidden} field="{name}"><span title="{text}">{text}</span></html-col>';
            }
            
            var caption = input.get("caption");
            var col = input.get("col");
            
            var url = input.get("url");
            var name = input.get("name");
            var hidden = input.get("hidden");
            var placeholder = input.get("placeholder");
            var readonly = input.get("readonly");
            var onlyLeaf = input.get("onlyLeaf");
            
            var required = input.get("required");
            var checkType = input.get("checkType");
            var checkSize = input.get("checkSize");
            var dataSize = input.get("dataSize");
            var checkExp = input.get("checkExp");
            var JSONParam = input.get("JSONParam");
            var format = input.get("format");
            
            var value = rowValue[name];
            if(rowValue.get !== undefined)
                value = rowValue.get("name");
            var displayvalue = rowValue[name + "_DISPLAY"];
            
            tpl = tpl.replace(/{name}/g, name );
            tpl = tpl.replace("{col}", ( col?"col=" + col + "":"") );
            tpl = tpl.replace("{label}", ( caption?"label='" + caption.replace(/'/g, "''") + "'":"") );
            
            if(xtype == "textarea"){
                tpl = tpl.replace("{xtype}", "");
                tpl = tpl.replace("<input", "<textarea").replace(">"+validFlag+"</html-col>", ">" + (value?value:"") + "</textarea>" +validFlag+ "</html-col>");
            }else{
                tpl = tpl.replace("{xtype}", ( xtype?"xtype='" + xtype.replace(/'/g, "''") + "'":"") );
            }
            
            tpl = tpl.replace("{url}", (url?"data-url='" + url.replace(/'/g, "''") + "'":"") );
            tpl = tpl.replace("{value}", (value !== undefined && value !== null?"value='" + String(value).replace(/'/g, "''") + "'":"") );
            tpl = tpl.replace("{hidden}", (hidden?"class='hidden'":"") );
            tpl = tpl.replace("{required}", (required?"required='true'":"") );
            tpl = tpl.replace("{placeholder}", (placeholder?"placeholder='" + placeholder.replace(/'/g, "''") + "'":"") );
            tpl = tpl.replace("{readonly}", (readonly?"readonly='true'":"") );
            tpl = tpl.replace("{format}", (format?"format='"+ format +"'":"") );
            tpl = tpl.replace("{onlyLeaf}", (onlyLeaf?"onlyLeaf='1'":"") );
            
            tpl = tpl.replace("{displayvalue}", (displayvalue?"displayvalue='" + displayvalue + "'":"") );
            tpl = tpl.replace(/{text}/g, (displayvalue||value?displayvalue||value:"") );
            tpl = tpl.replace("{JSONParam}", (JSONParam?"data-jsonparam='" + JSONParam + "'":"") );
            
            //非只读控件，并且不隐藏的，需要校验
            if(!readonly && !hidden){
                var aCheckField = [];
                if(required)aCheckField.push("required");
                if(checkType)aCheckField.push(checkType);
                
                //长度检查的优先级大于字段长度检查
                if(checkSize){
                    aCheckField.push("maxSize[" + checkSize + "]");
                }else if(dataSize){
                    aCheckField.push("custom[maxLength[" + dataSize + "]]");
                }
                
                if(checkExp)aCheckField.push("custom[" + checkExp + "]");
                tpl = tpl.replace("{checkField}", (aCheckField.length>0?"validate["+aCheckField.join(",")+"]":"") );
            }
            //分组
            var group = input.get("groupName")?input.get("groupName"):"";
            // var tpl_group = '<html-gp></html-gp>';
            var tpl_group = '<div class="col-md-12 groupName {groupIndex}"><h4 class="form">' + group + '</h4></div>';
            if(defaultGroup != group){
                index = index + 1;
                tpl = tpl_group.replace("{groupIndex}", "gp" + index) + tpl;
                defaultGroup = group;
            }
            
            return tpl;
        }).join("");
    }
    
    static resetForm(formDOM, rowValue:any):void{
        $("[name]", formDOM).each(function(){
            Utils.setValue(this, rowValue);
        });
    }
    
    static buildCondition(opts, builderList, defaultItems){
        function AddRow(builderList){
            var $row = $(`<div class="b-group bh-clearfix">
                            <div class="form-group col-md-4 bh-form-group bh-col-md-4"><select class="form-control bh-form-control" id="searchBy"></select></div>
                            <div class="form-group col-md-2 bh-form-group bh-col-md-2"><select class="form-control bh-form-control" id="searchConditon"></select></div>
                            <div class="form-group col-md-5 bh-form-group bh-col-md-5 searchContentContainer"><input type="text" xtype="text" name="searchContent" id="searchContent" placeholder="关键字" class="form-control bh-form-control"></div>
                            <div class="form-group col-md-1 bh-form-group bh-col-md-1 col-icon">
                              <a href="javascript:void(0);" id="minus" class="b-option-minus" onclick="removeRow">X</a>
                            </div>
                        </div>`);
            var $searchBy = $("#searchBy", $row).empty();
            for(let item of opts){
                if(item.hidden)
                    continue;
                let option = $(`<option></option>`);
                option.val(item.name).text(item.caption).data(item);
                $searchBy.append(option);
            }
            
            $searchBy.change(function(){
                var opt = $(":selected", this).data();
                var $searchConditon = $("#searchConditon", $row).empty();
                for(let item of builderList[opt.builderList]){
                    let option = $(`<option></option>`);
                    option.val(item.name).text(item.caption);
                    $searchConditon.append(option);
                }
                $searchConditon.change(function(){
                    var $searchContentContainer = $(".searchContentContainer", $row).empty();
                    var $searchContent = $(`<input type="text" xtype="${opt.xtype||"text"}" id="searchContent" name="searchContent" placeholder="关键字" class="form-control bh-form-control">`);
                    if(opt.url)
                        $searchContent.attr("data-url", opt.url);
                    if($(this).val().indexOf("m_value_") > -1)
                        $searchContent.attr("data-multi", "true");
                    $searchContentContainer.append($searchContent);
                    var loader = new DataLoader(window.location.pathname);
                    formControls.init($row, loader.getContextPath());
                });
                // $("option[value=" + opt.defaultBuilder + "]", $searchConditon).attr("selected", "selected");
                $searchConditon.trigger("change");
            });
            
            $("#minus", $row).click(function(){
                $(this).closest("div.b-group").remove();
            });
            
            $(".searchByContainer", $row).append($searchBy);
            return $row;
        }
        
        var $form = $(`<form role="form" class="advanceSearch">
            <div id="rowContainer"></div>
            <div class="form-group col-md-6 bh-form-group bh-col-md-6">
                <a href="javascript:void(0);" class="b-search-add-options color-primary bh-color-primary">添加条件</a>
            </div>
            <div class="form-group col-md-5 bh-form-group bh-col-md-5">
                <a href="javascript:void(0);" class="btn btn-primary btn-xs bh-btn bh-btn-primary bh-btn-small searchBtn">查询</a>
            </div>
            <div class="form-group col-md-1 bh-form-group bh-col-md-1"></div>
        </form>`);
        $(".b-search-add-options", $form).click(function(e){
            var row = AddRow(builderList);
            $("#rowContainer", $form).append(row);
            $("#searchBy option:first", row).attr("selected", "selected");
            $("#searchBy", row).trigger("change");
        });
        $(".searchBtn", $form).click(function(e){
            var searchValue = [];
            var _opts = opts;
            var _builderList = builderList;
            $(".b-group", $form).each(function(){
                var caption = "";
                var name = $("#searchBy", this).val();
                var itemdef = _opts.filter(function(value){return value.name == name});
                if(itemdef.length > 0)
                    caption = itemdef[0].caption;
                var buildercaption = "";
                var builder = $("#searchConditon", this).val();
                var builderdef = _builderList[itemdef[0].builderList].filter(function(value){return value.name == builder});
                if(builderdef.length > 0)
                    buildercaption = builderdef[0].caption;
                var value = $("#searchContent", this).val();
                var text = $("#searchContent", this).attr("displayvalue") || value;
                searchValue.push({caption:caption, name:name, value:value, text:text, builder:builder, builderCaption:buildercaption, linkOpt:"AND"});
            });
            $form.trigger("search_click", [searchValue]);
        });
        
        
        if(defaultItems.length == 0){
            $(".b-search-add-options", $form).trigger("click");
        }else{
            for(let item of defaultItems){
                var row = AddRow(builderList);
                $("#searchBy", row).val(item.name);
                $("#rowContainer", $form).append(row);
                $("#searchBy", row).trigger("change");
                $("#searchConditon", row).val(item.builder);
                $("#searchConditon", row).trigger("change");
                Utils.setValue($("#searchContent", row)[0], {"searchContent":item.value, "searchContent_DISPLAY":item.text});
            }
        }
        
        return $form;
    }
    
    static lockFields(fieldName, formDOM){
        function fReadonly(fieldName, formDOM){
            var oControl;
            if(typeof fieldName == "string")
                oControl = $("[name=" + fieldName + "]", formDOM);
            else
                oControl = $(fieldName);
            var xtype = oControl.attr("xtype");
            switch(xtype){
                case "select":
                oControl[0].selectize.lock();
                break;
                case "tree":
                oControl.next().attr("readonly", "true").removeAttr("data-toggle").removeClass("dropdown-toggle");
                break;
                case "date-ym":
                case "date-local":
                oControl.attr("readonly", "true");
                oControl.off("focus").off("click");
                break;
                // case "radiolist":
                // case "checkboxlist":
                default:
                oControl.attr("readonly", "true");
                break;
            }
        }
        
        if($.isArray(fieldName)){
            fieldName.forEach(element => {
                fReadonly(element, formDOM);
            });
        }else if(fieldName == "*"){
            $("[name]", formDOM).each(function(){
                fReadonly(this, formDOM);
            });
        }else{
            fReadonly(fieldName, formDOM);
        }
    }
    
    static unlockFields(fieldName, formDOM){
        function fEdit(fieldName, formDOM){
            var oControl;
            if(typeof fieldName == "string")
                oControl = $("[name=" + fieldName + "]", formDOM);
            else
                oControl = $(fieldName);
            var xtype = oControl.attr("xtype");
            switch(xtype){
                case "select":
                oControl[0].selectize.unlock();
                break;
                case "tree":
                oControl.next().removeAttr("readonly").attr("data-toggle","dropdown").addClass("dropdown-toggle");
                break;
                case "date-ym":
                oControl.on("focus", function(){
                    WdatePicker({dateFmt:"yyyy-MM"});
                    return false;
                });
                oControl.removeAttr("readonly");
                break;
                case "date-local":
                oControl.on("focus", function(){
                    WdatePicker();
                    return false;
                });
                oControl.removeAttr("readonly");
                break;
                // case "radiolist":
                // case "checkboxlist":
                default:
                oControl.removeAttr("readonly");
                break;
            }
        }
        
        if($.isArray(fieldName)){
            fieldName.forEach(element => {
                fEdit(element, formDOM);
            });
        }else if(fieldName == "*"){
            $("[name]", formDOM).each(function(){
                fEdit(this, formDOM);
            });
        }else{
            fEdit(fieldName, formDOM);
        }
    }
    
    static toggleFields(fieldName, formDOM):void{
        if(formDOM.DataTable){
            var table = formDOM.DataTable();
            var columns = table.columns().dataSrc();
            var keys = [];
            if($.isArray(fieldName)){
                fieldName.forEach(element => {
                    keys.push( columns.indexOf(element) );
                });
            }else{
                keys.push(columns.indexOf(fieldName));
            }
            table.columns( keys ).visible( false, false );
            table.columns.adjust().draw( false );
        }else{
            if($.isArray(fieldName)){
                fieldName.forEach(element => {
                    $("html-col[field=" + element + "]").toggleClass("hide");
                });
            }else{
                $("html-col[field=" + fieldName+ "]").toggleClass("hide");
            }
        }
        
    }
    
    static getColumnMeta(dataId, aColumns, gridMeta){
        var columns =[];
        //表头勾选框
        var loader = new DataLoader(window.location.pathname, gridMeta);
        var aColModel = loader.model(dataId);
		
        var params = {
            columns:[], 
            columnDefs:[],
            "dom" : 'T<"clear">rt<<"col-md-6"il><"col-md-6"p>>',//是否取消抬头的页面显示数量以及查询组件
			"ordering":  true,//是否排序
			"bPaginate" : true,// 分页按钮
            "autoWidth":false,
            "bLengthChange": true,
			"aLengthMenu": [15, 25, 50],
			"oLanguage" : { //主要用于设置各种提示文本
				"sProcessing" : "正在处理...", //设置进度条显示文本
				"sLengthMenu" : "每页显示 _MENU_ 条",//显示每页多少条记录
				"sEmptyTable" : "没有找到记录",//没有记录时显示的文本
				"sZeroRecords" : "没有找到记录",//没有记录时显示的文本
				"sInfo" : "总记录数_TOTAL_条     当前显示_START_至_END_条",
				"sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",//没记录时,关于记录数的显示文本
				"sInfoFiltered": "",//"(由 _MAX_ 项结果过滤)",//
				"sSearch" : "",//搜索框前的文本设置
				"oPaginate" : {		
				"sNext" : "»",
				"sPrevious" : "«"
				}
			}
        }
        
		var index = 0;
		if(aColumns.indexOf("checkbox") > -1){
            var checkboxtmp = { "data": null,
                className: "checkbox ",
                "orderData":false,
                "width":"12px",
                "sTitle":"<div class='bh-checkbox'> <label> <input type='checkbox' id='allselect'> <i class='input-helper bh-choice-helper'></i> </label></div>"
                //"defaultContent":"<div class='bh-checkbox'> <label> <input type='checkbox' name='chk'> <i class='input-helper bh-choice-helper'></i> </label></div>"
            };
            params.columns.push(checkboxtmp);
			
			params.columnDefs.push({
				"targets": index,
      			"orderable": false,
                "render":function( data, type, row, meta ){
                    return "<div class='bh-checkbox bh-w-12'> <label> <input type='checkbox' name='chk'> <i class='input-helper bh-choice-helper'></i> </label></div>";    
                }
			});
            index++;
        }
		if(aColumns.indexOf("index") > -1){
			params.columns.push({title:"序号",data:null,defaultContent:"",className: "index"});
			
			params.columnDefs.push({
				"render": function ( data, type, row, index ) {
					return index.row + 1;
				},
				"targets": index,
      			"orderable": false
			});
            index++;
		}
        params.columnDefs.push({
            "targets":"_all", 
            render:function( data, type, row, meta ){
                // return $(`<div class="bh-str-cut" title="${data}"></div>`).text(data).html();
                var content = "";
                if(data !== undefined && data != null)
                    content = String(data);
                return `<div class="bh-str-cut" title="${content}">${content.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`;
            }
        });
        // params.columnDefs.push({
        //     "render": function ( data, type, row, index ) {
        //         return `<div class="bh-str-cut" title="${data}">${data}</div>`;
        //     },
        //     "targets": "_all"
        // });
        
                
        //获取数据列
        aColModel.forEach(element => {
            element.get = function(field){
                if(element["grid."+field] !== undefined)
                    return element["grid."+field];
                else
                    return element[field];
            }
            // if(!element.get("hidden") || (element.get("hidden") !== undefined && element.hidden=="false")){
            var data;
            //title & label是旧版本底座的名称，在后期将要去掉
            if(element.url){//字典类型
                data = {"title":element.get("caption")||element.get("title")||element.get("label"),"data":element.get("name")+'_DISPLAY'};
            }else{
                data = {"title":element.get("caption")||element.get("title")||element.get("label"),"data":element.get("name")};
            }
            if(element.get("hidden"))data.visible = !element.get("hidden");
            if(element.get("width"))data.width = element.get("width");
            params.columns.push(data);
            // }
        });
        
        return params;
    }

    // 根据token 获取 token下的文件 信息
    static attachmentGetUploadedAttachment (token, contextPath) {
        var result;
        $.ajax({
            type : "post",
            dataType : "json",
            async : false,
            url : contextPath + '/sys/emapcomponent/file/deleteFileByToken/getUploadedAttachment/' + token + '.do',
            success : function(data){
                if (data.success) {
                    result = data.items;
                } else {
                    result = false;
                }
            }
        });
        return result;
    }
}
