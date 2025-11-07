// ✅ src/context/AuthProvider.jsx
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import AuthContext from "@/context/AuthContext";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const ref = doc(db, "users", currentUser.uid);
          const snap = await getDoc(ref);
          setRole(snap.exists() ? snap.data().role : "general");
        } catch {
          setRole("general");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
