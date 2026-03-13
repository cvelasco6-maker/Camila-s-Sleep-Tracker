import React, { useState } from "react";

function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatTime(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ActiveSleepCard({ activeSleep, elapsed, onStop, moods }) {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");

  const handleStop = () => onStop(activeSleep.id, mood, note);

  return (
    <div className="active-card">
      <div className="active-badge">
        {activeSleep.type === "nap" ? "☀️ Napping" : "🌑 Night Sleep"}
      </div>

      <div className="active-timer">{formatDuration(elapsed)}</div>
      <div className="active-since">
        Started at {formatTime(activeSleep.startTime)}
      </div>

      <div className="mood-section">
        <p className="mood-label">Mood upon waking</p>
        <div className="mood-grid">
          {moods.map(m => (
            <button
              key={m.label}
              className={`mood-btn ${mood === m.label ? "selected" : ""}`}
              onClick={() => setMood(m.label)}
              title={m.label}
            >
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-name">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <input
        className="note-input"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Add a note (optional)…"
      />

      <button className="wake-btn" onClick={handleStop}>
        ☀️ Wake Up — End Session
      </button>
    </div>
  );
}
