// Install-only service worker: its sole purpose right now is to satisfy
// iOS/Android's requirement of a registered SW for "Add to Home Screen"
// installability. No caching or push handling yet — those come in later
// phases (offline outbox, Web Push).
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
