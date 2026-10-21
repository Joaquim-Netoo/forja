// Cache offline. Troque VERSION a cada publicação para atualizar os arquivos.
const VERSION = 'forja-v2.1';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/tokens.css', 'css/app.css',
  'js/app.js', 'js/state.js', 'js/dates.js', 'js/streak.js', 'js/progress.js', 'js/medals.js', 'js/game.js',
  'js/curriculum.js', 'js/markup.js',
  'js/views/today.js', 'js/views/course.js', 'js/views/lesson.js', 'js/views/exam.js', 'js/views/medals.js', 'js/views/settings.js',
  'js/ui/html.js', 'js/ui/motion.js', 'js/ui/patch.js', 'js/ui/toast.js', 'js/ui/tools.js', 'js/ui/celebrate.js', 'js/ui/guitar3d.js',
  'js/ui/paints.js', 'js/ui/stage.js', 'js/ui/audio.js',
  'vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/SplitText.min.js', 'vendor/Flip.min.js',
  'vendor/three.module.min.js', 'vendor/RoomEnvironment.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Arquivos do app: cache primeiro. Fontes do Google: guarda na primeira visita.
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  e.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((res) => {
    const url = new URL(request.url);
    if (res.ok && (url.origin === location.origin || url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com'))) {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(request, copy));
    }
    return res;
  })));
});
