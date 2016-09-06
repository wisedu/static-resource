define(function(require, exports, module) {
    var utils = require('utils');
    var bs = require('./{$}BS');

    var viewConfig = {
        initialize: function() {
            this.eventMap = {
                '.dskh-dialog-btn-container [data-action="delete"]': this.deleteHandle,
                '.dskh-dialog-btn-container [data-action="export"]': this.exportHandle
            };
        }

    };
    return viewConfig;
});