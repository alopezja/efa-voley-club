// Service worker de EFA Voley Club: notificaciones web push + instalable.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "EFA Voley Club", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "EFA Voley Club";
  const options = {
    body: data.body || "",
    icon: "/brand/efa-logo.jpg",
    badge: "/brand/efa-logo.jpg",
    data: { url: data.url || "/jugador" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/jugador";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes(url) && "focus" in w) return w.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
