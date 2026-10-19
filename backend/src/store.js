import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cases } from "./cases.js";
import { CaseModel } from "./models.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(here, "data", "progress.json");
let mongoReady = false;

export function setMongoReady(value) { mongoReady = value; }
export function isMongoReady() { return mongoReady; }

async function readData() {
  try { return JSON.parse(await fs.readFile(dataPath, "utf8")); }
  catch { return { users: [], progress: {} }; }
}
async function writeData(data) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf8");
}

export async function getCases() {
  if (mongoReady) {
    const count = await CaseModel.countDocuments();
    if (!count) await CaseModel.insertMany(cases);
    return await CaseModel.find({}, { _id: 0, __v: 0 }).lean();
  }
  return cases;
}
export async function getCase(id) {
  const all = await getCases();
  return all.find(c => c.id === id);
}
export async function getProgress(key) {
  const data = await readData();
  return data.progress[key] || { xp: 0, solvedCases: [], attempts: {}, hintsUsed: {}, lastSolvedDate: null };
}
export async function saveProgress(key, progress) {
  const data = await readData();
  data.progress[key] = progress;
  await writeData(data);
  return progress;
}
export async function getOrCreateUser(username, email) {
  const data = await readData();
  let user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = { username, email, createdAt: new Date().toISOString() };
    data.users.push(user);
    await writeData(data);
  }
  return user;
}
