var jsbfServerPusher = require("./lib/pusher/server/jsbf/jsbfServerPusher");
perfmjs.app.newInstance().register("jsbfServerPusher", jsbfServerPusher);
perfmjs.app.instance.startAll();