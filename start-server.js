/**
 * 应用入口函数
 */
require("./lib/perfmjs/perfmjs");
perfmjs.ready(function($$, app) {
    var async = require('./lib/perfmjs/async');
    var deferred = async.defer();
    $$.utils.nextTick(function() {
        deferred.resolve('ok');
    });
    deferred.promise.then(function(result) {
        console.log('result=' + result);
    }, function(result) {
        console.log('error:' + result);
    });
    $$.logger.info('Hello perfmjs-node!');
});