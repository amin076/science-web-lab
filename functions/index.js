/* eslint-env node */
const {
  onRequest,
  onCall,
  HttpsError,
} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {
  listSimulations,
  getSimulationById,
  getSimulationCapabilities,
} = require("./api/services/simulationService");

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
exports.platformApi = onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  const sendJson = (status, data) => {
    return res.status(status).json({
      ok: status >= 200 && status < 300,
      ...data,
    });
  };

  if (req.method !== "GET") {
    return sendJson(405, {
      error: "METHOD_NOT_ALLOWED",
      message: "Only GET is supported in Platform API v1 phase 1.",
    });
  }

  const path = req.path || "/";

  if (path === "/" || path === "/v1" || path === "/v1/health") {
    return sendJson(200, {
      name: "Esbiko Platform API",
      version: "v1",
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  }

  if (path === "/v1/platform/info") {
    return sendJson(200, {
      name: "Esbiko",
      product: "Science Web Lab",
      type: "Educational Simulation Platform",
      apiVersion: "v1",
      capabilities: [
        "platform-health",
        "platform-info",
        "simulation-discovery",
        "simulation-capability-discovery",
      ],
      futureCapabilities: [
        "simulation-metadata",
        "classroom-integration",
        "experiment-presets",
        "report-export",
        "agent-gateway",
      ],
    });
  }

  if (path === "/v1/simulations") {
    const simulations = listSimulations();

    return sendJson(200, {
      count: simulations.length,
      simulations,
    });
  }

  if (path.startsWith("/v1/simulations/") && path.endsWith("/capabilities")) {
    const id = decodeURIComponent(
      path.replace("/v1/simulations/", "").replace("/capabilities", ""),
    );

    const result = getSimulationCapabilities(id);

    if (!result) {
      return sendJson(404, {
        error: "SIMULATION_NOT_FOUND",
        message: `Simulation not found: ${id}`,
      });
    }

    return sendJson(200, result);
  }

  if (path.startsWith("/v1/simulations/")) {
    const id = decodeURIComponent(path.replace("/v1/simulations/", ""));
    const simulation = getSimulationById(id);

    if (!simulation) {
      return sendJson(404, {
        error: "SIMULATION_NOT_FOUND",
        message: `Simulation not found: ${id}`,
      });
    }

    return sendJson(200, { simulation });
  }

  return sendJson(404, {
    error: "NOT_FOUND",
    message: `No Platform API route found for ${path}`,
  });
});
