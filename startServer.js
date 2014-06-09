//应用入口函数
var jsbfPusher = require("./lib/pusher/server/jsbf/jsbfPusher");
perfmjs.ready(function($$,app) {
    app.register("jsbfPusher", jsbfPusher);
    app.startAll();
});