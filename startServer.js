/**
 * 应用入口函数
 */
var jsbfPusher = require("./lib/pusher/server/jsbf/jsbfPusher");
perfmjs.ready(function($$, app) {
    var cluster = require('cluster');
    if (cluster.isMaster) {
        var cpuCount = require('os').cpus().length;
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
    } else {
        app.register("jsbfPusher", jsbfPusher);
        app.startAll();
    }
});