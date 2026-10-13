/*
 * PAGASA SYNOP VALIDATOR — PAGE CONTROLS
 * ---------------------------------------
 * This file only connects the ruleset to the webpage.
 * Meteorological rules belong in ruleset-config.js or ruleset.js.
 */

// Keep page-only variable names inside this private wrapper. This prevents
// them from colliding with functions exported by ruleset.js in the browser.
(() => {

const $ = (id) => document.getElementById(id);
const { parseCode, validate } = window.SynopRuleset;
const sample4 = `SMPH20 RPLC 151200 AAXX 15121 98327 11462 72502 10260 20240 39924 40097 56019 69961 76098 84470 333 10342 56990 58002 84620 87360=JD/MP`;
const n = (value) => value === "" ? null : Number(value);
const pressureHistoryKey = "pagasaSynopMslpHistoryV1";
const pressureHistoryMaxAge = 36 * 60 * 60 * 1000;
let lastResult = null;
let activeObservationKey = null;
let lastValidatedCode="";
let rainfallRows=[];
let lastRainAutoSignature="";
const H=window.SynopHistory;

// Batch A — turn validator results into readable cards.
function render(result){
  lastResult=result;
  const errors=result.issues.filter(x=>x.severity==="error").length;
  const warnings=result.issues.filter(x=>x.severity==="warning").length;
  const state=errors?"invalid":warnings?"warning":"valid";
  const label=errors?"Invalid":warnings?"Valid with warnings":"Valid";
  const escaped=s=>String(s).replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const decoded=Object.entries(result.decoded).map(([k,v])=>`<div class="decoded-item"><span>${escaped(k)}</span>${escaped(v)}</div>`).join("");
  const issues=result.issues.map((x,i)=>`<article class="issue ${x.severity}" data-index="${i}" tabindex="0" role="button" aria-label="Select affected code for ${escaped(x.title)}"><div class="issue-top"><div class="issue-title">${escaped(x.title)}</div><span class="severity">${escaped(x.severity)}</span></div><p>${escaped(x.detail)}</p>${x.group?`<code>${escaped(x.group)}</code>`:""}${x.suggestion?`<p class="suggestion">Correction: ${escaped(x.suggestion)}</p>`:""}</article>`).join("");
  $("results").innerHTML=`<div class="results-head"><h2>Validation result</h2><span class="badge ${state}">${label}</span></div><div class="summary"><div class="metric"><strong>${errors}</strong><span>Errors</span></div><div class="metric"><strong>${warnings}</strong><span>Warnings</span></div><div class="metric"><strong>${result.p.sec1.length+result.p.sec3.length+(result.p.sec5?.length||0)}</strong><span>Data groups checked</span></div></div>${decoded?`<div class="decoded"><h3>Decoded overview</h3><div class="decoded-grid">${decoded}</div></div>`:""}<div class="issues"><h3>Findings and corrections</h3>${issues}</div>`;
}

// Main reports use six hours; intermediate reports use three.
function rainfallHours(p){return [0,6,12,18].includes(Number(p.yy.slice(2,4)))?6:3;}
function history(){const h={p3:n($("p3").value),p24:n($("p24").value),rainOccurred:$("rainOccurred").checked};
 const p=parseCode($("synopCode").value),hour=Number(p.yy.slice(2,4));const time=H.timestamp(p,$("obsDate").value);if(time!==null){h.savedWet6=H.wetEvidence(p.station,time-6*3600000,time).length>0;h.savedRain3=H.threeHourReadings(p.station,time-6*3600000,time);h.savedWet24=hour===0&&H.wetEvidence(p.station,time-24*3600000,time).length>0;}
 if($("rainOccurred").checked){if(rainfallHours(p)===6)h.rain6=H.rainValue($("rain6").value);else h.rain3=H.rainValue($("rain6").value);}
 if(hour===0){const override=H.rainValue($("rain24").value);const total=H.total(rainfallRows.map((r,i)=>H.rainValue($("rainPeriod"+i)?.value||"")));h.rain24=override||(!total?.needsMeasuredTotal?total:null);h.rain24Sum=total&&!total.needsMeasuredTotal?total:null;}
 return h;
}

function observationSlot(code){
  const parsed=parseCode(code);
  const match=/^(\d{2})(\d{2})\d$/.exec(parsed.yy);
  if(!match||!/^[0-9]{5}$/.test(parsed.station)) return null;
  const day=Number(match[1]),hour=Number(match[2]);
  if(day<1||day>31||hour>23) return null;
  return {station:parsed.station,day,hour};
}

function observationKey(code){
  const parsed=parseCode(code);
  if(!/^\d{5}$/.test(parsed.yy)||!/^\d{5}$/.test(parsed.station)) return null;
  return `${parsed.yy}:${parsed.station}`;
}

function previousSlot(slot,hours){
  const totalHours=slot.hour-hours;
  const day=slot.day+Math.floor(totalHours/24);
  if(day<1) return null;
  return {station:slot.station,day,hour:(totalHours%24+24)%24};
}

function storedMslp(){
  try{
    const entries=JSON.parse(window.localStorage.getItem(pressureHistoryKey)||"[]");
    if(!Array.isArray(entries)) return [];
    const now=Date.now();
    const valid=entries.filter(entry=>entry&&/^[0-9]{5}$/.test(entry.station)&&Number.isInteger(entry.day)&&entry.day>=1&&entry.day<=31&&Number.isInteger(entry.hour)&&entry.hour>=0&&entry.hour<=23&&Number.isFinite(entry.mslp)&&Number.isFinite(entry.savedAt)&&now-entry.savedAt>=0&&now-entry.savedAt<=pressureHistoryMaxAge);
    if(valid.length!==entries.length) window.localStorage.setItem(pressureHistoryKey,JSON.stringify(valid));
    return valid;
  }catch{return []}
}

// Batch A2 — pressure basis, persistent history and exact rainfall review.
function fillPressureHistory(){
 const parsed=parseCode($("synopCode").value),time=H.timestamp(parsed,$("obsDate").value),basis=window.SYNOP_RULESET_CONFIG.pressure.stationBasis[parsed.station]||"mslp";
 const label=basis==="stationPressure"?"station pressure":"MSLP";
 $("pressureBasisText").textContent=`Both pressure differences use ${label}${window.SYNOP_RULESET_CONFIG.pressure.stationNames[parsed.station]?" for "+window.SYNOP_RULESET_CONFIG.pressure.stationNames[parsed.station]:""}.`;
 $("p3Label").textContent=`3 hours before, ${label} (hPa)`;$("p24Label").textContent=`24 hours before, ${label} (hPa)`;
 [["p3",3],["p24",24]].forEach(([id,hours])=>{const input=$(id);if(input.dataset.autoFilled==="true"){input.value="";input.dataset.autoFilled="false";}if(time===null||input.value!==""||(id==="p24"&&!window.SYNOP_RULESET_CONFIG.schedule.pressure24Hours.includes(Number(parsed.yy.slice(2,4)))))return;
 let value=H.pressure(parsed.station,time-hours*3600000,basis);
 // Carry existing MSLP history forward, without ever using it as station pressure.
 if(value===null&&basis==="mslp"&&new Date(time-hours*3600000).getUTCMonth()===new Date(time).getUTCMonth())value=findLegacyMslp(parsed,hours);
 if(value!==null){input.value=value.toFixed(1);input.dataset.autoFilled="true";}});
}
function findLegacyMslp(parsed,hours){const slot=observationSlot($("synopCode").value),target=slot&&previousSlot(slot,hours);if(!target)return null;return storedMslp().filter(e=>e.station===parsed.station&&e.day===target.day&&e.hour===target.hour).sort((a,b)=>b.savedAt-a.savedAt)[0]?.mslp??null;}
// Always format saved periods in UTC, with month names for easier review.
function rainDateLabel(time,year=false){const d=new Date(time),months=['January','February','March','April','May','June','July','August','September','October','November','December'];return `${months[d.getUTCMonth()]} ${d.getUTCDate()}${year?', '+d.getUTCFullYear():''}`;}
function rainPeriodLabel(end){const start=end-6*3600000,a=new Date(start),b=new Date(end),hh=d=>String(d.getUTCHours()).padStart(2,'0')+'00',same=a.toISOString().slice(0,10)===b.toISOString().slice(0,10),year=a.getUTCFullYear()!==b.getUTCFullYear();return same?`${rainDateLabel(start)}, ${hh(a)}–${hh(b)} UTC`:`${rainDateLabel(start,year)}, ${hh(a)} – ${rainDateLabel(end,year)}, ${hh(b)} UTC`;}
function syncRainReview(load=false){
 const p=parseCode($("synopCode").value),hour=Number(p.yy.slice(2,4)),time=H.timestamp(p,$("obsDate").value),main=[0,6,12,18].includes(hour),show=/^\d{5}$/.test(p.yy)&&/^\d{5}$/.test(p.station);
 $("rainCard").hidden=!show;$("rain6Wrap").hidden=!show||!$("rainOccurred").checked;const duration=main?6:3;$("rainOccurredLabel").textContent=`Rainfall occurred during the previous ${duration} hours`;$("rainAmountLabel").textContent=`Exact rainfall during the previous ${duration} hours (mm)`;$("rainPeriodNote").textContent=`Matching ${duration}-hour rainfall automatically selects the checkbox; you can change it. Enter the exact amount or T / Trace. A 24-hour total alone does not select it.`;$("rain24Wrap").hidden=hour!==0;$("rainReview").hidden=false;if(!show)return;
 if(load){$("rain6").value=H.rainText(time===null?null:H.find(p.station,time)?.[main?"rain6":"rain3"]);$("rain24").value="";}
 $("historyStatus").textContent=time===null?"Confirm the UTC date before reviewing or saving rainfall.":"Rainfall records: 8 days in this browser. Pressure: 36 hours.";
 if(time!==null&&load){rainfallRows=H.dayRows(p.station,time);$("rainDayLabel").textContent=`Station ${p.station}: ${hour===0?'previous UTC day':'current UTC day so far'}. ${rainDateLabel(rainfallRows[0].time-6*3600000,true)}`;
 $("rainRows").innerHTML=rainfallRows.map((r,i)=>{const period=rainPeriodLabel(r.time);return `<label class="rain-row"><span>${period}<small>${r.future?"Not yet completed":r.rain?"Saved exact amount":r.evidence?"Rain confirmed; exact amount missing":"Missing amount"}</small></span><input id="rainPeriod${i}" aria-label="Rainfall for ${period}" value="${H.rainText(r.rain)}" ${r.future?'disabled':''} placeholder="0 / mm / Trace"></label>`;}).join('');}
 if(time===null){rainfallRows=[];$("rainRows").innerHTML="";}updateRainTotal();
}
function currentRainIndex(){const p=parseCode($("synopCode").value),time=H.timestamp(p,$("obsDate").value);return rainfallRows.findIndex(r=>r.time===time);}
function updateRainTotal(){const completed=rainfallRows.filter(r=>!r.future),values=completed.map(r=>H.rainValue($("rainPeriod"+rainfallRows.indexOf(r))?.value||"")),total=values.length?H.total(values):null,full=completed.length===4;$("rainTotal").textContent=!total?"Total cannot be verified: an exact period amount is missing.":total.needsMeasuredTotal?"Mixed trace and measurable rain: confirm the measured total.":`${full?'24-hour total':'Completed periods subtotal'}: ${H.rainText(total)}${total.trace?'':' mm'}${full?'':' — day incomplete'}`;}
function persistRainReview(){for(let i=0;i<rainfallRows.length;i++){if(rainfallRows[i].future)continue;if(H.rainValue($("rainPeriod"+i)?.value||'')?.invalid){$("rainPopupStatus").textContent='Correct the amounts: use 0, a nonnegative amount with one decimal place, or Trace.';return false;}}
 let saved=true;const p=parseCode($("synopCode").value);rainfallRows.forEach((r,i)=>{if(!r.future)saved=H.save(p.station,r.time,{rain6:H.rainValue($("rainPeriod"+i)?.value||'')})&&saved;});if(!saved)$("rainPopupStatus").textContent='Browser storage could not save these records.';return saved;}
$("openRainReview").addEventListener('click',()=>{if(H.timestamp(parseCode($("synopCode").value),$("obsDate").value)===null){$("historyStatus").textContent='Confirm a UTC date matching AAXX first.';return;}$("rainPopupStatus").textContent='';$("rainDialog").showModal();});
$("closeRainReview").addEventListener('click',()=>$("rainDialog").close());
$("saveRainReview").addEventListener('click',()=>{if(!persistRainReview())return;$("historyStatus").textContent='Rainfall review saved. Validate the observation to cross-check the report.';$("rainDialog").close();lastValidatedCode='';highlightCode();});
function saveCurrentMslp(code,result){const p=result.p,time=H.timestamp(p,$("obsDate").value);if(time===null){$("historyStatus").textContent="History not saved: the UTC date does not match AAXX.";return;}
 const patch={pressureSavedAt:Date.now(),mslp:null,stationPressure:null};const cfg=window.SYNOP_RULESET_CONFIG.pressure;
 for(const [basis,indicator,decoded,min,max]of [["mslp","4","Current MSLP",cfg.minimumMslp,cfg.maximumMslp],["stationPressure","3","Current station pressure",cfg.minimumStationPressure,cfg.maximumStationPressure]]){const groups=p.sec1.slice(2).filter(g=>g[0]===indicator&&/^\d{5}$/.test(g)),v=Number.parseFloat(result.decoded[decoded]);if(groups.length===1&&Number.isFinite(v)&&v>=min&&v<=max)patch[basis]=v;}
 // Preserve observed rainfall as intervals; do not add these as extra amounts.
 const intervals=[];if($("rainOccurred").checked)intervals.push({start:time-rainfallHours(p)*3600000,source:'manual'});
 const duration={1:6,2:12,3:18,4:24,5:1,6:2,7:3,8:9,9:15};
 for(const g of [...p.sec1.slice(2),...p.sec3])if(/^6\d{4}$/.test(g)&&Number(g.slice(1,4))>0&&duration[g[4]]&&!result.issues.some(x=>x.severity==='error'&&String(x.group||'').split(' ').includes(g)))intervals.push({start:time-duration[g[4]]*3600000,source:g});
 patch.rainEvidence=intervals;
 const h=history(),hour=Number(p.yy.slice(2,4));if(rainfallHours(p)===6){if(!h.rain6?.invalid)patch.rain6=h.rain6||null;}else if(!h.rain3?.invalid)patch.rain3=h.rain3||null;
 let saved=H.save(p.station,time,patch);
 rainfallRows.forEach((r,i)=>{if(r.future)return;const v=H.rainValue($("rainPeriod"+i)?.value||"");if(!v?.invalid)saved=H.save(p.station,r.time,{rain6:v||null})&&saved;});
 $("historyStatus").textContent=saved?"History saved in this browser. Review exact amounts before using the total.":"This browser could not save history. Check its storage settings.";
}

// Batch A3 — safe marks behind the native editable textarea.
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
function highlightCode(){const raw=$("synopCode").value,flags=new Map();if(lastResult&&raw===lastValidatedCode)lastResult.issues.forEach(x=>{if(!["error","warning"].includes(x.severity))return;for(const token of String(x.group||"").match(/[A-Z0-9/]+/g)||[]){if(flags.get(token)!=="error")flags.set(token,x.severity);}});
 const end=raw.indexOf('=');$("codeHighlights").innerHTML=raw.replace(/[^\s=]+|=/g,(token,index)=>{const severity=(end<0||index<end)?flags.get(token):null;return severity?`<mark class="${severity}">${escapeHtml(token)}</mark>`:escapeHtml(token);})+'\n';syncCodeScroll();}
function syncCodeScroll(){$("codeHighlights").style.width=($("synopCode").clientWidth+2)+"px";$("codeHighlights").scrollTop=$("synopCode").scrollTop;$("codeHighlights").scrollLeft=$("synopCode").scrollLeft;}
function selectFinding(index){const issue=lastResult?.issues[index];if(!issue||$("synopCode").value!==lastValidatedCode)return;const raw=$("synopCode").value;for(const token of String(issue.group||"").match(/[A-Z0-9/]+/g)||[]){const tokens=[...raw.matchAll(/[^\s=]+|=/g)],hit=tokens.find(m=>m[0]===token);if(hit){const area=$("synopCode");area.focus();area.setSelectionRange(hit.index,hit.index+token.length);const before=raw.slice(0,hit.index),line=before.split('\n').length-1;area.scrollTop=Math.max(0,line*24-24);syncCodeScroll();break;}}}
$("results").addEventListener("click",e=>{const card=e.target.closest('[data-index]');if(card)selectFinding(Number(card.dataset.index));});
$("results").addEventListener("keydown",e=>{if(e.key==='Enter'||e.key===' '){const card=e.target.closest('[data-index]');if(card){e.preventDefault();selectFinding(Number(card.dataset.index));}}});
$("synopCode").addEventListener("scroll",syncCodeScroll);
if(window.ResizeObserver)new ResizeObserver(syncCodeScroll).observe($("synopCode"));
$("rainRows").addEventListener("input",e=>{if(e.target.id==='rainPeriod'+currentRainIndex())$("rain6").value=e.target.value;updateRainTotal();lastValidatedCode="";highlightCode();});
$("rain6").addEventListener("input",()=>{lastValidatedCode="";highlightCode();if($("rainPeriod"+currentRainIndex()))$("rainPeriod"+currentRainIndex()).value=$("rain6").value;updateRainTotal();});
["p3","p24","rain24"].forEach(id=>$(id).addEventListener("change",()=>{lastValidatedCode="";highlightCode();}));
$("rainOccurred").addEventListener("change",()=>{syncRainReview(false);lastValidatedCode="";highlightCode();});
$("obsDate").addEventListener("change",()=>{lastValidatedCode="";highlightCode();["p3","p24"].forEach(id=>{$(id).value="";});fillPressureHistory();syncRainReview(true);});
// Batch B — detect the report time and show the 24-hour field when needed.
function updateTime(){
  const code=$("synopCode").value;
  const nextObservationKey=observationKey(code);
  // Clear the manual answer only when YYGGi/station identifies a different
  // observation. Keep it while correcting groups in the same observation.
  const changed=nextObservationKey!==activeObservationKey;
  if(nextObservationKey&&activeObservationKey&&changed){$("rainOccurred").checked=false;["p3","p24"].forEach(id=>$(id).value="");}
  if(changed||!$("obsDate").value)$("obsDate").value=H.guessDate(parseCode(code));
  if(nextObservationKey) activeObservationKey=nextObservationKey;
  const p=parseCode(code),ok=/^\d{5}$/.test(p.yy),hour=ok?Number(p.yy.slice(2,4)):null;
  $("obsTimeBadge").textContent=ok?`${String(hour).padStart(2,"0")}:00 UTC detected`:"Time not detected";
  $("obsTimeBadge").classList.toggle("active",ok);
  $("p24Wrap").classList.toggle("visible",window.SYNOP_RULESET_CONFIG.schedule.pressure24Hours.includes(hour));
  const evidence=window.SynopRuleset.periodRainfallEvidence(code),signature=evidence.join(' ');
  // Preserve a manual override while the matching rainfall groups stay unchanged.
  if(changed||signature!==lastRainAutoSignature)$("rainOccurred").checked=evidence.length>0;
  lastRainAutoSignature=signature;
  fillPressureHistory();syncRainReview(changed);lastValidatedCode="";highlightCode();
}
$("synopCode").addEventListener("input",updateTime);
$("p3").addEventListener("input",event=>{event.currentTarget.dataset.autoFilled="false";});
$("p24").addEventListener("input",event=>{event.currentTarget.dataset.autoFilled="false";});

// Batch C — button actions.
$("validate").addEventListener("click",()=>{
  fillPressureHistory();
  const code=$("synopCode").value;
  const context=history();
  const result=validate(code,context);
  // Alarm tracks an explicit Validate action, including observations with findings.
  window.dispatchEvent(new CustomEvent("synop-observation-entered",{detail:{station:result.p.station,time:H.timestamp(result.p,$("obsDate").value),yy:result.p.yy,groups:result.p.sec1.length}}));
  rainfallRows.forEach((r,i)=>{const v=H.rainValue($("rainPeriod"+i)?.value||"");if(v?.invalid)result.issues.push({severity:"error",title:"Invalid six-hour rainfall period entry",detail:"Enter a nonnegative amount with one decimal place, or Trace.",group:"",suggestion:"Correct the rainfall review entry."});});
  const invalid=[['Three-hour',context.rain3],['Six-hour',context.rain6],['24-hour',context.rain24]].filter(([label,v])=>v?.invalid);
  for(const [label]of invalid)result.issues.push({severity:"error",title:`Invalid exact ${label.toLowerCase()} rainfall entry`,detail:"Enter a nonnegative amount with at most one decimal place, or Trace.",group:"",suggestion:"Correct the measured rainfall entry."});
  if(Number(result.p.yy.slice(2,4))===0&&!context.rain24)result.issues.push({severity:"info",title:"24-hour rainfall amount not verified",detail:$("rainTotal").textContent||"Enter the exact amounts to verify the 24-hour rainfall total.",group:"",suggestion:"Review the four periods or enter the measured 24-hour total."});
  result.issues=result.issues.filter(x=>x.severity!=="ok"||!result.issues.some(i=>i.severity==="error"||i.severity==="warning"));
  render(result);lastValidatedCode=code;highlightCode();
  saveCurrentMslp(code,result);
});
$("loadSample").addEventListener("click",()=>{$("synopCode").value=sample4;$("rainOccurred").checked=false;["p3","p24"].forEach(id=>$(id).value="");updateTime();render(validate(sample4,history()));lastValidatedCode=sample4;highlightCode();});
$("clear").addEventListener("click",()=>{$("synopCode").value="";$("rainOccurred").checked=false;activeObservationKey=null;lastResult=null;lastValidatedCode="";$("rain6").value="";$("rain24").value="";["p3","p24"].forEach(id=>$(id).value="");updateTime();$("results").innerHTML=`<div class="empty-state"><div class="empty-icon">✓</div><h2>Ready to check</h2><p>Paste an observation and provide its pressure history.</p></div>`;});

async function copyEnteredCode(){
  const code=$("synopCode").value.trim();
  if(!code){window.alert("Enter the SYNOP observation first.");return;}
  let copied=false;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(code);copied=true;}}catch{}
  if(!copied){
    const area=$("synopCode");area.focus();area.select();
    try{copied=document.execCommand("copy");}catch{}
  }
  $("copyStatus").hidden=false;
  $("copyStatus").textContent=copied?"SYNOP code copied.":"Could not copy automatically. Select the code and use your device’s Copy command.";
}
$("copyCode").addEventListener("click",copyEnteredCode);

// Opens the user's own email application. No observation is stored or sent by
// the webpage itself; the user can review and edit the draft before sending.
$("reportIssue").addEventListener("click",()=>{
  const code=$("synopCode").value.trim();
  if(!code){
    window.alert("Enter the SYNOP observation first so it can be included in the email draft.");
    return;
  }

  const result=validate(code,history());
  const errors=result.issues.filter(issue=>issue.severity==="error").length;
  const warnings=result.issues.filter(issue=>issue.severity==="warning").length;
  const findings=result.issues
    .filter(issue=>issue.severity!=="ok")
    .slice(0,5)
    .map(issue=>`- [${issue.severity.toUpperCase()}] ${issue.title}`)
    .join("\n");
  const body=[
    "Hello,",
    "",
    "I would like to report a possible PAGASA SYNOP Validator checking issue.",
    "",
    "ISSUE TYPE (please mark one):",
    "[ ] The observation contains an error that the validator did not detect.",
    "[ ] The validator detected an error, but the observation is correct.",
    "",
    `RULESET: ${window.SYNOP_RULESET_CONFIG.version}`,
    `VALIDATOR SUMMARY: ${errors} error(s), ${warnings} warning(s)`,
    "",
    "ENTERED SYNOP CODE:",
    code,
    "",
    "VALIDATOR FINDINGS (summary):",
    findings||"No error or warning was produced.",
    "",
    "EXPECTED RESULT OR CORRECTION:",
    "Please describe what the validator should have detected or why the flagged code is correct.",
    "",
    "ADDITIONAL NOTES:",
    ""
  ].join("\n");
  const subject=`PAGASA SYNOP Validator issue - ${window.SYNOP_RULESET_CONFIG.version}`;
  const mailto=`mailto:renieragas@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // A real link click is handled more reliably than assigning window.location
  // on hosted/embedded pages. The message remains an editable email draft.
  const link=document.createElement("a");
  link.href=mailto;
  link.style.display="none";
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Copy the same draft as a fallback when no default email application is
  // configured. Clipboard failure does not prevent the mail link from opening.
  if(navigator.clipboard?.writeText) navigator.clipboard.writeText(body).catch(()=>{});
  $("emailStatus").hidden=false;
  $("emailStatus").textContent="Email draft requested. If no email window opened, the report was also copied so you can paste it into an email to renieragas@gmail.com.";
});

if(document.modelContext?.registerTool){
  try{document.modelContext.registerTool({name:"validate_synop",title:"Validate SYNOP",description:"Validate one WMO FM 12 SYNOP observation using the same rules and supporting inputs as the visible checker.",inputSchema:{type:"object",properties:{code:{type:"string"},pressure_3h_ago:{type:"number",description:"Previous pressure using the station’s configured basis: station pressure for Tayabas/Tanay, otherwise MSLP."},pressure_24h_ago:{type:"number"},mslp_3h_ago:{type:"number"},mslp_24h_ago:{type:"number"},rainfall_occurred:{type:"boolean"}},required:["code"],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){if(!input||typeof input.code!=="string")throw new Error("code must be a string");$("synopCode").value=input.code;updateTime();const station=parseCode(input.code).station;const stationBasis=window.SYNOP_RULESET_CONFIG.pressure.stationBasis?.[station]==="stationPressure";const h={p3:input.pressure_3h_ago??(stationBasis?null:input.mslp_3h_ago)??null,p24:input.pressure_24h_ago??(stationBasis?null:input.mslp_24h_ago)??null,rainOccurred:input.rainfall_occurred===true};$("p3").value=h.p3??"";$("p24").value=h.p24??"";$("rainOccurred").checked=h.rainOccurred;const r=validate(input.code,h);render(r);lastValidatedCode=input.code;highlightCode();return {status:r.issues.some(x=>x.severity==="error")?"invalid":r.issues.some(x=>x.severity==="warning")?"warning":"valid",issues:r.issues,decoded:r.decoded};}})}catch(e){console.warn("WebMCP registration unavailable",e)}
}

})();
