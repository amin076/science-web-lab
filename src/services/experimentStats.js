// src/services/experimentStats.js
import { db } from "@/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const COL = "experimentStats";

// Track a view when a simulation is opened.
export async function trackExperimentView(experimentId) {
  if (!experimentId) return;

  const ref = doc(db, COL, experimentId);

  try {
    await updateDoc(ref, {
      views: increment(1),
      lastViewedAt: serverTimestamp(),
    });
  } catch (err) {
    // Doc might not exist yet (or rules). Try creating it.
    try {
      await setDoc(
        ref,
        { views: 1, lastViewedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (_) {
      // Silent fail: app must keep working even without analytics.
    }
  }
}

// Get top N most viewed experiment ids.
export async function getPopularExperimentIds(topN = 3) {
  try {
    const q = query(collection(db, COL), orderBy("views", "desc"), limit(topN));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.id);
  } catch (err) {
    return [];
  }
}
