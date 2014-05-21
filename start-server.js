require("./lib/pusher/server/pushserver");
perfmjs.app.newInstance();
perfmjs.app.instance.register("pushserver", perfmjs.pushserver);
perfmjs.app.instance.startAll();

perfmjs.pushserver.instance.startServer();