/*for Node.js begin*/
if (typeof module !== 'undefined' && module.exports) {
    perfmjs = require("./perfmjs");
    exports = module.exports = perfmjs.sysconfig
}
/*for Node.js end*/
perfmjs.plugin('sysconfig', function($$) {
    $$.sysconfig.events = {
        moduleIsReady: 'perfmjs.ready',
        end:0
    };
});