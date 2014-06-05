perfmjs-node
=======
perfmjs(high performance javascript framework) for Node.js  V1.0

Features:
=======
fast by default：高效，易用，易读

原生态支持面向对象(OO)功能

更高效的插件开发机制

支持事件代理,AOP,状态机,日志等功能

可测试性，通过了jasmine库的测试

启动项目命令列表
=======
1.安装javascript编辑器WebStorm(目前用8.0), 安装node.js环境

2.安装热部署插件supervisor(反安装npm uninstall)  >npm install supervisord -g

3.安装单元测试插件jasmine-node >npm install jasmine-node -g

4.在项目路径下执行命令安装项目依赖的插件 >npm install

5.在项目路径下启动程序: >node start-server.js

也可使用热部署插件启动　>C:/Users/Administrator/AppData/Roaming/npm/supervisor.cmd start-server.js

6.在项目路径下测试：>jasmine-node test/