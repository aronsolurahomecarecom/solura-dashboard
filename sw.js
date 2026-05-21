var CACHE = 'solura-v1';
var ASSETS = [
  'Solura_Dashboard.html',
  'manifest.json',
  'logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Network-first for OneDrive/Graph API calls, cache-first for static assets
self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // Always fetch live for auth + API calls
  if(url.indexOf('microsoftonline.com')>-1 || url.indexOf('graph.microsoft.com')>-1 || url.indexOf('leadconnectorhq.com')>-1){
    e.respondWith(fetch(e.request));
    return;
  }
  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(resp){
        return caches.open(CACHE).then(function(c){
          c.put(e.request, resp.clone());
          return resp;
        });
      });
    })
  );
});
