import React from "react";

export default function StartCard({ onStart }) {
  return (
    <div className="start-card">
      <div className="start-moon-wrap">
        <div className="start-ripple" />
        <div className="start-moon">🌙</div>
      </div>
      <h2 className="start-title">Start Tracking Sleep</h2>
      <p className="start-sub">Choose the type of sleep to begin</p>
      <div className="start-buttons">
        <button className="btn-sleep nap" onClick={() => onStart("nap")}>
          <span className="btn-icon">☀️</span>
          <span className="btn-label">Nap</span>
          <span className="btn-desc">Daytime rest</span>
        </button>
        <button className="btn-sleep night" onClick={() => onStart("night")}>
          <span className="btn-icon">🌑</span>
          <span className="btn-label">Night Sleep</span>
          <span className="btn-desc">Bedtime</span>
        </button>
      </div>
    </div>
  );
}
