/**
 * 即时比分服务端推送
 * Created by Administrator on 2014/6/6.
 */
require("../../../perfmjs/perfmjs");
require("../serverPusher");
perfmjs.plugin('jsbfServerPusher', function($$) {
    $$.base("base.serverPusher.jsbfServerPusher", {
        init: function (eventproxy) {
            this._super('init', eventproxy);
            this.startup(18000, "/jsbf");
            return this;
        },

        /**
         * 根据业务情况，子类需要重写该业务方法
         * 给每个客户端连接返回实时的初始数据
         * @returns {*}
         */
        buildInitDataOnConn: function() {
            this.options['socketData'] = {'id':0, 'date':(new Date).getTime()};
            return this.options['socketData'];
        },

        /**
         * 根据业务情况，子类应继承该业务方法
         * 规范socket传递中的json格式的数据
         * @param jsonResult
         */
        specJSONResult: function(jsonResult) {
            this.options['socketData'] = jsonResult;
            return this.options['socketData'];
        },
        end: 0
    }, $$.base.serverPusher.prototype, $$.base.serverPusher.defaults);
    $$.base.serverPusher.jsbfServerPusher.defaults = {
        shouldBuildInitDataOnConn: true,
        end: 0
    };
    /*for Node.js begin*/
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = perfmjs.jsbfServerPusher;
    }
    /*for Node.js end*/
});