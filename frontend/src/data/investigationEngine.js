const bankTests = (plan = {}) => {
  const state = { balance: 100000, claims: new Set(), ledger: [] };
  const debit = (requestId, amount) => {
    if (plan.idempotency && state.claims.has(requestId)) return { status: 'duplicate', balance: state.balance };
    if (plan.idempotency) state.claims.add(requestId);
    if (state.balance < amount) return { status: 'declined', balance: state.balance };
    // The atomic strategy prevents two requests from independently passing a stale balance check.
    if (!plan.atomic && state.ledger.length === 0) {
      state.ledger.push({ requestId, amount });
      return { status: 'pending', balance: state.balance };
    }
    state.balance -= amount;
    state.ledger.push({ requestId, amount });
    return { status: 'posted', balance: state.balance };
  };

  const first = debit('PAY-440', 50000);
  const duplicate = debit('PAY-440', 50000);
  if (first.status === 'pending' && duplicate.status === 'pending') {
    state.balance -= 100000;
    first.status = duplicate.status = 'posted';
  }
  const insufficient = debit('PAY-441', 150000);
  return { first, duplicate, insufficient, balance: state.balance, ledger: state.ledger };
};

export function simulateBankHeist(plan) {
  const result = bankTests(plan);
  const tests = [
    {
      label: 'Concurrent duplicate request posts only one fictional debit',
      expected: 'one posted transfer; balance ₹50,000',
      actual: `${result.ledger.length} ledger entries; balance ₹${result.balance.toLocaleString('en-IN')}`,
      passed: result.ledger.length === 1 && result.balance === 50000,
      message: result.ledger.length === 1 ? 'The duplicate request was prevented.' : 'Both requests reached the ledger; establish an idempotency claim before debiting.'
    },
    {
      label: 'Repeated request receives a safe duplicate response',
      expected: 'duplicate response', actual: result.duplicate.status,
      passed: result.duplicate.status === 'duplicate',
      message: result.duplicate.status === 'duplicate' ? 'The original result is preserved.' : 'A repeat request must be recognized before it can debit again.'
    },
    {
      label: 'Insufficient fictional balance remains protected',
      expected: 'declined; no negative balance', actual: `${result.insufficient.status}; balance ₹${result.balance.toLocaleString('en-IN')}`,
      passed: result.insufficient.status === 'declined' && result.balance >= 0,
      message: result.insufficient.status === 'declined' ? 'The balance invariant held.' : 'Check funds within the protected transaction path.'
    }
  ];
  return { tests, passed: tests.every(test => test.passed), simulation: result };
}

export function simulateAiRetrieval(plan = {}) {
  const documents = [
    { source: 'student-forum', official: false, publishedAt: '2026-11-01', text: 'Deadline: December 20' },
    { source: 'university-circular', official: true, publishedAt: '2026-11-05', text: 'Deadline: December 10' }
  ];
  const selected = plan.officialOnly ? documents.filter(doc => doc.official) : documents;
  const answer = plan.latestFirst ? [...selected].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0] : selected[0];
  const citation = plan.citation ? answer?.source : undefined;
  const tests = [
    { label: 'Uses the newest official circular', expected: 'Deadline: December 10', actual: answer?.text || 'no answer', passed: answer?.text === 'Deadline: December 10', message: answer?.text === 'Deadline: December 10' ? 'The retrieval fixture selected the current official document.' : 'The outdated forum document still wins retrieval.' },
    { label: 'Returns evidence for the answer', expected: 'university-circular citation', actual: citation || 'no citation', passed: citation === 'university-circular', message: citation ? 'The answer can be audited against its source.' : 'A trustworthy answer needs its source.' },
    { label: 'Handles no authoritative result safely', expected: 'unknown', actual: plan.safeUnknown ? 'unknown' : 'guessed answer', passed: Boolean(plan.safeUnknown), message: plan.safeUnknown ? 'The assistant can decline unsupported answers.' : 'Do not invent an answer when no official result exists.' }
  ];
  return { tests, passed: tests.every(test => test.passed) };
}

export function assessStructuredReport(item, report, selectedEvidence) {
  const rubric = item.diagnosisRubric;
  const missing = [];
  if (!rubric) return { passed: false, feedback: 'This case does not yet have a structured rubric.' };
  if (report.fault !== rubric.fault) missing.push('identify the underlying fault');
  if (report.mechanism !== rubric.mechanism) missing.push('explain how the fault caused the incident');
  if (!rubric.evidence.every(index => selectedEvidence.includes(index))) missing.push('attach the evidence that proves the theory');
  if (report.repair !== rubric.repair) missing.push('connect the repair to the fault');
  return {
    passed: missing.length === 0,
    missing,
    evidenceOk: !missing.includes('attach the evidence that proves the theory'),
    feedback: missing.length ? `Your report still needs to ${missing.join(', ')}.` : 'Your report links the cause, evidence, and repair.'
  };
}

export function buildCaseReport({ item, evidence, hintCount = 0, attempts = 1, tests }) {
  const rating = hintCount === 0 && attempts <= 1 ? 'Gold' : hintCount <= 1 && attempts <= 2 ? 'Silver' : 'Bronze';
  return {
    rating,
    rootCause: item.diagnosis,
    evidence: evidence.map(index => item.evidence[index]?.title).filter(Boolean),
    repair: item.solution,
    tests: tests.map(test => ({ label: test.label, passed: test.passed, actual: test.actual })),
    concept: item.lesson
  };
}

export function investigationStage({ selectedEvidence = [], hypothesis, report, tests }) {
  if (tests?.passed && report?.passed) return { id: 'closed', label: 'Case report ready', prompt: 'Review the learning summary and carry this pattern into the next case.' };
  if (tests && !tests.passed) return { id: 'repair', label: 'Repair verification', prompt: 'Read the first failed fixture. Which invariant did the observed output break?' };
  if (report?.passed) return { id: 'verification', label: 'Ready to verify', prompt: 'Your evidence-backed theory is ready. Run the controlled tests.' };
  if (hypothesis && selectedEvidence.length >= 2) return { id: 'reasoning', label: 'Reasoning chain', prompt: 'Explain how the selected evidence proves your theory and how the repair changes the outcome.' };
  if (selectedEvidence.length >= 2) return { id: 'theory', label: 'Form a theory', prompt: 'Which explanation accounts for both attached clues?' };
  return { id: 'evidence', label: 'Collect evidence', prompt: 'Open the evidence and attach two clues that belong to the same theory.' };
}
