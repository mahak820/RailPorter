// frontend/src/components/book/BookingForm.jsx
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./BookingForm.css";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "";

/* ------------------ DATE HELPERS ------------------ */
// Convert yyyy-mm-dd → dd-mm-yyyy
function toDDMMYYYY(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

/* ------------------ VALIDATION SCHEMA ------------------ */
const BookingSchema = Yup.object().shape({
  departureStation: Yup.string().required("Required"),
  arrivalStation: Yup.string().required("Required"),
  dateOfTransport: Yup.string().required("Required"),
  luggageTypeId: Yup.string().required("Required"),
  weightKg: Yup.number().typeError("Must be a number").positive("Must be > 0").required("Required"),
  lengthCm: Yup.number().typeError("Must be a number").positive("Must be > 0").required("Required"),
  widthCm: Yup.number().typeError("Must be a number").positive("Must be > 0").required("Required"),
  heightCm: Yup.number().typeError("Must be a number").positive("Must be > 0").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
});

const todayIso = new Date().toISOString().split("T")[0]; // yyyy-MM-dd

export default function BookingForm() {
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const navigate = useNavigate?.() || (() => {});

  async function submitBooking(values) {
    setServerError(null);
    setLoading(true);
    setResult(null);

    const ddmm = toDDMMYYYY(values.dateOfTransport);

    const payload = {
      departureStation: values.departureStation,
      arrivalStation: values.arrivalStation,
      dateOfTransport: ddmm, // dd-MM-yyyy
      luggageTypeId: values.luggageTypeId,
      weightKg: Number(values.weightKg),
      lengthCm: Number(values.lengthCm),
      widthCm: Number(values.widthCm),
      heightCm: Number(values.heightCm),
      isFragile: !!values.isFragile,
      containsBattery: !!values.containsBattery,
      containsLiquids: !!values.containsLiquids,
      containsRestrictedItems: !!values.containsRestrictedItems,
      declaration: values.declaration,
      email: values.email
    };

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => null);
        throw new Error(t || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      // clear estimate because booking changed
      setEstimate(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Create booking error:", err);
      setServerError(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  async function getEstimate(values) {
    setEstimating(true);
    setEstimate(null);
    setServerError(null);

    const ddmm = toDDMMYYYY(values.dateOfTransport);

    const payload = {
      departureStation: values.departureStation,
      arrivalStation: values.arrivalStation,
      dateOfTransport: ddmm, // dd-MM-yyyy - backend may use or ignore
      luggageTypeId: values.luggageTypeId,
      weightKg: Number(values.weightKg || 0),
      lengthCm: Number(values.lengthCm || 0),
      widthCm: Number(values.widthCm || 0),
      heightCm: Number(values.heightCm || 0),
      isFragile: !!values.isFragile,
      containsBattery: !!values.containsBattery,
      containsLiquids: !!values.containsLiquids,
      containsRestrictedItems: !!values.containsRestrictedItems,
    };

    try {
      const res = await fetch(`${API_BASE}/api/bookings/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => null);
        throw new Error(t || `HTTP ${res.status}`);
      }

      const data = await res.json();
      // backend might return a breakdown object or a simple number
      setEstimate(data);
    } catch (err) {
      console.error("Estimate error:", err);
      setServerError(err.message || "Failed to get estimate");
    } finally {
      setEstimating(false);
    }
  }

  return (
    <div className="booking-page"  style={{
  background: "transparent",
  minHeight: "100vh",
  padding: "40px 0",
}}>
      <div className="booking-wrap">
        <div className="card">
          <a className="back-link" href="/" onClick={(e)=>{ e.preventDefault(); navigate("/"); }}>← Back to Home</a>
          <div className="hdr">
            <h2>Create Booking</h2>
          </div>

          <Formik
            initialValues={{
              departureStation: "",
              arrivalStation: "",
              dateOfTransport: todayIso,
              luggageTypeId: "parcel",
              weightKg: "",
              lengthCm: "",
              widthCm: "",
              heightCm: "",
              isFragile: false,
              containsBattery: false,
              containsLiquids: false,
              containsRestrictedItems: false,
              declaration: "",
              email: "",
            }}
            validationSchema={BookingSchema}
            onSubmit={(values) => submitBooking(values)}
          >
            {({ values, isSubmitting, setFieldValue }) => (
              <Form>
                <div className="form-grid">
                  <div>
                    <label>Departure Station</label>
                    <Field name="departureStation" placeholder="e.g., Pune" />
                    <div className="field-error"><ErrorMessage name="departureStation" /></div>
                  </div>

                  <div>
                    <label>Arrival Station</label>
                    <Field name="arrivalStation" placeholder="e.g., Mumbai" />
                    <div className="field-error"><ErrorMessage name="arrivalStation" /></div>
                  </div>

                  <div>
                    <label>Date of Transport (dd-mm-yyyy)</label>
                    <Field
                      name="dateOfTransport"
                      type="date"
                      value={values.dateOfTransport}
                      onChange={(e) => setFieldValue("dateOfTransport", e.target.value)}
                    />
                    <small style={{ color: "#475569" }}>Selected: <b>{toDDMMYYYY(values.dateOfTransport)}</b></small>
                    <div className="field-error"><ErrorMessage name="dateOfTransport" /></div>
                  </div>

                  <div>
                    <label>Luggage Type</label>
                    <Field name="luggageTypeId" as="select">
                      <option value="parcel">Parcel</option>
                      <option value="document">Document</option>
                      <option value="bike">Two-wheeler</option>
                    </Field>
                    <div className="field-error"><ErrorMessage name="luggageTypeId" /></div>
                  </div>

                  <div>
                    <label>Weight (kg)</label>
                    <Field name="weightKg" placeholder="e.g., 12" />
                    <div className="field-error"><ErrorMessage name="weightKg" /></div>
                  </div>

                  <div>
                    <label>Length (cm)</label>
                    <Field name="lengthCm" placeholder="e.g., 50" />
                    <div className="field-error"><ErrorMessage name="lengthCm" /></div>
                  </div>

                  <div>
                    <label>Width (cm)</label>
                    <Field name="widthCm" placeholder="e.g., 50" />
                    <div className="field-error"><ErrorMessage name="widthCm" /></div>
                  </div>

                  <div>
                    <label>Height (cm)</label>
                    <Field name="heightCm" placeholder="e.g., 50" />
                    <div className="field-error"><ErrorMessage name="heightCm" /></div>
                  </div>

                  <div>
                    <label>Email (for confirmation)</label>
                    <Field name="email" type="email" placeholder="you@example.com" />
                    <div className="field-error"><ErrorMessage name="email" /></div>
                  </div>

                  {/* Checkboxes */}
                  <div>
                    <label style={{ display: "block", marginBottom: 8 }}>Contains battery</label>
                    <label style={{ fontWeight: 500 }}>
                      <Field type="checkbox" name="containsBattery" /> &nbsp; Yes
                    </label>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 8 }}>Contains liquids</label>
                    <label style={{ fontWeight: 500 }}>
                      <Field type="checkbox" name="containsLiquids" /> &nbsp; Yes
                    </label>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 8 }}>Contains restricted items</label>
                    <label style={{ fontWeight: 500 }}>
                      <Field type="checkbox" name="containsRestrictedItems" /> &nbsp; Yes
                    </label>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 8 }}>Is fragile?</label>
                    <label style={{ fontWeight: 500 }}>
                      <Field type="checkbox" name="isFragile" /> &nbsp; Yes
                    </label>
                  </div>

                  <div className="form-row full">
                    <label>Declaration / Notes</label>
                    <Field name="declaration" as="textarea" placeholder="Any declarations" />
                  </div>

                  <div className="form-row full">
                    <div className="actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => getEstimate(values)}
                        disabled={estimating}
                      >
                        {estimating ? "Estimating..." : "Get Estimate"}
                      </button>

                      <button type="submit" className="btn btn-primary" disabled={isSubmitting || loading}>
                        {loading ? "Creating..." : "Create Booking"}
                      </button>

                      <button type="reset" className="btn btn-secondary" onClick={() => { setEstimate(null); setResult(null); }}>
                        Reset
                      </button>
                    </div>

                    {serverError && <div style={{ color: "#dc2626", marginTop:12 }}>{serverError}</div>}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <div className="side-panel">
          <h4 style={{marginTop:0}}>Estimate & Result</h4>

          <div className="result">
            {/* Estimate area */}
            <div style={{ marginBottom: 10 }}>
              <strong>Estimate</strong>
              {!estimate && <div style={{ color: "#475569", marginTop:8 }}>Click <b>Get Estimate</b> to preview the fee breakdown.</div>}
              {estimate && (
                <div style={{ marginTop:8 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#10b981", marginBottom: 10 }}>
                    ₹ {estimate.total ?? estimate}
                  </div>
                  {estimate.breakdown && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "#94a3b8" }}>Base charge</span>
                        <span style={{ fontWeight: 600 }}>₹ {estimate.breakdown.base}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "#94a3b8" }}>Weight charge</span>
                        <span style={{ fontWeight: 600 }}>₹ {estimate.breakdown.weightFactor}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "#94a3b8" }}>Distance charge</span>
                        <span style={{ fontWeight: 600 }}>₹ {estimate.breakdown.distanceFactor}</span>
                      </div>
                      <div style={{ borderTop: "1px solid #253745", marginTop: 4, paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
                        <span>Total</span>
                        <span>₹ {estimate.total}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Booking result area */}
            {!result && <div style={{ color:"#475569" }}>No booking created yet.</div>}
            {result && (
              <>
                <div style={{ marginTop: 8 }}>
                  <strong>Booking created</strong>
                  <pre style={{ marginTop:8 }}>{JSON.stringify(result.booking || result, null, 2)}</pre>
                </div>
                {result.qrBase64 && (
                  <div style={{ marginTop:10 }}>
                    <strong>QR</strong>
                    <img className="qr" src={`data:image/png;base64,${result.qrBase64}`} alt="QR" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
