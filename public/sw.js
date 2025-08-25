const VERSION = "v2";
const APP_SHELL_CACHE = `uno-app-shell-${VERSION}`;
const ASSETS_CACHE = `uno-assets-${VERSION}`;

const APP_SHELL_URLS = ["/", "/index.html", "/manifest.json"];
const OPTIONAL_URLS = ["/favicon.svg", "/favicon.ico"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => {
        const essentialPromises = APP_SHELL_URLS.map((url) =>
          cache.add(url).catch((error) => {
            console.warn(`Failed to cache essential file ${url}:`, error);
            return null;
          })
        );

        const optionalPromises = OPTIONAL_URLS.map((url) =>
          cache.add(url).catch((error) => {
            console.log(`Optional file ${url} not available for caching`);
            return null;
          })
        );

        return Promise.allSettled([...essentialPromises, ...optionalPromises]);
      })
      .catch((error) => {
        console.error("Service Worker install failed:", error);
        return Promise.resolve();
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        try {
          await self.registration.navigationPreload.enable();
        } catch (error) {
          console.warn("Navigation preload failed:", error);
        }
      }

      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== APP_SHELL_CACHE && cacheName !== ASSETS_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );

      await self.clients.claim();
    })()
  );
});

function isSameOrigin(url) {
  try {
    const u = new URL(url, self.location.origin);
    return u.origin === self.location.origin;
  } catch {
    return false;
  }
}

async function handleAssetRequest(request) {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response?.ok) {
      cache.put(request, response.clone());
      return response;
    }
    if (response?.status >= 500 || response?.status === 0) {
      return cached || response;
    }
    return response;
  } catch {
    return cached || Response.error();
  }
}

async function handleNavigationRequest(event) {
  try {
    const preload = await event.preloadResponse;
    if (preload?.ok) return preload;

    const response = await fetch(event.request);
    if (response?.ok) return response;

    if (response?.status >= 500 || response?.status === 0) {
      const shell = await caches.open(APP_SHELL_CACHE);
      const cachedIndex = await shell.match("/index.html");
      return cachedIndex || response;
    }

    return response;
  } catch {
    const shell = await caches.open(APP_SHELL_CACHE);
    const cachedIndex = await shell.match("/index.html");
    return cachedIndex || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(event));
    return;
  }

  if (
    isSameOrigin(request.url) &&
    (url.pathname.startsWith("/assets/") ||
      request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "image" ||
      /\.(?:js|css|svg|png|jpg|jpeg|gif|webp|ico|json)$/i.test(url.pathname))
  ) {
    event.respondWith(handleAssetRequest(request));
  }
});
