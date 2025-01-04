const staticCacheName = 's-v1';
const dynamicCacheName = 'd-v1';


const assetUrls = [
  '/Fambly/',
  '/Fambly/index.html',
  '/Fambly/pages/offline.html',
  '/Fambly/pages/auth/join-family.html',
  '/Fambly/pages/auth/pin-login.html',
  '/Fambly/pages/auth/registration-success.html',
  '/Fambly/pages/auth/set-password.html',
  '/Fambly/pages/auth/set-pin.html',
  '/Fambly/pages/auth/sign-in.html',
  '/Fambly/pages/auth/sign-up.html',
  '/Fambly/pages/dashboard/dashboard.html',
  '/Fambly/pages/events/calendar.html',
  '/Fambly/pages/events/create-event.html',
  '/Fambly/pages/events/delete-event.html',
  '/Fambly/pages/events/edit-event.html',
  '/Fambly/pages/events/event-details.html',
  '/Fambly/pages/family/create-family.html',
  '/Fambly/pages/family/family.html',
  '/Fambly/pages/family/family-settings.html',
  '/Fambly/pages/settings/settings.html',
  '/Fambly/pages/tasks/create-task.html',
  '/Fambly/pages/tasks/delete-task.html',
  '/Fambly/pages/tasks/edit-task.html',
  '/Fambly/pages/tasks/task-info.html',
  '/Fambly/pages/tasks/tasks.html',

  '/Fambly/js/auth/auth.js',
  '/Fambly/js/auth/join-family.js',
  '/Fambly/js/auth/login.js',
  '/Fambly/js/auth/pin-login.js',
  '/Fambly/js/auth/set-password.js',
  '/Fambly/js/auth/set-pin.js',
  '/Fambly/js/dashboard/dashboard.js',
  '/Fambly/js/events/calendar.js',
  '/Fambly/js/events/create-event.js',
  '/Fambly/js/events/delete-event.js',
  '/Fambly/js/events/edit-event.js',
  '/Fambly/js/events/event-details.js',
  '/Fambly/js/family/create-family.js',
  '/Fambly/js/family/family.js',
  '/Fambly/js/family/family-settings.js',
  '/Fambly/js/personalization/theme.js',
  '/Fambly/js/settings/settings.js',
  '/Fambly/js/tasks/create-task.js',
  '/Fambly/js/tasks/delete-task.js',
  '/Fambly/js/tasks/edit-task.js',
  '/Fambly/js/tasks/task-info.js',
  '/Fambly/js/tasks/tasks.js',
  '/Fambly/js/utils/api.js',
  '/Fambly/js/utils/cryptoUtils.js',
  '/Fambly/js/main.js',

  '/Fambly/css/index.css',
  '/Fambly/css/main.css',
  '/Fambly/css/auth/code-question.css',
  '/Fambly/css/auth/join-family.css',
  '/Fambly/css/auth/login.css',
  '/Fambly/css/auth/registration.css',
  '/Fambly/css/auth/registration-success.css',
  '/Fambly/css/auth/set-code.css',
  '/Fambly/css/auth/set-password.css',
  '/Fambly/css/dashboard/dashboard.css',
  '/Fambly/css/events/calendar.css',
  '/Fambly/css/events/create-event.css',
  '/Fambly/css/events/delete-event.css',
  '/Fambly/css/events/edit-event.css',
  '/Fambly/css/events/event-details.css',
  '/Fambly/css/family/create-family.css',
  '/Fambly/css/family/family.css',
  '/Fambly/css/family/family-settings.css',
  '/Fambly/css/settings/settings.css',
  '/Fambly/css/tasks/create-task.css',
  '/Fambly/css/tasks/delete-task.css',
  '/Fambly/css/tasks/edit-task.css',
  '/Fambly/css/tasks/task-info.css',
  '/Fambly/css/tasks/tasks.css'



];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => cache.addAll(assetUrls))
  );
});

self.addEventListener('activate', async event => {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter(name => name !== staticCacheName)
      .filter(name => name !== dynamicCacheName)
      .map(name => caches.delete(name))
  )
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') {
    return; // Пропускаем все не-GET запросы
  }

  if (request.url.startsWith(location.origin)) {
    event.respondWith(cacheFirst(request));
  } else if (request.url.startsWith('https://alexey-galka.github.io/Fambly/')) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});


async function cacheFirst(request){
  const cache = await caches.match(request);
  return cache ?? await fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(dynamicCacheName);
  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    return response

  } catch (e) {
    const cached = await cache.match(request);
    return cached ?? await caches.match('/Fambly/offline.html');
  }
}
