$(document).on("click", ".table-cross-highlight thead th", function(e){
    if (e.target.nodeName == "INPUT") {return;}
    var _self = $(this);
    var table = _self.closest("table.table");
    var tbody = table.children("tbody");

    if (_self.hasClass("ch-active")) {
        _self.removeClass("ch-active");
        ampTableGetColTds(_self, 0, "ch-active");
    }else {
        table.find("td.ch-active, th.ch-active").removeClass("ch-active");
        _self.addClass("ch-active");
        ampTableGetColTds(_self, 1, "ch-active");
    }
}).on("mouseover", "td", function(){
    var _self = $(this);
    _self.parent("tr").addClass("ch-hover");
    ampTableGetColTds(_self, 1, "ch-hover");

}).on("mouseout", "td", function(){
    var _self = $(this);
    _self.parent("tr").removeClass("ch-hover");
    ampTableGetColTds(_self, 0, "ch-hover");
});

function ampTableGetColTds ($ele, type, className) {
    var table = $ele.closest("table.table");
    var index = $ele.index();
    table.find("tr").each(function(){
        var td = $(this).children("td:eq(" + index + ")");
        if (type) {
            td.addClass(className);
        }else {
            td.removeClass(className);
        }
    });
}