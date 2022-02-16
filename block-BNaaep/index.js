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
            if (!username) return res.end('username required');
            fs.open(contactsDir + username + '.json', "wx", (err,fd) => {
                if (err) return console.log(err);
                fs.writeFile(fd,JSON.stringify(parsedData), (err) => {
                    if (err) return console.log(err);
                    fs.close(fd, (err) => {
                        if (err) return console.log(err);
                        return res.end(`${username} registered`);
                    })
                })
            })
        }
        if(req.method === 'GET' && parsedUrl.pathname === '/users') {
            var username = parsedUrl.query.name;
            if (username) {
                fs.readFile(contactsDir + username + '.json', (err,user) => {
                    if (err) return console.log(err);
                    res.setHeader('Content-Type','application/json');
                    return res.end(user);
                })
            } else {
                fs.readdir(contactsDir, (err,files) => {
                    // console.log(files);
                    if (err) return console.log(err);
                    let filesData = files.map((file) => {
                        return JSON.parse(fs.readFileSync(contactsDir + file));
                    });
                    console.log(filesData);
                    let allContacts = '';
                    filesData.forEach((contact) => {
                    allContacts += `<h1>${contact.name}</h1>
                                <h3>${contact.email}</h3>
                                <h3>${contact.username}</h3>
                                <h3>${contact.age}</h3>
                                <h3>${contact.bio}</h3>`;
                    });
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    return res.end(allContacts);
                });
            } 
        }

        // res.statusCode = 404;
        // res.end("Page not found");
    })
}

server.listen(5000, 'localhost', () => {
    console.log('Server listening on port 5000')
})




// files.forEach((user,i) => {
//     let filesParsed = JSON.parse(user);
//     console.log(filesParsed);

//     if (i === filesLength-1) {
//         fs.readFile(contactsDir + user, (err,content) => {
//             res.end(content);
//         })            
//     } else {
//         fs.readFile(contactsDir + user, (err,content) => {
//             res.write(content);
//         })
//     }
// })