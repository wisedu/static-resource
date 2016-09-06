define(function(require, exports, module) {

	var utils = require('utils');
	var bs = require('./{$}BS');

	var viewConfig = {
		initialize: function() {
			var view = utils.loadCompiledPage('{$}');
            this.$rootElement.html(view.render({}), true);
            
            this.initView();

			this.eventMap = {
				"[data-action=new]": this.actionNew,
				"[data-action=detail]": this.actionPreviewDetail
			};
		},

		initView: function() {
            this._initAdvanceQuery();
            this._initTable();
        },

        actionNew: function(){
        	$.bhPaperPileDialog.show({
            	ready: function($header, $body, $footer){
            		var mode = WIS_EMAP_SERV.getModel(MOCK_CONFIG.PAGE_MODEL, 'TABLE', 'grid');
		            $body.emapForm({
		                data: mode,
		                readonly: true,
		                model: 'h'
		            });
            	}
            });
        },

		_initAdvanceQuery: function() {
            var searchData = WIS_EMAP_SERV.getModel(bs.api.advancedQueryModel, 'TABLE', "search");
            var $query = $('#emapAdvancedQuery').emapAdvancedQuery({
                data: searchData
            });
            $query.on('search', this._searchCallback);
        },

        _searchCallback: function(e, data, opts) {
            $('#emapdatatable').emapdatatable('reload', {
                querySetting: JSON.stringify(data)
            });
        },

        _initTable: function() {
            var tableOptions = {
                pagePath: MOCK_CONFIG.PAGE_MODEL,
                action: MOCK_CONFIG.ACTION_ID_TABLE,
                customColumns: [{
                    colIndex: '0',
                    type: 'checkbox'
                }, {
                    colIndex: '1',
                    type: 'tpl',
                    column: {
                        text: '操作',
                        align: 'center',
                        cellsAlign: 'center',
                        cellsRenderer: function(row, column, value, rowData) {
                            return '<a href="javascript:void(0)" data-action="detail" data-x-wid=' + rowData.WID + '>' + '详情' + '</a>';
                        }
                    }
                }]
            };
            $('#emapdatatable').emapdatatable(tableOptions);
        }
	};

	return viewConfig;
});