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
    $$.sysConfig.config = require('./config') || {}; //线上环境下需带启动参数, 如：--NODE_ENV=[production|development] --NODE_CONFIG_DIR=test/config
});
/*for Node.js begin*/
if (perfmjs.utils.isNodeJSSupport()) {
    exports = module.exports = perfmjs.sysConfig;
}
/*for Node.js end*/