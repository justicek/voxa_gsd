var qs = require('querystring');
var http = require('http');

var MAX_SIZE = 1000;
var cache = [];

var server = http.createServer(function(req, res) {
	if (req.method === 'GET')
		res.end(JSON.stringify(cache));

	else if (req.method === 'POST') {
		var body = '';

		req.on('data', function(data) {
			body += data;

			if (body.length > 1000000)
				req.connection.destroy();
		});

		req.on('end', function() {
			if (store(qs.parse(body)))
				res.end('message stored');
			else
				res.end('error: message not stored');
		});
	}

	else if (req.method === 'DELETE') {
		cache = [];
		res.end('messages deleted');
	}

	else
		res.end('Invalid HTTP request (' + req.method + ') - GET/POST/DELETE only');
});
server.listen(8080);


function store(msg) {
	// todo: shifting
	if (cache.length > MAX_SIZE)
		return false;

	cache.unshift(msg);
	return true;
}

