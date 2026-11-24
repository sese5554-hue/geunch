import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import type { Pool } from 'mariadb';
import { consentSchema, terms, termsVersion, type ConsentRecord } from '../shared/terms';

export interface ConsentStore {
  save(record: ConsentRecord): Promise<void>;
  find(id: string): Promise<ConsentRecord | null>;
}
export class MariaConsentStore implements ConsentStore {
  constructor(private pool: Pool) {}
  async save(record: ConsentRecord) {
    await this.pool.query('INSERT INTO consents (id, version, choices_json, saved_at) VALUES (?, ?, ?, ?)', [record.id, record.version, JSON.stringify(record.choices), new Date(record.savedAt)]);
  }
  async find(id: string): Promise<ConsentRecord | null> {
    const rows = await this.pool.query('SELECT id, version, choices_json, saved_at FROM consents WHERE id = ?', [id]);
    const row = rows[0];
    if (!row) return null;
    return { id: row.id, version: row.version, choices: typeof row.choices_json === 'string' ? JSON.parse(row.choices_json) : row.choices_json, savedAt: new Date(row.saved_at).toISOString() };
  }
}
export function consentRoutes(store?: ConsentStore, secureCookie = false) {
  const router = Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.get('/terms', (_req, res) => res.json({ version: termsVersion, terms }));
  router.get('/consents/current', async (req, res) => {
    const id = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith('geuncha_consent='))?.slice('geuncha_consent='.length);
    if (!id || !/^[0-9a-f-]{36}$/.test(id)) { res.json(null); return; }
    if (!store) { res.status(503).json({ message: '동의 내용을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.' }); return; }
    try {
      const record = await store.find(id);
      res.json(record ? { version: record.version, choices: record.choices, savedAt: record.savedAt } : null);
    } catch { res.status(503).json({ message: '동의 내용을 불러오지 못했습니다. 다시 시도해 주세요.' }); }
  });
  router.post('/consents', async (req, res) => {
    if (req.body?.version !== termsVersion) { res.status(409).json({ message: '약관이 바뀌었습니다. 새로 불러온 뒤 다시 확인해 주세요.' }); return; }
    const input = consentSchema.safeParse(req.body);
    if (!input.success) { res.status(400).json({ message: '필수 약관에 동의하고 선택 항목을 확인해 주세요.' }); return; }
    if (!store) { res.status(503).json({ message: '저장할 수 없습니다. 잠시 후 다시 시도해 주세요.' }); return; }
    const record: ConsentRecord = { id: randomUUID(), ...input.data, savedAt: new Date().toISOString() };
    try { await store.save(record); }
    catch { res.status(503).json({ message: '저장하지 못했습니다. 선택 내용은 유지되니 다시 시도해 주세요.' }); return; }
    res.cookie('geuncha_consent', record.id, { httpOnly: true, sameSite: 'strict', secure: secureCookie, path: '/api', maxAge: 1000 * 60 * 60 * 24 * 30 });
    res.status(201).json({ version: record.version, choices: record.choices, savedAt: record.savedAt });
  });
  return router;
}
