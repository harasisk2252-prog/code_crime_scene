import mongoose from "mongoose";

const caseSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: String, category: String, difficulty: String, duration: String,
  summary: String, incident: String, environment: String,
  evidence: [mongoose.Schema.Types.Mixed],
  hypotheses: [mongoose.Schema.Types.Mixed],
  diagnosis: String, solution: String, lesson: String,
  starterCode: String, fixedCode: String, testLabels: [String],
  xp: Number, accent: String
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  xp: { type: Number, default: 0 },
  solvedCases: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const CaseModel = mongoose.models.Case || mongoose.model("Case", caseSchema);
export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
