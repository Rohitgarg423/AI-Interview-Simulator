import mongoose from "mongoose";

const QuestionAnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  format: { type: String, enum: ["MCQ", "Subjective"], default: "Subjective" },
  options: [{ type: String }],           
  correctAnswer: { type: String, default: "" },
  answer: { type: String, default: "" }, 
  status: { type: String, enum: ["not-answered", "answered", "marked-for-review"], default: "not-answered" },
  score: { type: Number, default: null },
  feedback: { type: String, default: "" },
});

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mode: { type: String, enum: ["company", "topic"], default: "company" },

  // company mode fields
  company: { type: String, default: "General" },
  role: { type: String, default: "" },

  // topic mode fields
  topic: { type: String, default: "" },

  type: { type: String, enum: ["DSA", "HR", "System Design", "Mixed"], default: "Mixed" },
  questionFormat: { type: String, enum: ["MCQ", "Subjective", "Mixed"], default: "Subjective" },

  questionsAnswers: [QuestionAnswerSchema],
  overallScore: { type: Number, default: null },
  status: { type: String, enum: ["ongoing", "completed"], default: "ongoing" },
  summary: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);