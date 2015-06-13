importScripts('handlebars-v2.0.0.js');
importScripts('serviceworker-cache-polyfill.js');
var youtube = "https://www.googleapis.com/youtube/v3/search?part=snippet&key=<APIKEY>&q=";
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
    evt.respondWith(caches.match(evt.request).then(function(entry) {
      return entry || performSearch(evt.request);
    }));
  } else if(/\.jpg$/.test(evt.request.url)){
    evt.respondWith(getImage(evt.request));
  }
};

storeResponse = function(cacheName, request, response){
  return caches.open(cacheName).then(function(cache){
    return cache.put(request, response.clone()).then(function(){
      return response;
    });
  });
};

performSearch = function(request) {
  return caches.match('list.hbs').then(function(tpl) {
    return tpl.text();
  }).then(function(body){
    return fetch(youtube + request.url.split('/').pop()).then(function(res) {
      return res.json();
    }).then(function(json){
      list = list || Handlebars.compile(body);
      var response = new Response(list(json), { headers: {"Content-Type": "text/html"} });
      return storeResponse('pages-cache', request, response);
    });
  })
};

getImage = function(request) {
  return caches.match(request).then(function(image){
    return image || fetch(request.url, {mode: 'no-cors'}).then(function(res){
      return storeResponse('img-cache', request, res);
    });
  });
};
