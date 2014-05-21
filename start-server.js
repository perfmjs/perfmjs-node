require("./lib/pusher/server/pushserver");
perfmjs.app.newInstance();
perfmjs.app.instance.register("pushserver", perfmjs.pushserver);
perfmjs.app.instance.startAll();

var i = 0;
perfmjs.pushserver.instance.startServer(18000, "/jsbf", function(io_of_room) {
    setInterval(function() {
        i += 1;
        io_of_room.emit("message", {"id":i});
    }, 2000);
});