import { Link } from "react-router-dom";
import { getCurrentUser, logout } from "../services/auth";

export default function Dashboard() {
  const user = getCurrentUser();

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>Dashboard</h2>
            <p style={{ color: "var(--muted, #6b7280)", fontSize: 14, marginTop: 4 }}>
              Welcome back, {user?.fullName || user?.name || "User"}
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => { logout(); window.location.href = "/"; }}>
            Logout
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <Link to="/book" className="card" style={{ padding: 24, textDecoration: "none", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Book Luggage</h3>
            <p style={{ color: "var(--muted, #6b7280)", fontSize: 13 }}>Create a new luggage booking</p>
          </Link>

          <Link to="/track" className="card" style={{ padding: 24, textDecoration: "none", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Track Shipment</h3>
            <p style={{ color: "var(--muted, #6b7280)", fontSize: 13 }}>Track your existing bookings</p>
          </Link>

          <Link to="/" className="card" style={{ padding: 24, textDecoration: "none", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Home</h3>
            <p style={{ color: "var(--muted, #6b7280)", fontSize: 13 }}>Go back to homepage</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
