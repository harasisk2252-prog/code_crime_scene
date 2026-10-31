import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import { detectiveProgress, demoUsers } from "../../db/schema.js";
import { CASES } from "../../src/data/cases.js";

function emptyProgress() {
  return { xp: 0, solvedCases: [], attempts: {}, hintsUsed: {}, lastSolvedDate: null };
}

function counters(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, count]) =>
    CASES.some(c => c.id === key) && Number.isSafeInteger(count) && Number(count) >= 0
  ));
}

export default async (req: Request) => {
  const path = new URL(req.url).pathname;
  const json = (value: unknown, status = 200) => Response.json(value, {
    status, headers: { "Cache-Control": "no-store" },
  });
  try {
    if (path === "/api/health" && req.method === "GET") {
      return json({ ok: true, service: "Code Crime Scene API" });
    }
    if (path === "/api/cases" && req.method === "GET") {
      return json(CASES.map(c => ({
        id: c.id, title: c.title, category: c.category, difficulty: c.difficulty,
        duration: c.duration, xp: c.xp, accent: c.accent, summary: c.summary,
        evidenceCount: c.evidence.length,
      })));
    }
    if (path.startsWith("/api/cases/") && req.method === "GET") {
      const found = CASES.find(c => c.id === path.slice("/api/cases/".length));
      return found ? json(found) : json({ message: "Case not found" }, 404);
    }
    const match = path.match(/^\/api\/progress\/([a-zA-Z0-9_-]{1,100})$/);
    if (match) {
      if (!["GET", "POST"].includes(req.method)) return json({ message: "Method not allowed" }, 405);
      const db = getDb();
      const key = match[1];
      if (req.method === "GET") {
        const [row] = await db.select().from(detectiveProgress).where(eq(detectiveProgress.key, key));
        return json(row?.progress ?? emptyProgress());
      }
      const body = await req.json();
      if (!body || typeof body !== "object" || Array.isArray(body)) return json({ message: "Invalid progress" }, 400);
      const solvedCases = CASES.filter(c => Array.isArray(body.solvedCases) && body.solvedCases.includes(c.id)).map(c => c.id);
      const progress = {
        xp: CASES.filter(c => solvedCases.includes(c.id)).reduce((sum, c) => sum + c.xp, 0),
        solvedCases, attempts: counters(body.attempts), hintsUsed: counters(body.hintsUsed),
        lastSolvedDate: typeof body.lastSolvedDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.lastSolvedDate) ? body.lastSolvedDate : null,
      };
      await db.insert(detectiveProgress).values({ key, progress }).onConflictDoUpdate({
        target: detectiveProgress.key, set: { progress, updatedAt: new Date() },
      });
      return json(progress);
    }
    if (path === "/api/demo-user" && req.method === "POST") {
      const body = await req.json();
      const username = String(body?.username || "Detective").trim().slice(0, 30) || "Detective";
      const email = String(body?.email || "detective@demo.local").trim().slice(0, 100).toLowerCase();
      const db = getDb();
      await db.insert(demoUsers).values({ email, username }).onConflictDoNothing();
      const [user] = await db.select().from(demoUsers).where(eq(demoUsers.email, email));
      return json({ username: user.username, email: user.email, mode: "demo" });
    }
    return json({ message: "API route not found" }, 404);
  } catch (error) {
    if (error instanceof SyntaxError) return json({ message: "Invalid JSON body" }, 400);
    return json({ message: "The API is temporarily unavailable. Please try again." }, 503);
  }
};

export const config: Config = { path: "/api/*" };
