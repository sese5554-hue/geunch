import { useState } from 'react';
import { terms, chooseAll, allChosen, requiredChosen } from '../../../shared/terms';

export function TermsPage() {
  const [choices, setChoices] = useState(() => chooseAll(false));
  return <main className="page">
    <a className="brand" href="/">근차<span>GEUNCHA</span></a>
    <header><p className="eyebrow">처음 오셨나요?</p><h1>안전한 차량 공유의 시작</h1><p>이용에 필요한 약관을 확인해 주세요.</p></header>
    <form className="card" onSubmit={event => event.preventDefault()}>
      <label className="all"><input type="checkbox" checked={allChosen(choices)} onChange={event => setChoices(chooseAll(event.target.checked))} />전체 동의</label>
      <p className="hint">선택 항목에 동의하지 않아도 이용할 수 있어요.</p>
      <div className="agreements">{terms.map(({key, label, required}) => <details key={key}>
        <summary><label><input type="checkbox" name={key} checked={choices[key]} onChange={event => setChoices({ ...choices, [key]: event.target.checked })} /><span>{label} <small>{required ? '(필수)' : '(선택)'}</small></span></label><span className="more">내용 보기</span></summary>
        <p>근차 개발용 약관 안내입니다. {label} 동의 여부를 보관합니다. 운영 약관 전문은 서비스 출시 전에 확정합니다.</p>
      </details>)}</div>
      <button type="submit" disabled={!requiredChosen(choices)}>동의하고 계속하기</button>
    </form>
  </main>;
}
