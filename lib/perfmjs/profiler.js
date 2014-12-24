/**
 * 各种profiler的日志打印
 * Created by Administrator on 2014/12/24.
 */
perfmjs.plugin('profiler', function($$) {
    $$.base("profiler", {
        init: function () {
            return this;
        },

        /**
         * 开始profiler
         * @param name profiler名称
         * @param type 如: 运行时长tickcount
         * @param threshold  阀值
         */
        start: function(name, threshold, type) {
            threshold = threshold || 99999;
            type = type || 'tickcount';
            this.option('threshold')[name + '_' + type] = threshold || 0;
        },

        stop: function(name, value, message, type) {
            type = type || 'tickcount';
            value = value || 0;
            if (value > $$.utils.toNumber(this.option('threshold')[name + '_' + type])) {
                $$.logger.info(message + ": " + name + "_" + type + ': ' + value + ", threshold:" + this.option('threshold')[name + '_' + type]);
            }
        },
        end: 0
    });
    $$.profiler.defaults = {
        type: ['tickcount'],
        threshold: {}, //阀值: {'tickcount':200}
        end: 0
    };
    /*for Node.js begin*/
    if ($$.utils.isNodeJSSupport()) {
        exports = module.exports = $$.profiler;
    }
    /*for Node.js end*/
});