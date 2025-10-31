// MaidConnect Service Worker for Push Notifications and Offline Support

const CACHE_VERSION = "v1";
const STATIC_CACHE = `maidconnect-static-${CACHE_VERSION}`;
const OFFLINE_CACHE = `maidconnect-offline-${CACHE_VERSION}`;
const OFFLINE_PAGE = "/offline.html";
const ASSET_EXTENSIONS_REGEX = /\.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|webp|ico)$/;

// Install event - precache offline page for marketing/public pages only
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => {
      console.log("[Service Worker] Precaching offline page");
      return cache.add(OFFLINE_PAGE).catch((err) => {
        console.warn("[Service Worker] Offline page not found, skipping precache:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  const currentCaches = [STATIC_CACHE, OFFLINE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            console.log("[Service Worker] Deleting old cache:", name);
            return caches.delete(name);
          })
      )
    )
  );
  return self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received:", event);

  let data = { title: "MaidConnect", body: "New notification", icon: "/icon-192x192.png" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error("[Service Worker] Failed to parse push data:", e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192x192.png",
    badge: "/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || 1,
      url: data.url || "/",
    },
    actions: data.actions || [],
    tag: data.tag || "default",
    requireInteraction: data.requireInteraction,
  };

  event.waitUntil(self.registration.showNotification(data.title || "MaidConnect", options));
});

// Notification click event - handle user clicking notification
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard/customer";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Helper: Check if request should be cached
function shouldCache(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Only cache GET requests
  if (request.method !== "GET") {
    return false;
  }

  // Never cache API routes (could contain sensitive data)
  if (pathname.startsWith("/api/")) {
    return false;
  }

  // Never cache authenticated pages (dashboard, admin)
  if (pathname.startsWith("/dashboard/") || pathname.startsWith("/admin/")) {
    return false;
  }

  // Never cache auth pages (could leak session data)
  if (pathname.startsWith("/auth/")) {
    return false;
  }

  // Cache static assets only
  return (
    pathname.startsWith("/_next/static/") || // Next.js static assets
    pathname.startsWith("/images/") || // Public images
    pathname.match(ASSET_EXTENSIONS_REGEX) // Asset extensions
  );
}

// Helper: Check if we should serve offline page
function shouldServeOffline(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Only serve offline page for public marketing pages
  return (
    request.method === "GET" &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/dashboard/") &&
    !pathname.startsWith("/admin/") &&
    !pathname.startsWith("/auth/") &&
    !pathname.startsWith("/_next/") &&
    request.headers.get("accept")?.includes("text/html")
  );
}

// Fetch event - stale-while-revalidate for static assets only
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Strategy: Stale-while-revalidate for cacheable static assets
  if (shouldCache(request)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Fetch from network and update cache in background
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });

          // Return cached version immediately (stale-while-revalidate)
          // or wait for network if no cache
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // For non-cacheable requests: network-only with offline fallback
  // (but only serve offline page for public marketing pages)
  if (shouldServeOffline(request)) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_PAGE).then(
          (offlineResponse) =>
            offlineResponse ||
            new Response("Offline - Please check your internet connection", {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({ "Content-Type": "text/plain" }),
            })
        )
      )
    );
    return;
  }

  // For everything else (API, dashboard, auth): network-only, no offline fallback
  // Let the browser handle the error naturally
});
