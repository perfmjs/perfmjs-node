 /**
 * 日志模块
 * 1）允许定义日志等级 -- "error", "warn", "info", "debug", "log"
 * @date 2014-5-21
 * import lib.js
 */
!(function() {
	DEBUG_MOD = false;
	perfmjs.logger = function(){};
	perfmjs.logger.level = 4; 	//default level
	//lib.logger.errorUri="http://search.china.alibaba.com/rpc/dragoontrack/logError.json?msg="; 	//dragoon url
	//lib.logger.errorUri="http://s.no100.com/rpc/dragoontrack/logError.json?msg="; 	//dragoon url
	perfmjs.logger.setLevel=function(level){//set logger level to filter the logger , so just show the logger level you focus.
		perfmjs.logger.level = level;
	};
	var prepared = false;
	var methods = ["error", "warn", "info", "debug", "log"];//0-4 level
	perfmjs.utils.extend(perfmjs.logger.prototype, {
		level:perfmjs.logger.level,
		setEnableLevel: function(level) {
			if(level > 4 || level < 0) {
				this.error(['wrong level setting. level should be 0-4, the int type,you set ',level,", so stupided."].join(''));
			}
			this.level = parseInt(level);
		},
        dateFileAppend: function(dirName, fileName, msg) {
            var self = this;
            if(arguments.length == 2){
                var arr = arguments[0].split("/");
                msg = arguments[1];
                dirName = arr[0];
                fileName = arr[1];
            }
            var path = dirName +  '/' + this._formatDate(new Date).substring(0, 10) + '-' + fileName + '.log';
            var fs = require('fs');
            var eol = require('os').EOL || '\n';
            fs.exists(dirName,function(exist){
                if(!exist){
                    fs.mkdir(dirName, 755, function(err){
                        if(err){throw err;}
                    });
                }
                fs.appendFile(path, msg + eol, 'utf-8', function(err){
                    if(err) throw err;
                });
            });
        },
		enabled: function(level) {
			if(level > perfmjs.logger.level) {
				return false;
			}
			return true;
		},
		name: function() {
			return this._name;
		},
		log: function() {
			this._log(4, arguments);
		},
		debug: function() {
			this._log(3, arguments);
		},
		info: function() {
			this._log(2, arguments);
		},
		warn: function() {
			this._log(1, arguments);
		},
		error: function() {
			this._log(0, arguments);
		},
		_handler: function(level, name, msg){
		   var method = methods[level];
		   msg = [['[' + this._formatDate(new Date()) + "] [" + method + "] [default] - "].join("-")].concat(Array.prototype.slice.call(msg));


           if(console.log.apply){
              console[method].apply(console, msg);
           }
            //写入date file FIXME 目前写死了路径
           this.dateFileAppend(require('fs').realpathSync('.') + '/logs/', 'app', msg);
		},
		_log: function(level, msg) {
			if (this.enabled(level)) {
				this._handler(level,this.name(),msg);
			}
		},
        _formatDate: function(date) {
            if (!date) {
                return ':';
            }
            var month = date.getMonth() + 1, day = date.getDate(), hour = date.getHours(), min = date.getMinutes(), seconds = date.getSeconds();
            return date.getFullYear() + "-" + (month<10?('0'+month):month) + "-" + (day<10?('0'+day):day) + " " + (hour<10?('0'+hour):hour)+":" +
                (min<10?('0'+min):min) + ":" + (seconds<10?('0'+seconds):seconds) + "." + date.getMilliseconds();
        },
		end:0
	});

	var logs = {};
	perfmjs.logger = function(name) {
       if (!logs[name]) {
           logs[name] = new perfmjs.logger(name);
           logs[name]._name=name;
       }
       return logs[name];
	}('perfmjs');
	if(DEBUG_MOD){
		perfmjs.logger.setEnableLevel(4);	
	}else{
		perfmjs.logger.setEnableLevel(2);
	}
    /*for Node.js begin*/
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = perfmjs.logger;
    }
    /*for Node.js end*/
})();