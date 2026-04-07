// src/components/book/BookingDetails.jsx
import React, { useEffect, useState } from "react";
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

      // generate a QR image after data loads
      const payload = data?.bookingRef ?? data?.id ?? id;
      if (payload) {
        try {
          const url = await QRCode.toDataURL(String(payload), {
            margin: 2,
            width: 240,
            color: {
              dark: "#111827",
              light: "#ffffff",
            },
          });
          if (mounted) setQrDataUrl(url);
        } catch (err) {
          console.error("QR generation failed:", err);
        }
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading booking...</div>;
  if (!booking) return <div style={{ padding: 24 }}>Booking not found.</div>;

  const bookingRef = booking.bookingRef ?? booking.id;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2 style={{ fontWeight: "bold", marginBottom: 10 }}>
        Booking Details – {bookingRef}
      </h2>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>
        Created: {new Date(booking.createdAt).toLocaleString()}
      </p>

      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* Left Side */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <h3>Passenger Information</h3>
            <p><strong>Name:</strong> {booking.user?.fullName || "Guest"}</p>
            <p><strong>Email:</strong> {booking.user?.email || "N/A"}</p>

            <h3 style={{ marginTop: 16 }}>Trip Information</h3>
            <p>
              <strong>From:</strong> {booking.departureStation} <br />
              <strong>To:</strong> {booking.arrivalStation}
            </p>
            <p><strong>Date:</strong> {booking.dateOfTransport}</p>

            <h3 style={{ marginTop: 16 }}>Luggage</h3>
            <p><strong>Type:</strong> {booking.luggageTypeId || "Custom"}</p>
            <p><strong>Weight:</strong> {booking.weightKg} kg</p>
            {booking.dimensions && (
              <p>
                <strong>Dimensions:</strong>{" "}
                {booking.dimensions.lengthCm}×{booking.dimensions.widthCm}×
                {booking.dimensions.heightCm} cm
              </p>
            )}
            <p><strong>Status:</strong> {booking.status}</p>
            <p><strong>Fee:</strong> ₹ {booking.fee || "—"}</p>
          </div>
        </div>

        {/* Right Side */}
        <div
          style={{
            width: 260,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
            textAlign: "center",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR for ${bookingRef}`}
              style={{ width: 180, height: 180, marginBottom: 8 }}
            />
          ) : (
            <div
              style={{
                width: 180,
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #ccc",
                margin: "0 auto 8px",
              }}
            >
              Generating QR...
            </div>
          )}
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 10 }}>
            Show this QR at check-in
          </p>
          <a
            href={qrDataUrl || "#"}
            download={`${bookingRef}.png`}
            className="btn secondary"
            style={{
              display: "block",
              marginBottom: 10,
              color: "white",
              background: "#2563eb",
              padding: "8px 12px",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Download QR
          </a>
          <Link
            to="/book"
            className="btn"
            style={{
              display: "block",
              background: "#16a34a",
              color: "white",
              padding: "8px 12px",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            New Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
