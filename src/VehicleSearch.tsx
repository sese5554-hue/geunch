export function VehicleSearch() {
  return <main className="page"><a href="/" className="brand">근차 <span>GEUNCHA</span></a>
    <header><p className="eyebrow">우리 동네 차량 공유</p><h1>가까운 차를 찾아보세요</h1><p>동네와 원하는 조건으로 찾아볼 수 있어요.</p></header>
    <form className="card" onSubmit={event=>event.preventDefault()}>
      <label className="field">찾을 동네<input name="neighborhood" placeholder="예: 성수동" required /></label>
      <label className="field">차 이름<input name="q" placeholder="차 이름으로 검색" /></label>
      <label className="field">하루 최대 예산<input name="maxPrice" type="number" min="0" step="1000" placeholder="금액 제한 없음" /></label>
      <button disabled>차 찾기</button>
    </form>
    <section className="results" aria-label="차량 목록"><p className="message">찾을 동네를 정해 주세요.</p></section>
  </main>;
}
