// Import Firebase to enable messaging in the Service Worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging-compat.js"
);

require("dotenv").config({ path: "config.env" });

const firbaseAPI = process.env.FIREBASE_API_KEY;
const firebaseMSID = process.env.FIREBASE_MSG_SENDER_ID;
const firebaseAID = process.env.FIREBASE_APP_ID;
const firebaseVAP = process.env.FIREBASE_VAPID_KEY;

const firebase_config = {
  config: {
    apiKey: firbaseAPI,
    authDomain: "womaye-4367e.firebaseapp.com",
    projectId: "womaye-4367e",
    storageBucket: "womaye-4367e.firebasestorage.app",
    messagingSenderId: firebaseMSID,
    appId: firebaseAID,
  },
  vapidKey: firebaseVAP,
};

firebase.initializeApp(firebase_config?.config);

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

  self.registration.showNotification(notificationTitle, notificationOptions);
});
