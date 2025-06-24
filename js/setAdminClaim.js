const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const targetEmail = "amansingh376@gmail.com"; // Replace with your real email

async function setAdminRole() {
  try {
    const user = await admin.auth().getUserByEmail(targetEmail);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Custom claim 'admin: true' set for ${targetEmail}`);
  } catch (error) {
    console.error("❌ Error setting admin claim:", error);
  }
}

setAdminRole();
