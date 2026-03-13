import React, { useState, useEffect, useCallback } from "react";
import {
  collection, addDoc, onSnapshot, query, orderBy,
  doc, updateDoc, deleteDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import WeeklyStats from "./components/WeeklyStats";
import SleepLog from "./components/SleepLog";
import FeedingLog from "./components/FeedingLog";
import ActiveSleepCard from "./components/ActiveSleepCard";
import StartCard from "./components/StartCard";
import "./App.css";

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😴", label: "Drowsy" },
  { emoji: "😢", label: "Fussy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😤", label: "Cranky" },
];

export { MOODS };

export default function App() {
  const [tab, setTab] = useState("home");
  const [sleepLogs, setSleepLogs] = useState([]);
  const [feedingLogs, setFeedingLogs] = useState([]);
  const [activeSleep, setActiveSleep] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Real-time listener for sleep logs
  useEffect(() => {
    const q = query(collection(db, "sleepLogs"), orderBy("startTime", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSleepLogs(data);
      const active = data.find(d => !d.endTime);
      setActiveSleep(active || null);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Real-time listener for feeding logs
  useEffect(() => {
    const q = query(collection(db, "feedingLogs"), orderBy("time", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setFeedingLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (!activeSleep) { setElapsed(0); return; }
    const tick = () => {
      const start = activeSleep.startTime?.toDate
        ? activeSleep.startTime.toDate()
        : new Date(activeSleep.startTime);
      setElapsed(Date.now() - start.getTime());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeSleep]);

  const startSleep = useCallback(async (type) => {
    await addDoc(collection(db, "sleepLogs"), {
      startTime: serverTimestamp(),
      type, // "nap" or "night"
      endTime: null,
      mood: null,
      note: "",
    });
  }, []);

  const stopSleep = useCallback(async (id, mood, note) => {
    await updateDoc(doc(db, "sleepLogs", id), {
      endTime: serverTimestamp(),
      mood,
      note,
    });
  }, []);

  const deleteSleep = useCallback(async (id) => {
    await deleteDoc(doc(db, "sleepLogs", id));
  }, []);

  const addFeeding = useCallback(async (amount, unit, time) => {
    await addDoc(collection(db, "feedingLogs"), {
      amount: parseFloat(amount),
      unit,
      time: time ? new Date(time) : new Date(),
      createdAt: serverTimestamp(),
    });
  }, []);

  const deleteFeeding = useCallback(async (id) => {
    await deleteDoc(doc(db, "feedingLogs", id));
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-moon">🌙</div>
      <p>Loading Camila's tracker…</p>
    </div>
  );

  return (
    <div className="app">
      {/* Stars */}
      <div className="stars" aria-hidden="true">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            animationDelay: `${(i % 5) * 0.8}s`,
            animationDuration: `${2 + (i % 4)}s`,
            width: i % 7 === 0 ? "3px" : "2px",
            height: i % 7 === 0 ? "3px" : "2px",
            opacity: 0.1 + (i % 6) * 0.06,
          }} />
        ))}
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <span className="header-moon">🌙</span>
          <div>
            <h1 className="header-title">Camila's Sleep Tracker</h1>
            <p className="header-sub">Shared family tracker · syncs in real time</p>
          </div>
          <span className="header-moon" style={{ transform: "scaleX(-1)" }}>🌙</span>
        </div>
      </header>

      {/* Tab Nav */}
      <nav className="tab-nav">
        {[
          { key: "home", label: "🏠 Home" },
          { key: "feedings", label: "🍼 Feedings" },
          { key: "stats", label: "📊 Weekly" },
          { key: "log", label: "📋 History" },
        ].map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="main">
        {tab === "home" && (
          <div className="home-tab">
            {activeSleep ? (
              <ActiveSleepCard
                activeSleep={activeSleep}
                elapsed={elapsed}
                onStop={stopSleep}
                moods={MOODS}
              />
            ) : (
              <StartCard onStart={startSleep} />
            )}
            <RecentSummary sleepLogs={sleepLogs} feedingLogs={feedingLogs} />
          </div>
        )}
        {tab === "feedings" && (
          <FeedingLog
            feedingLogs={feedingLogs}
            onAdd={addFeeding}
            onDelete={deleteFeeding}
          />
        )}
        {tab === "stats" && (
          <WeeklyStats sleepLogs={sleepLogs} feedingLogs={feedingLogs} />
        )}
        {tab === "log" && (
          <SleepLog
            sleepLogs={sleepLogs}
            onDelete={deleteSleep}
            moods={MOODS}
          />
        )}
      </main>
    </div>
  );
}

function RecentSummary({ sleepLogs, feedingLogs }) {
  const todayStr = new Date().toDateString();
  const todayLogs = sleepLogs.filter(l => {
    const t = l.startTime?.toDate ? l.startTime.toDate() : new Date(l.startTime);
    return t.toDateString() === todayStr && l.endTime;
  });
  const totalMs = todayLogs.reduce((acc, l) => {
    const s = l.startTime?.toDate ? l.startTime.toDate() : new Date(l.startTime);
    const e = l.endTime?.toDate ? l.endTime.toDate() : new Date(l.endTime);
    return acc + (e - s);
  }, 0);
  const totalMin = Math.floor(totalMs / 60000);
  const h = Math.floor(totalMin / 60), m = totalMin % 60;

  const todayFeedings = feedingLogs.filter(f => {
    const t = f.time?.toDate ? f.time.toDate() : new Date(f.time);
    return t.toDateString() === todayStr;
  });
  const totalOz = todayFeedings.reduce((acc, f) => acc + (f.unit === "oz" ? f.amount : f.amount / 29.5735), 0);

  const naps = todayLogs.filter(l => l.type === "nap").length;
  const nights = todayLogs.filter(l => l.type === "night").length;

  return (
    <div className="summary-grid">
      <div className="summary-card">
        <div className="summary-label">Today's Sleep</div>
        <div className="summary-value">{totalMin > 0 ? `${h}h ${m}m` : "—"}</div>
        <div className="summary-sub">{naps} nap{naps !== 1 ? "s" : ""} · {nights} night</div>
      </div>
      <div className="summary-card">
        <div className="summary-label">Today's Feedings</div>
        <div className="summary-value">{todayFeedings.length > 0 ? `${totalOz.toFixed(1)} oz` : "—"}</div>
        <div className="summary-sub">{todayFeedings.length} bottle{todayFeedings.length !== 1 ? "s" : ""} today</div>
      </div>
    </div>
  );
}
