"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/lib/useAuth";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";

const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "TCS", "Infosys", "Wipro", "General"];
const ROLES = ["Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "Data Scientist", "DevOps Engineer", "System Design Engineer"];
const TYPES = ["DSA", "HR", "System Design", "Mixed"];
const TOPICS = ["Operating Systems", "DBMS", "Computer Networks", "OOPs", "DSA", "Aptitude", "Puzzles"];
const QUESTION_FORMATS = ["Subjective", "MCQ", "Mixed"];
const NUM_QUESTIONS = [3, 5, 7, 10];

export default function InterviewPage() {
  const router = useRouter();
  const { token, loading } = useAuth();

  const [step, setStep] = useState("setup"); // setup → interview → evaluation
  const [form, setForm] = useState({
    mode: "company",        // "company" | "topic"
    role: "",
    company: "General",
    type: "Mixed",
    topic: "",
    questionFormat: "Subjective",
    numQuestions: 5,
  });
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleStart = async () => {
    if (form.mode === "company" && !form.role) {
      toast.error("Please select a target role");
      return;
    }
    if (form.mode === "topic" && !form.topic) {
      toast.error("Please select a topic");
      return;
    }

    setLoadingAI(true);

    try {
      const res = await apiFetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setStep("interview");

    } catch {
      toast.error("Failed to start interview. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSaveAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error("Please write an answer before continuing");
      return;
    }

    try {
      const res = await apiFetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionIndex: currentQ,
          answer: currentAnswer,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to save answer");
        return;
      }

      const newAnswers = [...answers];
      newAnswers[currentQ] = currentAnswer;
      setAnswers(newAnswers);
      setCurrentAnswer("");

      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setStep("review");
      }

    } catch {
      toast.error("Something went wrong.");
    }
  };

  const handleEvaluate = async () => {
    setLoadingAI(true);

    try {
      const res = await apiFetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setEvaluation(data);
      setStep("evaluation");

    } catch {
      toast.error("Failed to evaluate. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

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
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <span className="text-xl font-bold text-indigo-400">InterviewAI</span>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-lg transition text-sm"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-10">

        {/* STEP 1 — Setup */}
        {step === "setup" && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Setup Your Interview</h1>
            <p className="text-gray-400 mb-8">Choose how you want to practice today</p>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col gap-6">

              {/* Mode Toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Practice Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, mode: "company" })}
                    className={`py-3 rounded-xl text-sm font-medium transition border ${form.mode === "company"
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500"
                      }`}
                  >
                    Company Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, mode: "topic" })}
                    className={`py-3 rounded-xl text-sm font-medium transition border ${form.mode === "topic"
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500"
                      }`}
                  >
                    Topic Practice
                  </button>
                </div>
              </div>

              {/* Company Mode Fields */}
              {form.mode === "company" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Target Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                    >
                      <option value="">Select a role</option>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Target Company</label>
                    <select
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                    >
                      {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Interview Type</label>
                    <div className="grid grid-cols-4 gap-3">
                      {TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({ ...form, type: t })}
                          className={`py-3 rounded-xl text-sm font-medium transition border ${form.type === t
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500"
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Topic Mode Fields */}
              {form.mode === "topic" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Select Topic</label>
                  <div className="grid grid-cols-2 gap-3">
                    {TOPICS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, topic: t })}
                        className={`py-3 rounded-xl text-sm font-medium transition border ${form.topic === t
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500"
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Format */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Question Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {QUESTION_FORMATS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setForm({ ...form, questionFormat: f })}
                      className={`py-3 rounded-xl text-sm font-medium transition border ${form.questionFormat === f
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500"
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Number of Questions</label>
                <div className="grid grid-cols-4 gap-3">
                  {NUM_QUESTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, numQuestions: n })}
                      className={`py-3 rounded-xl text-sm font-medium transition border ${form.numQuestions === n
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500"
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={loadingAI}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition mt-2"
              >
                {loadingAI ? "Generating questions..." : "Start Interview →"}
              </button>

            </div>
          </div>
        )}

        {/* STEP 2 — Interview */}
        {step === "interview" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold">Question {currentQ + 1} of {questions.length}</h1>
              <span className="text-sm text-gray-400">{form.type} · {form.company}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-8">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all"
                style={{ width: `${((currentQ) / questions.length) * 100}%` }}
              />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
              <p className="text-lg font-medium leading-relaxed">{questions[currentQ]}</p>
            </div>

            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm resize-none mb-6"
            />

            <div className="flex justify-between">
              {currentQ > 0 && (
                <button
                  onClick={() => {
                    setCurrentQ(currentQ - 1);
                    setCurrentAnswer(answers[currentQ - 1]);
                  }}
                  className="px-6 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-xl transition text-sm"
                >
                  ← Previous
                </button>
              )}
              <button
                onClick={handleSaveAnswer}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition text-sm ml-auto"
              >
                {currentQ < questions.length - 1 ? "Next Question →" : "Review Answers →"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Review */}
        {step === "review" && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Review Your Answers</h1>
            <p className="text-gray-400 mb-8">Check your answers before submitting for evaluation</p>

            <div className="flex flex-col gap-4 mb-8">
              {questions.map((q, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <p className="text-sm text-indigo-400 font-medium mb-2">Question {i + 1}</p>
                  <p className="font-medium mb-3">{q}</p>
                  <p className="text-gray-300 text-sm bg-gray-800 rounded-xl p-3">{answers[i]}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleEvaluate}
              disabled={loadingAI}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition"
            >
              {loadingAI ? "AI is evaluating your answers..." : "Submit for Evaluation →"}
            </button>
          </div>
        )}

        {/* STEP 4 — Evaluation */}
        {step === "evaluation" && evaluation && (
          <div>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
              <div className={`inline-block px-6 py-3 rounded-2xl text-4xl font-bold mt-4 ${evaluation.overallScore >= 7 ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                evaluation.overallScore >= 5 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                  "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                {evaluation.overallScore}/10
              </div>
              <p className="text-gray-300 mt-4 max-w-xl mx-auto">{evaluation.summary}</p>
            </div>

            {/* Per question feedback */}
            <div className="flex flex-col gap-4 mb-8">
              {questions.map((q, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-indigo-400 font-medium">Question {i + 1}</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${evaluation.evaluations[i]?.score >= 7 ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                      evaluation.evaluations[i]?.score >= 5 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                      {evaluation.evaluations[i]?.score}/10
                    </span>
                  </div>
                  <p className="font-medium mb-2">{q}</p>
                  <p className="text-gray-400 text-sm bg-gray-800 rounded-xl p-3 mb-3">{answers[i]}</p>
                  <p className="text-gray-300 text-sm">{evaluation.evaluations[i]?.feedback}</p>
                </div>
              ))}
            </div>

            {/* Weak / Strong topics */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-3 text-red-400">Topics to Improve</h3>
                <div className="flex flex-wrap gap-2">
                  {evaluation.weakTopics?.map((t) => (
                    <span key={t} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm">{t}</span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-3 text-green-400">Strong Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {evaluation.strongTopics?.map((t) => (
                    <span key={t} className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-sm">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </main>
    </div>
  );
}