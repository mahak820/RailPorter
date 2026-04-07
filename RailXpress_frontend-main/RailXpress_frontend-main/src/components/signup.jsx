import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { register, login, saveAuth } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const initialValues = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      };
      await register(payload);

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
    <div className="container">
      <div style={{maxWidth:760, margin:"40px auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
          <div>
            <h2 style={{margin:0}}>Create Account</h2>
            <div className="small-muted">Sign up for RailPorter</div>
          </div>
          <div>
            <Link to="/" className="inline-link">Back to home</Link>
          </div>
        </div>

        <div className="form-wrapper">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <div className="grid-2">
                  <div className="field">
                    <label>Full name</label>
                    <Field name="fullName" />
                    <ErrorMessage name="fullName" component="div" className="error" />
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <Field name="phone" />
                    <ErrorMessage name="phone" component="div" className="error" />
                  </div>
                </div>

                <div className="field">
                  <label>Email</label>
                  <Field name="email" type="email" />
                  <ErrorMessage name="email" component="div" className="error" />
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label>Password</label>
                    <Field name="password" type="password" />
                    <ErrorMessage name="password" component="div" className="error" />
                  </div>
                  <div className="field">
                    <label>Confirm Password</label>
                    <Field name="confirmPassword" type="password" />
                    <ErrorMessage name="confirmPassword" component="div" className="error" />
                  </div>
                </div>

                <div style={{display:"flex", justifyContent:"flex-end", marginTop:8}}>
                  <button type="submit" className="btn" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <div className="center" style={{marginTop:12}}>
          <div className="small-muted">Already have an account?
            <Link to="/login" className="inline-link"> Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
