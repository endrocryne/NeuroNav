
const CACHE_NAME = 'neuronav-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,300;8..144,400;8..144,500;8..144,700&display=swap',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// --- Reminder Logic ---
const scheduledReminders = {};

self.addEventListener('message', event => {
  if (!event.data) return;

  const { type, task, taskId } = event.data;

  if (type === 'SCHEDULE_REMINDER') {
    // Cancel any existing reminder for this task to avoid duplicates
    if (scheduledReminders[task.id]) {
      clearTimeout(scheduledReminders[task.id]);
    }

    if (task.dueDate && !task.completed) {
      const dueTime = new Date(task.dueDate).getTime();
      // Remind 15 minutes before due time
      const reminderTime = dueTime - 15 * 60 * 1000;
      const now = Date.now();
      
      if (reminderTime > now) {
        const delay = reminderTime - now;
        const timeoutId = setTimeout(() => {
          self.registration.showNotification('NeuroNav Task Reminder', {
            body: `Your task "${task.title}" is due soon!`,
            icon: '/icon-192.png', // Using an icon from the app
            tag: task.id // Tag ensures that if a reminder is rescheduled, the old one is replaced
          });
          delete scheduledReminders[task.id];
        }, delay);
        scheduledReminders[task.id] = timeoutId;
      }
    }
  } else if (type === 'CANCEL_REMINDER') {
    if (scheduledReminders[taskId]) {
      clearTimeout(scheduledReminders[taskId]);
      delete scheduledReminders[taskId];
    }
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        // Check if there's a focused client
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
