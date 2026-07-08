import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  refreshToken: { type: String, default: null },
  profile: {
    targetRole: { type: String, default: "" },
    targetCompanies: [{ type: String }],
    experience: { type: String, default: "fresher" },
  },
  resume: {
    url: { type: String, default: null },
    extractedText: { type: String, default: null },
    uploadedAt: { type: Date, default: null },
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);