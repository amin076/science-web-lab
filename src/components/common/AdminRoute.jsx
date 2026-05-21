import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        // Force refresh token to get latest custom claims
        const tokenResult = await user.getIdTokenResult(true);

        const adminAccess =
          tokenResult.claims.role === "admin" ||
          tokenResult.claims.admin === true;

        setIsAdmin(adminAccess);
      } catch (error) {
        console.error("Admin check error:", error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdmin();
  }, []);

  if (checking) {
    return (
      <div style={{ padding: "32px", color: "white" }}>
        Checking admin access...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
