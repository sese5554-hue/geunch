import { useEffect, useRef, useState } from 'react';
import { chooseAll, termsVersion, type ConsentRecord } from '../../../shared/terms';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch('/api' + path, { ...options, credentials: 'same-origin' });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || '요청을 처리하지 못했습니다. 다시 시도해 주세요.');
  return body as T;
}
export function useTerms() {
  const [choices, setChoices] = useState(() => chooseAll(false));
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [retry, setRetry] = useState(0);
  const pending = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    setReady(false); setError('');
    Promise.all([
      request<{ version: string }>('/terms', { signal: controller.signal }),
      request<Omit<ConsentRecord, 'id'> | null>('/consents/current', { signal: controller.signal }),
    ]).then(([catalog, record]) => {
      if (controller.signal.aborted) return;
      if (catalog.version !== termsVersion) throw new Error('새 약관이 있습니다. 화면을 새로고침해 주세요.');
      if (record?.version === termsVersion) { setChoices(record.choices); setSaved(true); }
      else if (record) { setChoices(chooseAll(false)); setError('약관이 바뀌었습니다. 다시 동의해 주세요.'); }
      setReady(true);
    }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : '불러오지 못했습니다.'); });
    return () => controller.abort();
  }, [retry]);
  async function save() {
    if (!ready || pending.current) return;
    pending.current = true; setBusy(true); setError(''); setSaved(false);
    try {
      await request('/consents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: termsVersion, choices }) });
      setSaved(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : '저장하지 못했습니다.'); }
    finally { pending.current = false; setBusy(false); }
  }
  function change(next: typeof choices) { setChoices(next); setSaved(false); }
  return { choices, change, ready, busy, error, saved, save, reload: () => setRetry(value => value + 1) };
}
