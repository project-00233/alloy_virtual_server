const admin = require("firebase-admin");

const firbasePKID = ".env";
const firebasePK = ".env";
const firebaseCID = ".env";
const firebaseVAP = ".env";

const firebaseConfig = {
  config: {
    type: "",
    project_id: "",
    private_key_id: firbasePKID,
    private_key: firebasePK,
    client_email: "",
    client_id: firebaseCID,
    auth_uri: "",
    token_uri: "",
    auth_provider_x509_cert_url: "",
    client_x509_cert_url: "",
    universe_domain: "",
  },
  vapidKey: firebaseVAP,
};

// const serviceAccount = firebaseConfig.config;

// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
// const messaging = admin.messaging();

// module.exports = messaging;
