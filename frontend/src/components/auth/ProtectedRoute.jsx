import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main className="lyvo-auth-page">
        <div className="lyvo-auth-background">
          <div className="lyvo-auth-orb lyvo-auth-orb-one"></div>
          <div className="lyvo-auth-orb lyvo-auth-orb-two"></div>
        </div>

        <section className="lyvo-auth-card lyvo-auth-loading">
          <div className="lyvo-auth-icon">✦</div>

          <h1>Loading LYVO...</h1>

          <p className="lyvo-auth-subtitle">
            Checking your workspace session.
          </p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;