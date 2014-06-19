/**
 * 应用入口函数
 */
require("./lib/perfmjs/perfmjs");
perfmjs.ready(function($$, app) {
    var cluster = require('cluster');
    if (cluster.isMaster) {
        var cpuCount = require('os').cpus().length;
        cpuCount = 1;
        $$.logger.info("将启动" + cpuCount + "个工作线程，开始进行系统初始化......");
        //启动工作线程
        for (var i = 0; i < cpuCount; i += 1) {
            cluster.fork();
        }
        cluster.on('online', function(worker) {
            $$.logger.info('工作线程:' + worker.id + ' is online.');
        });
        cluster.on('exit', function(worker, code, signal) {
            $$.logger.info('工作线程：' + worker.id + ' 挂了，将重启工作线程…………,signal:' + signal);
            cluster.fork();
        });
        //主线程开启服务器推客户端
        var jsbfPusherClient = require("./lib/push/server/jsbf/jsbf-push-client");
        app.register("jsbfPushClient", jsbfPushClient);
        app.start('jsbfPushClient');
    } else {
        app.register('jsbfPusherServer', require("./lib/push/server/jsbf/jsbf-push-server"));
        app.start('jsbfPusherServer');
    }
});