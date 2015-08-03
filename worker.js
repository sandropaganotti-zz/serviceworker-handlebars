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
      caches.match('list.hbs').then(tpl => tpl.text()),
      fetch(youtube + evt.request.url.split('/').pop()).then(res => res.json())
    ]).then(([tpl,json]) => {
      return new Response(
        (Handlebars.compile(tpl))(json), 
        {headers: {"Content-Type": "text/html"}});
    }));
  }
};