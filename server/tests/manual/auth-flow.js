#!/usr/bin/env node

const { requestJson } = require('./http-client');

function fail(message) {
  console.error(`
❌ ${message}`);
  process.exitCode = 1;
}

function success(message) {
  console.log(`✅ ${message}`);
}

async function main() {
  const uniqueEmail = `user-${Date.now()}@test.local`;
  const password = 'TestPassword123';
  let token = '';

  console.log('[AUTH TEST] Starting manual auth flow');
  console.log(`[AUTH TEST] Base URL: ${process.env.TEST_API_BASE_URL || process.env.APP_URL || 'http://localhost:3000'}`);
  console.log(`[AUTH TEST] Email: ${uniqueEmail}\n`);

  const signup = await requestJson('/api/v1/auth/signup', {
    method: 'POST',
    body: { email: uniqueEmail, password },
  });

  console.log(`[SIGNUP] status=${signup.status}`);
  if (signup.status !== 201 || !signup.body?.access_token) {
    fail(`Signup failed: ${JSON.stringify(signup.body)}`);
    return;
  }
  token = signup.body.access_token;
  if (!signup.body?.user?.scanSnapshot) {
    fail('Signup did not return the initial scan snapshot');
    return;
  }
  success('Signup created a user and returned an access token');
  success('Signup returned the initial scan snapshot');

  const wrongLogin = await requestJson('/api/v1/auth/login', {
    method: 'POST',
    body: { email: uniqueEmail, password: 'WrongPassword' },
  });

  console.log(`[LOGIN wrong password] status=${wrongLogin.status}`);
  if (wrongLogin.status !== 401) {
    fail(`Expected 401 for wrong password, got ${wrongLogin.status}`);
    return;
  }
  success('Wrong password was rejected');

  const login = await requestJson('/api/v1/auth/login', {
    method: 'POST',
    body: { email: uniqueEmail, password },
  });

  console.log(`[LOGIN correct password] status=${login.status}`);
  if (login.status !== 200 || !login.body?.access_token) {
    fail(`Login failed: ${JSON.stringify(login.body)}`);
    return;
  }
  token = login.body.access_token;
  if (!login.body?.user?.scanSnapshot) {
    fail('Login did not return the stored scan snapshot');
    return;
  }
  success('Login succeeded and returned a fresh token');
  success('Login returned the stored scan snapshot');

  const me = await requestJson('/api/v1/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`[ME] status=${me.status}`);
  if (me.status !== 200 || me.body?.email !== uniqueEmail) {
    fail(`GET /me failed: ${JSON.stringify(me.body)}`);
    return;
  }
  if (!me.body?.scanSnapshot) {
    fail('GET /me did not return the stored scan snapshot');
    return;
  }
  success('Authenticated profile endpoint returned the expected user');
  success('Authenticated profile endpoint returned the stored scan snapshot');

  const duplicate = await requestJson('/api/v1/auth/signup', {
    method: 'POST',
    body: { email: uniqueEmail, password },
  });

  console.log(`[DUPLICATE SIGNUP] status=${duplicate.status}`);
  if (duplicate.status !== 409) {
    fail(`Expected 409 for duplicate signup, got ${duplicate.status}`);
    return;
  }
  success('Duplicate signup was rejected');

  console.log('\n[AUTH TEST] Completed successfully');
}

main().catch((error) => {
  fail(error.message);
});