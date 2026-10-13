import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../dist/js/alarm.js',import.meta.url),'utf8');
const base=Date.parse('2026-10-13T06:00:00Z');let now=base;const minute=60000;
const elements=new Map(),listeners={},store=new Map();let interval;
const element=()=>({value:'',checked:false,hidden:true,textContent:'',handlers:{},addEventListener(k,f){this.handlers[k]=f;},showModal(){this.open=true;},close(){this.open=false;}});
const c={console,Intl,Date:class extends Date{static now(){return now;}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},addEventListener(){}},addEventListener:(n,f)=>listeners[n]=f,setInterval:f=>interval=f,SynopRuleset:{parseCode:()=>({station:'98327'})}};c.window=c;vm.createContext(c);vm.runInContext(source,c);
const $=id=>c.document.getElementById(id),click=async id=>$(id).handlers.click();
assert.match($('alarmSettings').textContent,/OFF/);
const settings={enabled:true,station:'98327',delay:8,schedule:'all',armedAt:base};
assert.equal(c.SynopAlarm.dueSlot(base+7*minute,settings),null);
assert.equal(c.SynopAlarm.dueSlot(base+8*minute,settings).time,base);
assert.equal(c.SynopAlarm.dueSlot(base+8*minute,{...settings,enabled:false}),null);
assert.equal(c.SynopAlarm.dueSlot(base+8*minute,{...settings,armedAt:base+9*minute}),null);
assert.equal(c.SynopAlarm.dueSlot(base+3*3600000+8*minute,{...settings,schedule:'main'}).time,base);
await click('alarmSettings');assert.equal($('alarmStation').value,'98327');$('alarmEnabled').checked=true;$('alarmDelay').value='8';$('alarmSchedule').value='all';await click('alarmSave');
now=base+7*minute;interval();assert.equal($('alarmReminder').hidden,true);
now=base+8*minute;interval();assert.equal($('alarmReminder').hidden,false);assert.match($('alarmReminderText').textContent,/0600 UTC/);assert.match($('alarmSoundStatus').textContent,/not enabled/);
await click('alarmSnooze');assert.equal($('alarmReminder').hidden,true);now+=4*minute;interval();assert.equal($('alarmReminder').hidden,true);now+=minute;interval();assert.equal($('alarmReminder').hidden,false);
listeners['synop-observation-entered']({detail:{station:'98433',time:base,yy:'13061',groups:8}});assert.equal($('alarmReminder').hidden,false,'another station never suppresses alarm');
listeners['synop-observation-entered']({detail:{station:'98327',time:base,yy:'13061',groups:8}});assert.equal($('alarmReminder').hidden,true,'Validate entry acknowledges even if meteorological findings exist');
now=base+3*3600000+8*minute;interval();assert.equal($('alarmReminder').hidden,false);await click('alarmDismiss');interval();assert.equal($('alarmReminder').hidden,true);
await click('alarmSettings');$('alarmDelay').value='-1';await click('alarmSave');assert.match($('alarmSettingsStatus').textContent,/1 to 120/);$('alarmDelay').value='15';await click('alarmSave');assert.match($('alarmSettings').textContent,/15 min/);interval();assert.equal($('alarmReminder').hidden,true,'changed settings do not replay old deadline');
now=base+6*3600000+15*minute;interval();assert.equal($('alarmReminder').hidden,false);
await click('alarmSettings');$('alarmEnabled').checked=false;await click('alarmSave');interval();assert.equal($('alarmReminder').hidden,true);
assert.equal(JSON.parse(store.get('pagasaSynopAlarmV1')).settings.enabled,false);
const reload={...c};reload.window=reload;vm.createContext(reload);vm.runInContext(source,reload);assert.match($('alarmSettings').textContent,/OFF/);
// A midnight slot belongs to the new UTC date, independent of local timezone.
const midnight=Date.parse('2026-11-01T00:00:00Z');assert.equal(c.SynopAlarm.dueSlot(midnight+15*minute,{...settings,delay:15,armedAt:midnight}).time,midnight);
console.log('Alarm UTC deadlines, delay, station isolation, entry acknowledgment, snooze, dismiss, settings and persistence passed');

// Sound test: a successful user gesture creates eight alternating pulses.
let beeps=0,resumes=0;
c.AudioContext=class {constructor(){this.state='suspended';this.currentTime=0;this.destination={};}async resume(){resumes++;this.state='running';}createOscillator(){return {frequency:{},connect(){},start(){beeps++;},stop(){}};}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}};
reload.AudioContext=c.AudioContext;await click('alarmTest');assert.equal(beeps,8);assert.equal(resumes,1);assert.match($('alarmSettingsStatus').textContent,/Test chime played/);
console.log('User-gesture audio resume and eight-pulse alarm passed');
await click('alarmSettings');$('alarmEnabled').checked=true;await click('alarmSave');
now=base+9*3600000+15*minute;interval();const firstAlarmBeeps=beeps;
assert.equal($('alarmReminder').hidden,false);
now+=4000;interval();assert.equal(beeps,firstAlarmBeeps,'does not restart before five seconds');
now+=1000;interval();assert.equal(beeps,firstAlarmBeeps+8,'repeats the urgent burst after five seconds');
await click('alarmDismiss');now+=5000;interval();assert.equal(beeps,firstAlarmBeeps+8,'dismiss stops repetitions');
assert.equal($('alarmReminder').hidden,true);
console.log('Five-second repetition and dismissal checks passed');
// Sound choice and browser-local custom file workflow.
await click('alarmSettings');$('alarmSound').value='ring';let before=beeps;await click('alarmTest');assert.equal(beeps-before,10);
$('alarmSound').value='chime';before=beeps;await click('alarmTest');assert.equal(beeps-before,3);
$('alarmSound').value='custom';await click('alarmTest');assert.match($('alarmSettingsStatus').textContent,/Upload/);
$('alarmSoundFile').files=[{name:'bad.txt',size:10}];await $('alarmSoundFile').handlers.change();assert.match($('alarmSettingsStatus').textContent,/MP3 or WAV/);
$('alarmSoundFile').files=[{name:'large.mp3',size:1048577}];await $('alarmSoundFile').handlers.change();assert.match($('alarmSettingsStatus').textContent,/1 MB/);
let customStarts=0,customStops=0;
c.AudioContext.prototype.decodeAudioData=async()=>({duration:12});
c.AudioContext.prototype.createBufferSource=()=>({connect(){},disconnect(){},start(){customStarts++;},stop(){customStops++;}});
reload.FileReader=class{readAsDataURL(){this.result='data:audio/mpeg;base64,AQID';this.onload();}};
reload.atob=value=>Buffer.from(value,'base64').toString('binary');
$('alarmSoundFile').files=[{name:'alarm.mp3',size:3,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer}];await $('alarmSoundFile').handlers.change();assert.equal($('alarmSound').value,'custom');assert.match($('alarmCustomName').textContent,/alarm.mp3/);
await click('alarmTest');assert.equal(customStarts,1);await click('alarmStopPreview');assert.ok(customStops>=2);
await click('alarmSave');assert.equal(JSON.parse(store.get('pagasaSynopAlarmV1')).settings.sound,'custom');assert.equal(JSON.parse(store.get('pagasaSynopAlarmV1')).custom.name,'alarm.mp3');
now=base+12*3600000+15*minute;interval();before=customStarts;assert.ok(before>=2);
now+=5000;interval();assert.equal(customStarts,before,'custom audio is not interrupted after five seconds');now+=8000;interval();assert.equal(customStarts,before+1,'12-second file repeats after playback plus one second');
await click('alarmDismiss');
// Reload retains both selection and the local audio data.
const restored={...reload};restored.window=restored;vm.createContext(restored);vm.runInContext(source,restored);await click('alarmSettings');assert.equal($('alarmSound').value,'custom');assert.match($('alarmCustomName').textContent,/alarm.mp3/);await click('alarmTest');assert.equal(customStarts,before+2);
await click('alarmRemoveSound');await click('alarmSave');assert.equal(JSON.parse(store.get('pagasaSynopAlarmV1')).custom,null);assert.equal(JSON.parse(store.get('pagasaSynopAlarmV1')).settings.sound,'urgent');
console.log('Built-in selection, file validation, upload/preview/save, persistence, removal and custom repeat timing passed');
await click('alarmSettings');const storedBefore=store.get('pagasaSynopAlarmV1');$('alarmSound').value='ring';const originalSet=restored.localStorage.setItem;restored.localStorage.setItem=()=>{throw new Error('quota');};await click('alarmSave');assert.match($('alarmSettingsStatus').textContent,/could not save/);assert.equal(store.get('pagasaSynopAlarmV1'),storedBefore);restored.localStorage.setItem=originalSet;
restored.AudioContext.prototype.decodeAudioData=async()=>{throw new Error('bad audio');};$('alarmSoundFile').files=[{name:'not-audio.wav',size:5,arrayBuffer:async()=>new ArrayBuffer(5)}];await $('alarmSoundFile').handlers.change();assert.match($('alarmSettingsStatus').textContent,/could not be decoded/);
console.log('Storage-quota failure preserves saved settings and invalid audio is rejected');

// Released-page integration: fresh cache URLs, matching elements and ruleset link.
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.ok(html.includes('Ruleset v0.16.5'));assert.ok(html.includes('dist/js/alarm.js?v=0.16.5-1'));assert.ok(html.includes('dist/js/app.js?v=0.16.5-1'));
assert.ok(!html.includes('Temporary third site'));assert.ok(!html.includes('Alarm review'));
for(const match of source.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes('id="'+match[1]+'"'),'missing element '+match[1]);
console.log('Released-page alarm integration and cache URLs passed');

const css=fs.readFileSync(new URL('../dist/css/styles.css',import.meta.url),'utf8');
assert.match(css,/main > \.alarm-toolbar, main > \.alarm-reminder\{grid-column:1 \/ -1\}/);
assert.ok(html.includes('css/styles.css?v=0.16.5-2'));
console.log('Alarm toolbar and reminder span the grid; layout cache revision passed');
