const staticCacheName = 's-v1';
const dynamicCacheName = 'd-v1';


const assetUrls = [
  '/',
  '/index.html',
  '/pages/offline.html',
  '/pages/auth/join-family.html',
  '/pages/auth/pin-login.html',
  '/pages/auth/registration-success.html',
  '/pages/auth/set-password.html',
  '/pages/auth/set-pin.html',
  '/pages/auth/sign-in.html',
  '/pages/auth/sign-up.html',
  '/pages/dashboard/dashboard.html',
  '/pages/events/calendar.html',
  '/pages/events/create-event.html',
  '/pages/events/delete-event.html',
  '/pages/events/edit-event.html',
  '/pages/events/event-details.html',
  '/pages/family/create-family.html',
  '/pages/family/family.html',
  '/pages/family/family-settings.html',
  '/pages/settings/settings.html',
  '/pages/tasks/create-task.html',
  '/pages/tasks/delete-task.html',
  '/pages/tasks/edit-task.html',
  '/pages/tasks/task-info.html',
  '/pages/tasks/tasks.html',

  '/js/auth/auth.js',
  '/js/auth/join-family.js',
  '/js/auth/login.js',
  '/js/auth/pin-login.js',
  '/js/auth/set-password.js',
  '/js/auth/set-pin.js',
  '/js/dashboard/dashboard.js',
  '/js/events/calendar.js',
  '/js/events/create-event.js',
  '/js/events/delete-event.js',
  '/js/events/edit-event.js',
  '/js/events/event-details.js',
  '/js/family/create-family.js',
  '/js/family/family.js',
  '/js/family/family-settings.js',
  '/js/personalization/theme.js',
  '/js/settings/settings.js',
  '/js/tasks/create-task.js',
  '/js/tasks/delete-task.js',
  '/js/tasks/edit-task.js',
  '/js/tasks/task-info.js',
  '/js/tasks/tasks.js',
  '/js/utils/api.js',
  '/js/utils/cryptoUtils.js',
  '/js/main.js',

  '/css/index.css',
  '/css/main.css',
  '/css/auth/code-question.css',
  '/css/auth/join-family.css',
  '/css/auth/login.css',
  '/css/auth/registration.css',
  '/css/auth/registration-success.css',
  '/css/auth/set-code.css',
  '/css/auth/set-password.css',
  '/css/dashboard/dashboard.css',
  '/css/events/calendar.css',
  '/css/events/create-event.css',
  '/css/events/delete-event.css',
  '/css/events/edit-event.css',
  '/css/events/event-details.css',
  '/css/family/create-family.css',
  '/css/family/family.css',
  '/css/family/family-settings.css',
  '/css/settings/settings.css',
  '/css/tasks/create-task.css',
  '/css/tasks/delete-task.css',
  '/css/tasks/edit-task.css',
  '/css/tasks/task-info.css',
  '/css/tasks/tasks.css'



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


// self.addEventListener('fetch', event => {
//   const { request } = event;
//   const url = new URL(request.url);
//
//   if (url.origin === location.origin) {
//     event.respondWith(cacheFirst(request));
//   } else {
//     event.respondWith(networkFirst(request));
//   }
// });

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') {
    return; // Пропускаем все не-GET запросы
  }

  if (request.url.startsWith(location.origin)) {
    event.respondWith(cacheFirst(request));
  } else if (request.url.startsWith('http://127.0.0.1:8000')) {
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
    return cached ?? await caches.match('/offline.html');
  }
}
