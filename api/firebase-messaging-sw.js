// Import Firebase to enable messaging in the Service Worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging-compat.js"
);

require("dotenv").config({ path: "config.env" });

const firbaseAPI = ".env";
const firebaseMSID = ".env";
const firebaseAID = ".env";
const firebaseVAP = ".env";

const firebase_config = {
  config: {
    apiKey: firbaseAPI,
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: firebaseMSID,
    appId: firebaseAID,
  },
  vapidKey: firebaseVAP,
};

// firebase.initializeApp(firebase_config?.config);

// // Initialize messaging
// const messaging = firebase.messaging();

// // Handle background notifications
// messaging.onBackgroundMessage((payload) => {
//   // console.log("[Service Worker] Received background message:", payload);

//   const notificationTitle = payload.notification.title || "Notification";
//   const notificationOptions = {
//     body: payload.notification.body || "You have a new message",
//     icon: payload.notification.icon || "/images/wL-img.png",
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });
