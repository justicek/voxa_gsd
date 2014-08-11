var http = require('http');
var url = require('url');
var init = require('./data_init');			

// local storage
var MAX_SIZE = 5000;
var cache = [];


/*  Locally store a recent message, removing the oldest message if
	there are MAX_SIZE messages already stored. */
function store(msg) {
	if (cache.length > MAX_SIZE)
		cache.pop();

	cache.unshift(msg); 
	console.log('msg stored, length now ' + cache.length);
}


/* Initialize accounts, attach source, listenrs, etc. */
init();

var server = http.createServer(function(req, res) {

	// GET:
	// output JSON-formatted email messages
	//
	// 2 formats: 1) /messages/n - sends last n messages
	//			  2) anything else - sends all messages
	if (req.method === 'GET') {
		console.log('GET');

		pathnameParts = url.parse(req.url).pathname.split('/');
		pathnameParts.shift();	// remove the empty string from split call

		// send the last n messages
		if (pathnameParts.length > 1 && pathnameParts[0] === 'messages') {
			var numMsg = parseInt(pathnameParts[1], 10);
			if (numMsg > 0 && numMsg < cache.length) 
				res.end(JSON.stringify(cache.slice(0, numMsg)))
		}

		// send all messages, up to MAX_SIZE
		res.end(JSON.stringify(cache));
	}

	// POST:
	// process email from context webhook. triggered on email events
	else if (req.method === 'POST') {
		console.log('POST');
		var body = '';

		// reads the data in piecewise
		req.on('data', function(data) {
			body += data;

			if (body.length > 1000000)
				req.connection.destroy();
		});

		req.on('end', function() {
			var output = {};
			var message = JSON.parse(body);

			// strips message of extraneous info and sets success flag
			if (message.message_data) {
				output.email = message.message_data;
				store(output);
			}
			else
				console.log('message store false')
		});
	}

	// DELETE:
	// clear all recent messages
	else if (req.method === 'DELETE') {
		console.log('DELETE');
		cache = [];
		res.end('messages deleted');
	}

	else
		res.end('Invalid HTTP request (' + req.method + ') - GET/POST/DELETE only');
});
server.listen(8080);