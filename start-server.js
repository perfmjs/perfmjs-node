require("./lib/pusher/server/ServerSidePusher");
perfmjs.app.newInstance();
perfmjs.app.instance.register("pushserver", perfmjs.pushserver);
perfmjs.app.instance.startAll();