1.4.2 / 2014-1-12
==================
* improved: 增加$$.utils.aop()功能

1.4.0 / 2014-12-25
==================
* add: 增加Profiler.js功能

1.3.5 / 2014-09-19
==================
* add: 增加管理production和development环境变量的config.js
* improved: 增加logger日志文件的配置：appenderFile

1.3.3 / 2014-09-15
==================
* improved: 将app.js中error.message改为error.stack
* fixed: 修复base.js的option方法的BUG

1.3.2 / 2014-08-31
==================
* fix: 将perfmjs.utils#isH5Supported方法名改成isH5Support()

1.3.1 / 2014-08-31
==================
 * fixed: change $$.sysconfig to $$.sysConfig

1.3.1 / 2014-08-28
==================
 * improved: 整理命名空间
 * improved: async.js重构

1.3.0 / 2014-08-26
==================
 * improved: 优化promise/A+实现类async.js

1.2.9 / 2014-08-22
==================
 * add: 在utils中增加方法：isBrowserSupport(), isNodeJSSupport(), isAmdSupport(), isH5Support()
 * add: 增加promise/A+实现类async.js

1.2.8 / 2014-8-14
==================
 * add: 增加datefile日志功能

1.2.7 / 2014-07-29
==================
 * improved: add pretty logger format in logger.js

1.2.6 / 2014-07-23
==================
 * improved: improved some function in joquery.js

1.2.5 / 2014-07-16
==================
 * fixed: fixed defaults problem in base.js

1.2.4 / 2014-07-16
==================
 * fixed: fixed scope problem in app.js

1.2.3 / 2014-07-16
==================
 * fixed: add scope default vlaue in base.js

1.2.2 / 2014-07-09
==================
 * improved: improved base function

1.1.9 / 2014-07-08
==================
 * improved: improved perfmjs.utils#fmtJSONMsg, etc

1.1.8 / 2014-07-02
==================
 * add: perfmjs.utils#isObject, perfmjs.utils#keys

1.1.7 / 2014-06-26
==================
 * add: perfmjs.utils#fastMap, perfmjs.utils#fastReduce

1.1.4 / 2014-06-25
==================
 * fix: fix some bugs
 * add: perfmjs.utils#fastBind, perfmjs.utils#forEach
 * modify: joquery#where, joquery#updateOrInsert, joquery#last, joquery#last

1.1.3 / 2014-06-20
==================
 * fix: fix some bugs

说明：修改类型为: improved(改善功能)/add(新增功能)/remove(移除功能)/modify(修复功能内容)/fix(修改BUG)