"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "@/lib/useAuth";
import { apiFetch } from "@/lib/api";
import Navbar from "@/app/components/Navbar";

export default function DashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchProgress = async () => {
      try {
        const res = await apiFetch("/api/progress");
        const data = await res.json();
        setProgress(data.progress);
      } catch {
        console.error("Failed to fetch progress");
      } finally {
        setProgressLoading(false);
      }
    };

    fetchProgress();
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

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-gray-400 mt-1">Ready to practice? Let's ace that interview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-indigo-400">
              {progressLoading ? "—" : progress?.totalSessions ?? 0}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Average Score</p>
            <p className="text-3xl font-bold text-indigo-400">
              {progressLoading ? "—" : progress?.averageScore ? `${progress.averageScore}/10` : "N/A"}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Weak Topics</p>
            <p className="text-3xl font-bold text-indigo-400">
              {progressLoading ? "—" : progress?.weakTopics?.length ?? 0}
            </p>
          </div>
        </div>

        {/* Start Interview */}
        <div className="bg-indigo-950 border border-indigo-800 rounded-2xl p-8 mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Start a New Interview</h2>
            <p className="text-indigo-300 text-sm">Practice DSA, HR, or System Design with AI</p>
          </div>
          <Link href="/interview">
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition text-sm">
              Start Now →
            </button>
          </Link>
        </div>

        {/* Weak Topics */}
        {progress?.weakTopics?.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-10">
            <h2 className="text-lg font-semibold mb-4">Topics to Improve</h2>
            <div className="flex flex-wrap gap-2">
              {progress.weakTopics.map((topic) => (
                <span key={topic} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Sessions</h2>
          {progressLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : progress?.sessionHistory?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {[...progress.sessionHistory].reverse().slice(0, 5).map((session, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{session.role} — {session.company}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{new Date(session.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${session.score >= 7 ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                    session.score >= 5 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                      "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                    {session.score}/10
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No sessions yet. Start your first interview!</p>
          )}
        </div>

      </main>
    </div>
  );
}