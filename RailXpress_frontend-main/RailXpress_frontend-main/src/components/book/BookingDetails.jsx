// src/components/book/BookingDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBooking } from "../../services/bookings";
import QRCode from "qrcode";

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      const data = await getBooking(id);
      if (!mounted) return;
      setBooking(data);
      setLoading(false);

      const payload = data?.bookingRef ?? data?.id ?? id;
      if (payload) {
        try {
          const url = await QRCode.toDataURL(String(payload), {
            margin: 2, width: 240,
            color: { dark: "#111827", light: "#ffffff" },
          });
          if (mounted) setQrDataUrl(url);
        } catch (err) {
          console.error("QR generation failed:", err);
        }
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>Loading...</div>
        <p style={{ color: "var(--muted, #6b7280)" }}>Fetching booking details</p>
      </div>
    </div>
  );

  if (!booking) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
        <h3>Booking Not Found</h3>
        <p style={{ color: "var(--muted, #6b7280)" }}>The booking ID may be incorrect or expired.</p>
        <Link to="/book" className="btn btn-primary" style={{ marginTop: 12 }}>Create New Booking</Link>
      </div>
    </div>
  );

  const bookingRef = booking.bookingRef ?? booking.id;

  const InfoRow = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border, #e6e9ee)" }}>
      <span style={{ color: "var(--muted, #6b7280)", fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{value || "—"}</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/book" style={{ color: "var(--brand-grad-start, #2563eb)", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>← Back to Booking</Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>Booking Details</h2>
              <p style={{ color: "var(--muted, #6b7280)", fontSize: 14, marginTop: 4 }}>
                Created: {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
            <span style={{
              display: "inline-block", padding: "6px 14px", borderRadius: 20,
              background: booking.status === "DELIVERED" ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)",
              color: booking.status === "DELIVERED" ? "#10b981" : "#6366f1",
              fontSize: 13, fontWeight: 700
            }}>
              {booking.status}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
          {/* Left - Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Booking Reference Card */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{
                textAlign: "center", padding: "16px 0",
                background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(139,92,246,0.08))",
                borderRadius: 10, marginBottom: 12
              }}>
                <div style={{ fontSize: 12, color: "var(--muted, #6b7280)", marginBottom: 4 }}>Booking Reference</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>{bookingRef}</div>
              </div>
            </div>

            {/* Trip Info */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Trip Information</h3>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
                padding: "14px 0", marginBottom: 12,
                background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(139,92,246,0.06))",
                borderRadius: 10
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "var(--muted, #6b7280)" }}>From</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{booking.departureStation}</div>
                </div>
                <div style={{ fontSize: 20 }}>→</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "var(--muted, #6b7280)" }}>To</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{booking.arrivalStation}</div>
                </div>
              </div>
              <InfoRow label="Date of Transport" value={booking.dateOfTransport} />
              <InfoRow label="Luggage Type" value={booking.luggageTypeId || "Custom"} />
            </div>

            {/* Luggage Details */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Luggage Details</h3>
              <InfoRow label="Weight" value={`${booking.weightKg} kg`} />
              <InfoRow label="Dimensions (L×W×H)" value={`${booking.lengthCm || "—"} × ${booking.widthCm || "—"} × ${booking.heightCm || "—"} cm`} />
              <InfoRow label="Fragile" value={booking.isFragile ? "Yes" : "No"} />
              <InfoRow label="Contains Battery" value={booking.containsBattery ? "Yes" : "No"} />
              <InfoRow label="Contains Liquids" value={booking.containsLiquids ? "Yes" : "No"} />
              <InfoRow label="Restricted Items" value={booking.containsRestrictedItems ? "Yes" : "No"} />
              {booking.declaration && <InfoRow label="Declaration" value={booking.declaration} />}
            </div>

            {/* Fee */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Total Fee</h3>
                <div style={{
                  fontSize: 24, fontWeight: 800,
                  background: "linear-gradient(90deg, #2563eb, #8b5cf6)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>
                  ₹ {booking.fee || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Right - QR Code */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card" style={{ padding: 20, textAlign: "center" }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR for ${bookingRef}`} style={{ width: 200, height: 200, borderRadius: 8, margin: "0 auto" }} />
              ) : (
                <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border, #ccc)", margin: "0 auto", borderRadius: 8 }}>
                  Generating QR...
                </div>
              )}
              <p style={{ color: "var(--muted, #6b7280)", fontSize: 13, margin: "10px 0" }}>Show this QR at station check-in</p>
              <a href={qrDataUrl || "#"} download={`${bookingRef}.png`} className="btn btn-primary" style={{ display: "block", textDecoration: "none", marginBottom: 8 }}>
                Download QR
              </a>
              <Link to="/track" className="btn btn-secondary" style={{ display: "block", textDecoration: "none", marginBottom: 8 }}>
                Track Shipment
              </Link>
              <Link to="/book" className="btn btn-secondary" style={{ display: "block", textDecoration: "none" }}>
                New Booking
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
