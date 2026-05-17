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

export async function trackExperimentView(experimentId) {
  if (!experimentId) return;

  const ref = doc(db, COL, experimentId);

  try {
    await updateDoc(ref, {
      views: increment(1),
      lastViewedAt: serverTimestamp(),
    });
  } catch {
    try {
      await setDoc(
        ref,
        {
          views: 1,
          lastViewedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch {
      // Public analytics must never break the simulation.
    }
  }
}

export async function getPopularExperimentIds(topN = 3) {
  try {
    const q = query(collection(db, COL), orderBy("views", "desc"), limit(topN));
    const snap = await getDocs(q);

    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}
