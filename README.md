perfmjs-node
=======
perfmjs(high performance javascript framework) for Node.js  V1.3.4

Features:
=======
fast by default：高效，易用，易读

实现了异步编程模块(Promises/A+)规范

原生态支持面向对象(object-oriented)功能

更高效的插件开发机制

支持高效的数组操作，事件代理，AOP, 状态机, 日志等功能

可测试性，通过了jasmine库的测试

浏览器端的perfmjs框架请移步：https://github.com/perfmjs/perfmjs

基于perfmjs-node的服务器推送实时系统框架请移步：https://github.com/perfmjs/perfmjs-push

启动项目命令列表
=======
1.安装javascript编辑器WebStorm(目前用8.0), 安装node.js环境

2.安装热部署插件supervisor(反安装npm uninstall)  >npm install supervisord -g

3.安装单元测试插件jasmine-node >npm install jasmine-node -g

4.在项目路径下执行命令安装项目依赖的插件 >npm install

5.在项目路径下启动程序 >node start.js

也可使用热部署插件启动 >C:/Users/Administrator/AppData/Roaming/npm/supervisor.cmd start.js

6.在项目路径下测试：>mocha(或jasmine-node test/)

7.压力测试使用websocket-bench

可选依赖包
=======
"dependencies": {
"jasmine-node": "1.14.3",
"websocket-bench": "0.0.6"
}

>npm install jasmine-node@1.14.3 -g

发布
=======
先修改README.md和package.json的版本号，如从1.1.5升到1.1.6,然后在项目路径下运行如下命令

>npm unpublish perfmjs-node --force (这一步不是必需的)

>npm publish

How to use
=======
>npm install perfmjs-node

start-server.js
```js
/**
 * 应用入口函数
 */
require("perfmjs-node");
perfmjs.ready(function($$, app) {
    //app.registerAndStart($$.jsbfPusher);
    $$.logger.info('Hello perfmjs-node!');
});
```


License
-------

Copyright 2011 Tony

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.