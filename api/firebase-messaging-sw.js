// Import Firebase to enable messaging in the Service Worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging-compat.js"
);

fetch("http://localhost:3000/api/firebase-config.json")
  .then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch Firebase configuration");
    }

    return res.json();
  })
  .then((firebaseConfig) => {
    const { config } = firebaseConfig;
    // Initialize Firebase in the service worker
    firebase.initializeApp(config);

    // Initialize messaging
    const messaging = firebase.messaging();

    // Handle background notifications
    messaging.onBackgroundMessage((payload) => {
      // console.log("[Service Worker] Received background message:", payload);

      const notificationTitle = payload.notification.title || "Notification";
      const notificationOptions = {
        body: payload.notification.body || "You have a new message",
        icon: payload.notification.icon || "/images/wL-img.png",
      };

      self.registration.showNotification(
        notificationTitle,
        notificationOptions
      );
    });
  });
