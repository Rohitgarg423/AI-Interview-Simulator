"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "@/lib/useAuth";
import { apiFetch } from "@/lib/api";
import Navbar from "@/app/components/Navbar";

export default function HistoryPage() {
  const { user, token, loading, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchSessions = async () => {
      try {
        const res = await apiFetch("/api/progress");
        const data = await res.json();
        setSessions(data.progress?.sessionHistory?.reverse() ?? []);
      } catch {
        console.error("Failed to fetch sessions");
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSessions();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <Navbar user={user} logout={logout} />

      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Interview History</h1>
          <p className="text-gray-400 mt-1">All your past interview sessions</p>
        </div>

        {sessionsLoading ? (
          <p className="text-gray-400">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No sessions yet.</p>
            <Link href="/interview">
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition text-sm">
                Start Your First Interview
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session, i) => (
              <div
                key={i}
                onClick={() => setSelected(selected === i ? null : i)}
                className="bg-gray-900 border border-gray-800 hover:border-indigo-800 rounded-2xl p-6 cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{session.role} — {session.company}</p>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {session.sessionId?.type ?? "Mixed"} · {new Date(session.date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${session.score >= 7 ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                      session.score >= 5 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                    {session.score}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}