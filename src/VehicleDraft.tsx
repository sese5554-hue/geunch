import{useEffect,useRef,useState}from'react';
import{api}from'./api';
import{draftSchema,type VehicleDraft as Draft}from'../shared/vehicles';
type Session={user:{id:string;role:string}|null;developmentLogin:boolean};
const blank={name:'',year:'',plate:'',neighborhood:''};
export function VehicleDraft(){
  const[session,setSession]=useState<Session|null>(null),[values,setValues]=useState(blank),[record,setRecord]=useState<Draft|null>(null);
  const[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  const pending=useRef(false);
  useEffect(()=>{
    const controller=new AbortController();setLoading(true);setError('');
    (async()=>{
      const current=await api<Session>('/session',{signal:controller.signal});if(controller.signal.aborted)return;setSession(current);
      const id=new URLSearchParams(location.search).get('vehicle');
      if(current.user&&id){const saved=await api<Draft>('/vehicles/'+encodeURIComponent(id),{signal:controller.signal});if(controller.signal.aborted)return;setRecord(saved);setValues({...saved,year:String(saved.year)});}
    })().catch(reason=>{if(!controller.signal.aborted)setError(reason instanceof Error?reason.message:'불러오지 못했습니다.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[retry]);
  async function login(){if(pending.current)return;pending.current=true;setBusy(true);setError('');try{await api('/dev/session',{method:'POST'});setRetry(value=>value+1);}catch(reason){setError((reason as Error).message);}finally{pending.current=false;setBusy(false);}}
  async function save(){
    if(pending.current)return;const result=draftSchema.safeParse(values);if(!result.success){setError(result.error.issues[0].message);return;}
    pending.current=true;setBusy(true);setError('');
    try{const saved=await api<Draft>('/vehicles',{method:'POST',body:JSON.stringify(result.data)});setRecord(saved);setValues({...saved,year:String(saved.year)});history.replaceState({},'','?vehicle='+saved.id);}
    catch(reason){setError((reason as Error).message);}finally{pending.current=false;setBusy(false);}
  }
  return <main className="page"><a href="/" className="brand">근차 <span>HOST</span></a>
    <header><p className="eyebrow">내 차 등록하기</p><h1>차량의 기본 정보를 알려주세요</h1><p>먼저 저장해두고 나머지는 이어서 등록할 수 있어요.</p></header>
    {loading&&<p role="status">정보를 불러오고 있어요.</p>}
    {error&&<div className="message error" role="alert">{error}{!session&&<button onClick={()=>setRetry(value=>value+1)}>다시 불러오기</button>}</div>}
    {!loading&&session&&!session.user&&<section className="card"><h2>로그인이 필요해요</h2><p>차를 빌려주는 계정으로 로그인해 주세요.</p>{session.developmentLogin&&<><p className="hint">개발 계정으로 기능을 확인할 수 있어요.</p><button onClick={()=>void login()} disabled={busy}>개발 호스트로 시작</button></>}</section>}
    {!loading&&session?.user&&<form className="card" onSubmit={event=>{event.preventDefault();void save();}} aria-busy={busy}>
      {record&&<p role="status" className="message">기본 정보가 저장됐어요. 아직 공개 전이에요.</p>}
      <label className="field">차 이름<input value={values.name} onChange={event=>setValues({...values,name:event.target.value})} disabled={busy||!!record} maxLength={80} required/></label>
      <label className="field">연식<input value={values.year} onChange={event=>setValues({...values,year:event.target.value})} type="number" min="1980" max={new Date().getFullYear()+1} disabled={busy||!!record} required/></label>
      <label className="field">차량번호<input value={values.plate} onChange={event=>setValues({...values,plate:event.target.value})} placeholder="예: 123가4567" disabled={busy||!!record} required/></label>
      <label className="field">동네<input value={values.neighborhood} onChange={event=>setValues({...values,neighborhood:event.target.value})} maxLength={60} disabled={busy||!!record} required/></label>
      <p className="hint">기본 정보만 저장한 차는 아직 검색에 공개되지 않아요.</p>
      {!record&&<button disabled={busy}>{busy?'저장하고 있어요…':'기본 정보 저장'}</button>}
      {record&&<button type="button" className="secondary" onClick={()=>{setRecord(null);setValues(blank);history.replaceState({},'','/');}}>다른 차량 등록</button>}
    </form>}
  </main>;
}
