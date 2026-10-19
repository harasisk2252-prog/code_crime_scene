import { Router } from "express";
import { getCases, getCase, getProgress, saveProgress, getOrCreateUser } from "../store.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, service: "Code Crime Scene API" }));

router.get("/cases", async (_req, res, next) => {
  try {
    const all = await getCases();
    res.json(all.map(c => ({
      id: c.id, title: c.title, category: c.category, difficulty: c.difficulty,
      duration: c.duration, xp: c.xp, accent: c.accent, summary: c.summary,
      evidenceCount: c.evidence?.length ?? 0
    })));
  } catch (e) { next(e); }
});

router.get("/cases/:id", async (req, res, next) => {
  try {
    const found = await getCase(req.params.id);
    if (!found) return res.status(404).json({ message: "Case not found" });
    res.json(found);
  } catch (e) { next(e); }
});

router.post("/progress/:key", async (req, res, next) => {
  try {
    const key = String(req.params.key).slice(0, 100);
    const existing = await getProgress(key);
    const { solvedCases = [], xp = 0, attempts = {}, hintsUsed = {}, lastSolvedDate = null } = req.body || {};
    const safe = {
      xp: Math.max(0, Math.min(Number(xp) || 0, 100000)),
      solvedCases: Array.isArray(solvedCases) ? [...new Set(solvedCases.filter(x => typeof x === "string"))].slice(0, 100) : existing.solvedCases,
      attempts: typeof attempts === "object" && attempts ? attempts : existing.attempts,
      hintsUsed: typeof hintsUsed === "object" && hintsUsed ? hintsUsed : existing.hintsUsed,
      lastSolvedDate: typeof lastSolvedDate === "string" ? lastSolvedDate : existing.lastSolvedDate
    };
    await saveProgress(key, safe);
    res.json(safe);
  } catch (e) { next(e); }
});

router.get("/progress/:key", async (req, res, next) => {
  try { res.json(await getProgress(String(req.params.key).slice(0, 100))); }
  catch (e) { next(e); }
});

router.post("/demo-user", async (req, res, next) => {
  try {
    const username = String(req.body?.username || "Detective").trim().slice(0, 30) || "Detective";
    const email = String(req.body?.email || "detective@demo.local").trim().slice(0, 100).toLowerCase();
    const user = await getOrCreateUser(username, email);
    res.json({ username: user.username, email: user.email, mode: "demo" });
  } catch (e) { next(e); }
});

export default router;
