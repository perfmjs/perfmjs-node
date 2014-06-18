/**
 * socket.io服务端
 * 从socket.io.client(v0.9.x)升级到socket.io.client(v1.x)可参考：https://github.com/Automattic/socket.io/wiki/Migrating-to-1.0
 * 参考#Restricting yourself to a namespace：http://socket.io/docs/
 * 压力测试：websocket-bench -a 100 -c 50 http://192.168.66.150:18000
 * Created by tony on 2014/5/21.
 */
require("../../perfmjs/perfmjs");
perfmjs.plugin('serverPusher', function($$) {
    $$.base("base.serverPusher", {
        init: function(eventProxy) {
            (this.options['eventProxy'] = eventProxy).on($$.sysconfig.events.moduleIsReady, function() {$$.logger.info("ServerSide Pusher is Ready!");});
            return this;
        },

        /**
         * 开启socket服务
         * ref to: node_modules/socket.io/node_modules/engine.io/README.md
         * @param port e.g. 18000
         * @param room e.g. "/jsbf"
         */
        startup: function(port, room) {
            var self = this,
            io_of_room = require("socket.io")(port, {
                'path': '/socket.io',
                'origins': '*:*',
                'transports':['polling-xhr', 'polling-jsonp', 'polling', 'websocket'],
                'pingTimeout': 5000,
                'pingInterval': 55000,
                //'maxHttpBufferSize': 30*1024,  //30KB, 防Dos攻击
                'allowUpgrades': true,
                'cookie': false
            }).of(room);
            $$.logger.info("Socket.IO Server Started with Port: " + port  + ", and room: " + room);

            io_of_room.on('connection', function (socket) {
                self.options['socketConnCount'] += 1;
//                $$.logger.info(self.options['socketConnCount'] + "，又一个新连接过来了..." + socket.id);
                socket.on("notifyAll", function(jsonResult) {
                    //TODO 权限校验，只允许同源域名或IP白名单访问该方法
//                    console.log("发送一个notifyAll消息:");
                    io_of_room.emit("message", (function() {
                        try {
                            return self.specJSONResult(jsonResult);
                        } catch (err) {
                            return {};
                        }
                    })());
                });
                socket.on('disconnect', function () {
                    self.options['socketConnCount'] -= 1;
                    //$$.logger.info(self.options['socketConnCount'] + ",一个连接关闭了..." + socket.id);
                });
                if (self.options['shouldBuildInitDataOnConn']) {
                    socket.emit("message", (function() {
                        try {
                            return self.buildInitDataOnConn();
                        } catch (err) {
                            return {};
                        }
                    })());
                }
            });
        },

        /**
         * 根据业务情况，子类应继承该业务方法
         * 给每个客户端连接返回实时的初始数据
         * @returns {*}
         */
        buildInitDataOnConn: function() {
            this.options['socketData'] = {'id':0, 'date':0};
            return this.options['socketData'];
        },

        /**
         * 根据业务情况，子类需要重写该业务方法
         * 规范socket传递中的json格式的数据
         * @param jsonResult
         */
        specJSONResult: function(jsonResult) {
            this.options['socketData'] = jsonResult;
            return this.options['socketData'];
        },
        end: 0
    });
    $$.base.serverPusher.defaults = {
        shouldBuildInitDataOnConn: true,
        socketData: {}, //需要定义成和dataChange一致的数据结构
        socketConnCount: 0,
        eventProxy: {},
        scope: 'singleton',
        end: 0
    };
});
