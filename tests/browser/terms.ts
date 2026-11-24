import { once } from 'node:events';
import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import { createApp } from '../../server/app';
import type { ConsentStore } from '../../server/consents';
import type { ConsentRecord } from '../../shared/terms';

const records = new Map<string, ConsentRecord>();
const store: ConsentStore = {
  async save(record) { records.set(record.id, record); },
  async find(id) { return records.get(id) || null; },
};
const options = { consents: store, origin: '' };
const api = createApp(options).listen(0, '127.0.0.1');
await once(api, 'listening');
const address = api.address();
if (!address || typeof address === 'string') throw Error('API address missing');
const web = await createServer({ server: { port: 0, strictPort: false, proxy: { '/api': `http://127.0.0.1:${address.port}` } } });
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
try {
  await web.listen();
  const webAddress = web.httpServer!.address();
  if (!webAddress || typeof webAddress === 'string') throw Error('Web address missing');
  options.origin = `http://127.0.0.1:${webAddress.port}`;
  browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'chrome' : undefined) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(options.origin);
  const all = page.getByRole('checkbox', { name: '전체 동의', exact: true });
  const marketing = page.getByRole('checkbox', { name: '문자 혜택 알림' });
  const save = page.getByRole('button', { name: '동의하고 계속하기' });
  await expect(all).toBeEnabled();
  await expect(save).toBeDisabled();
  await all.check();
  await expect(page.locator('input:checked')).toHaveCount(8);
  await marketing.uncheck();
  await expect(all).not.toBeChecked();
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByRole('status')).toHaveText('동의 내용이 저장됐어요.');
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('동의 내용이 저장됐어요.');
  await expect(marketing).not.toBeChecked();
  fs.mkdirSync('docs/screenshots', { recursive: true });
  await page.screenshot({ path: 'docs/screenshots/00-terms.png', fullPage: true });
  await page.route('**/api/consents', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: '저장하지 못했습니다. 다시 시도해 주세요.' }) }));
  await marketing.check();
  await save.click();
  await expect(page.getByRole('alert')).toContainText('저장하지 못했습니다.');
  await expect(marketing).toBeChecked();
  await expect(save).toBeEnabled();
  await page.screenshot({ path: 'docs/screenshots/00-terms-error.png', fullPage: true });
  await page.unroute('**/api/consents');
  await save.click();
  await expect(page.getByRole('status')).toHaveText('동의 내용이 저장됐어요.');
  console.log('브라우저 확인 통과: 전체·개별 동의, 필수 조건, 저장·새로고침, 실패 후 선택 유지·재시도');
} finally {
  await browser?.close();
  await web.close();
  api.closeAllConnections();
  await new Promise<void>(resolve => api.close(() => resolve()));
}
