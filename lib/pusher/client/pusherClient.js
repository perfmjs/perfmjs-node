/**
 * 服务器推client助手类,保持IE客户端连接5次/分钟的连接请求
 * 参考：http://socket.io/docs/
 * 　　　https://github.com/Automattic/socket.io-client
 * Created by tony on 2014/5/21.
 */
perfmjs.plugin('pusherClient', function($$) {
    $$.base("base.pusherClient", {
        init: function(eventProxy) {
            this.options['eventProxy'] = eventProxy;
            this._startup();
            return this;
        },

        /**
         * 据据业务情况，子类需要重写该业务处理逻辑
         * @param jsonResult
         * @private
         */
        doBusiness: function(jsonResult) {
            document.getElementById("renderId").innerHTML = "新数据来了：date=" + jsonResult.date + "/id=" + jsonResult.id;
        },

        /**
         * 启动长连接业务服务
         * @private
         */
        _startup: function() {
          var self = this;
          if (this.options['socketEnabled']) {
              this._openSocketConnect(this.options['socketURL']);
              this.options['socketFirstRetryInterval'] = setInterval(function () {
                  if (self.options['socketConnectedCount'] > 0) {
                      if (typeof self.options['socketFirstRetryInterval'] !== 'undefined') {
                          clearInterval(self.options['socketFirstRetryInterval']);
                      }
                      return;
                  }
                  self._openSocketConnect(self.options['socketURL']);
              }, this.options['socketFirstRetryDelay']);
          }
        },

        /**
         * 打开socket连接
         * @param url，e.g. 'http://nodejs.no100.com/jsbf'
         * @private
         */
        _openSocketConnect: function(url) {
            var self = this, socketConn = io.connect(url, {
                'forceNew': true,
                'transports': ['polling', 'websocket'],
                'reconnection': false,
                //'reconnectionDelay': 10*1000,
                //'reconnectionDelayMax': 5*60*1000, //重连间隔最多为５分钟
                //'reconnectionAttempts': 50, //最多重连50次
                'timeout': 5000
            });
            socketConn.on("connect", function() {
                self.options['socketConnectedCount'] += 1;
                if (typeof self.options['socketReconnInterval'] !== 'undefined') {
                    clearInterval(self.options['socketReconnInterval']);
                }
            });
            socketConn.on("message", function (jsonResult) {
                try {
                    self.doBusiness(jsonResult);
                } catch (err) {}
            });
            socketConn.on("disconnect", function() {
                socketConn.destroy();
                socketConn.close();
                //断开后重新连接
                self.options['socketReconnInterval'] = setInterval(function() {
                    self._openSocketConnect(url);
                }, self.options['socketReconnDelay']);
            });
        },
        end: 0
    });
    $$.base.pusherClient.defaults = {
        socketEnabled: true,
        socketURL: 'http://xxx.yyy.com/namespace',
        socketFirstRetryInterval: undefined,
        socketFirstRetryDelay: 30*1000,
        socketReconnInterval: undefined,
        socketReconnDelay: 10*1000,
        socketConnectedCount: 0,
        eventProxy: {},
        scope: 'singleton',
        end: 0
    };
});