importScripts('handlebars-v2.0.0.js');
importScripts('serviceworker-cache-polyfill.js');
var youtube = "https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyChzANAy9JaN3KdUM3DOVMW0lluJFBSTUg&q=";
var list;

oninstall = function(evt) {
  evt.waitUntil(
    caches.open('tpl-cache').then(function(cache){
      return cache.add('list.hbs');
    })
  );
};

onfetch = function(evt) {
  if(/\/search\/[^\/]+$/.test(evt.request.url)){
    evt.respondWith(Promise.all([
      caches.match('list.hbs').then(function(tpl){ return tpl.text();  }),
      fetch(youtube + evt.request.url.split('/').pop()).then(function(res){ return res.json(); })
    ]).then(function(res){
      var html = (Handlebars.compile(res[0]))(res[1]);
      return new Response(html, {headers: {"Content-Type": "text/html"} });
    }));
  }
};