const CACHE = 'az-v4'; // 캐시 이름을 v4로 변경하여 예전 하얀 화면 기억을 강제로 날립니다.
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))\n  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firebase') || e.request.url.includes('gstatic')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', {status: 503})));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});