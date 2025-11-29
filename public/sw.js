const CACHE_NAME = "runasty-v1"

// Arquivos para cache inicial (app shell)
const STATIC_ASSETS = [
  "/",
  "/login",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// Instalar Service Worker e cachear assets estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  // Ativar imediatamente
  self.skipWaiting()
})

// Ativar e limpar caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  // Controlar todas as páginas imediatamente
  self.clients.claim()
})

// Estratégia: Network First com fallback para cache
self.addEventListener("fetch", (event) => {
  const { request } = event

  // Ignorar requests que não são GET
  if (request.method !== "GET") return

  // Ignorar requests para APIs externas
  const url = new URL(request.url)
  if (url.origin !== location.origin) return

  // Ignorar requests de API (sempre buscar da rede)
  if (url.pathname.startsWith("/api/")) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Se a resposta for válida, cachear uma cópia
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Se offline, tentar buscar do cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Se não tiver no cache e for navegação, mostrar página offline
          if (request.mode === "navigate") {
            return caches.match("/")
          }
          return new Response("Offline", { status: 503 })
        })
      })
  )
})
