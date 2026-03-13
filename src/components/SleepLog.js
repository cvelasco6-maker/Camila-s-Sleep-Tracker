import React from "react";

function formatDuration(ms) {
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

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
    const d = log.startTime?.toDate ? log.startTime.toDate() : new Date(log.startTime);
    const key = d.toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  });
  return groups;
}

const MOOD_EMOJI = {
  Happy: "😊", Drowsy: "😴", Fussy: "😢", Calm: "😌", Cranky: "😤"
};

export default function SleepLog({ sleepLogs, onDelete, moods }) {
  const grouped = groupByDate(sleepLogs.filter(l => l.endTime));
  const dateKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="tab-content">
      <h2 className="section-title">📋 Sleep History</h2>
      {sleepLogs.filter(l => l.endTime).length === 0 && (
        <p className="empty-state">No sleep logged yet</p>
      )}
      {dateKeys.map(key => {
        const dayLogs = grouped[key];
        const dayMs = dayLogs.reduce((acc, l) => {
          const s = l.startTime?.toDate ? l.startTime.toDate() : new Date(l.startTime);
          const e = l.endTime?.toDate ? l.endTime.toDate() : new Date(l.endTime);
          return acc + (e - s);
        }, 0);
        const naps = dayLogs.filter(l => l.type === "nap").length;
        const nights = dayLogs.filter(l => l.type === "night").length;

        return (
          <div key={key} className="log-group">
            <div className="log-group-header">
              <span>{formatDate(dayLogs[0].startTime)}</span>
              <span>{formatDuration(dayMs)} · {naps} nap{naps !== 1 ? "s" : ""} · {nights} night</span>
            </div>
            {dayLogs.map(log => {
              const s = log.startTime?.toDate ? log.startTime.toDate() : new Date(log.startTime);
              const e = log.endTime?.toDate ? log.endTime.toDate() : new Date(log.endTime);
              const dur = e - s;
              return (
                <div key={log.id} className="log-item sleep-item">
                  <div className="log-item-left">
                    <span className="log-icon">{log.type === "nap" ? "☀️" : "🌑"}</span>
                    <div className="log-details">
                      <div className="log-main">
                        {formatTime(log.startTime)} – {formatTime(log.endTime)}
                        <span className="log-dur"> ({formatDuration(dur)})</span>
                      </div>
                      <div className="log-meta">
                        <span className="log-type-tag">{log.type === "nap" ? "Nap" : "Night"}</span>
                        {log.mood && <span className="log-mood">{MOOD_EMOJI[log.mood]} {log.mood}</span>}
                        {log.note && <span className="log-note">· {log.note}</span>}
                      </div>
                    </div>
                  </div>
                  <button className="delete-btn" onClick={() => onDelete(log.id)}>🗑️</button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
