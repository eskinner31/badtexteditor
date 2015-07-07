var routes = require('routes')()
var fs = require('fs')
var db = require('monk')('localhost/notes')
var notes = db.get('notes')
var qs = require('qs')
var view = require('./view')
var mime = require('mime')

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
routes.addRoute('/notes/index', (req, res, url) => { //home index
  console.log("working with mustache")
  console.log('in /notes/index')
  res.setHeader('Content-Type', 'text/html')
    if (req.method === 'GET') {
        notes.find({}, function (err, docs) {
          if (err) {
            res.end('shits broke yo')
            return
          }
          var template = view.render('index', {notes: docs} )
          console.log('working with mustache')
          res.end(template)
          console.log('done')
          return
        })
      }
    res.setHeader('Content-Type', 'text/html')
    if (req.method === 'GET') {
      notes.find({}, function (err, docs) {
        if (err) {
          res.end('shits broke yo')
          return
        }
        var template = view.render('index', docs )
        res.end(template)
      })
    }
})
routes.addRoute('/notes/new', (req, res, url) => {
  console.log('in new')
  res.setHeader('Content-Type', 'text/html')
  var template = view.render('new', {} )
  res.end(template)
})

routes.addRoute('/notes/:id', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if(req.method === "GET"){
    notes.findOne({_id: url.params.id}, function(err,doc){
      if(err){
        res.end("Shits Broke Yo")
        return
      }
      var template = view.render('show', doc)
      res.end(template);
    })
  }
})

routes.addRoute('/notes/:id/delete', (req, res, url) => {
  console.log('invoke delete')

  if (req.method === 'POST') {
    notes.remove({_id: url.params.id}, function (err, doc) {
      if (err) {
        res.end('well, fuck')
        return
      }
        res.writeHead(302, {'Location': '/notes/index'})
      res.end()
    })
  }
})
routes.addRoute('/notes/:id/update', (req, res, url) => {
  console.log('in notes/id/edit')
  if (req.method === 'POST'){
      var data = ''
      req.on('data', function (chunk){
          data += chunk
      })
      req.on('end', function () {
        var note = qs.parse(data)
        notes.update({_id: url.params.id}, note, function (err, doc){
          if (err){
            res.writeHead(302, {'Location': '/notes/index'})
            res.end
            return
          }
        res.writeHead(302, {'Location': '/notes/index'})
        res.end()
      })
    })
  }
})
routes.addRoute('/notes', (req, res, url) => { //posts new note to db
if (req.method == 'POST') {
  var data = ''
  req.on('data', function (chunk) {
    data += chunk
  })
  req.on('end', function () {
    var note = qs.parse(data)
    console.log(note)
    notes.insert(note, function (err, doc) {
      if (err) {
        console.log(err)
        res.end('It may have broke vOv')
        return
      }
      res.writeHead(302, {'Location': '/notes/index'})
      res.end()
    })
  })
}
})

module.exports = routes
