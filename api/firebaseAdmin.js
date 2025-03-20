const admin = require("firebase-admin");
require("dotenv").config({ path: "config.env" });

const firbasePKID = process.env.FIREBASE_SERVER_PKID;
const firebasePK = process.env.FIREBASE_SERVER_PK;
const firebaseCID = process.env.FIREBASE_CID;
const firebaseVAP = process.env.FIREBASE_VAPID_KEY;

const firebaseConfig = {
  config: {
    type: "service_account",
    project_id: "womaye-4367e",
    private_key_id: firbasePKID,
    private_key: firebasePK,
    client_email:
      "firebase-adminsdk-lz8ec@womaye-4367e.iam.gserviceaccount.com",
    client_id: firebaseCID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-lz8ec%40womaye-4367e.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  },
  vapidKey: firebaseVAP,
};

const serviceAccount = firebaseConfig.config;

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const messaging = admin.messaging();

module.exports = messaging;
