var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');

var server = http.createServer(handleRequest);

function handleRequest(req,res) {
    var contactsDir = __dirname + '/contacts/';
    var parsedUrl = url.parse(req.url,true);

    var store = '';
    req.on('data', (chunk) => {
        store += chunk;
    })

    req.on('end', () => {
        // console.log(req.url, req.method);
        if(req.method === 'GET' && req.url === '/') {
            res.setHeader('Content-Type','text/html');
            fs.createReadStream('./index.html').pipe(res);
        }
        if(req.method === 'GET' && req.url === '/about') {
            res.setHeader('Content-Type','text/html');
            fs.createReadStream('./about.html').pipe(res);
        }
        if(req.url.split('.').pop() === 'css') {
            res.setHeader('Content-Type','text/css');
            fs.createReadStream('.' + req.url).pipe(res);
        }
        if(req.url.split('.').pop() === 'jpg') {
            res.setHeader('Content-Type','image/jpg');
            fs.createReadStream('.' + req.url).pipe(res);
        }
        if(req.method === 'GET' && req.url === '/contact') {
            res.setHeader('Content-Type','text/html');
            fs.createReadStream('./form.html').pipe(res);
        }
        if(req.method === 'POST' && req.url === '/form') {
            let parsedData = qs.parse(store);
            var username = parsedData.name;
            fs.open(contactsDir + username + '.json', "wx", (err,fd) => {
                if (err) return console.log(err);
                fs.writeFile(fd,JSON.stringify(parsedData), (err) => {
                    if (err) return console.log(err);
                    fs.close(fd, (err) => {
                        if (err) return console.log(err);
                        res.end(`${username} registered`);
                    })
                })
            })
        }
        if(req.method === 'GET' && parsedUrl.pathname === '/users') {
            var username = parsedUrl.query.name;
            fs.readFile(contactsDir + username + '.json', (err,user) => {
                if (err) return console.log(err);
                res.setHeader('Content-Type','application/json');
                res.end(user);
            })
        }
    })
}

server.listen(5000, 'localhost', () => {
    console.log('Server listening on port 5000')
})