var http = require('http'),
    router = require('./router'),
    url = require('url')

var server = http.createServer(function (req, res) {
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'})
    res.end()
    return
  }
  var path = url.parse(req.url).pathname
  var currentRoute = router.match(path)
  if (currentRoute !== undefined){
    currentRoute.fn(req, res, currentRoute)
  } else {
    res.setHeader('Content-Type', 'text/html')
    res.end('<h1>404</h1>')
  }
})

server.listen(8080, function (err) {
  if (err) console.log('Doah', err)
  console.log('Woot. A server is running on port 8080')
})
