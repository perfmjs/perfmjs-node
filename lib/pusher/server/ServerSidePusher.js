/**
 * socket.io服务端
 * 从socket.io.client(v0.9.x)升级到socket.io.client(v1.x)可参考：https://github.com/Automattic/socket.io/wiki/Migrating-to-1.0
 * 参考#Restricting yourself to a namespace：http://socket.io/docs/
 * 压力测试：websocket-bench -a 100 -c 50 http://192.168.66.150:18000
 * Created by tony on 2014/5/21.
 */
require("../../perfmjs/perfmjs");
perfmjs.plugin('pushserver', function($$) {
    $$.base("base.pushserver", {
        init: function(eventproxy) {
            var self = this;
            (this.options['eventproxy'] = eventproxy).on($$.sysconfig.events.moduleIsReady, function() {$$.logger.info("ServerSide Pusher is Ready!");});
            //start server
            perfmjs.pushserver.instance._startServer(18000, "/jsbf");
            return this;
        },

        /**
         * 开启socket服务
         * @param port
         * @param room
         */
        _openServer: function(port, room) {
            //ref to: node_modules/socket.io/node_modules/engine.io/README.md
            var io_of_room = require("socket.io")(port, {
                'origins': '*:*',
                'transports':['polling-xhr', 'polling', 'websocket'],
                'pingTimeout': 5000,
                'pingInterval': 55000,
                //'maxHttpBufferSize': 30*1024,  //30KB, 防Dos攻击
                'allowUpgrades': true,
                'cookie': false
            }).of(room);
            $$.logger.info("Socket.IO Server Started with Port " + port);
            return io_of_room;
        },

        /**
         *
         * @param port e.g. 18000
         * @param room e.g. "/jsbf"
         */
        _startServer: function(port, room) {
            var self = this, io_of_room = this._openServer(port, room);
            io_of_room.on('connection', function (socket) {
                socket.emit("message", self.options['socketData']); //返回每个连接的初始数据
                $$.logger.info("一个新连接过来了..." + socket.id);
                socket.on("notifyAll", function(jsonData) {
                    //TODO 权限校验，只允许同源域名或IP白名单访问该方法
                    console.log("发送一个notifyAll消息");
                    self.options['socketData'].id = jsonData.id;
                    io_of_room.emit("message", self.options['socketData']);
                });
                socket.on('disconnect', function () {
                    $$.logger.info("一个连接关闭了...");
                });
            });
//            setInterval(function() {
//                self.options['socketData']['id'] += 1;
//                console.log('Send a Message[id=' + self.options['socketData']['id'] + '] at ' + new Date);
//                io_of_room.emit("message", self.options['socketData']);
//            }, 10000);
        },
        end: 0
    });
    $$.base.pushserver.defaults = {
        socketData: {'id':0},
        scope: 'singleton',
        end: 0
    };
    /*for Node.js begin*/
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = perfmjs.pushserver;
    }
    /*for Node.js end*/
});
