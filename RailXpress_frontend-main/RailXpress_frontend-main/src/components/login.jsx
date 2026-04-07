import React from "react";
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
    <div className="container">
      <div style={{maxWidth:760, margin:"40px auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
          <div>
            <h2 style={{margin:0}}>Login</h2>
            <div className="small-muted">Access your RailPorter account</div>
          </div>
          <div>
            <Link to="/" className="inline-link">Back to home</Link>
          </div>
        </div>

        <div className="form-wrapper">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <div className="field">
                  <label>Email</label>
                  <Field name="email" type="email" />
                  <ErrorMessage name="email" component="div" className="error" />
                </div>

                <div className="field">
                  <label>Password</label>
                  <Field name="password" type="password" />
                  <ErrorMessage name="password" component="div" className="error" />
                </div>

                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8}}>
                  <Link to="/signup" className="small-muted">Create account</Link>
                  <button type="submit" className="btn" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <div className="center" style={{marginTop:12}}>
          <div className="small-muted">Need help? <a href="mailto:help@railxpress.example" className="inline-link">Contact support</a></div>
        </div>
      </div>
    </div>
  );
}
