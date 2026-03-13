import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from "recharts";

function getWeekDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function toHours(ms) {
  return parseFloat((ms / 3600000).toFixed(2));
}

function formatDuration(ms) {
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

const MOOD_EMOJI = {
  Happy: "😊", Drowsy: "😴", Fussy: "😢", Calm: "😌", Cranky: "😤"
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a1035", border: "1px solid rgba(124,58,237,0.4)",
      borderRadius: "10px", padding: "10px 14px", fontSize: "0.85rem", color: "#ddd6fe"
    }}>
      <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: "4px 0", color: p.color }}>
          {p.name}: {p.value}h
        </p>
      ))}
    </div>
  );
};

export default function WeeklyStats({ sleepLogs, feedingLogs }) {
  const weekDays = getWeekDays();

  // Build chart data
  const chartData = weekDays.map(day => {
    const dayStr = day.toDateString();
    const label = day.toLocaleDateString([], { weekday: "short" });

    const dayLogs = sleepLogs.filter(l => {
      if (!l.endTime) return false;
      const s = l.startTime?.toDate ? l.startTime.toDate() : new Date(l.startTime);
      return s.toDateString() === dayStr;
    });

    const napMs = dayLogs.filter(l => l.type === "nap").reduce((acc, l) => {
      const s = l.startTime?.toDate ? l.startTime.toDate() : new Date(l.startTime);
      const e = l.endTime?.toDate ? l.endTime.toDate() : new Date(l.endTime);
      return acc + (e - s);
    }, 0);

    const nightMs = dayLogs.filter(l => l.type === "night").reduce((acc, l) => {
      const s = l.startTime?.toDate ? l.startTime.toDate() : new Date(l.startTime);
      const e = l.endTime?.toDate ? l.endTime.toDate() : new Date(l.endTime);
      return acc + (e - s);
    }, 0);

    const dayFeedings = feedingLogs.filter(f => {
      const t = f.time?.toDate ? f.time.toDate() : new Date(f.time);
      return t.toDateString() === dayStr;
    });
    const feedingOz = dayFeedings.reduce((acc, f) => acc + (f.unit === "oz" ? f.amount : f.amount / 29.5735), 0);

    return {
      day: label,
      Naps: toHours(napMs),
      Night: toHours(nightMs),
      Total: toHours(napMs + nightMs),
      feedingOz: parseFloat(feedingOz.toFixed(1)),
      napCount: dayLogs.filter(l => l.type === "nap").length,
    };
  });

  // Mood tally
  const weekLogs = sleepLogs.filter(l => {
    if (!l.endTime || !l.mood) return false;
    const s = l.startTime?.toDate ? l.startTime.toDate() : new Date(l.startTime);
    return weekDays.some(d => d.toDateString() === s.toDateString());
  });
  const moodTally = {};
  weekLogs.forEach(l => { moodTally[l.mood] = (moodTally[l.mood] || 0) + 1; });
  const sortedMoods = Object.entries(moodTally).sort((a, b) => b[1] - a[1]);

  // Weekly totals
  const totalNapMs = chartData.reduce((a, d) => a + d.Naps * 3600000, 0);
  const totalNightMs = chartData.reduce((a, d) => a + d.Night * 3600000, 0);
  const totalFeedingOz = chartData.reduce((a, d) => a + d.feedingOz, 0);
  const avgNapCount = (chartData.reduce((a, d) => a + d.napCount, 0) / 7).toFixed(1);

  return (
    <div className="tab-content">
      <h2 className="section-title">📊 Weekly Overview</h2>

      {/* Summary cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Nap Sleep</div>
          <div className="stat-value">{formatDuration(totalNapMs)}</div>
          <div className="stat-sub">this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Night Sleep</div>
          <div className="stat-value">{formatDuration(totalNightMs)}</div>
          <div className="stat-sub">this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Naps/Day</div>
          <div className="stat-value">{avgNapCount}</div>
          <div className="stat-sub">per day</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Feedings</div>
          <div className="stat-value">{totalFeedingOz.toFixed(1)} oz</div>
          <div className="stat-sub">this week</div>
        </div>
      </div>

      {/* Sleep chart */}
      <div className="chart-card">
        <h3 className="chart-title">Sleep by Day (hours)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barGap={4}>
            <XAxis dataKey="day" tick={{ fill: "#7c6f9e", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#7c6f9e", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: "#7c6f9e", fontSize: "0.8rem" }} />
            <Bar dataKey="Naps" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Night" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feeding chart */}
      <div className="chart-card">
        <h3 className="chart-title">Feedings by Day (oz)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
            <XAxis dataKey="day" tick={{ fill: "#7c6f9e", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#7c6f9e", fontSize: 11 }} axisLine={false} tickLine={false} unit=" oz" />
            <Tooltip contentStyle={{ background: "#1a1035", border: "1px solid rgba(124,58,237,0.4)", borderRadius: "10px", color: "#ddd6fe" }} />
            <Line type="monotone" dataKey="feedingOz" stroke="#34d399" strokeWidth={2} dot={{ fill: "#34d399", r: 4 }} name="oz" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mood tally */}
      {sortedMoods.length > 0 && (
        <div className="chart-card">
          <h3 className="chart-title">Mood Upon Waking — This Week</h3>
          <div className="mood-tally">
            {sortedMoods.map(([mood, count]) => (
              <div key={mood} className="mood-tally-row">
                <span className="mood-tally-emoji">{MOOD_EMOJI[mood]}</span>
                <span className="mood-tally-label">{mood}</span>
                <div className="mood-tally-bar-wrap">
                  <div className="mood-tally-bar" style={{ width: `${(count / weekLogs.length) * 100}%` }} />
                </div>
                <span className="mood-tally-count">{count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
