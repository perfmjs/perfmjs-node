/**
 * 即时比分服务端推送
 * Created by Administrator on 2014/6/6.
 */
if (typeof module !== 'undefined' && module.exports) {
    require("../push-server");
}
perfmjs.plugin('jsbfPushServer', function($$) {
    $$.base("base.pushServer.jsbfPushServer", {
        init: function (eventProxy) {
            this._super('init', eventProxy);
            this.startup(18000, "/jsbf");
            return this;
        },

        /**
         * 根据业务情况，子类需要重写该业务方法
         * 给每个客户端连接返回实时的初始数据
         * @returns {*}
         */
        _buildInitDataOnConn: function() {
            this.options['socketData'] = {'id':0, 'date':(new Date).getTime()};
            return this.options['socketData'];
        },

        /**
         * 根据业务情况，子类应继承该业务方法
         * 规范socket传递中的json格式的数据
         * @param jsonResult
         */
        _specJSONResult: function(jsonResult) {
            this.options['socketData'] = jsonResult;
            return this.options['socketData'];
        },
        end: 0
    }, $$.base.pushServer.prototype, $$.base.pushServer.defaults);
    $$.base.pushServer.jsbfPushServer.defaults = {
        shouldBuildInitDataOnConn: true,
        end: 0
    };
    /*for Node.js begin*/
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = perfmjs.jsbfPushServer;
    }
    /*for Node.js end*/
});