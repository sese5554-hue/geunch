import { useEffect, useState } from 'react';
import { api } from './api';
import { money, searchParams, searchSchema, type Search, type Vehicle } from '../shared/vehicles';

function readLocation(): Search | null {
  const params = new URLSearchParams(location.search);
  const result = searchSchema.safeParse(Object.fromEntries(params));
  return result.success ? result.data : null;
}
export function VehicleSearch() {
  const initial = readLocation();
  const [neighborhood, setNeighborhood] = useState(initial?.neighborhood || '');
  const [name, setName] = useState(initial?.q || '');
  const [maxPrice, setMaxPrice] = useState(initial?.maxPrice === undefined ? '' : String(initial.maxPrice));
  const [applied, setApplied] = useState<Search | null>(initial);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!applied) return;
    const controller = new AbortController();
    setLoading(true); setError(''); setVehicles([]);
    api<Vehicle[]>('/vehicles?' + searchParams(applied), { signal: controller.signal })
      .then(values => { if (!controller.signal.aborted) setVehicles(values); })
      .catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : '차량을 불러오지 못했습니다.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [applied, retry]);
  useEffect(() => {
    const back = () => { const next = readLocation(); setApplied(next); setNeighborhood(next?.neighborhood || ''); setName(next?.q || ''); setMaxPrice(next?.maxPrice === undefined ? '' : String(next.maxPrice)); setError(''); };
    window.addEventListener('popstate', back);
    return () => window.removeEventListener('popstate', back);
  }, []);
  return <main className="page"><a href="/" className="brand">근차 <span>GEUNCHA</span></a>
    <header><p className="eyebrow">우리 동네 차량 공유</p><h1>가까운 차를 찾아보세요</h1><p>동네와 원하는 조건으로 찾아볼 수 있어요.</p></header>
    <form className="card" onSubmit={event => {
      event.preventDefault();
      const result = searchSchema.safeParse({ neighborhood, q: name, maxPrice });
      if (!result.success) { setError(result.error.issues[0].message); return; }
      history.pushState({}, '', '?' + searchParams(result.data)); setApplied(result.data);
    }}>
      <label className="field">찾을 동네<input value={neighborhood} onChange={event=>setNeighborhood(event.target.value)} placeholder="예: 성수동" required maxLength={60}/></label>
      <label className="field">차 이름<input value={name} onChange={event=>setName(event.target.value)} placeholder="차 이름으로 검색" maxLength={60}/></label>
      <label className="field">하루 최대 예산<input value={maxPrice} onChange={event=>setMaxPrice(event.target.value)} type="number" min="0" max="10000000" step="1" placeholder="금액 제한 없음"/></label>
      <button>차 찾기</button>
    </form>
    <section className="results" aria-label="차량 목록" aria-busy={loading}>
      {!applied && !error && <p className="message">찾을 동네를 정해 주세요.</p>}
      {loading && <p role="status">차량을 찾고 있어요.</p>}
      {error && <div className="message error" role="alert">{error}{applied && <button className="secondary" onClick={()=>setRetry(value=>value+1)}>다시 찾기</button>}</div>}
      {applied && !loading && !error && <><p>{applied.neighborhood} · {vehicles.length}대</p>
        {vehicles.length === 0 && <p className="message">조건에 맞는 차량이 없어요. 다른 조건으로 찾아보세요.</p>}
        {vehicles.map(vehicle=><article className="card" key={vehicle.id}><span className="badge">{vehicle.neighborhood}</span><h2>{vehicle.name}</h2><p className="muted">{vehicle.year}년 · {vehicle.fuel} · {vehicle.seats}인승</p><p className="price">{money(vehicle.dailyPrice)}원 <small>/ 하루</small></p></article>)}
      </>}
    </section>
  </main>;
}
