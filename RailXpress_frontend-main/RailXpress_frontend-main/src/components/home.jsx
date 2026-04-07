import React from "react";
import { Link } from "react-router-dom";
import { getCurrentUser, logout } from "../services/auth";

export default function Home() {
  const user = getCurrentUser();

  return (
    <div>
      <header className="navbar">
        <div className="container" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div className="brand">
            <div className="logo">RX</div>
            <div>
              <div style={{fontWeight:700}}>RailXpress</div>
              <div className="small-muted">Simplified luggage transport</div>
            </div>
          </div>

          <nav className="navlinks">
            <Link to="/">Home</Link>
            <Link to="/book">Book Luggage</Link>
            <Link to="/track">Track</Link>
            {user ? (
              <>
                <span style={{fontSize:14, color:"#374151"}}>Hi, {user.fullName ?? user.name ?? "User"}</span>
                <button className="btn" onClick={() => { logout(); window.location.reload(); }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="cta">Login</Link>
                <Link to="/signup" className="cta">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="hero-left">
            <h2 className="hero-title">Ship your luggage easily with RailXpress</h2>
            <p className="hero-sub">Automated form filling, instant fee estimates, QR-based tracking and secure delivery to your destination station.</p>
            <div style={{display:"flex",gap:12}}>
              <Link to="/book" className="btn">Start Booking</Link>
              <Link to="#how" className="btn secondary">How it works</Link>
            </div>

            <div style={{marginTop:18, display:"flex", gap:12}}>
              <div className="card" style={{minWidth:120}}>
                <div style={{fontSize:12,color:"var(--muted)"}}>Avg Booking Time</div>
                <div style={{fontWeight:700}}>2 mins</div>
              </div>
              <div className="card" style={{minWidth:120}}>
                <div style={{fontSize:12,color:"var(--muted)"}}>Supported Stations</div>
                <div style={{fontWeight:700}}>200+</div>
              </div>
              <div className="card" style={{minWidth:120}}>
                <div style={{fontSize:12,color:"var(--muted)"}}>Secure Delivery</div>
                <div style={{fontWeight:700}}>Trackable</div>
              </div>
            </div>
          </div>

          <div style={{width:360}}>
            <div className="card quick-form">
              <h4 style={{marginTop:0}}>Quick booking preview</h4>
              <div className="small-muted" style={{marginBottom:12}}>Fill minimal details and get an instant estimate</div>
              <form>
                <div className="field">
                  <label>From</label>
                  <input placeholder="Departure station" />
                </div>
                <div className="field">
                  <label>To</label>
                  <input placeholder="Arrival station" />
                </div>
                <div className="row" style={{display:"flex", gap:8}}>
                  <div style={{flex:1}}>
                    <label>Weight (kg)</label>
                    <input type="number" placeholder="e.g. 12" />
                  </div>
                  <div style={{flex:1}}>
                    <label>Date</label>
                    <input type="date" />
                  </div>
                </div>

                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12}}>
                  <div className="small-muted">Estimate: <strong>₹ 240</strong></div>
                  <Link to="/book" className="btn">Continue</Link>
                </div>
              </form>
            </div>

            <div className="small-muted" style={{marginTop:8,fontSize:12}}>* Estimate shown for demo. Final fee calculated on server.</div>
          </div>
        </section>

        <section id="how" style={{marginTop:28}}>
          <h3>Why choose RailXpress?</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12, marginTop:12}}>
            <div className="card">
              <div style={{fontWeight:600}}>Auto-fill forms</div>
              <div className="small-muted">Save time: let RailXpress auto-complete commonly used profiles.</div>
            </div>
            <div className="card">
              <div style={{fontWeight:600}}>QR Tracking</div>
              <div className="small-muted">Each booking has a QR code for quick scan & status updates.</div>
            </div>
            <div className="card">
              <div style={{fontWeight:600}}>Secure handled</div>
              <div className="small-muted">Station staff will check and sign off on each luggage delivery.</div>
            </div>
            <div className="card">
              <div style={{fontWeight:600}}>Flexible payments</div>
              <div className="small-muted">Pay online or at the station while dropping the luggage.</div>
            </div>
          </div>
        </section>

        <section style={{marginTop:28}}>
          <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:12}}>
            <div className="card">
              <h4 style={{marginTop:0}}>Recent deliveries</h4>
              <ul style={{listStyle:"none",padding:0,margin:0}}>
                <li style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid #f3f6f9"}}>
                  <div>
                    <div style={{fontWeight:600}}>Amit K.</div>
                    <div className="small-muted">Pune → Mumbai · 2 days ago</div>
                  </div>
                  <div style={{color:"#10b981", fontWeight:600}}>Delivered</div>
                </li>
                <li style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid #f3f6f9"}}>
                  <div>
                    <div style={{fontWeight:600}}>Sana R.</div>
                    <div className="small-muted">Delhi → Lucknow · 1 day ago</div>
                  </div>
                  <div style={{color:"#f59e0b", fontWeight:600}}>In Transit</div>
                </li>
                <li style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid #f3f6f9"}}>
                  <div>
                    <div style={{fontWeight:600}}>Rohit P.</div>
                    <div className="small-muted">Bengaluru → Chennai · 3 hours ago</div>
                  </div>
                  <div style={{color:"#6b7280", fontWeight:600}}>Pending</div>
                </li>
              </ul>
            </div>

            <div className="card">
              <h4 style={{marginTop:0}}>Get the app</h4>
              <div className="small-muted">Scan & manage bookings quickly using the staff app.</div>
              <div style={{display:"flex",gap:8, marginTop:12}}>
                <div style={{padding:"8px 12px",borderRadius:8,border:"1px solid #e6edf3"}}>App Store</div>
                <div style={{padding:"8px 12px",borderRadius:8,border:"1px solid #e6edf3"}}>Play Store</div>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          © {new Date().getFullYear()} RailXpress — All rights reserved
        </footer>
      </main>
    </div>
  );
}
