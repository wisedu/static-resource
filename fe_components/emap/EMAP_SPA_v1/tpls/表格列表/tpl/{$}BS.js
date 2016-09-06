define(function(require, exports, module) {
	var utils = require('utils');
	var bs = {
		api: {
			pageModel: '{$url}',
			advancedQueryModel: '{$queryUrl}',
			resultProfile: './mock/resultProfile.json'
		},
		getDemoMainModel: function() {
			var def = $.Deferred();
			utils.doAjax(bs.api.resultProfile, null, 'get').done(function(data) {
				data.length = data.list.length;
				def.resolve(data);
			}).fail(function(res) {
				def.reject(res);
			});
			return def.promise();
		}
	};

	return bs;
});