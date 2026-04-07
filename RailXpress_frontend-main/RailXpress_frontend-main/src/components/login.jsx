import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { login, saveAuth } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const initialValues = { email: "", password: "" };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email required"),
    password: Yup.string().min(6, "Min 6 characters").required("Password required"),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const res = await login(values);
      const token = res.token || res.accessToken || res.jwt;
      if (token) {
        saveAuth(token, res.user ?? {});
        navigate("/");
      } else {
        setFieldError("email", "Login failed");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid credentials";
      setFieldError("email", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, display: "inline-grid", placeItems: "center",
            background: "linear-gradient(135deg, #2563eb, #1f4fbf)",
            color: "#fff", fontWeight: 800, fontSize: 18, marginBottom: 12
          }}>RX</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Welcome Back</h2>
          <p style={{ color: "var(--muted, #6b7280)", fontSize: 14 }}>Sign in to your RailXpress account</p>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
                  <Field name="email" type="email" placeholder="you@example.com" />
                  <ErrorMessage name="email" component="div" className="field-error" />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
                  <Field name="password" type="password" placeholder="Enter your password" />
                  <ErrorMessage name="password" component="div" className="field-error" />
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: "100%", padding: 12, fontSize: 15 }}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
          <span style={{ color: "var(--muted, #6b7280)" }}>Don't have an account? </span>
          <Link to="/signup" style={{ color: "var(--brand-grad-start, #2563eb)", fontWeight: 600, textDecoration: "none" }}>Sign up</Link>
        </div>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Link to="/" style={{ color: "var(--muted, #6b7280)", fontSize: 13, textDecoration: "none" }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
