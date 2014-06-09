perfmjs-node
=======
perfmjs(high performance javascript framework) for Node.js  V1.0.6

Features:
=======
fast by default：高效，易用，易读

原生态支持面向对象(OO)功能

更高效的插件开发机制

支持事件代理,　AOP,　状态机,　日志等功能

支持Real-time App(服务器推/WebSocket/Polling-xhr/Polling-jsonp)功能

可测试性，通过了jasmine库的测试

启动项目命令列表
=======
1.安装javascript编辑器WebStorm(目前用8.0), 安装node.js环境

2.安装热部署插件supervisor(反安装npm uninstall)  >npm install supervisord -g

3.安装单元测试插件jasmine-node >npm install jasmine-node -g

4.在项目路径下执行命令安装项目依赖的插件 >npm install

5.在项目路径下启动程序: >node startServer.js

也可使用热部署插件启动　>C:/Users/Administrator/AppData/Roaming/npm/supervisor.cmd startServer.js

6.在项目路径下测试：>jasmine-node test/

7.压力测试使用websocket-bench

可选依赖包
=======
"dependencies": {
"socket.io": "1.0.4",
"jasmine-node": "1.14.3",
"websocket-bench": "0.0.6"
}

>npm install socket.io@1.0.4

>npm install jasmine-node@1.14.3 -g

>npm install websocket-bench@0.0.6 -g

发布
=======
先修改README.md和package.json的版本号，如从1.0.5升到1.0.6,然后在项目路径下运行如下命令

>npm unpublish perfmjs-node@1.0.5 (这一步不是必需的)

>npm publish --tag 1.0.6

How to use
=======
>npm install perfmjs-node

startServer.js
```js
//应用入口函数
var perfmjs = require("perfmjs-node");
perfmjs.ready(function($$, app) {
    //app.register("jsbfPusher", jsbfPusher);
    //app.startAll();
    $$.logger.info('Hello perfmjs-node!');
});
```