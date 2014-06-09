/**
 * 即时比分服务器推客户端
 * Created by Administrator on 2014/6/6.
 */
perfmjs.plugin('jsbfPusher', function($$) {
    $$.base("base.pusherClient.jsbfPusher", {
        /**
         * 据据业务情况，子类需要重写该业务处理逻辑
         * @param jsonResult
         * @private
         */
        doBusiness: function(jsonResult) {
            document.getElementById("renderId").innerHTML = "新数据来了：date=" + jsonResult.date + "/id=" + jsonResult.id;
        },
        end: 0
    }, $$.base.pusherClient.prototype, $$.base.pusherClient.defaults);
    $$.base.pusherClient.jsbfPusher.defaults = {
        socketURL: 'http://nodejs.no100.com/jsbf',
        end: 0
    };
});