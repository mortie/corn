var fs = require("fs");
var http = require("http");

var conf = JSON.parse(fs.readFileSync("conf.json"));

console.log("Starting HTTP server on port "+conf.port+".");

http.createServer(function(req, res)
{
	console.log("New request from "+req.connection.remoteAddress);
	res.end("no");
}).listen(conf.port);
