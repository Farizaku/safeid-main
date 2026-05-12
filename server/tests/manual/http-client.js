const { request } = require('http');

function getBaseUrl() {
  return process.env.TEST_API_BASE_URL || process.env.APP_URL || 'http://localhost:3000';
}

function requestJson(path, { method = 'GET', body, headers = {} } = {}) {
  const baseUrl = new URL(getBaseUrl());
  const payload = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const req = request(
      {
        protocol: baseUrl.protocol,
        hostname: baseUrl.hostname,
        port: baseUrl.port || 80,
        path,
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let raw = '';

        res.on('data', (chunk) => {
          raw += chunk;
        });

        res.on('end', () => {
          if (!raw) {
            resolve({ status: res.statusCode, body: null });
            return;
          }

          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      }
    );

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

module.exports = {
  requestJson,
};