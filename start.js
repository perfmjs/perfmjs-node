/**
 * 应用入口函数, 启动：node start.js --NODE_ENV=production --NODE_CONFIG_DIR=test/config
 */
require("./lib/perfmjs/perfmjs");
perfmjs.ready(function($$, app) {
    $$.logger.info('Hello perfmjs-node!');
    var dbConfig = $$.sysConfig.config.get('customer.dbConfig.host');
    console.log('dbConfig:' + dbConfig);
});