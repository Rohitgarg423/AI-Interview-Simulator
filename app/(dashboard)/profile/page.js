"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "@/lib/useAuth";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";
import Navbar from "@/app/components/Navbar";

const ROLES = ["Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "Data Scientist", "DevOps Engineer", "System Design Engineer"];
const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "TCS", "Infosys", "Wipro"];
const EXPERIENCE = ["Fresher", "1 year", "2 years", "3+ years"];

export default function ProfilePage() {
  const { user, token, loading, logout } = useAuth();
  const [profile, setProfile] = useState({ targetRole: "", targetCompanies: [], experience: "Fresher" });
  const [resume, setResume] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await apiFetch("/api/user/profile");
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
        if (data.resume) setResume(data.resume);
      } catch {
        console.error("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, [token]);

  const handleCompanyToggle = (company) => {
    setProfile((prev) => ({
      ...prev,
      targetCompanies: prev.targetCompanies.includes(company)
        ? prev.targetCompanies.filter((c) => c !== company)
        : [...prev.targetCompanies, company],
    }));
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const res = await apiFetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setResume({ url: data.url, uploadedAt: new Date() });
      setResumeFile(null);
      toast.success("Resume uploaded successfully!");

    } catch {
      toast.error("Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      const res = await apiFetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("Profile saved!");

    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
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
      <Navbar user={user} logout={logout} />

      <main className="max-w-3xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-400 mt-1">Set your target role and upload your resume for personalized questions</p>
        </div>

        {/* Account Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Account Info</h2>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-400">Name: <span className="text-white">{user?.name}</span></p>
            <p className="text-sm text-gray-400">Email: <span className="text-white">{user?.email}</span></p>
          </div>
        </div>

        {/* Resume Upload */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Resume</h2>

          {resume?.url && (
            <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm flex items-center justify-between">
              <span>✅ Resume uploaded — {new Date(resume.uploadedAt).toLocaleDateString()}</span>
              <a href={resume.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">
                View
              </a>
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-sm cursor-pointer"
            />
            <button
              onClick={handleResumeUpload}
              disabled={!resumeFile || uploading}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {/* Target Role */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Target Role</h2>
          <select
            value={profile.targetRole}
            onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
          >
            <option value="">Select your target role</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Target Companies */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Target Companies</h2>
          <div className="flex flex-wrap gap-2">
            {COMPANIES.map((company) => (
              <button
                key={company}
                type="button"
                onClick={() => handleCompanyToggle(company)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${profile.targetCompanies.includes(company)
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500"
                  }`}
              >
                {company}
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Experience Level</h2>
          <div className="flex gap-3">
            {EXPERIENCE.map((exp) => (
              <button
                key={exp}
                type="button"
                onClick={() => setProfile({ ...profile, experience: exp })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${profile.experience === exp
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500"
                  }`}
              >
                {exp}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

      </main>
    </div>
  );
}