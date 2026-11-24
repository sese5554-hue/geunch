export function Profile() {
  return <main className="page"><a href="/" className="brand">근차 <span>MY</span></a>
    <header><p className="eyebrow">마이페이지</p><h1>내 정보</h1><p>내 정보와 인증 상태를 확인하세요.</p></header>
    <section className="card"><h2>로그인이 필요해요</h2><p>로그인하면 내 정보와 인증 상태를 볼 수 있어요.</p><button disabled>로그인</button></section>
    <section className="card"><h2>계정 관리</h2><ul className="menu"><li>내 정보 수정</li><li>운전면허</li><li>결제수단</li><li>알림 설정</li></ul></section>
  </main>;
}
