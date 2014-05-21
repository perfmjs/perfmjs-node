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
        /**
         *
         * @param port e.g. 18000
         * @param room e.g. "/jsbf"
         * @param onConnection
         */
        startServer: function(port, room, onConnection) {
            var server = require('http').Server(), io = require('socket.io').listen(server);
            server.listen(port);

            io.configure(function () {
               io.set('transports', ['websocket','flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
            });

            io.configure('development', function () {
                io.set('transport', ['websocket', 'xhr-polling']);
                io.enable('log');
            });

            var io_of_room = io.of(room);
            io_of_room.on('connection', function (socket) {
                onConnection(io_of_room);
                socket.on("notifyAll", function(jsonData) {
                    //TODO 权限校验，只允许同源域名或IP白名单访问该方法
                    io_of_room.emit("message", jsonData);
                });
            });
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
