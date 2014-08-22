/**
 * npm install jasmine-node -g
 * 在项目根路径下运行测试的方法： jasmine-node test/
 * 参考：https://www.npmjs.org/package/jasmine-node
 * Created by tony on 2014/5/21.
 */
describe("测试perfmjs-node", function () {
    beforeEach(function() {
        require("../lib/perfmjs/perfmjs");
    });
    it("应能测试通过perfmjs.utils.isBrowserSupport方法", function() {
        perfmjs.ready(function($$, app) {
            expect($$.utils.isBrowserSupport()).toEqual(false);
        });
    });
    it("应能测试通过perfmjs.utils.isH5Supported方法", function() {
        perfmjs.ready(function($$, app) {
            expect($$.utils.isH5Supported()).toEqual(true);
        });
    });
    it("应能测试通过perfmjs.utils.fmtJSONMsg方法", function() {
        perfmjs.ready(function($$, app) {
            expect($$.utils.fmtJSONMsg().status).toEqual('fail');
            expect($$.utils.fmtJSONMsg(new Date).status).toEqual('success');
            expect($$.utils.fmtJSONMsg('{"key":1}').result.key).toEqual(1);
            expect($$.utils.fmtJSONMsg('{"key":1}').status).toEqual('success');
            expect($$.utils.fmtJSONMsg({"key":1}).result.key).toEqual(1);
            expect($$.utils.fmtJSONMsg({"key":2}).status).toEqual('success');
        });
    });
    it("应能测试通过perfmjs.utils.forEach方法", function () {
        perfmjs.ready(function($$, app) {
            $$.utils.forEach(['one', 'two', 'three'], function(item, index) {
                expect(item).toEqual(['one', 'two', 'three'][index]);
            });
        });
    });
    it("应能测试通过perfmjs.utils.isString方法", function () {
        expect(perfmjs.utils.isString('perfmjs')).toEqual(true);
    });
    it("perfmjs.utils#keys应该能运行正常", function() {
        perfmjs.ready(function($$, app) {
            var arr = [1,2,3,4,5];
            var jsonObj = {'a':1, 'b':2};
            expect($$.utils.keys(arr).length).toEqual(5);
            expect($$.utils.keys(jsonObj).length).toEqual(2);
        });
    });
    it("map-reduce功能应该可以正常运行", function() {
        perfmjs.ready(function($$, app) {
            var items = [], summary = 0, mapResult;
            for (i = 0; i < 101; i++) {
                items[items.length] = i;
            }
            mapResult = $$.utils.fastMap([items.slice(0,31), items.slice(31,61), items.slice(61,101)], function(subItems, subIndex) {
                return $$.utils.fastReduce(subItems, function(result, item, index) {
                    summary += item;
                    return result + item;
                }, 0);
            });
            expect(summary).toEqual(5050);
        });
    });
    it("应能测试通过异步编程模型async", function() {
        perfmjs.ready(function($$, app) {
            var async = require('../lib/perfmjs/async');
            var deferred = async.defer();
            $$.utils.nextTick(function() {
                deferred.resolve('ok');
            });
            deferred.promise.then(function(result) {
                console.log('result=' + result);
            }, function(result) {
                console.log('error:' + result);
            });
            expect($$.utils.isNodeJSSupport()).toEqual(true);
        });
    });
    it("应能测试通过joquery.js-updateOrInsert", function () {
        perfmjs.ready(function($$, app) {
            var data = [
                { ID: 1, firstName: "Chris", lastName: "Pearson", BookIDs: [1001, 1002, 1003] },
                { ID: 9, firstName: "Bernard", lastName: "Sutherland", BookIDs: [1001, 2002, 3003] },
                { ID: 20, firstName: "Kate", lastName: "Pinkerton", BookIDs: [4001, 3002, 2003] }
            ];
            var result = $$.joquery.newInstance(data).updateOrInsert({ID: 0, firstName: "Chris", lastName: "Pearson", BookIDs: [1001, 1002, 1003]}, function(item, index) {
                return item.ID == 9;
            }, function(item, index) {
                return item.ID > 15;
            });
            expect(result.index).toEqual(1);
        });
    });
    it("应能测试通过joquery.js-first", function () {
        perfmjs.ready(function($$, app) {
            var data = [
                { ID: 1, firstName: "Chris", lastName: "Pearson", BookIDs: [1001, 1002, 1003] },
                { ID: 9, firstName: "Kate", lastName: "Sutherland", BookIDs: [1001, 2002, 3003] },
                { ID: 20, firstName: "Kate", lastName: "Pinkerton", BookIDs: [4001, 3002, 2003] }
            ];
            var first = $$.joquery.newInstance(data).first(function(item, index) {
                return item.firstName === 'Kate';
            });
            var last = $$.joquery.newInstance(data).last(function(item, index) {
                return item.firstName === 'Kate';
            });
            expect(first.ID).toEqual(9);
            expect(last.ID).toEqual(20);
        });
    });
    it("应能测试通过base.js", function () {
        perfmjs.plugin('xxx', function($$) {
            $$.base("xxx", {
                init: function(arg) {
                    return this;
                },
                test: function() {
                  return 12;
                },
                end: 0
            });
            $$.xxx.defaults = {
                scope: 'singleton',
                end: 0
            };
        });
        expect(new xxx().test()).toEqual(12);
    });
    it("应能测试通过logger.js", function () {
        perfmjs.ready(function($$, app) {
            $$.logger.info('pretty logger!');
            expect(perfmjs.logger.level).toEqual(2);
        });
    });
    it("应能测试通过app.js", function () {
        perfmjs.plugin('model1', function($$) {
            $$.base("model1", {
                init: function(eventProxy) {
                    this.eventProxy = eventProxy;
                    this.eventProxy.on($$.sysconfig.events.moduleIsReady, function() {$$.logger.info("module1 is ready!");});
                    return this;
                },
                foo: function() {
                    return 133;
                },
                end: 0
            });
            $$.model1.defaults = {
                scope: 'singleton',
                end: 0
            };
        });
        perfmjs.ready(function($$, app) {
            app.register("model1", $$.model1);
            app.start('model1');
            expect($$.model1.instance.foo()).toEqual(133);
        });
    });
    it("应能测试通过AOP功能", function () {
        perfmjs.plugin('aoptest', function($$) {
            $$.base("aoptest", {
                init: function(arg) {
                    return this;
                },
                test: function() {
                    console.log("called test function in aoptest!")
                    return 12;
                },
                end: 0
            });
            $$.aoptest.defaults = {
                scope: 'singleton',
                end: 0
            };
        });
        perfmjs.ready(function($$, app) {
            app.register("aoptest", $$.aoptest);
            app.start('aoptest');
            $$.aoptest.instance.test = $$.utils.aop(null, $$.aoptest.instance.test, function(){return 1000;}, function(){});
            expect($$.aoptest.newInstance().test()).toEqual(1000);
        });
    });
});