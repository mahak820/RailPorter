// src/App.jsx
import './App.css';
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Signup from "./components/signup";
import Home from "./components/home";
import Dashboard from "./components/dashboard";
import { getCurrentUser } from "./services/auth";
import BookingForm from "./components/book/BookingForm";
import BookingDetails from "./components/book/BookingDetails"; //  correct path
import TrackBooking from "./components/track/TracKBooking";
import FullPageLoader from "./components/pageloaders/FullPageLoader";
import GridLoader from "./components/pageloaders/GridLoader";
import Loader from "./components/Loader";
import TrackLoader from './components/pageloaders/TrackLoader';
import RailLogo from './components/pageloaders/RailLogo';


// Private Route wrapper
function PrivateRoute({ children }) {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      {/* <FullPageLoader message="Preparing RailXpress..." size={260} /> */}
      {/* <GridLoader message="Loading RailXpress..." minVisibleMs={900} fadeOutMs={420} /> */}
      <Loader showFor={3000} /> 
      {/* <TrackLoader showFor={3000} message="Preparing RailXpress..." /> */}
      
      <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/book" element={<BookingForm />} />
        <Route path="/booking/:id" element={<BookingDetails />} /> {/* ✅ new */}
        <Route path="/track" element={<TrackBooking />} />

        {/* Example protected route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Redirect unknown routes */}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
    
  );
}
