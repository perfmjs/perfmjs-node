/**
 * socket.io服务端
 * Created by tony on 2014/5/21.
 */
require("../../perfmjs/perfmjs");
perfmjs.plugin('pushserver', function($$) {
    $$.base("base.pushserver", {
        init: function(eventproxy) {
            this.eventproxy = eventproxy;
            this.eventproxy.on($$.sysconfig.events.moduleIsReady, function() {perfmjs.logger.info("pushserver is ready!");});
            return this;
        },
        startServer: function() {
            var server = require('http').Server(), io = require('socket.io').listen(server);
            server.listen(18000);

            io.configure(function () {
               io.set('transports', ['websocket','flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
            });

            io.configure('development', function () {
                io.set('transport', ['websocket', 'xhr-polling']);
                io.enable('log');
            });

            var i = 0;
            io.of("/jsbf").on('connection', function (socket) {
                console.info("comming a connection.....");
                socket.on("message", function(data) {
                    console.info("on message.........................." + data.id);
                });
                socket.on("heartbeat", function() {
                    console.info("heartbeat");
                });
                socket.on("disconnect", function() {
                    console.info("disconnect a client.....");
                });
                socket.on("notifyAll", function(data) {
                    io.of("/jsbf").emit("message", {"id":data.id});
                });
            });

            setInterval(function() {
                i += 1;
                io.of("/jsbf").emit("message", {"id":i});
            }, 5000);
        },
        end: 0
    });
    $$.base.pushserver.defaults = {
        scope: 'singleton',
        end: 0
    };
    /*for Node.js begin*/
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = perfmjs.pushserver;
    }
    /*for Node.js end*/
});
