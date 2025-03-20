const admin = require("firebase-admin");
const path = require("path");

// FSA Key
const firebaseConfig = require(path.resolve(
  "./config/firebase-server-config.json"
));

const serviceAccount = firebaseConfig.config;

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const messaging = admin.messaging();

module.exports = messaging;
