import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server/app';
import type { ConsentStore } from '../server/consents';
import { chooseAll, termsVersion, type ConsentRecord } from '../shared/terms';

class MemoryStore implements ConsentStore {
  records = new Map<string, ConsentRecord>();
  async save(record: ConsentRecord) { this.records.set(record.id, structuredClone(record)); }
  async find(id: string) { return this.records.get(id) || null; }
}
async function serve(store: ConsentStore | undefined, run: (base: string) => Promise<void>) {
  const server = createApp({ consents: store }).listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    await run(`http://127.0.0.1:${address.port}/api`);
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
}
const body = () => ({ version: termsVersion, choices: { ...chooseAll(true), marketingSms: false } });
const post = (value: unknown) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });

test('선택 항목을 거부해도 저장되고 같은 쿠키로 다시 읽을 수 있다', async () => {
  const store = new MemoryStore();
  await serve(store, async base => {
    assert.equal(await (await fetch(base + '/consents/current')).json(), null);
    const response = await fetch(base + '/consents', post(body()));
    assert.equal(response.status, 201);
    assert.equal(store.records.size, 1);
    const cookie = response.headers.get('set-cookie');
    assert.ok(cookie); assert.match(cookie, /HttpOnly/i); assert.match(cookie, /SameSite=Strict/i);
    const record = await response.json();
    assert.deepEqual(record.choices, body().choices);
    const restored = await fetch(base + '/consents/current', { headers: { Cookie: cookie.split(';')[0] } });
    assert.deepEqual(await restored.json(), record);
    assert.equal(restored.headers.get('cache-control'), 'no-store');
    assert.equal(await (await fetch(base + '/consents/current')).json(), null);
  });
});
test('필수 동의 누락과 이전 약관은 저장하지 않는다', async () => {
  const store = new MemoryStore();
  await serve(store, async base => {
    const missing = body(); missing.choices.privacy = false;
    assert.equal((await fetch(base + '/consents', post(missing))).status, 400);
    assert.equal((await fetch(base + '/consents', post({ ...body(), version: 'old' }))).status, 409);
    assert.equal(store.records.size, 0);
  });
});
test('다른 사이트에서 보낸 저장 요청을 거절한다', async () => {
  const store = new MemoryStore();
  await serve(store, async base => {
    const options = post(body());
    const response = await fetch(base + '/consents', { ...options, headers: { ...options.headers, Origin: 'https://another.example' } });
    assert.equal(response.status, 403);
    assert.equal(store.records.size, 0);
  });
});
test('저장소 실패 때 성공이나 동의 쿠키를 반환하지 않는다', async () => {
  await serve({ async save() { throw Error('database password must not leak'); }, async find() { throw Error('db unavailable'); } }, async base => {
    const response = await fetch(base + '/consents', post(body()));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.doesNotMatch(await response.text(), /password/);
    const lookup = await fetch(base + '/consents/current', { headers: { Cookie: 'geuncha_consent=12345678-1234-1234-1234-123456789012' } });
    assert.equal(lookup.status, 503);
  });
});
test('연결되지 않은 저장소와 잘못된 JSON을 안내한다', async () => {
  await serve(undefined, async base => {
    assert.equal((await fetch(base + '/consents', post(body()))).status, 503);
    const response = await fetch(base + '/consents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
    assert.equal(response.status, 400);
  });
});
