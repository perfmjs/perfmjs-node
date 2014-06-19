/**
 * 应用入口函数
 */
require("./lib/perfmjs/perfmjs");
perfmjs.ready(function($$, app) {
    $$.logger.info('Hello perfmjs-node!');
});