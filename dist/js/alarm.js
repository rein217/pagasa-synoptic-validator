/* Batch A — schedule calculation. UTC avoids dependence on the PC's display timezone. */
(function(root){
'use strict';
const hour=3600000,key='pagasaSynopAlarmV1';
function dueSlot(now,settings){
 const step=(settings.schedule==='main'?6:3)*hour;
 const time=Math.floor((now-settings.delay*60000)/step)*step;
 const deadline=time+settings.delay*60000;
 return settings.enabled&&deadline>=settings.armedAt&&now>=deadline?{station:settings.station,time,deadline,id:settings.station+':'+time}:null;
}
root.SynopAlarm={dueSlot};
if(!root.document)return;
const $=id=>document.getElementById(id);
const defaults={enabled:false,station:'',delay:8,schedule:'all',armedAt:0,sound:'urgent'};
let state={settings:{...defaults},entered:{},dismissed:{},snoozed:{}};
let storageOK=true,audio=null,active=null,lastChime=0;
const playingTones=new Set();
const soundTypes=["urgent","ring","chime","custom"];
let pendingCustom=null,pendingBuffer=null,customBuffer=null,customData=null,uploadBusy=false,uploadSerial=0;
try{
 const saved=JSON.parse(localStorage.getItem(key)||'null');
 if(saved&&saved.settings){const s=saved.settings;state.settings={...defaults,enabled:s.enabled===true&&/^\d{5}$/.test(s.station),station:/^\d{5}$/.test(s.station)?s.station:'',delay:Number.isInteger(s.delay)&&s.delay>=1&&s.delay<=120?s.delay:8,schedule:s.schedule==='main'?'main':'all',armedAt:Number.isFinite(s.armedAt)?s.armedAt:Date.now(),sound:soundTypes.includes(s.sound)?s.sound:"urgent"};for(const name of ['entered','dismissed','snoozed'])if(saved[name]&&typeof saved[name]==='object'&&!Array.isArray(saved[name]))state[name]=saved[name];if(saved.custom&&typeof saved.custom.name==='string'&&typeof saved.custom.data==='string'&&/^data:audio\/[a-z0-9.+-]+;base64,/i.test(saved.custom.data)&&saved.custom.data.length<1500000)state.custom=saved.custom;if(state.settings.sound==='custom'&&!state.custom)state.settings.sound='urgent';}
}catch(e){storageOK=false;}
function save(){
 const cutoff=Date.now()-36*hour;
 for(const name of ['entered','dismissed','snoozed'])for(const id of Object.keys(state[name]))if(!Number.isFinite(Number(id.split(':')[1]))||Number(id.split(':')[1])<cutoff)delete state[name][id];
 try{localStorage.setItem(key,JSON.stringify(state));storageOK=true;}catch(e){storageOK=false;}
}
/* Batch B — built-in tones and an optional browser-local uploaded audio file. */
function audioContext(){const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)throw new Error('Audio unavailable');if(!audio)audio=new Audio();return audio;}
async function decodeCustom(custom){
 const bytes=Uint8Array.from(atob(custom.data.split(',')[1]),c=>c.charCodeAt(0));
 const buffer=await audioContext().decodeAudioData(bytes.buffer);
 if(!Number.isFinite(buffer.duration)||buffer.duration<=0)throw new Error('Empty sound');return buffer;
}
async function enableSound(){
 audioContext();if(audio.state!=='running')await audio.resume();if(audio.state!=='running')throw new Error('Audio blocked');
 if(state.settings.sound==='custom'&&state.custom&&customData!==state.custom.data){try{customBuffer=await decodeCustom(state.custom);customData=state.custom.data;}catch(e){customBuffer=null;customData=null;}}
}
function chime(sound=state.settings.sound,buffer=customBuffer){
 if(!audio||audio.state!=='running'){$('alarmSoundStatus').textContent='Sound is not enabled. Open Alarm settings and click Preview sound. The visual reminder remains active.';return false;}
 stopSound();
 try{
 let fallback=false;
 if(sound==='custom'&&buffer){
  const source=audio.createBufferSource();source.buffer=buffer;source.connect(audio.destination);playingTones.add(source);source.onended=()=>{playingTones.delete(source);source.disconnect();};source.start();source.stop(audio.currentTime+Math.min(buffer.duration,30));
  $('alarmSoundStatus').textContent='Uploaded sound repeats after playback, until dismissed or snoozed.';return true;
 }
 if(sound==='custom'){sound='urgent';fallback=true;}
 const count=sound==='chime'?3:sound==='ring'?10:8;
 for(let i=0;i<count;i++){
  const osc=audio.createOscillator(),gain=audio.createGain(),spacing=sound==='chime'?.5:sound==='ring'?.25:.38,t=audio.currentTime+i*spacing;
  osc.type=sound==='urgent'?'square':sound==='ring'?'triangle':'sine';
  osc.frequency.value=sound==='chime'?[523.25,659.25,783.99][i]:sound==='ring'?(i%2?1568:1175):(i%2?1180:880);
  const duration=sound==='chime'?.8:sound==='ring'?.18:.28;
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(sound==='chime'?.14:.18,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
  osc.connect(gain);gain.connect(audio.destination);playingTones.add(osc);osc.onended=()=>{playingTones.delete(osc);osc.disconnect();gain.disconnect();};osc.start(t);osc.stop(t+duration+.02);
 }
 $('alarmSoundStatus').textContent=fallback?'Uploaded sound is unavailable. Using urgent beeps; re-upload or choose a built-in sound.':'Selected alarm repeats every 5 seconds while this reminder is active.';return true;
 }catch(e){$('alarmSoundStatus').textContent='Sound unavailable. Check browser audio permissions and device volume.';return false;}
}
function repeatInterval(){return state.settings.sound==='custom'&&customBuffer?Math.max(5000,Math.min(customBuffer.duration,30)*1000+1000):5000;}
function customLabel(){$('alarmCustomName').textContent=pendingCustom?'Selected file: '+pendingCustom.name:'No custom sound saved.';}
function label(time){return new Intl.DateTimeFormat('en',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(time))+', '+String(new Date(time).getUTCHours()).padStart(2,'0')+'00 UTC';}
function stopSound(){for(const osc of playingTones){try{osc.stop();}catch(e){}}playingTones.clear();}
function clearReminder(){if(active)stopSound();active=null;lastChime=0;$('alarmReminder').hidden=true;}
function status(){const s=state.settings;$('alarmSettings').textContent=s.enabled?'Alarm ON · '+s.delay+' min · Settings':'Alarm OFF · Settings';$('alarmStatus').textContent=!storageOK?'Browser storage is unavailable; settings may not survive a reload.':s.enabled?'Station '+s.station+' · '+(s.schedule==='main'?'main observations':'every 3 hours')+' · UTC'+(!audio||audio.state!=='running'?' · Click Preview sound to enable audio.':''):'';}
/* Batch C — one pending reminder, persisted dismissal, and five-minute snooze. */
function tick(){
 const now=Date.now(),slot=dueSlot(now,state.settings);
 if(!slot||state.entered[slot.id]||state.dismissed[slot.id]||(state.snoozed[slot.id]||0)>now){clearReminder();return;}
 if(!active||active.id!==slot.id){active=slot;lastChime=0;$('alarmReminderTitle').textContent='Observation not entered';$('alarmReminderText').textContent='Station '+slot.station+' · '+label(slot.time)+'. No Validate entry was recorded for this observation. Paste its code and click Validate.';$('alarmReminder').hidden=false;}
 if(!lastChime||now-lastChime>=repeatInterval()){chime();lastChime=now;}
}
$('alarmSettings').addEventListener('click',()=>{const s=state.settings;$('alarmEnabled').checked=s.enabled;$('alarmStation').value=s.station||root.SynopRuleset.parseCode($('synopCode').value).station||'';$('alarmDelay').value=s.delay;$('alarmSchedule').value=s.schedule;$('alarmSound').value=s.sound;pendingCustom=state.custom||null;pendingBuffer=customBuffer;uploadSerial++;uploadBusy=false;$('alarmSoundFile').value='';customLabel();$('alarmSettingsStatus').textContent='';$('alarmDialog').showModal();});
$('alarmClose').addEventListener('click',()=>{stopSound();uploadSerial++;uploadBusy=false;$('alarmDialog').close();});
$('alarmDialog').addEventListener('cancel',()=>{stopSound();uploadSerial++;uploadBusy=false;});
$('alarmStopPreview').addEventListener('click',()=>{stopSound();if(active)lastChime=Date.now();$('alarmSettingsStatus').textContent='Preview stopped.';});
$('alarmSoundFile').addEventListener('change',async()=>{
 const file=$('alarmSoundFile').files?.[0];if(!file)return;const serial=++uploadSerial;uploadBusy=false;
 if(!/\.(mp3|wav)$/i.test(file.name)||file.size<=0||file.size>1048576){$('alarmSettingsStatus').textContent='Choose a nonempty MP3 or WAV file up to 1 MB.';return;}
 uploadBusy=true;$('alarmSettingsStatus').textContent='Checking audio file…';
 try{
  const buffer=await audioContext().decodeAudioData(await file.arrayBuffer());if(!Number.isFinite(buffer.duration)||buffer.duration<=0)throw new Error('Empty sound');
  const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Cannot read file'));reader.readAsDataURL(file);});
  if(serial!==uploadSerial)return;
  // Normalize MIME after decoding, since some systems label WAV as application/octet-stream.
  pendingCustom={name:file.name,data:data.replace(/^data:[^;]*;/,'data:audio/'+(/\.mp3$/i.test(file.name)?'mpeg':'wav')+';')};pendingBuffer=buffer;$('alarmSound').value='custom';customLabel();$('alarmSettingsStatus').textContent='Sound ready. Preview it, then Save settings to keep it in this browser.';
 }catch(e){if(serial===uploadSerial)$('alarmSettingsStatus').textContent='This file could not be decoded as audio. Choose another MP3 or WAV.';}finally{if(serial===uploadSerial)uploadBusy=false;}
});
$('alarmRemoveSound').addEventListener('click',()=>{uploadSerial++;uploadBusy=false;pendingCustom=null;pendingBuffer=null;$('alarmSoundFile').value='';if($('alarmSound').value==='custom')$('alarmSound').value='urgent';customLabel();$('alarmSettingsStatus').textContent='Save settings to remove the uploaded sound.';});
$('alarmTest').addEventListener('click',async()=>{
 if(uploadBusy){$('alarmSettingsStatus').textContent='Wait until the audio file has been checked.';return;}
 const sound=$('alarmSound').value;
 if(sound==='custom'&&!pendingCustom){$('alarmSettingsStatus').textContent='Upload an MP3 or WAV first, or choose a built-in sound.';return;}
 try{await enableSound();if(sound==='custom'&&!pendingBuffer)pendingBuffer=await decodeCustom(pendingCustom);chime(sound,pendingBuffer);if(active)lastChime=Date.now();$('alarmSettingsStatus').textContent='Test chime played. If you cannot hear it, check mute and volume.';}catch(e){$('alarmSettingsStatus').textContent='Audio could not start. Check browser sound permissions; visual reminders are still available.';}status();
});
$('alarmSave').addEventListener('click',async()=>{
 if(uploadBusy){$('alarmSettingsStatus').textContent='Wait until the audio file has been checked.';return;}
 const sound=soundTypes.includes($('alarmSound').value)?$('alarmSound').value:'urgent';if(sound==='custom'&&!pendingCustom){$('alarmSettingsStatus').textContent='Upload an MP3 or WAV first.';return;}
 const station=$('alarmStation').value.trim(),delay=Number($('alarmDelay').value),enabled=$('alarmEnabled').checked,schedule=$('alarmSchedule').value;
 if((enabled&&!/^\d{5}$/.test(station))||(!/^\d{5}$/.test(station)&&station!=='')){$('alarmSettingsStatus').textContent='Enter a five-digit station number.';return;}
 if(!Number.isInteger(delay)||delay<1||delay>120){$('alarmSettingsStatus').textContent='Enter a whole number from 1 to 120 minutes.';return;}
 const old=state.settings;const changed=!old.enabled||old.station!==station||old.delay!==delay||old.schedule!==schedule;
 const next={...state,settings:{enabled,station,delay,schedule,sound,armedAt:changed?Date.now():old.armedAt},custom:pendingCustom};
 try{localStorage.setItem(key,JSON.stringify(next));}catch(e){$('alarmSettingsStatus').textContent='Browser storage could not save these settings or this sound. Try a smaller audio file, or remove it and use a built-in sound.';return;}
 state=next;customBuffer=pendingBuffer;customData=pendingCustom?.data||null;save();stopSound();clearReminder();
 if(enabled){try{await enableSound();}catch(e){/* The status explicitly indicates visual-only operation. */}}
 status();$('alarmDialog').close();tick();
});
$('alarmDismiss').addEventListener('click',()=>{if(active){state.dismissed[active.id]=Date.now();save();}clearReminder();});
$('alarmSnooze').addEventListener('click',()=>{if(active){state.snoozed[active.id]=Date.now()+5*60000;save();}clearReminder();});
/* Batch D — only explicit validation counts. Old text and loading the sample do not. */
root.addEventListener('synop-observation-entered',event=>{
 const d=event.detail||{};
 if(!/^\d{5}$/.test(d.station)||!/^\d{5}$/.test(d.yy)||!Number.isFinite(d.time)||d.groups<2||new Date(d.time).getUTCHours()%3!==0||d.time>Date.now())return;
 state.entered[d.station+':'+d.time]=Date.now();save();tick();
});
document.addEventListener('visibilitychange',()=>{status();tick();});root.addEventListener('focus',()=>{status();tick();});root.addEventListener('storage',e=>{if(e.key===key){try{const s=JSON.parse(e.newValue);if(s&&s.settings){state=s;status();tick();}}catch(err){}}});
status();tick();setInterval(tick,1000);
})(typeof window!=='undefined'?window:globalThis);
