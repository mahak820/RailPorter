import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { register, login, saveAuth } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const initialValues = {
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
  };

  const validationSchema = Yup.object({
    fullName: Yup.string().min(2, "Too short").required("Full name required"),
    email: Yup.string().email("Invalid email").required("Email required"),
    phone: Yup.string().matches(/^[0-9+ -]{7,15}$/, "Invalid phone").required("Phone required"),
    password: Yup.string().min(6, "Min 6 chars").required("Password required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm your password"),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await register({ fullName: values.fullName, email: values.email, phone: values.phone, password: values.password });
      try {
        const res = await login({ email: values.email, password: values.password });
        const token = res.token || res.accessToken || res.jwt;
        if (token) saveAuth(token, res.user ?? {});
      } catch (e) {}
      navigate("/");
    } catch (err) {
      const server = err?.response?.data;
      if (server?.errors) {
        Object.entries(server.errors).forEach(([field, msg]) => setFieldError(field, msg));
      } else {
        setFieldError("email", server?.message || "Registration failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, display: "inline-grid", placeItems: "center",
            background: "linear-gradient(135deg, #2563eb, #1f4fbf)",
            color: "#fff", fontWeight: 800, fontSize: 18, marginBottom: 12
          }}>RX</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create Account</h2>
          <p style={{ color: "var(--muted, #6b7280)", fontSize: 14 }}>Sign up for RailXpress</p>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Full Name</label>
                    <Field name="fullName" placeholder="John Doe" />
                    <ErrorMessage name="fullName" component="div" className="field-error" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Phone</label>
                    <Field name="phone" placeholder="+91 9876543210" />
                    <ErrorMessage name="phone" component="div" className="field-error" />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
                  <Field name="email" type="email" placeholder="you@example.com" />
                  <ErrorMessage name="email" component="div" className="field-error" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
                    <Field name="password" type="password" placeholder="Min 6 characters" />
                    <ErrorMessage name="password" component="div" className="field-error" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Confirm Password</label>
                    <Field name="confirmPassword" type="password" placeholder="Re-enter password" />
                    <ErrorMessage name="confirmPassword" component="div" className="field-error" />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: "100%", padding: 12, fontSize: 15, marginTop: 18 }}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
          <span style={{ color: "var(--muted, #6b7280)" }}>Already have an account? </span>
          <Link to="/login" style={{ color: "var(--brand-grad-start, #2563eb)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </div>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Link to="/" style={{ color: "var(--muted, #6b7280)", fontSize: 13, textDecoration: "none" }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
