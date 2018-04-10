importScripts('/src/js/idb.js'); //Importing the idb promised library
importScripts('/src/js/indexedDB.js'); //Importing my helper functions for indexedDB

const CACHE_STATIC_NAME = 'static-v12';
const CACHE_DYNAMIC_NAME = 'dynamic-v2';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.json',
  '/src/css/app.css',
  '/src/css/materialize.css',
  '/src/js/idb.js',
  '/src/fonts/roboto/Roboto-Bold.woff',
  '/src/fonts/roboto/Roboto-Bold.woff2',
  '/src/fonts/roboto/Roboto-Light.woff',
  '/src/fonts/roboto/Roboto-Light.woff2',
  '/src/fonts/roboto/Roboto-Medium.woff',
  '/src/fonts/roboto/Roboto-Medium.woff2',
  '/src/fonts/roboto/Roboto-Regular.woff',
  '/src/fonts/roboto/Roboto-Regular.woff2',
  '/src/fonts/roboto/Roboto-Thin.woff',
  '/src/fonts/roboto/Roboto-Thin.woff2',
  'https://fonts.googleapis.com/css?family=Raleway:400,700'
];

self.addEventListener('install', function (event) {
  console.log('Installing service worker');
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        cache.addAll(STATIC_FILES);
      })
  )
});

self.addEventListener('activate', function (event) {
  console.log('Activating service worker');
  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('Removing old caches', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length);
  } else {
    cachePath = string;
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', function (event) {
  var url = 'https://newsapi.org/v2/top-headlines?sources=abc-news&apiKey=0a7b41c5aaa14955b1420a15968d0779';
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(fetch(event.request)
      .then(function (res) {
        var clonedRes = res.clone();
          clearAllData('news')
            .then(function(){
              return clonedRes.json();
            })
            .then(function(data) {
              writeData('news', data);
            });
        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request)
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function (res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function (cache) {
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(function (err) {
                console.log('error detected');
                return caches.open(CACHE_STATIC_NAME)
                  .then(function (cache) {
                    return caches.match('./offline.json')
                  });
              });
          }
        })
    );
  }
});