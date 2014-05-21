var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs');
app.listen(1337);

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
}

var i = 0;
io.of("/jsbf").on('connection', function (socket) {
    console.info("comming a connection.....");
    socket.on("message", function(data) {
        console.info("on message.........................." + data.id);
    });
    socket.on("heartbeat", function() {
        console.info("heartbeat");
    });
    socket.on("disconnect", function() {
        console.info("disconnect a client.....");
    });
    socket.on("notifyAll", function(data) {
        io.of("/jsbf").emit("message", {"id":data.id});
    });
});

setInterval(function() {
    i += 1;
    io.of("/jsbf").emit("message", {"id":i});
}, 5000);