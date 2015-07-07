var routes = require('routes')()
var fs = require('fs')
var db = require('monk')('localhost/movies')
var movies = db.get('movies')
var qs = require('qs')
var view = require('./view')
var mime = require('mime')

routes.addRoute('/start', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
    if (req.method === 'GET') {
        var template = view.render('home', {} )
        res.end(template)
  }
})

routes.addRoute('/public/*', function (req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('./' + req.url, function (err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
      return
    }
    res.end(file)
  })
})

routes.addRoute('/movies', (req, res, url) => {
  console.log('in /movies')
  res.setHeader('Content-Type', 'text/html')
    if (req.method === 'GET') {
        movies.find({}, function (err, docs) {
          if (err) {
            res.end('shits broke yo')
            return
          }
          var template = view.render('index', {movies: docs} )
          res.end(template)
          return
        })
      }
    res.setHeader('Content-Type', 'text/html')
    if (req.method === 'GET') {
      movies.find({}, function (err, docs) {
        if (err) {
          res.end('shits broke yo')
          return
        }
        var template = view.render('index', { movies: docs} )
        res.end(template)
      })
    }
  if (req.method == 'POST') {
    var data = ''
    req.on('data', function (chunk) {
      data += chunk
    })
    req.on('end', function () {
      var movie = qs.parse(data)
      console.log(movie)
      movies.insert(movie, function (err, doc) {
        if (err) {
          console.log(err)
          res.end('It may have broke vOv')
          return
        }
        res.writeHead(302, {'Location': '/movies'})
        res.end()
      })
    })
  }
})

routes.addRoute('/movies/new', (req, res, url) => {
  console.log('in movies/new')
  res.setHeader('Content-Type', 'text/html')
  var template = view.render('new', {} )
  res.end(template)
})
routes.addRoute('/movies/:id/update', (req, res, url) => {
  console.log('loaded update page')
  if (req.method === 'GET')
  console.log(url.params.id)
  var movie = movies.findOne({_id: url.params.id}, function (err, doc) {
    if (err) {
      res.end('shits broke yo')
      return
    }
    res.setHeader('Content-Type', 'text/html')
    var template = view.render('update', doc )
    res.end(template)
  })
})
routes.addRoute('/movies/:id/delete', (req, res, url) => {
  console.log('invoke delete')

  if (req.method === 'POST') {
    movies.remove({_id: url.params.id}, function (err, doc) {
      if (err) {
        res.end('well, fuck')
        return
      }
      res.writeHead(302, {'Location': '/movies'})
      res.end()
    })
  }
})
routes.addRoute('/movies/:id', (req, res, url) => {
  console.log('in movies/id/edit')
  if (req.method === 'POST'){
      var data = ''
      req.on('data', function (chunk){
          data += chunk
      })
      req.on('end', function () {
        var movie = qs.parse(data)
        movies.update({_id: url.params.id}, movie, function (err, doc){
          if (err){
            res.writeHead(302, {'Location': '/movies'})
            res.end
            return
          }
        res.writeHead(302, {'Location': '/movies'})
        res.end()
      })
    })
  }
  if (req.method === 'GET') {
    movies.findOne({_id: url.params.id}, function (err, doc) {
      if (err) {
        res.end('shits broke yo')
        return
      }
      var template = view.render('show', doc )
      res.end(template)
    })
  }
})

module.exports = routes
