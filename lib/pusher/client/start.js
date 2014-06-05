/**
 * socket.io客户端入口类
 */
perfmjs.plugin('start', function($$) {
	$$.base("base.start", {
		init: function() {
			$$.app.newInstance();
            this._registerModules();
            $$.app.instance.startAll();
			return this;
		},

        /**
         * 注册需要的模块
         * @private
         */
        _registerModules: function() {
            $$.app.instance.register("socketHelper", $$.socketHelper);
        },
		end:0
	});
	$$.base.start.defaults = {
		scope: 'singleton',
		end: 0
	};

	//整个应用的入口函数
	$$.ready(document, function() {
		$$.start.newInstance();
	});
});
