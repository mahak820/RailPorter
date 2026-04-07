import React, { useEffect, useState } from "react";
import "./Loader.css";

export default function Loader({ showFor = 1200 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), showFor);
    return () => clearTimeout(timer);
  }, [showFor]);

  return (
    <div className={`loader-backdrop ${!visible ? "hide" : ""}`}>
      <div className="loader-wrapper">
        <div className="orbit">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>

        <div className="logo">
          🚆 RailPorter
        </div>
      </div>
    </div>
  );
}
