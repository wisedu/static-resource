if ($.fn.dataTable) {
    $.extend( $.fn.dataTable.defaults, {
        "paging": true,
        "ordering":  false,
        "info": true,
        "serverSide" :false,
        "sServerMethod": "POST",
        "bProcessing" : true,
        "oLanguage":{
            "sProcessing":   "处理中...",
            "sLengthMenu":   "_MENU_",
            "sZeroRecords":  "暂无数据",
            "sInfo":         "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            "sInfoEmpty":    "显示第 0 至 0 项结果，共 0 项",
            "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
            "sInfoPostFix":  "",
            "sSearch":       "<span style='margin-right:5px;'>组名称:</span>",
            "sUrl":          "",
            "sEmptyTable":     "没有数据",
            "sLoadingRecords": "载入中...",
            "sInfoThousands":  ",",
            "sThousands": ",",
            "oPaginate": {
                "sFirst":    "首页",
                "sPrevious": "<",
                "sNext":     ">",
                "sLast":     "末页"
            },
            "oAria": {
                "sSortAscending":  ": 以升序排列此列",
                "sSortDescending": ": 以降序排列此列"
            }
        }
    });
}