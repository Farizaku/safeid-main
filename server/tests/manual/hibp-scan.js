#!/usr/bin/env node

const { requestJson } = require('./http-client');

const defaultEmails = [
  { alias: 'account-exists', email: 'account-exists@hibp-integration-tests.com' },
  { alias: 'multiple-breaches', email: 'multiple-breaches@hibp-integration-tests.com' },
  {
    alias: 'not-active-and-active-breach',
    email: 'not-active-and-active-breach@hibp-integration-tests.com',
  },
  { alias: 'not-active-breach', email: 'not-active-breach@hibp-integration-tests.com' },
  { alias: 'opt-out', email: 'opt-out@hibp-integration-tests.com' },
  { alias: 'opt-out-breach', email: 'opt-out-breach@hibp-integration-tests.com' },
  {
    alias: 'paste-sensitive-breach',
    email: 'paste-sensitive-breach@hibp-integration-tests.com',
  },
  {
    alias: 'permanent-opt-out',
    email: 'permanent-opt-out@hibp-integration-tests.com',
  },
  {
    alias: 'sensitive-and-other-breaches',
    email: 'sensitive-and-other-breaches@hibp-integration-tests.com',
  },
  { alias: 'sensitive-breach', email: 'sensitive-breach@hibp-integration-tests.com' },
  { alias: 'spam-list-only', email: 'spam-list-only@hibp-integration-tests.com' },
  { alias: 'spam-list-and-others', email: 'spam-list-and-others@hibp-integration-tests.com' },
  {
    alias: 'subscription-free-and-other-breaches',
    email: 'subscription-free-and-other-breaches@hibp-integration-tests.com',
  },
  { alias: 'stealer-log', email: 'stealer-log@hibp-integration-tests.com' },
  { alias: 'subscription-free-breach', email: 'subscription-free-breach@hibp-integration-tests.com' },
  { alias: 'unverified-breach', email: 'unverified-breach@hibp-integration-tests.com' },
];

function fail(message) {
  console.error(`
❌ ${message}`);
  process.exitCode = 1;
}

function parseEmailsFromEnv() {
  const value = process.env.HIBP_TEST_EMAILS;
  if (!value) {
    return defaultEmails;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((email) => ({ alias: email.split('@')[0], email }));
}

async function pollScanResult(jobId, token) {
  const deadline = Date.now() + 30000;

  while (Date.now() < deadline) {
    const result = await requestJson(`/api/v1/scan/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (result.status === 200 && result.body?.processedAt) {
      return result.body;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Timed out waiting for scan ${jobId}`);
}

async function main() {
  console.log('[HIBP TEST] Starting manual HIBP scan flow');
  console.log(`[HIBP TEST] Base URL: ${process.env.TEST_API_BASE_URL || process.env.APP_URL || 'http://localhost:3000'}`);
  console.log(`[HIBP TEST] HIBP_API_KEY set: ${Boolean(process.env.HIBP_API_KEY)}`);

  const uniqueEmail = `hibp-${Date.now()}@test.local`;
  const password = 'TestPassword123';

  const signup = await requestJson('/api/v1/auth/signup', {
    method: 'POST',
    body: { email: uniqueEmail, password },
  });

  if (signup.status !== 201 || !signup.body?.access_token) {
    fail(`Unable to create test user: ${JSON.stringify(signup.body)}`);
    return;
  }

  const token = signup.body.access_token;
  const emails = parseEmailsFromEnv();

  for (const testCase of emails) {
    console.log(`\n[SCAN] ${testCase.alias} -> ${testCase.email}`);

    const submit = await requestJson('/api/v1/scan', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { email: testCase.email },
    });

    console.log(`[SUBMIT] status=${submit.status}`);
    if (submit.status !== 201 || !submit.body?.jobId) {
      fail(`Failed to submit scan for ${testCase.email}: ${JSON.stringify(submit.body)}`);
      return;
    }

    const result = await pollScanResult(submit.body.jobId, token);
    console.log(`[RESULT] classification=${result.classification} breaches=${result.breachesFound} riskScore=${result.riskScore}`);
  }

  console.log('\n[HIBP TEST] Completed successfully');
}

main().catch((error) => {
  fail(error.message);
});