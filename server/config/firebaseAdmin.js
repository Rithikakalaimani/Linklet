const admin = require("firebase-admin");

const projectId = process.env.FIREBASE_PROJECT_ID || "linklet-c4db1";
let firebaseAdmin = null;

function initializeFirebaseAdmin() {
  if (firebaseAdmin) return firebaseAdmin;

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    let credential;

    if (serviceAccountJson) {
      try {
        const serviceAccount = typeof serviceAccountJson === "string"
          ? JSON.parse(serviceAccountJson)
          : serviceAccountJson;
        credential = admin.credential.cert(serviceAccount);
      } catch (parseErr) {
        console.warn("Firebase: Invalid FIREBASE_SERVICE_ACCOUNT_JSON", parseErr.message);
        return null;
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      credential = admin.credential.applicationDefault();
    } else {
      console.warn(
        "Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS to enable auth."
      );
      return null;
    }

    firebaseAdmin = admin.initializeApp({
      credential,
      projectId,
    });
    return firebaseAdmin;
  } catch (err) {
    console.warn("Firebase Admin init failed:", err.message);
    return null;
  }
}

const getAuth = () => {
  const app = initializeFirebaseAdmin();
  return app ? app.auth() : null;
};

module.exports = {
  getAuth,
  initializeFirebaseAdmin,
};
