/**
 * 在项目根路径下运行测试的方法： jasmine-node test/
 * 参考：https://www.npmjs.org/package/jasmine-node
 * Created by tony on 2014/5/21.
 */
describe("测试perfmjs-node", function () {
    beforeEach(function() {
        require("../lib/perfmjs/perfmjs");
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
            $$.base("base.xxx", {
                init: function(arg) {
                    return this;
                },
                test: function() {
                  return 12;
                },
                end: 0
            });
            $$.base.xxx.defaults = {
                scope: 'singleton',
                end: 0
            };
        });
        expect(new xxx().test()).toEqual(12);
    });
    it("应能测试通过logger.js", function () {
        expect(perfmjs.logger.level).toEqual(2);
    });
    it("应能测试通过app.js", function () {
        perfmjs.plugin('model1', function($$) {
            $$.base("base.model1", {
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
            $$.base.model1.defaults = {
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
            $$.base("base.aoptest", {
                init: function(arg) {
                    return this;
                },
                test: function() {
                    console.log("called test function in aoptest!")
                    return 12;
                },
                end: 0
            });
            $$.base.aoptest.defaults = {
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