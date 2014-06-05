/**
 * 服务器推client助手类,保持在ie客户端3次/分钟的连接请求
 * 参考：http://socket.io/docs/
 * 　　　https://github.com/Automattic/socket.io-client
 * Created by tony on 2014/5/21.
 */
perfmjs.plugin('socketHelper', function($$) {
    $$.base("base.socketHelper", {
        init: function(eventproxy) {
            this.options['eventproxy'] = eventproxy;
            try {
                this._openSocketConnect('http://nodejs.no100.com/jsbf');
            } catch(err) {
                alert('error occured!' + err.message);
            }
            return this;
        },

        /**
         * 打开socket.io连接
         * @param socketIO　e.g. io
         * @param url  e.g. http://nodejs.no100.com/jsbf
         * @returns {*|io.Socket}
         * @private
         */
        _openSocketConnect: function(url) {
//            alert('start to connect');
            this.options['socketConnection'] = io.connect(url, {
                'forceNew': true,
                'transports': ['polling', 'websocket'],
                'reconnection': false,
                'reconnectionDelay': 1000,
                'timeout': 500
            });
//            alert('success to connect:' + this.options['socketConnection'].connected);
            this._onSocketConnect();
        },

        /**
         * 连接事件处理器
         * @private
         */
        _onSocketConnect: function() {
            var self = this, socket = this.options['socketConnection'];
            socket.on("err", function(err) {
                self._renderView("出现了错误....." + err.message);
            });
            socket.on("connect", function() {
                if (typeof self.options['socketInterval'] !== 'undefined') {
                    clearInterval(self.options['socketInterval']);
                }
                self._renderView("已成功获取连接.....");
            });
            socket.on("message", function (jsonData) {
                self._renderView("新赔率：" + jsonData.id);
            });
            socket.on("disconnect", function() {
                socket.destroy();
                self._renderView("断开连接了.....");
                //FIXME 以下代码有点问题
                self.options['socketInterval'] = setInterval(function() {
                    self._renderView("reopen new socket connection......");
                    self._openSocketConnect('http://nodejs.no100.com/jsbf');
                }, 10000);
            });
        },

        /**
         * 渲染页面
         * @private
         */
        _renderView: function(html) {
            document.getElementById("renderId").innerHTML = html;
        },
        end: 0
    });
    $$.base.socketHelper.defaults = {
        socketData: {},
        socketInterval: undefined,
        eventproxy: {},
        scope: 'singleton',
        end: 0
    };
});