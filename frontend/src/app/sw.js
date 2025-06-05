const CACHE_NAME = "taskflow-cache-v1"
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/task.png",
  "/categories",
  "/dashboard",
]

// Install event - cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()), // Force activation
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()), // Take control of clients
  )
})

// Fetch event - network first with cache fallback strategy
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // For API requests, use network only
  if (event.request.url.includes("/api/")) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If the response is valid, clone it and store it in the cache
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request)
      }),
  )
})

// Handle push notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body || "New notification from TaskFlow",
      icon: data.icon || "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "1",
        url: data.url || "/",
      },
      actions: [
        {
          action: "view",
          title: "View",
          icon: "/icons/icon-192x192.png",
        },
      ],
    }
    event.waitUntil(self.registration.showNotification("TaskFlow", options))
  }
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view" && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  } else {
    event.waitUntil(clients.openWindow("/"))
  }
})
