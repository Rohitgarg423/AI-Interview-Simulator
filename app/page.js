import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-gray-950 min-h-screen text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <span className="text-xl font-bold text-indigo-400">InterviewAI</span>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white transition">
            Login
          </Link>
          <Link href="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <div className="text-sm bg-indigo-500/10 text-indigo-400 px-4 py-1 rounded-full border border-indigo-500/20">
          Powered by Claude AI + Gemini
        </div>
        <h1 className="text-5xl font-bold leading-tight max-w-3xl">
          Ace Your Next Interview with{" "}
          <span className="text-indigo-400">AI-Powered</span> Practice
        </h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Upload your resume, choose your target company and role, and practice with personalized interview questions. Get instant AI feedback on every answer.
        </p>
        <div className="flex gap-4 mt-4">
          <Link href="/register">
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all text-sm">
              Start Practicing Free
            </button>
          </Link>
          <Link href="/login">
            <button className="px-6 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-xl transition-all text-sm">
              Sign In
            </button>
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-24 max-w-5xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-3">
          <span className="text-3xl">📄</span>
          <h3 className="text-lg font-semibold">Resume-Based Questions</h3>
          <p className="text-gray-400 text-sm">AI reads your resume and generates questions tailored to your experience and target role.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-3">
          <span className="text-3xl">⚡</span>
          <h3 className="text-lg font-semibold">Real-time Feedback</h3>
          <p className="text-gray-400 text-sm">Get scored and detailed feedback on every answer immediately after your session.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-3">
          <span className="text-3xl">📈</span>
          <h3 className="text-lg font-semibold">Track Progress</h3>
          <p className="text-gray-400 text-sm">Monitor your improvement over time with scores, weak topics, and session history.</p>
        </div>
      </section>

    </div>
  );
}