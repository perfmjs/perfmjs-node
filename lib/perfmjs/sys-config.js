/*for Node.js begin*/
if (typeof module !== 'undefined' && module.exports) {
    perfmjs = require("./perfmjs");
}
/*for Node.js end*/
perfmjs.plugin('sysConfig', function($$) {
    $$.utils.namespace('sysConfig');
    $$.sysConfig.events = {
        moduleIsReady: 'perfmjs.ready',
        end:0
    };
});
/*for Node.js begin*/
if (perfmjs.utils.isNodeJSSupport()) {
    exports = module.exports = perfmjs.sysConfig
}
/*for Node.js end*/