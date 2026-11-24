export function VehicleDraft() {
  return <main className="page"><a href="/" className="brand">근차 <span>HOST</span></a>
    <header><p className="eyebrow">내 차 등록하기</p><h1>차량의 기본 정보를 알려주세요</h1><p>먼저 저장해두고 나머지는 이어서 등록할 수 있어요.</p></header>
    <form className="card" onSubmit={event=>event.preventDefault()}>
      <label className="field">차 이름<input name="name" placeholder="예: 아반떼" required /></label>
      <label className="field">연식<input name="year" type="number" placeholder="예: 2022" required /></label>
      <label className="field">차량번호<input name="plate" placeholder="예: 123가4567" required /></label>
      <label className="field">동네<input name="neighborhood" placeholder="예: 성수동" required /></label>
      <p className="hint">기본 정보만 저장한 차는 아직 검색에 공개되지 않아요.</p>
      <button disabled>기본 정보 저장</button>
    </form>
  </main>;
}
