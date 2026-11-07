import test from 'node:test';
import assert from 'node:assert/strict';
import { CASES } from './cases.js';
import { assessExplanation, runCaseTests } from './caseEngine.js';
import { assessStructuredReport, simulateAiRetrieval, simulateBankHeist } from './investigationEngine.js';

for (const item of CASES) {
  test(`${item.id} reference repair passes its controlled fixtures`, () => {
    assert.equal(runCaseTests(item, item.fixedCode).passed, true);
  });
  test(`${item.id} original repair does not clear every controlled fixture`, () => {
    assert.equal(runCaseTests(item, item.starterCode).passed, false);
  });
  test(`${item.id} explanation needs two linked evidence items`, () => {
    const report = assessExplanation(item, item.diagnosis, [0, 1]);
    assert.equal(report.passed, true);
    assert.equal(assessExplanation(item, item.diagnosis, [0]).passed, false);
  });
}

test('CCS-101 simulated bank repair fails without protections and passes with both protections', () => {
  assert.equal(simulateBankHeist({}).passed, false);
  assert.equal(simulateBankHeist({ idempotency: true }).passed, false);
  assert.equal(simulateBankHeist({ idempotency: true, atomic: true }).passed, true);
});

test('CCS-101 structured report requires the right cause, linked evidence, and repair', () => {
  const bank = CASES.find(item => item.id === 'CCS-101');
  const report = { fault: 'missing-idempotency', mechanism: 'duplicate-race', repair: 'atomic-idempotency' };
  assert.equal(assessStructuredReport(bank, report, [0, 2]).passed, true);
  assert.equal(assessStructuredReport(bank, report, [0, 1]).passed, false);
});

test('CCS-102 structured report requires evidence for the SQL conclusion', () => {
  const records = CASES.find(item => item.id === 'CCS-102');
  const report = { fault: 'mutually-exclusive-filter', mechanism: 'empty-result-set', repair: 'select-published-only' };
  assert.equal(assessStructuredReport(records, report, [0, 1]).passed, true);
  assert.equal(assessStructuredReport(records, { ...report, repair: 'restart-the-server' }, [0, 1]).passed, false);
});

test('CCS-103 retrieval simulation rejects stale answers and requires an auditable response', () => {
  assert.equal(simulateAiRetrieval({}).passed, false);
  assert.equal(simulateAiRetrieval({ officialOnly: true, latestFirst: true, citation: true, safeUnknown: true }).passed, true);
});
