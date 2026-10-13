/* Browser-only history. Pressure expires after 36 hours; exact rain after 8 days.
 * UTC date is explicit because AAXX has no month or year. Nothing syncs remotely. */
(() => {
 const key='pagasaSynopObservationHistoryV2',pressureAge=36*3600000,rainAge=8*86400000;
 function read(){try{const a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a.filter(e=>e&&typeof e.station==='string'&&Number.isFinite(e.time)&&Number.isFinite(e.savedAt)&&Date.now()-e.savedAt>=0&&Date.now()-e.savedAt<=rainAge):[];}catch{return [];}}
 function write(a){try{localStorage.setItem(key,JSON.stringify(a.slice(-200)));return true;}catch{return false;}}
 function timestamp(parsed,date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{5}$/.test(parsed.yy)||!/^\d{5}$/.test(parsed.station))return null;const hour=Number(parsed.yy.slice(2,4)),t=Date.parse(date+'T'+String(hour).padStart(2,'0')+':00:00Z');if(!Number.isFinite(t)||hour>23||new Date(t).toISOString().slice(0,10)!==date||new Date(t).getUTCDate()!==Number(parsed.yy.slice(0,2)))return null;return t;}
 function guessDate(parsed){if(!/^\d{5}$/.test(parsed.yy))return '';const day=Number(parsed.yy.slice(0,2)),now=new Date(),c=[];for(let delta=-1;delta<=1;delta++){const d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+delta,day));if(d.getUTCDate()===day)c.push(d);}c.sort((a,b)=>Math.abs(a-now)-Math.abs(b-now));return c[0]?.toISOString().slice(0,10)||'';}
 function find(station,time){return read().filter(e=>e.station===station&&e.time===time).sort((a,b)=>b.savedAt-a.savedAt)[0]||null;}
 function save(station,time,patch){if(!Number.isFinite(time))return false;const a=read(),old=find(station,time)||{};return write([...a.filter(e=>!(e.station===station&&e.time===time)),{...old,...patch,station,time,savedAt:Date.now()}]);}
 function pressure(station,time,basis){const e=find(station,time);if(!e||Date.now()-(e.pressureSavedAt||e.savedAt)>pressureAge)return null;return Number.isFinite(e[basis])?e[basis]:null;}
 function rainValue(text){const v=String(text).trim().toLowerCase();if(!v)return null;if(v==='trace'||v==='t')return {trace:true,tenths:null};if(!/^\d+(?:\.\d)?$/.test(v))return {invalid:true};const n=Number(v);if(!Number.isFinite(n)||n>9999)return {invalid:true};return {trace:false,tenths:Math.round(n*10)};}
 function rainText(value){return !value?'':value.trace?'Trace':(value.tenths/10).toFixed(1);}
 function rainRows(station,time){return [18,12,6,0].map(hours=>{const t=time-hours*3600000,e=find(station,t);return {time:t,rain:e?.rain6||null};});}
 // Evidence is checked separately and never added to measured amounts.
 function wetEvidence(station,start,end){return read().filter(e=>e.station===station&&e.time>start&&e.time<=end&&((e.rain6&&(e.rain6.trace||e.rain6.tenths>0)&&e.time-6*3600000>=start)||(e.rain3&&(e.rain3.trace||e.rain3.tenths>0)&&e.time-3*3600000>=start)||(e.rainEvidence||[]).some(v=>Number.isFinite(v.start)&&v.start>=start&&v.start<e.time)));}
 // Exact intermediate quantities are a lower bound, not extra six-hour totals.
 function threeHourReadings(station,start,end){return read().filter(e=>e.station===station&&e.time>start&&e.time<end&&e.time-3*3600000>=start&&new Date(e.time).getUTCHours()%6===3&&e.rain3&&!e.rain3.invalid&&!e.rain3.trace&&Number.isInteger(e.rain3.tenths)&&e.rain3.tenths>=0).map(e=>({time:e.time,tenths:e.rain3.tenths}));}
 function dayRows(station,time){const d=new Date(time),end=d.getUTCHours()===0?time:Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+1);return rainRows(station,end).map(r=>({...r,future:r.time>time,evidence:wetEvidence(station,r.time-6*3600000,r.time).length>0}));}
 function total(values){if(values.some(v=>!v||v.invalid))return null;if(values.some(v=>v.trace)){if(values.every(v=>v.trace||v.tenths===0))return {trace:true,tenths:null};return {needsMeasuredTotal:true};}return {trace:false,tenths:values.reduce((s,v)=>s+v.tenths,0)};}
 window.SynopHistory=Object.freeze({timestamp,guessDate,find,save,pressure,rainValue,rainText,rainRows,dayRows,wetEvidence,threeHourReadings,total});
})();
