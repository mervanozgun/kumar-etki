const CACHE_NAME = 'kumar-tuzagi-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Ses dosyalarını önbelleğe al (URL'ler eklenmeli)
];

// Ses dosyalarını önbelleğe almak için
const audioUrls = [
  'https://assets.mixkit.co/sfx/preview/mixkit-slot-machine-spin-1086.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-slot-machine-lose-1087.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-playing-card-game-slide-1069.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-winning-coin-1996.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-casino-bling-achievement-667.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-small-crowd-cheer-and-applause-501.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-referee-whistle-481.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-crowd-cheering-up-at-stadium-479.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-crowd-disappointed-sigh-476.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-thunder-rumble-1230.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-magical-coin-win-1936.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-football-kick-3117.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-sports-crowd-cheer-475.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-crowd-groan-479.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-warning-alarm-buzzer-991.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-sad-game-over-trombone-471.mp3'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache açıldı');
        // Temel dosyaları önbelleğe al
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        // Ses dosyalarını arka planda önbelleğe al
        return caches.open(CACHE_NAME).then(function(cache) {
          const audioPromises = audioUrls.map(function(audioUrl) {
            return fetch(audioUrl, { mode: 'no-cors' })
              .then(function(response) {
                return cache.put(audioUrl, response);
              })
              .catch(function(error) {
                console.log('Ses önbelleğe alınamadı:', audioUrl, error);
              });
          });
          return Promise.all(audioPromises);
        });
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Ses dosyaları için özel işleme
  if (event.request.url.includes('mixkit.co')) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Önbellekte varsa önbellekten döndür
          if (response) {
            return response;
          }
          // Yoksa internetten getir ve önbelleğe al
          return fetch(event.request)
            .then(function(networkResponse) {
              if (!networkResponse || networkResponse.status !== 200) {
                return networkResponse;
              }
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
              return networkResponse;
            })
            .catch(function() {
              // İnternet yoksa boş response döndür
              return new Response('', { status: 408, statusText: 'Offline' });
            });
        })
    );
  } else {
    // Diğer dosyalar için normal işlem
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  }
});