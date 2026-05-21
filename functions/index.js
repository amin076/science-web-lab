const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

function assertAdmin(request) {
  const claims = request.auth?.token;

  if (!claims || claims.admin !== true || claims.role !== "admin") {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
}

exports.helloAdmin = onRequest((req, res) => {
  res.status(200).send("Esbiko Admin Functions Running");
});

// TEMPORARY: remove this after admin user management is working.
exports.makeAdmin = onRequest(async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).send("Email is required");
    }

    const user = await admin.auth().getUserByEmail(email);

    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      role: "admin",
    });

    await db.collection("users").doc(user.uid).set(
      {
        role: "admin",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).send(`Admin role assigned to ${email}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

exports.listUsers = onCall(async (request) => {
  assertAdmin(request);

  const result = await admin.auth().listUsers(1000);

  const users = result.users.map((user) => ({
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    disabled: user.disabled,
    createdAt: user.metadata.creationTime || "",
    lastLogin: user.metadata.lastSignInTime || "",
    role: user.customClaims?.role || "student",
    admin: user.customClaims?.admin === true,
  }));

  return { users };
});

exports.setUserRole = onCall(async (request) => {
  assertAdmin(request);

  const { uid, role } = request.data;

  const allowedRoles = ["student", "teacher", "admin"];

  if (!uid || !allowedRoles.includes(role)) {
    throw new HttpsError("invalid-argument", "Valid uid and role are required.");
  }

  await admin.auth().setCustomUserClaims(uid, {
    admin: role === "admin",
    role,
  });

  await db.collection("users").doc(uid).set(
    {
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { success: true };
});

exports.setUserDisabled = onCall(async (request) => {
  assertAdmin(request);

  const { uid, disabled } = request.data;

  if (!uid || typeof disabled !== "boolean") {
    throw new HttpsError("invalid-argument", "Valid uid and disabled are required.");
  }

  await admin.auth().updateUser(uid, { disabled });

  return { success: true };
});