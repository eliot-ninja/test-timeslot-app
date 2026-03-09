import { useState, useEffect } from "react";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────
const T = {
  navy:"#0f1b35", navyMid:"#1a2d52", blue:"#2563eb", blueLt:"#3b82f6",
  indigo:"#4f46e5", violet:"#7c3aed",
  load:"#0ea5e9", unload:"#8b5cf6",
  green:"#10b981", amber:"#f59e0b", red:"#ef4444",
  s50:"#f8fafc", s100:"#f1f5f9", s200:"#e2e8f0",
  s400:"#94a3b8", s500:"#64748b", s700:"#334155", s900:"#0f172a",
};

const GS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:${T.s100};}
  input,select,textarea,button{font-family:'DM Sans',sans-serif;}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:${T.s200};border-radius:99px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes tvTick{0%{opacity:1}50%{opacity:.4}100%{opacity:1}}
  .fu{animation:fadeUp .22s ease}
  .fi{animation:fadeIn .18s ease}
  .rh:hover{background:${T.s50}!important;}
  .gh:hover{background:rgba(255,255,255,.1)!important;}
`;

// ── CONSTANTS ─────────────────────────────────────────────────────────────
const DAYS = [
  {date:"2026-03-09",label:"Mon",day:"09",fullLabel:"Monday 09.03.2026"},
  {date:"2026-03-10",label:"Tue",day:"10",fullLabel:"Tuesday 10.03.2026"},
  {date:"2026-03-11",label:"Wed",day:"11",fullLabel:"Wednesday 11.03.2026"},
  {date:"2026-03-12",label:"Thu",day:"12",fullLabel:"Thursday 12.03.2026"},
  {date:"2026-03-13",label:"Fri",day:"13",fullLabel:"Friday 13.03.2026"},
];
const HOURS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"];
const CP = [
  {bg:"#eff6ff",border:"#bfdbfe",text:"#1d4ed8",dot:"#3b82f6"},
  {bg:"#fdf4ff",border:"#e9d5ff",text:"#7e22ce",dot:"#a855f7"},
  {bg:"#f0fdf4",border:"#bbf7d0",text:"#15803d",dot:"#22c55e"},
  {bg:"#fff7ed",border:"#fed7aa",text:"#c2410c",dot:"#f97316"},
  {bg:"#fdf2f8",border:"#fbcfe8",text:"#9d174d",dot:"#ec4899"},
  {bg:"#f0fdfa",border:"#99f6e4",text:"#0f766e",dot:"#14b8a6"},
];

const NOW = () => new Date("2026-03-09T11:25:00");
const isPast  = (date, hour) => { const n=NOW();const[h,m]=hour.split(":").map(Number);const d=new Date(date);d.setHours(h,m,0,0);return n>=d; };
const isLocked= (date, hour) => { const n=NOW();const[h,m]=hour.split(":").map(Number);const d=new Date(date);d.setHours(h,m,0,0);return(d-n)<=3600000; };
const genId   = () => Math.floor(100000+Math.random()*900000);
const genCoid = () => { const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";return Array.from({length:6},()=>c[~~(Math.random()*c.length)]).join(""); };
const fmtRef  = r => `#${r}`;
const nextH   = h => HOURS[HOURS.indexOf(h)+1] || "—";

const mkSlots = () => {
  const s={};
  DAYS.forEach(day=>["loading","unloading"].forEach(type=>HOURS.slice(0,-1).forEach(hour=>{
    s[`${day.date}_${type}_${hour}`]={total:15,booked:0,free:15,bookings:[],blocked:false};
  })));
  const demos=[
    {d:"2026-03-09",t:"loading",  h:"12:00",ci:"ABC001",cn:"ABC Zoo s.r.o.",  spz:"BA123AB",tv:"Laminate boards", p:8, by:"Jožko Novák"},
    {d:"2026-03-09",t:"loading",  h:"13:00",ci:"ABC001",cn:"ABC Zoo s.r.o.",  spz:"BA456CD",tv:"MDF panels",      p:12,by:"Ferko Kováč"},
    {d:"2026-03-09",t:"loading",  h:"14:00",ci:"DES002",cn:"Descanti s.r.o.", spz:"ZA789EF",tv:"Flooring rolls",  p:6, by:"Milan Horák"},
    {d:"2026-03-10",t:"loading",  h:"09:00",ci:"ABC001",cn:"ABC Zoo s.r.o.",  spz:"BA321GH",tv:"Veneer sheets",   p:10,by:"Jožko Novák"},
    {d:"2026-03-10",t:"loading",  h:"09:00",ci:"DES002",cn:"Descanti s.r.o.", spz:"ZA654IJ",tv:"Chipboard",       p:14,by:"Milan Horák"},
    {d:"2026-03-10",t:"unloading",h:"10:00",ci:"DES002",cn:"Descanti s.r.o.", spz:"ZA111KL",tv:"Returns",         p:4, by:"Milan Horák"},
    {d:"2026-03-11",t:"loading",  h:"11:00",ci:"ABC001",cn:"ABC Zoo s.r.o.",  spz:"BA999MN",tv:"OSB boards",      p:9, by:"Ferko Kováč"},
    {d:"2026-03-11",t:"unloading",h:"13:00",ci:"ABC001",cn:"ABC Zoo s.r.o.",  spz:"BA777OP",tv:"Empty pallets",   p:20,by:"Jožko Novák"},
    {d:"2026-03-12",t:"loading",  h:"08:00",ci:"DES002",cn:"Descanti s.r.o.", spz:"ZA222QR",tv:"Timber beams",    p:7, by:"Milan Horák"},
    {d:"2026-03-13",t:"loading",  h:"10:00",ci:"ABC001",cn:"ABC Zoo s.r.o.",  spz:"BA555ST",tv:"Plywood sheets",  p:11,by:"Ferko Kováč"},
    {d:"2026-03-13",t:"loading",  h:"10:00",ci:"DES002",cn:"Descanti s.r.o.", spz:"ZA888UV",tv:"Cork flooring",   p:5, by:"Milan Horák"},
  ];
  demos.forEach(dm=>{
    const k=`${dm.d}_${dm.t}_${dm.h}`;
    if(!s[k])return;
    const b={id:Math.random(),ref:genId(),spz:dm.spz,tovar:dm.tv,palety:dm.p,dopravca:dm.cn,note:"",
      loadType:dm.t,companyId:dm.ci,companyName:dm.cn,createdBy:dm.by,
      time:`${dm.h}–${nextH(dm.h)}`,date:DAYS.find(x=>x.date===dm.d)?.fullLabel||dm.d,
      slotDate:dm.d,slotHour:dm.h};
    s[k].bookings.push(b);s[k].booked++;s[k].free--;
  });
  return s;
};

const INIT_CO=[
  {id:"ABC001",name:"ABC Zoo s.r.o.",    address:"Hlavná 12",       city:"Bratislava",vat:"SK2020123456",email:"info@abczoo.com",    status:"active"},
  {id:"DES002",name:"Descanti s.r.o.",   address:"Priemyselná 5",   city:"Žilina",    vat:"SK2020654321",email:"office@descanti.com",status:"active"},
];
const INIT_U=[
  {id:"u1",name:"System Admin", email:"admin@system.com",  pw:"admin123",role:"admin",     coId:null,    status:"active"},
  {id:"u2",name:"Jožko Novák",  email:"jozko@abczoo.com",  pw:"pass123", role:"dispatcher",coId:"ABC001",status:"active"},
  {id:"u3",name:"Ferko Kováč",  email:"ferko@abczoo.com",  pw:"pass123", role:"dispatcher",coId:"ABC001",status:"active"},
  {id:"u4",name:"Milan Horák",  email:"milan@descanti.com",pw:"pass123", role:"dispatcher",coId:"DES002",status:"active"},
];
const EF={spz:"",tovar:"",palety:"",dopravca:"",note:"",loadType:"loading"};

// ── ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [users,   setUsers]   = useState(INIT_U);
  const [cos,     setCos]     = useState(INIT_CO);
  const [slots,   setSlots]   = useState(mkSlots);
  const [gCap,    setGCap]    = useState(15);
  const [curUser, setCurUser] = useState(null);
  const [page,    setPage]    = useState("login");

  const login  = u => { setCurUser(u); setPage(u.role==="admin"?"admin":"app"); };
  const logout = () => { setCurUser(null); setPage("login"); };

  // Per-slot capacity override
  const setSlotCap = (key, n) => setSlots(p => {
    const s = p[key]||{total:n,booked:0,free:n,bookings:[],blocked:false};
    return {...p,[key]:{...s,total:n,free:Math.max(0,n-s.booked)}};
  });

  return (
    <>
      <style>{GS}</style>
      {page==="login"    && <LoginPage    users={users} onLogin={login} onReg={()=>setPage("register")}/>}
      {page==="register" && <RegisterPage cos={cos} setCos={setCos} users={users} setUsers={setUsers} onBack={()=>setPage("login")}/>}
      {page==="admin"    && <AdminPanel   users={users} setUsers={setUsers} cos={cos} setCos={setCos} slots={slots} setSlots={setSlots} gCap={gCap} setGCap={setGCap} setSlotCap={setSlotCap} curUser={curUser} onLogout={logout} onTV={()=>setPage("tv")}/>}
      {page==="app"      && <DispatchApp  curUser={curUser} cos={cos} slots={slots} setSlots={setSlots} gCap={gCap} onLogout={logout}/>}
      {page==="tv"       && <TVView       slots={slots} cos={cos} onBack={()=>setPage("admin")}/>}
    </>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
function LoginPage({users,onLogin,onReg}) {
  const [email,setEmail]=useState("");const [pw,setPw]=useState("");const [err,setErr]=useState("");
  const go=()=>{
    const u=users.find(u=>u.email===email&&u.pw===pw);
    if(!u)return setErr("Nesprávny email alebo heslo.");
    if(u.status==="pending")return setErr("Váš účet čaká na schválenie adminom.");
    if(u.status==="rejected")return setErr("Váša registrácia bola zamietnutá.");
    onLogin(u);
  };
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${T.navy} 0%,#162447 60%,#1a2d52 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{width:"100%",maxWidth:400}} className="fu">
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:56,height:56,borderRadius:16,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 14px"}}>🚚</div>
          <div style={{color:"#fff",fontWeight:800,fontSize:22,letterSpacing:"-.3px"}}>Timeslot Management</div>
          <div style={{color:"rgba(255,255,255,.4)",fontSize:12,marginTop:4}}>SpedDKa s.r.o. · Portál prepravcov</div>
        </div>
        <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:18,padding:"26px 24px 22px",backdropFilter:"blur(12px)"}}>
          {err&&<div style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",color:"#fca5a5",borderRadius:9,padding:"9px 13px",fontSize:12,marginBottom:14,fontWeight:500}}>{err}</div>}
          <DL>Email</DL><DI value={email} onChange={e=>setEmail(e.target.value)} placeholder="vas@email.com" onKeyDown={e=>e.key==="Enter"&&go()}/>
          <div style={{height:10}}/>
          <DL>Heslo</DL><DI type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/>
          <button onClick={go} style={{width:"100%",marginTop:20,padding:"11px",background:T.blue,color:"#fff",border:"none",borderRadius:9,fontWeight:700,fontSize:14,cursor:"pointer"}}>Prihlásiť sa →</button>
          <div style={{textAlign:"center",marginTop:14,fontSize:12,color:"rgba(255,255,255,.35)"}}>
            Nová firma?{" "}<span onClick={onReg} style={{color:T.blueLt,fontWeight:700,cursor:"pointer"}}>Registrovať firmu</span>
          </div>
        </div>
        <div style={{marginTop:14,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"10px 14px",fontSize:10,color:"rgba(255,255,255,.3)",lineHeight:1.9,fontFamily:"'DM Mono',monospace"}}>
          <b style={{fontFamily:"'DM Sans',sans-serif",color:"rgba(255,255,255,.45)"}}>Demo účty</b><br/>
          admin@system.com / admin123<br/>jozko@abczoo.com / pass123<br/>milan@descanti.com / pass123
        </div>
      </div>
    </div>
  );
}

// ── REGISTER ──────────────────────────────────────────────────────────────
function RegisterPage({cos,setCos,users,setUsers,onBack}) {
  const [flow,setFlow]=useState(null);const [done,setDone]=useState(null);const [err,setErr]=useState("");
  const [cf,setCf]=useState({name:"",address:"",city:"",vat:"",email:"",cName:"",cEmail:"",pw:"",pw2:""});
  const [mf,setMf]=useState({coId:"",fn:"",ln:"",email:"",pw:"",pw2:""});
  const bg={minHeight:"100vh",background:`linear-gradient(135deg,${T.navy},#162447)`,display:"flex",alignItems:"center",justifyContent:"center",padding:16};
  const card={width:"100%",maxWidth:500,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:18,padding:"26px 24px 22px",backdropFilter:"blur(12px)"};

  const regCo=()=>{
    setErr("");
    if(!cf.name||!cf.address||!cf.city||!cf.vat||!cf.email||!cf.cName||!cf.cEmail||!cf.pw)return setErr("Všetky polia sú povinné.");
    if(cf.pw!==cf.pw2)return setErr("Heslá sa nezhodujú.");
    if(users.find(u=>u.email===cf.cEmail))return setErr("Email je už registrovaný.");
    if(cos.find(c=>c.vat.toLowerCase()===cf.vat.toLowerCase()))return setErr("IČ DPH je už registrované.");
    let nid;do{nid=genCoid();}while(cos.find(c=>c.id===nid));
    setCos(p=>[...p,{id:nid,name:cf.name,address:cf.address,city:cf.city,vat:cf.vat,email:cf.email,status:"pending"}]);
    setUsers(p=>[...p,{id:`u_${Date.now()}`,name:cf.cName,email:cf.cEmail,pw:cf.pw,role:"dispatcher",coId:nid,status:"pending",isContact:true}]);
    setDone({type:"co",coName:cf.name});
  };
  const regM=()=>{
    setErr("");
    if(!mf.coId||!mf.fn||!mf.ln||!mf.email||!mf.pw)return setErr("Všetky polia sú povinné.");
    if(mf.pw!==mf.pw2)return setErr("Heslá sa nezhodujú.");
    if(users.find(u=>u.email===mf.email))return setErr("Email je už registrovaný.");
    const co=cos.find(c=>c.id.toUpperCase()===mf.coId.toUpperCase());
    if(!co)return setErr("ID firmy nenájdené.");
    if(co.status==="pending")return setErr("Firma ešte čaká na schválenie.");
    if(co.status==="rejected")return setErr("Firma bola zamietnutá.");
    setUsers(p=>[...p,{id:`u_${Date.now()}`,name:`${mf.fn} ${mf.ln}`.trim(),email:mf.email,pw:mf.pw,role:"dispatcher",coId:co.id,status:"pending"}]);
    setDone({type:"m",coName:co.name});
  };

  if(done)return(
    <div style={bg}><div style={{...card,maxWidth:400,textAlign:"center"}} className="fu">
      <div style={{fontSize:48,marginBottom:10}}>⏳</div>
      <div style={{color:"#fff",fontWeight:800,fontSize:18,marginBottom:8}}>Registrácia odoslaná!</div>
      <div style={{color:"rgba(255,255,255,.45)",fontSize:13,lineHeight:1.7}}>{done.type==="co"?<>Firma <b style={{color:"rgba(255,255,255,.75)"}}>{done.coName}</b> čaká na schválenie adminom.</>:<>Účet pre <b style={{color:"rgba(255,255,255,.75)"}}>{done.coName}</b> čaká na schválenie.</>}</div>
      <button onClick={onBack} style={{...dBtn,marginTop:22,width:"100%"}}>← Späť na prihlásenie</button>
    </div></div>
  );

  if(!flow)return(
    <div style={bg}><div style={{...card,maxWidth:440}} className="fu">
      <button onClick={onBack} style={bBtn}>← Späť</button>
      <div style={{color:"#fff",fontWeight:800,fontSize:18,marginBottom:4}}>Vytvoriť účet</div>
      <div style={{color:"rgba(255,255,255,.4)",fontSize:12,marginBottom:22}}>Vyberte typ registrácie</div>
      {[{k:"co",icon:"🏢",t:"Registrovať novú firmu",d:"Prvýkrát? Zaregistrujte firmu s IČ DPH."},{k:"m",icon:"👤",t:"Pripojiť sa k firme",d:"Máte ID firmy? Vytvorte osobný účet dispečera."}].map(o=>(
        <button key={o.k} onClick={()=>setFlow(o.k)} style={{width:"100%",marginBottom:10,padding:"16px 18px",borderRadius:12,border:"1px solid rgba(255,255,255,.09)",background:"rgba(255,255,255,.04)",cursor:"pointer",textAlign:"left",transition:"all .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.08)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";}}>
          <div style={{fontSize:20,marginBottom:5}}>{o.icon}</div>
          <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{o.t}</div>
          <div style={{color:"rgba(255,255,255,.35)",fontSize:11,marginTop:2,lineHeight:1.5}}>{o.d}</div>
        </button>
      ))}
    </div></div>
  );

  if(flow==="co")return(
    <div style={bg}><div style={{...card,maxWidth:520}} className="fu">
      <button onClick={()=>{setFlow(null);setErr("");}} style={bBtn}>← Späť</button>
      <div style={{color:"#fff",fontWeight:800,fontSize:17,marginBottom:3}}>🏢 Registrácia novej firmy</div>
      <div style={{color:"rgba(255,255,255,.35)",fontSize:11,marginBottom:18}}>Všetky polia povinné · Podlieha schváleniu adminom</div>
      {err&&<div style={dErr}>{err}</div>}
      <div style={{color:"rgba(255,255,255,.4)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Údaje firmy</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{gridColumn:"1/-1"}}><DL>Názov firmy *</DL><DI value={cf.name} onChange={e=>setCf({...cf,name:e.target.value})} placeholder="ABC Transport s.r.o."/></div>
        <div><DL>Ulica *</DL><DI value={cf.address} onChange={e=>setCf({...cf,address:e.target.value})} placeholder="Hlavná 12"/></div>
        <div><DL>Mesto *</DL><DI value={cf.city} onChange={e=>setCf({...cf,city:e.target.value})} placeholder="Bratislava"/></div>
        <div><DL>IČ DPH *</DL><DI value={cf.vat} onChange={e=>setCf({...cf,vat:e.target.value})} placeholder="SK2020123456"/></div>
        <div><DL>Email firmy *</DL><DI value={cf.email} onChange={e=>setCf({...cf,email:e.target.value})} placeholder="info@firma.sk"/></div>
      </div>
      <div style={{color:"rgba(255,255,255,.4)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Kontaktná osoba</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{gridColumn:"1/-1"}}><DL>Meno *</DL><DI value={cf.cName} onChange={e=>setCf({...cf,cName:e.target.value})} placeholder="Ján Novák"/></div>
        <div style={{gridColumn:"1/-1"}}><DL>Login email *</DL><DI value={cf.cEmail} onChange={e=>setCf({...cf,cEmail:e.target.value})} placeholder="jan@firma.sk"/></div>
        <div><DL>Heslo *</DL><DI type="password" value={cf.pw} onChange={e=>setCf({...cf,pw:e.target.value})} placeholder="••••••••"/></div>
        <div><DL>Potvrdiť *</DL><DI type="password" value={cf.pw2} onChange={e=>setCf({...cf,pw2:e.target.value})} placeholder="••••••••"/></div>
      </div>
      <button onClick={regCo} style={{...dBtn,marginTop:16,width:"100%"}}>Odoslať registráciu →</button>
    </div></div>
  );

  return(
    <div style={bg}><div style={{...card,maxWidth:440}} className="fu">
      <button onClick={()=>{setFlow(null);setErr("");}} style={bBtn}>← Späť</button>
      <div style={{color:"#fff",fontWeight:800,fontSize:17,marginBottom:3}}>👤 Pripojiť sa k firme</div>
      <div style={{color:"rgba(255,255,255,.35)",fontSize:11,marginBottom:18}}>Zadajte ID firmy od vášho admina</div>
      {err&&<div style={dErr}>{err}</div>}
      <div style={{background:"rgba(99,102,241,.1)",border:"1px solid rgba(99,102,241,.25)",borderRadius:10,padding:"12px 14px",marginBottom:16}}>
        <DL>ID Firmy *</DL>
        <DI value={mf.coId} onChange={e=>setMf({...mf,coId:e.target.value.toUpperCase()})} placeholder="ABC001" style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:20,letterSpacing:4,textAlign:"center"}}/>
        <div style={{fontSize:10,color:"rgba(255,255,255,.25)",marginTop:4,textAlign:"center"}}>6-znakové ID od vášho firemného admina</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><DL>Meno *</DL><DI value={mf.fn} onChange={e=>setMf({...mf,fn:e.target.value})} placeholder="Ján"/></div>
        <div><DL>Priezvisko *</DL><DI value={mf.ln} onChange={e=>setMf({...mf,ln:e.target.value})} placeholder="Novák"/></div>
        <div style={{gridColumn:"1/-1"}}><DL>Email *</DL><DI value={mf.email} onChange={e=>setMf({...mf,email:e.target.value})} placeholder="jan@firma.sk"/></div>
        <div><DL>Heslo *</DL><DI type="password" value={mf.pw} onChange={e=>setMf({...mf,pw:e.target.value})} placeholder="••••••••"/></div>
        <div><DL>Potvrdiť *</DL><DI type="password" value={mf.pw2} onChange={e=>setMf({...mf,pw2:e.target.value})} placeholder="••••••••"/></div>
      </div>
      <button onClick={regM} style={{...dBtn,marginTop:16,width:"100%"}}>Odoslať registráciu →</button>
    </div></div>
  );
}

// ── TV VIEW ────────────────────────────────────────────────────────────────
function TVView({slots,cos,onBack}) {
  const [tick,setTick]=useState(0);
  useEffect(()=>{const i=setInterval(()=>setTick(p=>p+1),60000);return()=>clearInterval(i);},[]);

  const now=NOW();
  const nowStr=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const todayDate=DAYS[0].date;
  const pal={};cos.filter(c=>c.status==="active").forEach((c,i)=>{pal[c.id]=CP[i%CP.length];});

  // Build week entries grouped by day
  const weekData=DAYS.map(day=>{
    const isToday=day.date===todayDate;
    const hourGroups=[];
    HOURS.slice(0,-1).forEach(hour=>{
      const [h]=hour.split(":").map(Number);
      const slotStart=new Date(day.date);slotStart.setHours(h,0,0,0);
      const slotEnd=new Date(slotStart.getTime()+3600000);
      const isActive=isToday&&now>=slotStart&&now<slotEnd;
      const isPast=now>=slotEnd;
      const entries=[];
      ["loading","unloading"].forEach(type=>{
        const s=slots[`${day.date}_${type}_${hour}`];
        if(!s||s.blocked||s.bookings.length===0)return;
        s.bookings.forEach(b=>entries.push({type,b,hour,isActive,isPast}));
      });
      if(entries.length>0)hourGroups.push({hour,entries,isActive,isPast});
    });
    const totalB=hourGroups.reduce((a,g)=>a+g.entries.length,0);
    const doneB=hourGroups.filter(g=>g.isPast).reduce((a,g)=>a+g.entries.length,0);
    return{day,hourGroups,totalB,doneB,isToday};
  }).filter(d=>d.totalB>0); // hide days with no bookings

  const totalWeek=weekData.reduce((a,d)=>a+d.totalB,0);
  const totalLoad=weekData.reduce((a,d)=>a+d.hourGroups.reduce((b,g)=>b+g.entries.filter(e=>e.type==="loading").length,0),0);
  const totalUnload=totalWeek-totalLoad;

  return(
    <div style={{minHeight:"100vh",background:"#070d1a",fontFamily:"'DM Sans',sans-serif",color:"#fff"}}>

      {/* ── HEADER ── */}
      <div style={{background:"#0c1628",borderBottom:"1px solid #192a47",padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{fontSize:28}}>🚚</div>
          <div>
            <div style={{fontWeight:800,fontSize:20,letterSpacing:"-.2px",lineHeight:1.1}}>SpedDKa s.r.o. · Sklad</div>
            <div style={{color:"rgba(255,255,255,.35)",fontSize:12,marginTop:2}}>Týždenný rozvrh · Wk 09.03 – 13.03.2026</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {/* Week stats */}
          {[{v:totalWeek,l:"Celkom",c:T.blue},{v:totalLoad,l:"Nakládok",c:T.load},{v:totalUnload,l:"Vykládok",c:T.unload}].map(s=>(
            <div key={s.l} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"6px 14px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:800,color:s.c,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
            </div>
          ))}
          {/* Clock */}
          <div style={{background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.2)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,fontFamily:"'DM Mono',monospace",color:T.green,letterSpacing:2,lineHeight:1}}>{nowStr}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2,fontWeight:600,letterSpacing:.5}}>ČAS TERAZ</div>
          </div>
          <button onClick={onBack} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.45)",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:11}}>← Admin</button>
        </div>
      </div>

      {/* ── WEEK COLUMNS ── */}
      <div style={{padding:"18px 20px",display:"grid",gridTemplateColumns:`repeat(${weekData.length},1fr)`,gap:14,minHeight:"calc(100vh - 80px)"}}>
        {weekData.map(({day,hourGroups,totalB,doneB,isToday})=>(
          <div key={day.date} style={{display:"flex",flexDirection:"column",gap:0}}>

            {/* Day header */}
            <div style={{
              background:isToday?"#0c2a4a":"#0c1628",
              border:`1px solid ${isToday?"#1e5a8a":"#192a47"}`,
              borderBottom:"none",
              borderRadius:"12px 12px 0 0",
              padding:"10px 14px",
              display:"flex",alignItems:"center",justifyContent:"space-between"
            }}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:800,fontSize:18,color:isToday?T.green:"#fff"}}>{day.label}</span>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:"rgba(255,255,255,.4)"}}>{day.day}.03</span>
                  {isToday&&<span style={{fontSize:9,fontWeight:700,background:"rgba(16,185,129,.15)",border:"1px solid rgba(16,185,129,.3)",color:T.green,borderRadius:99,padding:"1px 8px",animation:"tvTick 2.5s infinite"}}>● DNES</span>}
                </div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:1}}>{totalB} rezerv. · {doneB} hotovo</div>
              </div>
              {/* Day mini progress */}
              <div style={{width:36,height:36,borderRadius:8,background:"rgba(255,255,255,.04)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
                <div style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:"'DM Mono',monospace"}}>{totalB}</div>
                <div style={{width:22,height:2,borderRadius:99,background:"rgba(255,255,255,.1)",overflow:"hidden"}}>
                  <div style={{height:"100%",width:totalB>0?`${Math.round(doneB/totalB*100)}%`:"0%",background:T.green,borderRadius:99}}/>
                </div>
              </div>
            </div>

            {/* Hour slots */}
            <div style={{flex:1,display:"flex",flexDirection:"column",background:"#0a1120",border:`1px solid ${isToday?"#1e5a8a":"#192a47"}`,borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
              {hourGroups.length===0?(
                <div style={{padding:"20px 14px",textAlign:"center",color:"rgba(255,255,255,.2)",fontSize:12,fontStyle:"italic"}}>Žiadne rezervácie</div>
              ):hourGroups.map(({hour,entries,isActive,isPast})=>(
                <div key={hour} style={{borderTop:"1px solid rgba(255,255,255,.04)",background:isActive?"rgba(14,165,233,.04)":isPast?"rgba(255,255,255,.01)":"transparent"}}>
                  {/* Hour strip */}
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px 4px",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                    <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:13,color:isActive?T.load:isPast?"rgba(255,255,255,.25)":"rgba(255,255,255,.6)"}}>{hour}</span>
                    <span style={{fontSize:9,color:"rgba(255,255,255,.2)"}}>–{nextH(hour)}</span>
                    {isActive&&<span style={{fontSize:9,fontWeight:700,color:T.load,background:"rgba(14,165,233,.12)",border:"1px solid rgba(14,165,233,.25)",borderRadius:99,padding:"1px 6px",animation:"tvTick 2s infinite"}}>● TERAZ</span>}
                    {isPast&&<span style={{fontSize:9,color:"rgba(255,255,255,.2)",fontStyle:"italic"}}>hotovo</span>}
                  </div>
                  {/* Booking cards */}
                  <div style={{padding:"4px 8px 8px",display:"flex",flexDirection:"column",gap:5}}>
                    {entries.map((e,i)=>{
                      const isLoad=e.type==="loading";
                      const cp=pal[e.b.companyId]||CP[0];
                      return(
                        <div key={`${e.b.id}_${i}`} style={{
                          background:isPast?"rgba(255,255,255,.02)":"rgba(255,255,255,.04)",
                          border:`1px solid ${isPast?"rgba(255,255,255,.05)":isLoad?"rgba(14,165,233,.2)":"rgba(139,92,246,.2)"}`,
                          borderLeft:`4px solid ${isPast?"rgba(255,255,255,.1)":isLoad?T.load:T.unload}`,
                          borderRadius:9,padding:"9px 11px",
                          opacity:isPast?.5:1,
                        }}>
                          {/* Type + ŠPZ row */}
                          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                            <span style={{fontSize:14}}>{isLoad?"📦":"📬"}</span>
                            <span style={{fontSize:10,fontWeight:700,color:isLoad?T.load:T.unload}}>{isLoad?"NAKLÁDKA":"VYKLÁDKA"}</span>
                            <div style={{marginLeft:"auto",background:cp.bg,border:`1px solid ${cp.border}`,borderRadius:5,padding:"1px 6px"}}>
                              <span style={{fontSize:9,fontWeight:700,color:cp.text}}>{e.b.companyId}</span>
                            </div>
                          </div>
                          {/* ŠPZ — big */}
                          <div style={{background:"rgba(255,255,255,.05)",borderRadius:6,padding:"7px 10px",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:11,color:"rgba(255,255,255,.25)"}}>🚗</span>
                            <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:18,letterSpacing:2,color:isPast?"rgba(255,255,255,.4)":"#fff"}}>{e.b.spz}</span>
                          </div>
                          {/* Tovar + palety */}
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                            <span style={{fontSize:11,color:"rgba(255,255,255,.55)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.b.tovar}</span>
                            <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:13,color:T.amber,flexShrink:0}}>{e.b.palety} ks</span>
                          </div>
                          {e.b.note&&<div style={{marginTop:5,fontSize:10,color:"rgba(255,255,255,.25)",fontStyle:"italic"}}>💬 {e.b.note}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────
function AdminPanel({users,setUsers,cos,setCos,slots,setSlots,gCap,setGCap,setSlotCap,curUser,onLogout,onTV}) {
  const [tab,setTab]      = useState("grid");
  const [uTab,setUTab]    = useState("pending");
  const [gType,setGType]  = useState("both");
  const [fCo,setFCo]      = useState("all");
  const [capIn,setCapIn]  = useState(String(gCap));
  const [capOk,setCapOk]  = useState(false);

  // Edit booking modal
  const [eModal,setEModal]=useState(null);  // {key, bookingId}
  const [eForm,setEForm]  =useState(null);
  const [eSaved,setESaved]=useState(false);

  // Move booking modal
  const [mModal,setMModal]=useState(null);  // {booking, srcKey}
  const [mDay,setMDay]    =useState(null);
  const [mType,setMType]  =useState(null);
  const [mHour,setMHour]  =useState(null);
  const [mErr,setMErr]    =useState("");
  const [mOk,setMOk]      =useState("");

  // Per-slot cap inline edit: {key, val}
  const [sCap,setSCap]    =useState(null);

  const pendCo=cos.filter(c=>c.status==="pending");
  const actCo =cos.filter(c=>c.status==="active");
  const pendU =users.filter(u=>u.status==="pending"&&u.role!=="admin");
  const actU  =users.filter(u=>u.status==="active"&&u.role!=="admin");
  const rejU  =users.filter(u=>u.status==="rejected");

  const pal={};actCo.forEach((c,i)=>{pal[c.id]=CP[i%CP.length];});
  const gS=(date,type,hour)=>slots[`${date}_${type}_${hour}`]||{total:gCap,booked:0,free:gCap,bookings:[],blocked:false};

  const approveCo=id=>{setCos(p=>p.map(c=>c.id===id?{...c,status:"active"}:c));setUsers(p=>p.map(u=>u.coId===id&&u.isContact?{...u,status:"active"}:u));};
  const rejectCo =id=>setCos(p=>p.map(c=>c.id===id?{...c,status:"rejected"}:c));
  const approveU =id=>setUsers(p=>p.map(u=>u.id===id?{...u,status:"active"}:u));
  const rejectU  =id=>setUsers(p=>p.map(u=>u.id===id?{...u,status:"rejected"}:u));
  const deleteU  =id=>setUsers(p=>p.filter(u=>u.id!==id));

  const applyGCap=()=>{
    const n=parseInt(capIn);if(isNaN(n)||n<1)return;
    setGCap(n);
    setSlots(p=>{const ns={...p};Object.keys(ns).forEach(k=>{const s=ns[k];ns[k]={...s,total:n,free:Math.max(0,n-s.booked)};});return ns;});
    setCapOk(true);setTimeout(()=>setCapOk(false),2000);
  };
  const toggleBlock=(date,type,hour)=>{
    const k=`${date}_${type}_${hour}`;
    setSlots(p=>{const s=p[k]||{total:gCap,booked:0,free:gCap,bookings:[],blocked:false};return{...p,[k]:{...s,blocked:!s.blocked}};});
  };

  // Edit
  const openEdit=(key,b)=>{setEModal({key,bid:b.id});setEForm({spz:b.spz,tovar:b.tovar,palety:b.palety,dopravca:b.dopravca,note:b.note||"",loadType:b.loadType});setESaved(false);};
  const saveEdit=()=>{if(!eForm.spz||!eForm.tovar||!eForm.palety)return;setSlots(p=>{const ns={...p};const sl={...ns[eModal.key]};sl.bookings=sl.bookings.map(b=>b.id===eModal.bid?{...b,...eForm}:b);return{...ns,[eModal.key]:sl};});setESaved(true);};
  const closeEdit=()=>{setEModal(null);setEForm(null);setESaved(false);};

  // Move (via modal picker)
  const openMove=(key,b)=>{setMModal({booking:b,srcKey:key});setMDay(null);setMType(b.loadType);setMHour(null);setMErr("");setMOk("");};
  const closeMove=()=>{setMModal(null);setMDay(null);setMType(null);setMHour(null);setMErr("");setMOk("");};
  const doMove=()=>{
    if(!mModal||!mDay||!mType||!mHour){setMErr("Vyberte deň, typ a hodinu.");return;}
    const tKey=`${mDay.date}_${mType}_${mHour}`;
    if(tKey===mModal.srcKey){setMErr("To je ten istý slot.");return;}
    if(isPast(mDay.date,mHour)){setMErr("Tento slot je už expirovaný.");return;}
    const tgt=slots[tKey]||{total:gCap,booked:0,free:gCap,bookings:[],blocked:false};
    if(tgt.blocked){setMErr("Cieľový slot je zablokovaný.");return;}
    if(tgt.free<=0){setMErr("Cieľový slot je plný.");return;}
    setSlots(p=>{
      const ns={...p};
      const src={...(ns[mModal.srcKey]||{total:gCap,booked:0,free:gCap,bookings:[],blocked:false})};
      const tg ={...(ns[tKey]||{total:gCap,booked:0,free:gCap,bookings:[],blocked:false})};
      src.bookings=src.bookings.filter(b=>b.id!==mModal.booking.id);src.booked--;src.free++;
      const upd={...mModal.booking,time:`${mHour}–${nextH(mHour)}`,date:mDay.fullLabel,slotDate:mDay.date,slotHour:mHour,loadType:mType};
      tg.bookings=[...tg.bookings,upd];tg.booked++;tg.free--;
      ns[mModal.srcKey]=src;ns[tKey]=tg;return ns;
    });
    setMOk(`✅ Presunuté na ${mDay.label} ${mHour}`);
    setTimeout(()=>closeMove(),1800);
  };

  // Per-slot cap
  const saveSlotCap=(key)=>{
    if(!sCap||sCap.key!==key)return;
    const n=parseInt(sCap.val);if(isNaN(n)||n<1)return;
    setSlotCap(key,n);setSCap(null);
  };

  const TABS=[{k:"grid",l:"📅 Rozvrh",badge:0},{k:"cos",l:"🏢 Firmy",badge:pendCo.length},{k:"users",l:"👥 Používatelia",badge:pendU.length}];

  // Build schedule rows for a given day
  const buildDayRows=(day)=>{
    const types=gType==="both"?["loading","unloading"]:[gType];
    const rows=[];
    HOURS.slice(0,-1).forEach(hour=>{
      types.forEach(type=>{
        const key=`${day.date}_${type}_${hour}`;
        const s=gS(day.date,type,hour);
        const isExp=isPast(day.date,hour);
        const vis=fCo==="all"?s.bookings:s.bookings.filter(b=>b.companyId===fCo);
        // skip if empty and not blocked (only show rows with content)
        if(!s.blocked&&vis.length===0)return;
        rows.push({hour,type,key,s,isExp,vis,isBlocked:s.blocked});
      });
    });
    return rows;
  };

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.s100,minHeight:"100vh"}}>

      {/* Toast for move ok */}
      {mOk&&<div style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",zIndex:5000,padding:"10px 20px",borderRadius:9,fontWeight:700,fontSize:13,background:"#f0fdf4",border:"1.5px solid #86efac",color:"#15803d",boxShadow:"0 8px 28px rgba(0,0,0,.12)",animation:"slideDown .2s ease"}}>{mOk}</div>}

      {/* Top nav */}
      <div style={{background:T.navy,padding:"0 22px",display:"flex",alignItems:"center",height:56,boxShadow:"0 1px 0 rgba(255,255,255,.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginRight:24}}>
          <div style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>⚙️</div>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:13,lineHeight:1.1}}>Admin Panel</div>
            <div style={{color:"rgba(255,255,255,.3)",fontSize:10}}>SpedDKa s.r.o.</div>
          </div>
        </div>
        <div style={{display:"flex",gap:1,flex:1}}>
          {TABS.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"0 15px",height:56,border:"none",background:"none",cursor:"pointer",fontWeight:600,fontSize:12,color:tab===t.k?"#fff":"rgba(255,255,255,.38)",borderBottom:tab===t.k?`2px solid ${T.blue}`:"2px solid transparent",display:"flex",alignItems:"center",gap:6}}>
              {t.l}{t.badge>0&&<span style={{background:T.blue,color:"#fff",borderRadius:99,padding:"1px 6px",fontSize:9,fontWeight:700}}>{t.badge}</span>}
            </button>
          ))}
        </div>
        {/* Global cap */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginRight:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.07)",borderRadius:9,padding:"4px 9px"}}>
          <span style={{color:"rgba(255,255,255,.35)",fontSize:10,fontWeight:600}}>Glob.kap.</span>
          <button onClick={()=>setCapIn(v=>String(Math.max(1,parseInt(v||1)-1)))} style={nvBtn}>−</button>
          <input type="number" value={capIn} onChange={e=>setCapIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&applyGCap()} style={{width:36,textAlign:"center",background:"transparent",border:"none",color:"#fff",fontWeight:700,fontSize:13,fontFamily:"'DM Mono',monospace",outline:"none"}}/>
          <button onClick={()=>setCapIn(v=>String(Math.min(200,parseInt(v||1)+1)))} style={nvBtn}>+</button>
          <button onClick={applyGCap} style={{padding:"2px 8px",background:capOk?T.green:T.blue,border:"none",color:"#fff",borderRadius:5,fontWeight:700,fontSize:10,cursor:"pointer",transition:"background .25s"}}>{capOk?"✓":"OK"}</button>
        </div>
        {/* TV button */}
        <button onClick={onTV} style={{background:"rgba(16,185,129,.12)",border:"1px solid rgba(16,185,129,.25)",color:"#6ee7b7",borderRadius:7,padding:"5px 13px",cursor:"pointer",fontWeight:700,fontSize:11,marginRight:8,display:"flex",alignItems:"center",gap:5}}>
          📺 TV View
        </button>
        <button onClick={onLogout} className="gh" style={{background:"transparent",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.5)",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontWeight:600,fontSize:11}}>Odhlásiť</button>
      </div>

      <div style={{padding:"20px 22px"}}>

        {/* ── SCHEDULE ── */}
        {tab==="grid"&&(
          <div className="fu">
            {/* Controls */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:3,background:"#fff",border:`1px solid ${T.s200}`,borderRadius:9,padding:3}}>
                {[{k:"both",l:"📋 Oba"},{k:"loading",l:"📦 Nakládka"},{k:"unloading",l:"📬 Vykládka"}].map(t=>(
                  <button key={t.k} onClick={()=>setGType(t.k)} style={{padding:"4px 13px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:600,fontSize:11,background:gType===t.k?T.navy:"transparent",color:gType===t.k?"#fff":T.s500}}>{t.l}</button>
                ))}
              </div>
              <select value={fCo} onChange={e=>setFCo(e.target.value)} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${T.s200}`,background:"#fff",fontWeight:600,fontSize:11,color:T.s700,outline:"none",cursor:"pointer"}}>
                <option value="all">Všetky firmy</option>
                {actCo.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div style={{marginLeft:"auto",fontSize:10,color:T.s400,display:"flex",gap:10,alignItems:"center"}}>
                <span>💡 Prázdne sloty sú skryté</span>
                {actCo.map(c=>{const p=pal[c.id];if(!p)return null;return(<span key={c.id} style={{display:"flex",alignItems:"center",gap:4,background:p.bg,border:`1px solid ${p.border}`,borderRadius:99,padding:"2px 8px",color:p.text,fontWeight:700,fontSize:10}}><span style={{width:6,height:6,borderRadius:"50%",background:p.dot,display:"inline-block"}}/>{c.id}</span>);})}
              </div>
            </div>

            {/* One panel per day */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {DAYS.map(day=>{
                const rows=buildDayRows(day);
                const isExpDay=HOURS.slice(0,-1).every(h=>isPast(day.date,h));
                const types=gType==="both"?["loading","unloading"]:[gType];
                return(
                  <div key={day.date} style={{background:"#fff",border:`1px solid ${T.s200}`,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
                    {/* Day header */}
                    <div style={{background:isExpDay?T.s100:T.navy,padding:"10px 16px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:9,background:isExpDay?"rgba(0,0,0,.05)":"rgba(255,255,255,.09)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                        <span style={{color:isExpDay?T.s400:"rgba(255,255,255,.45)",fontSize:8,fontWeight:700}}>{day.label.toUpperCase()}</span>
                        <span style={{color:isExpDay?T.s600:"#fff",fontSize:16,fontWeight:800,lineHeight:1}}>{day.day}</span>
                      </div>
                      <div>
                        <div style={{color:isExpDay?T.s600:"#fff",fontWeight:700,fontSize:13}}>{day.fullLabel}</div>
                        <div style={{color:isExpDay?T.s400:"rgba(255,255,255,.38)",fontSize:10,marginTop:1}}>
                          {rows.length===0?"Žiadne rezervácie":`${rows.reduce((a,r)=>a+(r.vis?.length||0),0)} rezerv.`}
                        </div>
                      </div>
                      {!isExpDay&&(
                        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                          {types.map(tp=>{
                            const booked=HOURS.slice(0,-1).reduce((a,h)=>a+gS(day.date,tp,h).booked,0);
                            const total=HOURS.slice(0,-1).reduce((a,h)=>a+gS(day.date,tp,h).total,0);
                            const pct=total>0?Math.round(booked/total*100):0;
                            return(
                              <div key={tp} style={{background:"rgba(255,255,255,.07)",borderRadius:7,padding:"3px 9px",display:"flex",alignItems:"center",gap:5}}>
                                <span style={{fontSize:9,color:"rgba(255,255,255,.45)"}}>{tp==="loading"?"📦":"📬"}</span>
                                <div style={{width:40,height:3,borderRadius:99,background:"rgba(255,255,255,.12)",overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${pct}%`,background:pct>=85?T.red:pct>=55?T.amber:T.green,borderRadius:99}}/>
                                </div>
                                <span style={{fontSize:9,color:"rgba(255,255,255,.4)",fontFamily:"'DM Mono',monospace"}}>{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Table */}
                    {rows.length===0?(
                      <div style={{padding:"14px 16px",color:T.s400,fontSize:11,fontStyle:"italic",textAlign:"center"}}>
                        {isExpDay?"⏰ Expirovaný deň":"— Žiadne rezervácie ani blokované sloty —"}
                      </div>
                    ):(
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",minWidth:560}}>
                          <thead>
                            <tr style={{background:T.s50,borderBottom:`2px solid ${T.s200}`}}>
                              <th style={TH({width:100})}>Čas / Kap.</th>
                              {gType==="both"&&<th style={TH({width:85})}>Typ</th>}
                              <th style={TH()}>Ref #</th>
                              <th style={TH()}>ŠPZ</th>
                              <th style={TH()}>Tovar</th>
                              <th style={TH({width:50,textAlign:"center"})}>Plt</th>
                              <th style={TH()}>Firma</th>
                              <th style={TH()}>Poznámka</th>
                              <th style={TH({width:90,textAlign:"right"})}>Akcie</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row,ri)=>{
                              const isLoad=row.type==="loading";
                              const typeAccent=isLoad?T.load:T.unload;
                              const typeBg=isLoad?"#f0f9ff":"#faf5ff";
                              const s=row.s;
                              const pct=s.total>0?Math.round(s.booked/s.total*100):0;
                              const barC=pct>=85?T.red:pct>=55?T.amber:T.green;
                              const isCapEditing=sCap?.key===row.key;

                              if(row.isBlocked){
                                return(
                                  <tr key={`${row.key}_bl`} style={{background:"#fff1f2",borderTop:`1px solid ${T.s200}`}}>
                                    <td style={TD({})}>
                                      <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:12,color:T.navy}}>{row.hour}</div>
                                      <div style={{fontSize:9,color:T.s400}}>–{nextH(row.hour)}</div>
                                    </td>
                                    {gType==="both"&&<td style={TD({})}><TypeBadge type={row.type}/></td>}
                                    <td colSpan={6} style={TD({})}>
                                      <div style={{display:"flex",alignItems:"center",gap:6,color:T.red}}>
                                        <span style={{fontSize:14}}>🔒</span>
                                        <span style={{fontWeight:700,fontSize:12}}>SLOT ZABLOKOVANÝ</span>
                                        <span style={{fontSize:10,color:"#fca5a5"}}>— rezervácie nie sú povolené</span>
                                      </div>
                                    </td>
                                    <td style={TD({textAlign:"right"})}>
                                      <button onClick={()=>toggleBlock(day.date,row.type,row.hour)} style={aBtnR}>Odblokovať</button>
                                    </td>
                                  </tr>
                                );
                              }

                              // Booking rows
                              return row.vis.map((b,bi)=>{
                                const cp=pal[b.companyId]||CP[0];
                                const isFirstInSlot=bi===0;
                                return(
                                  <tr key={`${row.key}_${b.id}`} className="rh" style={{background:ri%2===0?"#fff":T.s50,borderTop:isFirstInSlot&&ri>0?`2px solid ${T.s200}`:`1px solid ${T.s100}`,opacity:row.isExp?.55:1}}>
                                    {/* Time + capacity — only first booking of this slot */}
                                    {isFirstInSlot?(
                                      <td rowSpan={row.vis.length} style={{...TD({}),verticalAlign:"top",borderRight:`1px solid ${T.s100}`,paddingTop:10}}>
                                        <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:12,color:T.navy}}>{row.hour}</div>
                                        <div style={{fontSize:9,color:T.s400,marginBottom:5}}>–{nextH(row.hour)}</div>
                                        {/* Capacity bar + inline edit */}
                                        <div style={{width:"100%"}}>
                                          <div style={{height:3,borderRadius:99,background:T.s200,overflow:"hidden",marginBottom:3}}>
                                            <div style={{height:"100%",width:`${pct}%`,background:barC,borderRadius:99}}/>
                                          </div>
                                          {isCapEditing?(
                                            <div style={{display:"flex",gap:3,alignItems:"center"}}>
                                              <input type="number" value={sCap.val} onChange={e=>setSCap({...sCap,val:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")saveSlotCap(row.key);if(e.key==="Escape")setSCap(null);}} style={{width:38,padding:"2px 4px",fontSize:10,border:`1px solid ${T.blue}`,borderRadius:4,fontFamily:"'DM Mono',monospace",fontWeight:700,outline:"none"}} autoFocus/>
                                              <button onClick={()=>saveSlotCap(row.key)} style={{padding:"2px 5px",background:T.blue,color:"#fff",border:"none",borderRadius:3,cursor:"pointer",fontSize:9,fontWeight:700}}>✓</button>
                                              <button onClick={()=>setSCap(null)} style={{padding:"2px 5px",background:T.s100,color:T.s500,border:"none",borderRadius:3,cursor:"pointer",fontSize:9}}>✕</button>
                                            </div>
                                          ):(
                                            <button onClick={()=>setSCap({key:row.key,val:String(s.total)})} style={{background:"none",border:"none",cursor:"pointer",fontSize:9,color:T.s400,padding:0,display:"flex",alignItems:"center",gap:3}}>
                                              <span style={{fontFamily:"'DM Mono',monospace",fontWeight:600}}>{s.free}/{s.total}</span>
                                              <span style={{fontSize:8,color:T.s300}}>✎</span>
                                            </button>
                                          )}
                                        </div>
                                        <button onClick={()=>toggleBlock(day.date,row.type,row.hour)} title="Blokovať" style={{marginTop:4,padding:"2px 6px",background:T.s50,border:`1px solid ${T.s200}`,borderRadius:4,cursor:"pointer",fontSize:9,color:T.s400}}>🔒</button>
                                      </td>
                                    ):null}
                                    {gType==="both"&&(
                                      <td style={TD({})}>
                                        {bi===0&&<TypeBadge type={row.type}/>}
                                      </td>
                                    )}
                                    {/* Ref */}
                                    <td style={TD({})}>
                                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                                        <div style={{width:3,height:22,borderRadius:99,background:cp.dot,flexShrink:0}}/>
                                        <div>
                                          <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:11,color:T.s900}}>{fmtRef(b.ref)}</div>
                                          <div style={{fontSize:9,color:T.s400}}>by {b.createdBy}</div>
                                        </div>
                                      </div>
                                    </td>
                                    {/* SPZ */}
                                    <td style={TD({})}>
                                      <span style={{fontFamily:"'DM Mono',monospace",fontWeight:600,fontSize:11,color:T.s700,background:T.s100,borderRadius:4,padding:"2px 6px"}}>{b.spz}</span>
                                    </td>
                                    {/* Tovar */}
                                    <td style={TD({})}><span style={{fontSize:12,color:T.s700}}>{b.tovar}</span></td>
                                    {/* Palety */}
                                    <td style={TD({textAlign:"center"})}><span style={{fontSize:12,fontWeight:700,color:T.s600}}>{b.palety}</span></td>
                                    {/* Firma */}
                                    <td style={TD({})}>
                                      <span style={{background:cp.bg,border:`1px solid ${cp.border}`,color:cp.text,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:700}}>{b.companyId}</span>
                                    </td>
                                    {/* Poznámka */}
                                    <td style={TD({})}><span style={{fontSize:10,color:T.s400,fontStyle:b.note?"normal":"italic"}}>{b.note||"—"}</span></td>
                                    {/* Akcie */}
                                    <td style={TD({textAlign:"right"})}>
                                      <div style={{display:"flex",gap:3,justifyContent:"flex-end"}}>
                                        <button onClick={()=>openEdit(row.key,b)} style={aBtnB} title="Upraviť">✏️</button>
                                        <button onClick={()=>openMove(row.key,b)} style={aBtnV} title="Presunúť">↔️</button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              });
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── COMPANIES ── */}
        {tab==="cos"&&(
          <div className="fu">
            {pendCo.length>0&&(
              <div style={{marginBottom:20}}>
                <SectionHead label="⏳ Čaká na schválenie" count={pendCo.length} color={T.amber}/>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {pendCo.map(c=>(
                    <div key={c.id} style={{background:"#fff",border:`1px solid ${T.s200}`,borderLeft:"4px solid #f59e0b",borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <span style={{fontWeight:700,fontSize:13,color:T.s900}}>{c.name}</span>
                          <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:10,background:T.s100,color:T.s500,borderRadius:5,padding:"1px 7px"}}>{c.id}</span>
                        </div>
                        <div style={{fontSize:11,color:T.s400}}>📍 {c.address}, {c.city} · 🏷️ {c.vat} · 📧 {c.email}</div>
                        {users.find(u=>u.coId===c.id&&u.isContact)&&<div style={{fontSize:10,color:T.s400,marginTop:3}}>Kontakt: <b style={{color:T.s600}}>{users.find(u=>u.coId===c.id&&u.isContact)?.name}</b></div>}
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>approveCo(c.id)} style={aBtnG}>✅ Schváliť</button>
                        <button onClick={()=>rejectCo(c.id)}  style={aBtnR}>❌ Zamietnuť</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <SectionHead label="✅ Aktívne firmy" count={actCo.length} color={T.green}/>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {actCo.map(c=>{
                const mc=users.filter(u=>u.coId===c.id&&u.status==="active").length;
                const cp=pal[c.id];
                return(
                  <div key={c.id} style={{background:"#fff",border:`1px solid ${T.s200}`,borderLeft:`4px solid ${cp?.dot||T.blue}`,borderRadius:12,padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        <span style={{fontWeight:700,fontSize:13,color:T.s900}}>{c.name}</span>
                        <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:10,background:T.s100,color:T.s500,borderRadius:5,padding:"1px 7px"}}>{c.id}</span>
                        <span style={{fontSize:10,background:"#f0fdf4",color:T.green,border:"1px solid #bbf7d0",borderRadius:5,padding:"1px 7px",fontWeight:600}}>{mc} používateľ{mc===1?"":"ia/ov"}</span>
                      </div>
                      <div style={{fontSize:11,color:T.s400}}>📍 {c.address}, {c.city} · 🏷️ {c.vat} · 📧 {c.email}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab==="users"&&(
          <div className="fu">
            <div style={{display:"flex",gap:3,background:"#fff",border:`1px solid ${T.s200}`,borderRadius:9,padding:3,marginBottom:16,width:"fit-content"}}>
              {[{k:"pending",l:"⏳ Čakajúci",c:pendU.length},{k:"active",l:"✅ Aktívni",c:actU.length},{k:"rejected",l:"❌ Zamietnutí",c:rejU.length}].map(t=>(
                <button key={t.k} onClick={()=>setUTab(t.k)} style={{padding:"5px 14px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:600,fontSize:11,background:uTab===t.k?T.navy:"transparent",color:uTab===t.k?"#fff":T.s500,display:"flex",alignItems:"center",gap:5}}>
                  {t.l}{t.c>0&&<span style={{background:uTab===t.k?T.blue:T.s200,color:uTab===t.k?"#fff":T.s500,borderRadius:99,padding:"0 5px",fontSize:9,fontWeight:700}}>{t.c}</span>}
                </button>
              ))}
            </div>
            {(uTab==="pending"?pendU:uTab==="active"?actU:rejU).length===0?(
              <div style={{textAlign:"center",padding:"50px 0",color:T.s400}}><div style={{fontSize:32}}>📭</div><div style={{marginTop:6,fontSize:13}}>Žiadni používatelia.</div></div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {(uTab==="pending"?pendU:uTab==="active"?actU:rejU).map(u=>{
                  const co=cos.find(c=>c.id===u.coId);const cp=co?pal[co.id]:null;
                  return(
                    <div key={u.id} style={{background:"#fff",border:`1px solid ${T.s200}`,borderLeft:`4px solid ${cp?.dot||T.s300}`,borderRadius:12,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:34,height:34,borderRadius:9,background:cp?.bg||T.s100,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:cp?.text||T.s500,fontSize:14}}>{u.name.charAt(0)}</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:12,color:T.s900}}>{u.name}{u.isContact&&<span style={{fontSize:8,background:T.s100,color:T.s500,borderRadius:3,padding:"1px 4px",marginLeft:5,fontWeight:600}}>KONTAKT</span>}</div>
                          <div style={{fontSize:10,color:T.s400,marginTop:1}}>{u.email}</div>
                          <div style={{fontSize:10,marginTop:1}}><span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,color:T.blue,fontSize:10}}>{u.coId}</span>{co&&<span style={{color:T.s400,marginLeft:5}}>· {co.name}</span>}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:5}}>
                        {uTab==="pending"&&<><button onClick={()=>approveU(u.id)} style={aBtnG}>✅ Schváliť</button><button onClick={()=>rejectU(u.id)} style={aBtnR}>❌ Zamietnuť</button></>}
                        {uTab==="active"&&<button onClick={()=>rejectU(u.id)} style={aBtnR}>Deaktivovať</button>}
                        {uTab==="rejected"&&<><button onClick={()=>approveU(u.id)} style={aBtnG}>Obnoviť</button><button onClick={()=>deleteU(u.id)} style={aBtnR}>Vymazať</button></>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {eModal&&eForm&&(
        <Overlay onClose={closeEdit} title="✏️ Upraviť rezerváciu" sub="Admin — bez časového obmedzenia" grad={`linear-gradient(135deg,${T.navy},#1e4a6a)`}>
          {eSaved?(
            <div style={{textAlign:"center",padding:"18px 0"}}>
              <div style={{fontSize:40}}>✅</div>
              <div style={{fontWeight:700,fontSize:15,color:T.green,marginTop:8}}>Zmeny uložené!</div>
              <button onClick={closeEdit} style={{...lBtn(T.green),marginTop:14,width:"100%"}}>Zavrieť</button>
            </div>
          ):(
            <>
              <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:7,padding:"7px 11px",marginBottom:14,fontSize:11,color:"#92400e"}}>⚙️ Admin — 1-hodinový zámok sa neuplatňuje</div>
              <EFields form={eForm} setForm={setEForm}/>
              <div style={{display:"flex",gap:8,marginTop:14}}>
                <button onClick={closeEdit} style={{flex:1,...lBtn(T.s400)}}>Zrušiť</button>
                <button onClick={saveEdit} disabled={!eForm.spz||!eForm.tovar||!eForm.palety} style={{flex:2,...lBtn(!eForm.spz||!eForm.tovar||!eForm.palety?"#94a3b8":"#b45309")}}>💾 Uložiť</button>
              </div>
            </>
          )}
        </Overlay>
      )}

      {/* ── MOVE MODAL ── */}
      {mModal&&(
        <Overlay onClose={closeMove} title="↔️ Presunúť rezerváciu" sub={`${fmtRef(mModal.booking.ref)} · ${mModal.booking.spz}`} grad={`linear-gradient(135deg,#4a148c,#6d28d9)`}>
          <div style={{marginBottom:14,background:"rgba(139,92,246,.07)",border:"1px solid rgba(139,92,246,.2)",borderRadius:9,padding:"10px 13px"}}>
            <div style={{fontSize:11,color:T.s500,marginBottom:1}}>Zdrojový slot</div>
            <div style={{fontWeight:700,fontSize:13,color:T.s900}}>{mModal.booking.slotDate} · {mModal.booking.slotHour} · {mModal.booking.loadType==="loading"?"📦 Nakládka":"📬 Vykládka"}</div>
            <div style={{fontSize:11,color:T.s500,marginTop:1}}>🚗 {mModal.booking.spz} · {mModal.booking.tovar}</div>
          </div>
          <div style={{fontWeight:700,fontSize:11,color:T.s500,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Vybrať nový cieľ</div>
          {/* Day picker */}
          <div style={{marginBottom:10}}>
            <label style={lLabel}>Deň</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {DAYS.map(d=>(
                <button key={d.date} onClick={()=>{setMDay(d);setMHour(null);setMErr("");}} style={{padding:"5px 11px",borderRadius:7,border:`1.5px solid ${mDay?.date===d.date?"#7c3aed":T.s200}`,background:mDay?.date===d.date?"#f5f3ff":"#fafafa",color:mDay?.date===d.date?"#7c3aed":T.s700,fontWeight:700,fontSize:11,cursor:"pointer"}}>
                  {d.label} {d.day}
                </button>
              ))}
            </div>
          </div>
          {/* Type picker */}
          <div style={{marginBottom:10}}>
            <label style={lLabel}>Typ</label>
            <div style={{display:"flex",gap:5}}>
              {["loading","unloading"].map(tp=>(
                <button key={tp} onClick={()=>{setMType(tp);setMHour(null);setMErr("");}} style={{flex:1,padding:"6px",borderRadius:7,border:`1.5px solid ${mType===tp?"#7c3aed":T.s200}`,background:mType===tp?"#f5f3ff":"#fafafa",color:mType===tp?"#7c3aed":T.s500,fontWeight:700,fontSize:11,cursor:"pointer"}}>
                  {tp==="loading"?"📦 Nakládka":"📬 Vykládka"}
                </button>
              ))}
            </div>
          </div>
          {/* Hour picker (only if day + type selected) */}
          {mDay&&mType&&(
            <div style={{marginBottom:10}}>
              <label style={lLabel}>Hodina</label>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {HOURS.slice(0,-1).map(h=>{
                  const key=`${mDay.date}_${mType}_${h}`;
                  const s=slots[key]||{total:gCap,booked:0,free:gCap,blocked:false};
                  const exp=isPast(mDay.date,h);
                  const full=s.free<=0;
                  const blk=s.blocked;
                  const same=key===mModal.srcKey;
                  const dis=exp||blk;
                  const pct=s.total>0?Math.round(s.booked/s.total*100):0;
                  const barC=pct>=85?T.red:pct>=55?T.amber:T.green;
                  return(
                    <button key={h} onClick={()=>{if(!dis&&!full){setMHour(h);setMErr("");}}} disabled={dis||full} style={{padding:"5px 9px",borderRadius:7,border:`1.5px solid ${mHour===h?"#7c3aed":same?"#fde68a":dis?"#fee2e2":full?"#fecdd3":T.s200}`,background:mHour===h?"#f5f3ff":same?"#fffbeb":dis?"#fef2f2":full?"#fef2f2":"#fafafa",color:mHour===h?"#7c3aed":same?T.amber:dis?T.red:full?T.red:T.s700,fontWeight:600,fontSize:10,cursor:dis||full?"not-allowed":"pointer",opacity:dis?.5:1}}>
                      <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700}}>{h}</div>
                      {!dis&&<div style={{display:"flex",alignItems:"center",gap:3,marginTop:2}}>
                        <div style={{width:24,height:2,borderRadius:99,background:T.s200,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:barC}}/></div>
                        <span style={{fontSize:7,color:T.s400,fontFamily:"'DM Mono',monospace"}}>{s.free}/{s.total}</span>
                      </div>}
                      {same&&<div style={{fontSize:7,color:T.amber,fontWeight:700}}>SRC</div>}
                      {(exp||blk||full)&&<div style={{fontSize:7,color:T.red}}>{exp?"exp":blk?"blk":"plný"}</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {mErr&&<div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:7,padding:"7px 11px",fontSize:11,color:T.red,fontWeight:600,marginBottom:10}}>{mErr}</div>}
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button onClick={closeMove} style={{flex:1,...lBtn(T.s400)}}>Zrušiť</button>
            <button onClick={doMove} disabled={!mDay||!mType||!mHour} style={{flex:2,...lBtn(!mDay||!mType||!mHour?"#94a3b8":"#7c3aed")}}>↔️ Potvrdiť presun</button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ── DISPATCHER APP ────────────────────────────────────────────────────────
function DispatchApp({curUser,cos,slots,setSlots,gCap,onLogout}) {
  const [aType,setAType] =useState("loading");
  const [selSlot,setSelSlot]=useState(null);
  const [form,setForm]   =useState(EF);
  const [saved,setSaved] =useState(null);
  const [viewMy,setViewMy]=useState(false);
  const [eBook,setEBook] =useState(null);  // {slotKey, bookingId}
  const [eForm,setEForm] =useState(null);
  const [eSaved,setESaved]=useState(false);
  const [drag,setDrag]   =useState(null);  // {slotKey, bookingId}
  const [dragOver,setDragOver]=useState(null);
  const [moveRes,setMoveRes]=useState(null);

  const co    =cos.find(c=>c.id===curUser.coId);
  const coName=co?.name||"";
  const now   =NOW();
  const nowStr=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const myB   =bs=>bs.filter(b=>b.companyId===curUser.coId);
  const gS    =(day,type,hour)=>slots[`${day.date}_${type}_${hour}`]||{total:gCap,booked:0,free:gCap,bookings:[],blocked:false};
  const palI  =cos.filter(c=>c.status==="active").findIndex(c=>c.id===curUser.coId);
  const cp    =CP[palI>=0?palI%CP.length:0];

  const freeClr=(free,total)=>{const r=free/total;return r>.5?T.green:r>.2?T.amber:T.red;};

  const openSlot=(day,type,hour)=>{
    const key=`${day.date}_${type}_${hour}`;
    if(isPast(day.date,hour)||slots[key]?.blocked)return;
    setSelSlot({day,type,hour,key});
    setForm({...EF,dopravca:coName,loadType:type});
    setSaved(null);setViewMy(false);setEBook(null);setEForm(null);setESaved(false);
  };
  const closeSlot=()=>{setSelSlot(null);setSaved(null);};

  const doBook=()=>{
    if(!form.spz||!form.tovar||!form.palety)return;
    const ns={...slots};const sl={...ns[selSlot.key]};
    const b={...form,id:Date.now(),ref:genId(),time:`${selSlot.hour}–${nextH(selSlot.hour)}`,date:selSlot.day.fullLabel,slotDate:selSlot.day.date,slotHour:selSlot.hour,loadType:aType,companyId:curUser.coId,companyName:coName,createdBy:curUser.name};
    sl.bookings=[...sl.bookings,b];sl.booked++;sl.free=sl.total-sl.booked;
    ns[selSlot.key]=sl;setSlots(ns);setSaved(b);
  };

  const openEdit=(sk,b,e)=>{e.stopPropagation();setEBook({sk,bid:b.id});setEForm({spz:b.spz,tovar:b.tovar,palety:b.palety,dopravca:b.dopravca,note:b.note||"",loadType:b.loadType});setESaved(false);};
  const closeEdit=()=>{setEBook(null);setEForm(null);setESaved(false);};
  const saveEdit=()=>{if(!eForm.spz||!eForm.tovar||!eForm.palety)return;setSlots(p=>{const ns={...p};const sl={...ns[eBook.sk]};sl.bookings=sl.bookings.map(b=>b.id===eBook.bid?{...b,...eForm}:b);return{...ns,[eBook.sk]:sl};});setESaved(true);};

  const dStart=(e,sk,bid)=>{setDrag({sk,bid});setMoveRes(null);e.dataTransfer.effectAllowed="move";};
  const dOver=(e,key)=>{e.preventDefault();if(key!==drag?.sk){setDragOver(key);e.dataTransfer.dropEffect="move";}};
  const dDrop=(e,day,type,hour)=>{
    e.preventDefault();setDragOver(null);if(!drag)return;
    const tKey=`${day.date}_${type}_${hour}`;
    if(tKey===drag.sk)return;
    if(isPast(day.date,hour)){setMoveRes({ok:false,msg:"❌ Slot je expirovaný."});setDrag(null);return;}
    const [sd,st,sh]=drag.sk.split("_");
    if(isLocked(sd,sh)){setMoveRes({ok:false,msg:"🔒 Rezervácia je uzamknutá (menej ako 1h)."});setDrag(null);return;}
    const tgt=slots[tKey]||{total:gCap,booked:0,free:gCap,bookings:[],blocked:false};
    if(tgt.blocked||tgt.free<=0){setMoveRes({ok:false,msg:tgt.blocked?"🔒 Cieľový slot je zablokovaný.":"⛔ Cieľový slot je plný."});setDrag(null);return;}
    setSlots(p=>{
      const ns={...p};
      const src={...ns[drag.sk]};const tg={...ns[tKey]};
      const b=src.bookings.find(b=>b.id===drag.bid);if(!b){setDrag(null);return p;}
      src.bookings=src.bookings.filter(b=>b.id!==drag.bid);src.booked--;src.free++;
      const upd={...b,time:`${hour}–${nextH(hour)}`,date:day.fullLabel,slotDate:day.date,slotHour:hour,loadType:type};
      tg.bookings=[...tg.bookings,upd];tg.booked++;tg.free--;
      ns[drag.sk]=src;ns[tKey]=tg;return ns;
    });
    setMoveRes({ok:true,msg:`✅ Presunuté na ${day.label} ${hour}`});setDrag(null);
  };
  const dEnd=()=>{setDrag(null);setDragOver(null);};

  const curS=selSlot?slots[selSlot.key]:null;
  const eBookData=eBook?slots[eBook.sk]?.bookings.find(b=>b.id===eBook.bid):null;

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.s100,minHeight:"100vh"}}>
      {moveRes&&<div onClick={()=>setMoveRes(null)} style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",zIndex:3000,padding:"10px 20px",borderRadius:9,fontWeight:700,fontSize:12,background:moveRes.ok?"#f0fdf4":"#fef2f2",border:moveRes.ok?"1.5px solid #86efac":"1.5px solid #fca5a5",color:moveRes.ok?"#15803d":"#b91c1c",boxShadow:"0 6px 24px rgba(0,0,0,.1)",animation:"slideDown .2s ease",cursor:"pointer"}}>{moveRes.msg}</div>}

      {/* Topbar */}
      <div style={{background:T.navy,padding:"0 22px",display:"flex",alignItems:"center",height:56,gap:14,boxShadow:"0 1px 0 rgba(255,255,255,.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🚚</div>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:13,lineHeight:1.1}}>Timeslot Management</div>
            <div style={{color:"rgba(255,255,255,.3)",fontSize:10}}>SpedDKa s.r.o.</div>
          </div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <div style={{background:"rgba(255,255,255,.06)",borderRadius:7,padding:"3px 9px",fontSize:10,color:"rgba(255,255,255,.35)",fontFamily:"'DM Mono',monospace"}}>🕐 {nowStr}</div>
          <div style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.09)",borderRadius:8,padding:"4px 10px",display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:24,height:24,borderRadius:6,background:cp.bg,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:cp.text,fontSize:11}}>{curUser.name.charAt(0)}</div>
            <div>
              <div style={{color:"#fff",fontWeight:600,fontSize:11}}>{curUser.name}</div>
              <div style={{color:"rgba(255,255,255,.3)",fontSize:9}}>{coName} · <span style={{fontFamily:"'DM Mono',monospace"}}>{curUser.coId}</span></div>
            </div>
          </div>
          <button onClick={onLogout} className="gh" style={{background:"transparent",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.45)",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontWeight:600,fontSize:11}}>Odhlásiť</button>
        </div>
      </div>

      {/* Type toggle */}
      <div style={{padding:"14px 22px 0",display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",gap:3,background:"#fff",border:`1px solid ${T.s200}`,borderRadius:9,padding:3}}>
          {["loading","unloading"].map(t=>(
            <button key={t} onClick={()=>setAType(t)} style={{padding:"5px 18px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:600,fontSize:12,background:aType===t?(t==="loading"?T.load:T.unload):"transparent",color:aType===t?"#fff":T.s500}}>
              {t==="loading"?"📦 Nakládka":"📬 Vykládka"}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto",fontSize:10,color:T.s400,display:"flex",gap:8,alignItems:"center"}}>
          <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:6,height:6,borderRadius:"50%",background:T.green,display:"inline-block"}}/>Voľné</span>
          <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:6,height:6,borderRadius:"50%",background:T.amber,display:"inline-block"}}/>Obmedzené</span>
          <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:6,height:6,borderRadius:"50%",background:T.red,display:"inline-block"}}/>Plné</span>
          <span style={{background:"#e0e7ff",color:T.indigo,borderRadius:5,padding:"1px 7px",fontSize:9,fontWeight:700}}>⠿ Drag = presunúť</span>
        </div>
      </div>

      {/* Grid */}
      <div style={{padding:"14px 22px 28px",overflowX:"auto"}}>
        <div style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,.07),0 4px 14px rgba(0,0,0,.05)",overflow:"hidden",minWidth:660,border:`1px solid ${T.s200}`}}>
          {/* Header */}
          <div style={{display:"grid",gridTemplateColumns:"72px repeat(5,1fr)",background:T.navy}}>
            <div style={{padding:"12px 14px",color:"rgba(255,255,255,.2)",fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>ČAS</div>
            {DAYS.map(day=>(
              <div key={day.date} style={{padding:"12px 12px",borderLeft:"1px solid rgba(255,255,255,.05)"}}>
                <span style={{color:"#fff",fontWeight:700,fontSize:13}}>{day.label}</span>
                <span style={{color:"rgba(255,255,255,.3)",fontSize:10,marginLeft:5,fontFamily:"'DM Mono',monospace"}}>{day.day}.03</span>
              </div>
            ))}
          </div>
          {HOURS.slice(0,-1).map((hour,i)=>(
            <div key={hour} style={{display:"grid",gridTemplateColumns:"72px repeat(5,1fr)",borderTop:`1px solid ${T.s100}`,background:i%2===0?"#fff":T.s50}}>
              <div style={{padding:"10px 14px",borderRight:`2px solid ${T.s100}`}}>
                <div style={{fontSize:12,fontWeight:700,color:T.navy,fontFamily:"'DM Mono',monospace"}}>{hour}</div>
                <div style={{fontSize:8,color:T.s400,marginTop:1}}>–{nextH(hour)}</div>
              </div>
              {DAYS.map(day=>{
                const s=gS(day,aType,hour);
                const myBs=myB(s.bookings);
                const exp=isPast(day.date,hour);
                const blk=s.blocked;
                const clr=freeClr(s.free,s.total);
                const tKey=`${day.date}_${aType}_${hour}`;
                const isDO=dragOver===tKey;
                const canDrop=drag&&s.free>0&&!exp&&!blk&&tKey!==drag.sk;
                return(
                  <div key={day.date} onClick={()=>!exp&&!blk&&!drag&&openSlot(day,aType,hour)}
                    onDragOver={e=>drag&&dOver(e,tKey)} onDrop={e=>drag&&dDrop(e,day,aType,hour)} onDragLeave={()=>setDragOver(null)}
                    style={{padding:"8px 10px",borderLeft:`1px solid ${T.s100}`,cursor:exp||blk?"default":"pointer",background:blk?"#fff1f2":exp?T.s50:isDO&&canDrop?"#eef2ff":isDO&&!canDrop?"#fef2f2":"transparent",minHeight:56,outline:isDO?(canDrop?`2px dashed ${T.indigo}`:`2px dashed ${T.red}`):"none",transition:"background .08s"}}
                    onMouseEnter={e=>{if(!exp&&!blk&&!drag)e.currentTarget.style.background="#f8faff";}}
                    onMouseLeave={e=>{if(!isDO)e.currentTarget.style.background=blk?"#fff1f2":exp?T.s50:"transparent";}}>
                    {exp?<div style={{fontSize:9,color:T.s300,fontStyle:"italic",paddingTop:4}}>⏰ exp.</div>
                    :blk?(<div style={{textAlign:"center",paddingTop:8}}><div style={{fontSize:16}}>🔒</div><div style={{fontSize:8,color:T.red,fontWeight:700,marginTop:1}}>Blokované</div></div>)
                    :(
                      <>
                        <div style={{display:"inline-flex",alignItems:"center",gap:3,background:`${clr}18`,borderRadius:5,padding:"1px 6px",marginBottom:myBs.length?5:0}}>
                          <div style={{width:5,height:5,borderRadius:"50%",background:clr}}/>
                          <span style={{fontSize:10,fontWeight:600,color:clr}}>({s.free})</span>
                        </div>
                        {myBs.map(b=>{
                          const canE=!isLocked(day.date,hour);
                          const sk=`${day.date}_${aType}_${hour}`;
                          const dragging=drag?.bookingId===b.id;
                          return(
                            <div key={b.id} draggable={canE} onDragStart={e=>canE&&dStart(e,sk,b.id)} onDragEnd={dEnd}
                              style={{marginTop:4,background:dragging?"#eff6ff":"#f8fafc",border:dragging?`2px dashed ${T.blue}`:`1px solid ${T.s200}`,borderLeft:`3px solid ${T.green}`,borderRadius:6,padding:"4px 6px",cursor:canE?"grab":"default",opacity:dragging?.45:1,userSelect:"none"}}>
                              <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:2}}>
                                {canE&&<span style={{color:T.s300,fontSize:9}}>⠿</span>}
                                <span style={{fontWeight:700,fontSize:10,color:T.s900,fontFamily:"'DM Mono',monospace"}}>{fmtRef(b.ref)}</span>
                                <button onClick={e=>canE?openEdit(sk,b,e):e.stopPropagation()} style={{marginLeft:"auto",background:canE?"#f0fdf4":T.s50,border:canE?"1px solid #86efac":`1px solid ${T.s200}`,borderRadius:4,cursor:canE?"pointer":"not-allowed",padding:"1px 5px",fontSize:9,color:canE?T.green:T.s400,fontWeight:600}}>{canE?"✏️":"🔒"}</button>
                              </div>
                              <div style={{fontSize:9,color:T.s600,fontFamily:"'DM Mono',monospace"}}>{b.spz}</div>
                              <div style={{fontSize:9,color:T.s400}}>{b.tovar} · {b.palety}ks</div>
                            </div>
                          );
                        })}
                        {isDO&&canDrop&&<div style={{marginTop:4,border:`2px dashed ${T.indigo}`,borderRadius:5,padding:"5px",textAlign:"center",fontSize:9,color:T.indigo,fontWeight:700}}>📥</div>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* New booking modal */}
      {selSlot&&curS&&(
        <Overlay onClose={closeSlot} title={aType==="loading"?"📦 Nová rezervácia":"📬 Nová rezervácia"} sub={`${selSlot.day.fullLabel} · ${selSlot.hour}–${nextH(selSlot.hour)}`} grad={aType==="loading"?`linear-gradient(135deg,${T.navy},#1e4a7a)`:`linear-gradient(135deg,#4a148c,#6a1a9a)`}>
          <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.s200}`,marginBottom:14}}>
            {["Nová rezervácia","Moje rezervácie"].map((lbl,idx)=>(
              <button key={lbl} onClick={()=>setViewMy(idx===1)} style={{flex:1,padding:"9px",border:"none",background:"none",cursor:"pointer",fontWeight:600,fontSize:11,borderBottom:(idx===0?!viewMy:viewMy)?`2px solid ${T.blue}`:"2px solid transparent",color:(idx===0?!viewMy:viewMy)?T.blue:T.s400}}>
                {lbl}{idx===1&&myB(curS.bookings).length>0?` (${myB(curS.bookings).length})`:""}
              </button>
            ))}
          </div>
          {/* Stats */}
          <div style={{display:"flex",background:T.s50,borderRadius:8,marginBottom:14,border:`1px solid ${T.s200}`}}>
            {[{l:"Celkom",v:curS.total,c:T.navy},{l:"Obsadené",v:curS.booked,c:T.red},{l:"Voľné",v:curS.free,c:T.green},{l:"Naše",v:myB(curS.bookings).length,c:T.violet}].map((s,i)=>(
              <div key={s.l} style={{flex:1,textAlign:"center",padding:"8px 0",borderLeft:i>0?`1px solid ${T.s200}`:"none"}}>
                <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
                <div style={{fontSize:9,color:T.s400,marginTop:1}}>{s.l}</div>
              </div>
            ))}
          </div>
          {!viewMy&&(
            saved?(
              <div>
                <div style={{textAlign:"center",marginBottom:12}}><div style={{fontSize:32}}>✅</div><div style={{fontWeight:700,fontSize:14,color:T.green,marginTop:5}}>Rezervácia potvrdená!</div></div>
                <BCard b={saved}/>
                <button onClick={closeSlot} style={{...lBtn(T.blue),marginTop:12,width:"100%"}}>Zavrieť</button>
              </div>
            ):(
              <>
                <EFields form={form} setForm={setForm}/>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button onClick={closeSlot} style={{flex:1,...lBtn(T.s400)}}>Zrušiť</button>
                  <button onClick={doBook} disabled={!form.spz||!form.tovar||!form.palety||curS.free===0} style={{flex:2,...lBtn(!form.spz||!form.tovar||!form.palety||curS.free===0?"#94a3b8":aType==="loading"?T.load:T.unload)}}>
                    {curS.free===0?"⛔ Plný slot":"💾 Uložiť"}
                  </button>
                </div>
              </>
            )
          )}
          {viewMy&&(
            myB(curS.bookings).length===0?<div style={{textAlign:"center",padding:"20px 0",color:T.s400}}><div style={{fontSize:28}}>📭</div><div style={{marginTop:6,fontSize:12}}>Žiadne vaše rezervácie.</div></div>
            :(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {myB(curS.bookings).map(b=>{
                  const canE=!isLocked(selSlot.day.date,selSlot.hour);
                  return(
                    <div key={b.id} style={{background:T.s50,border:`1px solid ${T.s200}`,borderRadius:9,padding:"10px 12px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{fontWeight:700,color:T.s900,fontSize:12,fontFamily:"'DM Mono',monospace"}}>{fmtRef(b.ref)} · {b.spz}</span>
                        <button onClick={e=>canE?openEdit(selSlot.key,b,e):e.stopPropagation()} style={{...lBtn(canE?T.blue:T.s300),padding:"2px 9px",fontSize:10}}>{canE?"✏️ Edit":"🔒"}</button>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 8px",fontSize:11,color:T.s600}}>
                        <span>📦 {b.tovar}</span><span>🔢 {b.palety} pal.</span>
                        <span>🏢 {b.dopravca}</span><span style={{color:T.s400,fontSize:10}}>by {b.createdBy}</span>
                        {b.note&&<span style={{gridColumn:"1/-1"}}>💬 {b.note}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </Overlay>
      )}

      {/* Edit booking modal */}
      {eBook&&eForm&&eBookData&&(
        <Overlay onClose={closeEdit} title="✏️ Upraviť rezerváciu" sub={`${fmtRef(eBookData.ref)} · ${eBookData.time} · ${eBookData.date}`} grad={`linear-gradient(135deg,#065f46,#047857)`}>
          {eSaved?(
            <div style={{textAlign:"center",padding:"18px 0"}}>
              <div style={{fontSize:36}}>✅</div>
              <div style={{fontWeight:700,fontSize:14,color:T.green,marginTop:7}}>Zmeny uložené!</div>
              <BCard b={{...eBookData,...eForm}} style={{marginTop:12}}/>
              <button onClick={closeEdit} style={{...lBtn(T.green),marginTop:12,width:"100%"}}>Zavrieť</button>
            </div>
          ):(
            <>
              <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:7,padding:"7px 11px",marginBottom:12,fontSize:11,color:"#92400e"}}>⚠️ Uzamknuté 1 hodinu pred začiatkom.</div>
              <EFields form={eForm} setForm={setEForm}/>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <button onClick={closeEdit} style={{flex:1,...lBtn(T.s400)}}>Zrušiť</button>
                <button onClick={saveEdit} disabled={!eForm.spz||!eForm.tovar||!eForm.palety} style={{flex:2,...lBtn(!eForm.spz||!eForm.tovar||!eForm.palety?"#94a3b8":T.green)}}>💾 Uložiť</button>
              </div>
            </>
          )}
        </Overlay>
      )}
    </div>
  );
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────
function Overlay({children,onClose,title,sub,grad}) {
  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:14}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:520,boxShadow:"0 20px 50px rgba(0,0,0,.22)",overflow:"hidden"}} className="fu">
        <div style={{background:grad||T.navy,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:15}}>{title}</div>
            {sub&&<div style={{color:"rgba(255,255,255,.5)",fontSize:11,marginTop:2}}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",color:"#fff",fontSize:16,width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"18px 20px 20px",maxHeight:"78vh",overflowY:"auto"}}>{children}</div>
      </div>
    </div>
  );
}

function EFields({form,setForm}) {
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div><label style={lLabel}>Dopravca</label><input value={form.dopravca} onChange={e=>setForm({...form,dopravca:e.target.value})} style={lInput}/></div>
      <div><label style={lLabel}>ŠPZ *</label><input value={form.spz} onChange={e=>setForm({...form,spz:e.target.value})} style={{...lInput,borderColor:!form.spz?"#fca5a5":""}}/></div>
      <div><label style={lLabel}>Tovar *</label><input value={form.tovar} onChange={e=>setForm({...form,tovar:e.target.value})} style={{...lInput,borderColor:!form.tovar?"#fca5a5":""}}/></div>
      <div><label style={lLabel}>Palety *</label><input type="number" min="1" value={form.palety} onChange={e=>setForm({...form,palety:e.target.value})} style={{...lInput,borderColor:!form.palety?"#fca5a5":""}}/></div>
      <div style={{gridColumn:"1/-1"}}>
        <label style={lLabel}>Typ operácie</label>
        <div style={{display:"flex",gap:6}}>
          {["loading","unloading"].map(t=>(
            <button key={t} onClick={()=>setForm({...form,loadType:t})} style={{flex:1,padding:"8px",borderRadius:8,border:`2px solid`,borderColor:form.loadType===t?(t==="loading"?T.load:T.unload):T.s200,background:form.loadType===t?(t==="loading"?"#f0f9ff":"#faf5ff"):"#fafafa",color:form.loadType===t?(t==="loading"?T.load:T.unload):T.s400,fontWeight:700,fontSize:11,cursor:"pointer"}}>
              {t==="loading"?"📦 Nakládka":"📬 Vykládka"}
            </button>
          ))}
        </div>
      </div>
      <div style={{gridColumn:"1/-1"}}><label style={lLabel}>Poznámka</label><textarea rows={2} value={form.note} onChange={e=>setForm({...form,note:e.target.value})} style={{...lInput,resize:"vertical"}}/></div>
    </div>
  );
}

function BCard({b}) {
  const isL=b.loadType==="loading";
  return(
    <div style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:"12px 14px"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:T.green}}/>
        <span style={{fontWeight:800,color:T.green,fontSize:14,fontFamily:"'DM Mono',monospace"}}>{fmtRef(b.ref)}</span>
        <span style={{marginLeft:"auto",fontSize:9,fontWeight:700,borderRadius:5,padding:"1px 7px",background:isL?"#dbeafe":"#ede9fe",color:isL?"#1d4ed8":"#6d28d9"}}>{isL?"📦 Nakládka":"📬 Vykládka"}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px",fontSize:11,color:T.s700}}>
        {[{l:"DOPRAVCA",v:b.dopravca},{l:"TIMESLOT",v:b.time},{l:"DÁTUM",v:b.date},{l:"ŠPZ",v:b.spz},{l:"TOVAR",v:b.tovar},{l:"PALETY",v:b.palety}].map(f=>(
          <div key={f.l}><div style={{color:T.s400,fontSize:8,fontWeight:700,letterSpacing:.5,marginBottom:1}}>{f.l}</div><div style={{fontWeight:600}}>{f.v}</div></div>
        ))}
        {b.note&&<div style={{gridColumn:"1/-1"}}><div style={{color:T.s400,fontSize:8,fontWeight:700,letterSpacing:.5,marginBottom:1}}>POZNÁMKA</div><div style={{fontWeight:600}}>{b.note}</div></div>}
      </div>
    </div>
  );
}

function TypeBadge({type}) {
  const isL=type==="loading";
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:3,background:isL?"#f0f9ff":"#faf5ff",border:`1.5px solid ${isL?"#bae6fd":"#ddd6fe"}`,borderRadius:5,padding:"2px 7px",fontSize:9,fontWeight:700,color:isL?T.load:T.unload,whiteSpace:"nowrap"}}>
      {isL?"📦 Nakl.":"📬 Vykl."}
    </span>
  );
}

function SectionHead({label,count,color}) {
  return(
    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
      <span style={{fontWeight:700,fontSize:12,color}}>{label}</span>
      <span style={{background:`${color}22`,color,borderRadius:99,padding:"1px 7px",fontSize:10,fontWeight:700}}>{count}</span>
    </div>
  );
}

// ── STYLE HELPERS ─────────────────────────────────────────────────────────
const DL = ({children}) => <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(255,255,255,.38)",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{children}</label>;
const DI = ({style,...p}) => <input {...p} style={{width:"100%",padding:"8px 10px",border:"1px solid rgba(255,255,255,.09)",borderRadius:7,fontSize:12,background:"rgba(255,255,255,.05)",color:"#fff",outline:"none",...style}}/>;
const dBtn = {padding:"10px",background:T.blue,color:"#fff",border:"none",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer"};
const dErr = {background:"rgba(239,68,68,.14)",border:"1px solid rgba(239,68,68,.3)",color:"#fca5a5",borderRadius:8,padding:"8px 11px",fontSize:11,marginBottom:12,fontWeight:500};
const bBtn = {background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.38)",fontSize:11,fontWeight:600,padding:"0 0 14px 0",display:"block"};
const nvBtn= {width:18,height:18,borderRadius:4,border:"1px solid rgba(255,255,255,.12)",background:"rgba(255,255,255,.07)",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"};
const lLabel={display:"block",fontSize:9,fontWeight:700,color:T.s400,marginBottom:3,textTransform:"uppercase",letterSpacing:.5};
const lInput ={width:"100%",padding:"8px 10px",border:`1.5px solid ${T.s200}`,borderRadius:7,fontSize:12,background:T.s50,color:T.s900,outline:"none"};
const lBtn  =(bg)=>({padding:"9px 14px",background:bg,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"});
const aBtnB ={padding:"3px 8px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:5,cursor:"pointer",fontSize:10,color:"#1d4ed8",fontWeight:700};
const aBtnV ={padding:"3px 8px",background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:5,cursor:"pointer",fontSize:10,color:"#6d28d9",fontWeight:700};
const aBtnG ={padding:"5px 12px",background:"#f0fdf4",border:"1px solid #86efac",color:"#15803d",borderRadius:7,fontWeight:700,cursor:"pointer",fontSize:11};
const aBtnR ={padding:"5px 12px",background:"#fef2f2",border:"1px solid #fca5a5",color:"#dc2626",borderRadius:7,fontWeight:700,cursor:"pointer",fontSize:11};
const TH    =(s={})=>({padding:"7px 10px",textAlign:s.textAlign||"left",fontSize:9,fontWeight:700,color:T.s400,letterSpacing:.5,textTransform:"uppercase",width:s.width||"auto",...s});
const TD    =(s={})=>({padding:"7px 10px",verticalAlign:"middle",...s});
