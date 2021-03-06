importScripts('handlebars-v2.0.0.js');
importScripts('bower_components/serviceworkerware/dist/sww.js');
var youtube = "https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyChzANAy9JaN3KdUM3DOVMW0lluJFBSTUg&q=";

var worker = new self.ServiceWorkerWare();

worker.use({
  onInstall: function() {
    return caches.open('tpl-cache').then(function(cache){
      return cache.add('list.hbs');
    })
  },
});

worker.get('/search/:term', function(request, response) {
  return Promise.all([
    caches.match('list.hbs').then(function(tpl){ return tpl.text();  }),
    fetch(youtube + arguments.callee.__params.term).then(function(res){ return res.json(); })
  ]).then(function(res){
    var html = (Handlebars.compile(res[0]))(res[1]);
    return new Response(html, {headers: {"Content-Type": "text/html"} });
  });
});

worker.init();