/* eslint-env node */
const {
  onRequest,
  onCall,
  HttpsError,
} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { platformApi } = require("./api/platformApi");

admin.initializeApp();

const db = admin.firestore();

function assertAdmin(request) {
  const claims = request.auth?.token;

  if (!claims || claims.admin !== true || claims.role !== "admin") {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
}

async function countAdmins() {
  const result = await admin.auth().listUsers(1000);

  return result.users.filter(
    (user) =>
      user.customClaims?.admin === true && user.customClaims?.role === "admin",
  ).length;
}

async function writeAdminLog({ actorUid, action, targetUid, details = {} }) {
  await db.collection("adminLogs").add({
    actorUid,
    action,
    targetUid,
    details,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

exports.helloAdmin = onRequest((req, res) => {
  res.status(200).send("Esbiko Admin Functions Running");
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

  const actorUid = request.auth.uid;
  const { uid, role } = request.data;

  const allowedRoles = ["student", "teacher", "admin"];

  if (!uid || !allowedRoles.includes(role)) {
    throw new HttpsError(
      "invalid-argument",
      "Valid uid and role are required.",
    );
  }

  const targetUser = await admin.auth().getUser(uid);
  const targetIsAdmin =
    targetUser.customClaims?.admin === true &&
    targetUser.customClaims?.role === "admin";

  if (targetIsAdmin && role !== "admin") {
    const adminCount = await countAdmins();

    if (adminCount <= 1) {
      throw new HttpsError(
        "failed-precondition",
        "You cannot remove the last admin.",
      );
    }
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
    { merge: true },
  );

  await writeAdminLog({
    actorUid,
    action: "setUserRole",
    targetUid: uid,
    details: { role },
  });

  return { success: true };
});

exports.setUserDisabled = onCall(async (request) => {
  assertAdmin(request);

  const actorUid = request.auth.uid;
  const { uid, disabled } = request.data;

  if (!uid || typeof disabled !== "boolean") {
    throw new HttpsError(
      "invalid-argument",
      "Valid uid and disabled are required.",
    );
  }

  if (actorUid === uid && disabled === true) {
    throw new HttpsError(
      "failed-precondition",
      "You cannot disable your own admin account.",
    );
  }

  const targetUser = await admin.auth().getUser(uid);
  const targetIsAdmin =
    targetUser.customClaims?.admin === true &&
    targetUser.customClaims?.role === "admin";

  if (targetIsAdmin && disabled === true) {
    const adminCount = await countAdmins();

    if (adminCount <= 1) {
      throw new HttpsError(
        "failed-precondition",
        "You cannot disable the last admin.",
      );
    }
  }

  await admin.auth().updateUser(uid, { disabled });

  await writeAdminLog({
    actorUid,
    action: disabled ? "disableUser" : "enableUser",
    targetUid: uid,
    details: { disabled },
  });

  return { success: true };
});
exports.platformApi = platformApi;
