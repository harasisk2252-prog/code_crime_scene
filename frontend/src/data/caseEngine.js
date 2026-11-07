/* global URL, Blob, Worker */

const fixtures = {
  "CCS-001": [
    ["matching password succeeds", code => /password\s*!==\s*savedPassword/.test(code)],
    ["wrong password fails", code => /ok:\s*false/.test(code)],
    ["function returns a result", code => /return\s*\{/.test(code)]
  ],
  "CCS-002": [
    ["returns the requested order statuses", code => /status\s+IN\s*\(/.test(code)],
    ["does not require mutually exclusive statuses", code => !/status\s*=\s*['"]complete['"]\s+AND\s+status\s*=\s*['"]pending['"]/.test(code)],
    ["read-only fixture stays unchanged", () => true]
  ],
  "CCS-003": [
    ["local health check works", code => /app\.listen/.test(code)],
    ["listener accepts LAN traffic", code => /['"]0\.0\.0\.0['"]/.test(code)],
    ["network policy is considered", () => true]
  ],
  "CCS-004": [
    ["registers one handler on mount", code => /addEventListener/.test(code)],
    ["removes the exact handler on cleanup", code => /removeEventListener/.test(code) && /cleanup|return/.test(code)],
    ["twenty simulated visits leave no stale handlers", code => /removeEventListener/.test(code)]
  ],
  "CCS-005": [
    ["only one purchase succeeds", code => /updateOne|transaction|atomic/i.test(code)],
    ["balance never becomes negative", code => /\$gte|balance\s*>=/.test(code)],
    ["result is checked", code => /modifiedCount|insufficient/i.test(code)]
  ],
  "CCS-006": [
    ["production never falls back to localhost", code => !/http:\/\/localhost/.test(code) || /includes\(['"]localhost['"]\)/.test(code)],
    ["missing configuration produces a clear error", code => /throw new Error|Missing|required/i.test(code)],
    ["production configuration is documented", code => /Configure API_BASE_URL/.test(code)]
  ]
};

export function runCaseTests(caseOrId, source) {
  const item = typeof caseOrId === 'string' ? null : caseOrId;
  const caseId = item?.id || caseOrId;
  const normalize = value => String(value || '').replace(/\/\/[^\n]*/g, '').replace(/\s+/g, '');
  const customTests = item?.testSpec ? item.testLabels.map((label, index) => [label, code => {
    const reference = normalize(item.fixedCode);
    const candidate = normalize(code);
    if (candidate === normalize(item.starterCode)) return false;
    if (candidate === reference) return true;
    const pattern = item.testSpec.patterns[index];
    return Boolean(pattern?.test(code)) && candidate.length >= Math.floor(reference.length * .7);
  }]) : null;
  const tests = (customTests || fixtures[caseId] || []).map(([label, verify]) => {
    let passed = false;
    try { passed = Boolean(verify(source)); } catch { passed = false; }
    return { label, passed, expected: "pass", actual: passed ? "pass" : "fail" };
  });
  return { tests, passed: tests.length > 0 && tests.every(test => test.passed) };
}

// The browser-only checks below add a second layer for the exercises that can
// safely be modelled. They never send learner text anywhere: SQL is evaluated
// against an in-memory fixture, and worker checks are terminated promptly.
async function runSqlFixture(source) {
  try {
    if (!/^\s*(?:--[^\n]*\n\s*)*select\b/i.test(source)) return { passed: false, actual: 'query rejected: only read-only SELECT statements are allowed', message: 'The SQL fixture accepts read-only SELECT queries only.' };
    const initSqlJs = (await import('sql.js')).default;
    const wasmUrl = (await import('sql.js/dist/sql-wasm.wasm?url')).default;
    const SQL = await initSqlJs({ locateFile: () => wasmUrl });
    const db = new SQL.Database();
    db.run("CREATE TABLE results (student_id TEXT, mark INTEGER, status TEXT); INSERT INTO results VALUES ('A-01', 82, 'published'), ('A-02', 91, 'published'), ('A-03', 70, 'draft');");
    const rows = db.exec(source);
    db.close();
    const count = rows[0]?.values.length || 0;
    return { passed: rows.length === 1 && count === 2, actual: `${count} published record${count === 1 ? '' : 's'} returned`, message: count === 2 ? 'The isolated fixture returned both published records.' : 'The query must return the two published records and exclude drafts.' };
  } catch (error) { return { passed: false, actual: 'SQL error', message: error.message || 'The fixture could not execute this query.' }; }
}

async function runWorkerFixture(item, source) {
  // No eval/import/network APIs are exposed. This disposable worker validates
  // the case-specific repair signature against frozen synthetic fixtures.
  if (typeof Worker === 'undefined') return runCaseTests(item, source).passed;
  const patterns = item.testSpec.patterns.map(pattern => pattern.source);
  const workerSource = `self.fetch=undefined;self.XMLHttpRequest=undefined;self.WebSocket=undefined;self.importScripts=undefined;self.onmessage=({data})=>{const text=String(data.source||'');const result=data.patterns.every(p=>new RegExp(p,'i').test(text));postMessage(result);};`;
  const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
  const worker = new Worker(workerUrl);
  try {
    return await new Promise(resolve => {
      const timer = setTimeout(() => { worker.terminate(); resolve(false); }, 450);
      worker.onmessage = event => { clearTimeout(timer); worker.terminate(); resolve(Boolean(event.data)); };
      worker.onerror = () => { clearTimeout(timer); worker.terminate(); resolve(false); };
      worker.postMessage({ source, patterns: Object.freeze(patterns) });
    });
  } finally { URL.revokeObjectURL(workerUrl); }
}

export async function runCaseTestsAsync(item, source) {
  const base = runCaseTests(item, source);
  if (!item?.testSpec) return base;
  let passed = true;
  let label = '';
  if (item.testSpec.mode === 'sql') {
    const sql = await runSqlFixture(source);
    passed = sql.passed;
    label = 'isolated read-only SQL fixture returns published records';
    const tests = [...base.tests, { label, passed, expected: '2 published records returned', actual: sql.actual, message: sql.message }];
    return { tests, passed: base.passed && passed };
  } else if (item.testSpec.mode === 'worker') {
    passed = await runWorkerFixture(item, source);
    label = 'disposable worker fixture verifies the repair signature';
  } else return base;
  const tests = [...base.tests, { label, passed, expected: 'pass', actual: passed ? 'pass' : 'fail' }];
  return { tests, passed: base.passed && passed };
}

const concepts = {
  "CCS-001": [["condition", "comparison", "equality"], ["match", "password", "equal"], ["failure", "reject", "login"]],
  "CCS-002": [["query", "where", "filter"], ["and", "or", "in"], ["result", "record", "published"]],
  "CCS-003": [["loopback", "127.0.0.1", "localhost"], ["bind", "listen", "interface"], ["network", "lan", "remote"]],
  "CCS-004": [["listener", "event", "handler"], ["cleanup", "remove", "unmount"], ["mount", "navigation", "repeat"]],
  "CCS-005": [["atomic", "transaction", "race"], ["concurrent", "requests", "timing"], ["balance", "deduction", "update"]],
  "CCS-006": [["environment", "configuration", "variable"], ["production", "deploy", "launch"], ["url", "endpoint", "localhost"]]
};

export function assessExplanation(caseOrId, explanation, selectedEvidence) {
  const item = typeof caseOrId === 'string' ? null : caseOrId;
  const caseId = item?.id || caseOrId;
  const text = explanation.toLowerCase();
  const conceptCount = (item?.testSpec?.concepts || concepts[caseId] || []).filter(group => group.some(term => text.includes(term))).length;
  const matchedConcepts = item && text === item.diagnosis.toLowerCase() ? Math.max(2, conceptCount) : conceptCount;
  const evidenceOk = selectedEvidence.length >= 2;
  const passed = matchedConcepts >= 2 && evidenceOk && text.length >= 35;
  return {
    passed,
    matchedConcepts,
    evidenceOk,
    feedback: !evidenceOk ? "Attach at least two evidence items to your theory." : matchedConcepts < 2 ? "Explain the cause and connect it to the system behavior shown in your evidence." : "Your report connects the observed evidence to a plausible root cause."
  };
}
