const admin = require("firebase-admin");
require("dotenv").config({ path: "config.env" });

const firbasePKID = process.env.FIREBASE_PKID;
const firebasePK = process.env.FIREBASE_PK;
const firebaseCID = process.env.FIREBASE_CID;
const firebaseVAP = process.env.FIREBASE_VAP;

const firebaseConfig = {
  config: {
    type: "service_account",
    project_id: "workflow-8a70f",
    private_key_id: firbasePKID,
    private_key: firebasePK,
    client_email:
      "firebase-adminsdk-fbsvc@workflow-8a70f.iam.gserviceaccount.com",
    client_id: firebaseCID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40workflow-8a70f.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  },
  vapidKey: firebaseVAP,
};

const serviceAccount = firebaseConfig.config;

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const messaging = admin.messaging();

module.exports = messaging;
