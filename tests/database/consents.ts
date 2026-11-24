import 'dotenv/config';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createPool } from '../../server/database';
import { MariaConsentStore } from '../../server/consents';
import { createApp } from '../../server/app';
import { chooseAll, termsVersion } from '../../shared/terms';

const firstPool = createPool();
const first = createApp({ consents: new MariaConsentStore(firstPool) }).listen(0, '127.0.0.1');
let id: string | undefined;
let cookie = '';
try {
  await once(first, 'listening');
  const address = first.address();
  assert.ok(address && typeof address !== 'string');
  const choices = { ...chooseAll(true), marketingEmail: false };
  const response = await fetch(`http://127.0.0.1:${address.port}/api/consents`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: termsVersion, choices }),
  });
  assert.equal(response.status, 201);
  cookie = response.headers.get('set-cookie')!.split(';')[0];
  id = cookie.split('=')[1];
  const rows = await firstPool.query('SELECT version, choices_json FROM consents WHERE id = ?', [id]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].version, termsVersion);
  const stored = typeof rows[0].choices_json === 'string' ? JSON.parse(rows[0].choices_json) : rows[0].choices_json;
  assert.deepEqual(stored, choices);
} finally {
  first.closeAllConnections();
  await new Promise<void>(resolve => first.close(() => resolve()));
  await firstPool.end();
}
const secondPool = createPool();
const second = createApp({ consents: new MariaConsentStore(secondPool) }).listen(0, '127.0.0.1');
try {
  await once(second, 'listening');
  const address = second.address();
  assert.ok(address && typeof address !== 'string');
  const response = await fetch(`http://127.0.0.1:${address.port}/api/consents/current`, { headers: { Cookie: cookie } });
  assert.equal(response.status, 200);
  const record = await response.json();
  assert.equal(record.version, termsVersion);
  assert.equal(record.choices.marketingEmail, false);
  console.log('MariaDB 확인 통과: 실제 저장, 연결 종료, 새 서버·연결에서 다시 조회');
} finally {
  if (id) await secondPool.query('DELETE FROM consents WHERE id = ?', [id]);
  second.closeAllConnections();
  await new Promise<void>(resolve => second.close(() => resolve()));
  await secondPool.end();
}
