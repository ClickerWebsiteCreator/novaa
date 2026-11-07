// Service Worker: speichert die App-Dateien, damit Nova auch offline startet.
// Bei jeder neuen Version VERSION erhöhen – dann lädt das iPhone die Dateien neu.
const VERSION = 'nova-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './app.css', './db.js', './app.js', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Eigene Dateien: erst Netz (aktuell), sonst Cache (offline). Fremde Anfragen (z. B. Suchvorschläge) gehen direkt ins Netz.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
