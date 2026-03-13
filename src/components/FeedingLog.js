import React, { useState } from "react";

function formatTime(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function groupByDate(logs) {
  const groups = {};
  logs.forEach(log => {
    const d = log.time?.toDate ? log.time.toDate() : new Date(log.time);
    const key = d.toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  });
  return groups;
}

export default function FeedingLog({ feedingLogs, onAdd, onDelete }) {
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("oz");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    setSubmitting(true);
    await onAdd(amount, unit, time || null);
    setAmount("");
    setTime("");
    setSubmitting(false);
  };

  const grouped = groupByDate(feedingLogs);
  const dateKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  // Today's total
  const todayStr = new Date().toDateString();
  const todayFeedings = feedingLogs.filter(f => {
    const d = f.time?.toDate ? f.time.toDate() : new Date(f.time);
    return d.toDateString() === todayStr;
  });
  const todayOz = todayFeedings.reduce((acc, f) => acc + (f.unit === "oz" ? f.amount : f.amount / 29.5735), 0);

  return (
    <div className="tab-content">
      <h2 className="section-title">🍼 Bottle Feedings</h2>

      {/* Add Feeding */}
      <div className="feeding-add-card">
        <h3 className="card-subtitle">Log a Feeding</h3>
        <div className="feeding-form">
          <div className="form-row">
            <input
              className="form-input"
              type="number"
              step="0.5"
              min="0"
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <select className="form-select" value={unit} onChange={e => setUnit(e.target.value)}>
              <option value="oz">oz</option>
              <option value="ml">ml</option>
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Time (leave blank for now)</label>
            <input
              className="form-input"
              type="datetime-local"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>
          <button className="add-btn" onClick={handleAdd} disabled={submitting}>
            {submitting ? "Saving…" : "➕ Log Feeding"}
          </button>
        </div>
      </div>

      {/* Today's summary */}
      {todayFeedings.length > 0 && (
        <div className="today-feeding-summary">
          <span>Today: <strong>{todayFeedings.length} bottle{todayFeedings.length !== 1 ? "s" : ""}</strong></span>
          <span><strong>{todayOz.toFixed(1)} oz</strong> total</span>
        </div>
      )}

      {/* History */}
      <div className="log-history">
        {feedingLogs.length === 0 && (
          <p className="empty-state">No feedings logged yet</p>
        )}
        {dateKeys.map(key => {
          const dayFeedings = grouped[key];
          const dayOz = dayFeedings.reduce((acc, f) => acc + (f.unit === "oz" ? f.amount : f.amount / 29.5735), 0);
          return (
            <div key={key} className="log-group">
              <div className="log-group-header">
                <span>{formatDate(dayFeedings[0].time)}</span>
                <span>{dayOz.toFixed(1)} oz total</span>
              </div>
              {dayFeedings.map(f => (
                <div key={f.id} className="log-item feeding-item">
                  <div className="log-item-left">
                    <span className="log-icon">🍼</span>
                    <span className="log-main">{f.amount} {f.unit}</span>
                    <span className="log-time">{formatTime(f.time)}</span>
                  </div>
                  <button className="delete-btn" onClick={() => onDelete(f.id)}>🗑️</button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
