import {chapters,endings,scenes,wardrobes} from './story.js';
import {fresh,current,format,record,advance,choose,availableRoutes,pack,unpack,beginChallenge,finishChallenge} from './engine.js';
import {GAMES,createChallenge} from './minigames.js';
import {mountChallenge} from './minigame-ui.js';
import {createMusic} from './music.js';
const $=id=>document.getElementById(id);
let state=null,auto=false,timer=null,toastTimer=null,miniCleanup=null,storageWorks=true;
const KEY='askmefirst.';
function read(key){try{return localStorage.getItem(KEY+key);}catch{storageWorks=false;return null;}}
function write(key,val){try{localStorage.setItem(KEY+key,val);return true;}catch{storageWorks=false;return false;}}
function notify(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3500);}
const music=createMusic({button:$('music-toggle'),audio:$('bgm'),read,write,notify});
function stopAuto(){auto=false;clearTimeout(timer);$('auto').textContent='自动阅读';$('auto').setAttribute('aria-pressed','false');}
function disposeMini(){miniCleanup?.();miniCleanup=null;}
function modal(title,content,mini=false){
 stopAuto();disposeMini();$('modal').classList.toggle('minigame-modal',mini);$('modal-title').textContent=title;$('modal-content').replaceChildren();
 if(typeof content==='string'){const p=document.createElement('p');p.textContent=content;$('modal-content').append(p);}else $('modal-content').append(content);
 if(!$('modal').open)$('modal').showModal();$('modal').scrollTop=0;
}
function button(text,fn,cls='slot'){const b=document.createElement('button');b.textContent=text;b.className=cls;b.onclick=fn;return b;}
function closeModal(){disposeMini();$('modal').close();}
$('close-modal').onclick=closeModal;
$('modal').addEventListener('close',disposeMini);
$('modal').addEventListener('click',e=>{if(e.target!==$('modal'))return;const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();});
function show(screen){for(const id of ['title','game','ending'])$(id).hidden=id!==screen;$('app').dataset.screen=screen;}
function saveAuto(){if(!write('auto',pack(state)))$('hint').textContent='浏览器未允许保存，当前进度仅在本次页面保留';}
function logVisible(){const n=current(state),speaker=state.reply?'旁白':n.speaker,text=state.reply||n.text;const last=state.log.at(-1);if(!last||last.text!==format(text,state)||last.speaker!==speaker)record(state,speaker,text);}
function render(){
 if(!state)return;
 if(state.ending){if(state.reply){record(state,'旁白',state.reply);state.reply=null;}renderEnding();saveAuto();return;}
 show('game');logVisible();const n=current(state),ch=chapters[n.chapter],scene=scenes[n.scene];
 $('chapter-no').textContent=ch[0];$('chapter-name').textContent=ch[1];$('scene-note').textContent=n.location||ch[2];
 const wardrobe=wardrobes[n.wardrobe];document.querySelectorAll('.portrait img').forEach((image,i)=>{const src=`./assets/${wardrobe.image}.webp`;if(image.getAttribute('src')!==src)image.src=src;image.alt=(['yqc','你','zzc'][i])+'，'+wardrobe.label;});$('game').dataset.wardrobe=n.wardrobe;$('game').dataset.scene=n.scene;$('game').style.setProperty('--scene-image',`url('./assets/${scene.image}.webp')`);music.scene(n.scene);
 const speaker=state.reply?'旁白':n.speaker;$('speaker').textContent=speaker==='你'?state.name:speaker;$('speaker').dataset.who=speaker;
 $('speaker-tag').textContent=({yqc:'主角必须是我',zzc:'就借一点地方','你':'今日客服，随时下班',旁白:'事件现场'})[speaker]||'';
 $('text').textContent=format(state.reply||n.text,state);$('line-number').textContent=String(state.log.length).padStart(3,'0');
 for(const id of ['y','z'])$(id+'-track').textContent=(id==='y'?'yqc':'zzc')+' · '+(state[id]>=5?'已开始加戏':state[id]>=3?'默契互损':'先看热闹');
 $('game').dataset.chapter=n.chapter;$('game').dataset.speaker=speaker;$('game').dataset.route=n.route;$('player-caption').firstChild.textContent=state.name;
 const challenge=!state.reply&&n.game&&!state.games[n.game],options=!state.reply&&(n.choices||n.routeChoice||challenge);
 $('choices').replaceChildren();$('choices').hidden=!options;$('hint').textContent=challenge?'玩一局，或者交给他们处理':options?'请选择你的应对方式':'点击继续 / 空格';
 $('dialogue').setAttribute('aria-disabled',String(!!options));$('dialogue').setAttribute('aria-label',options?'当前剧情，请在上方选择操作':'阅读下一段');
 if(options){
  stopAuto();
  if(challenge){$('choices').append(button(state.challenge?'继续小游戏':'开始：'+GAMES[n.game].title,openMini,'choice mini-entry'),button('不玩了，让他们自己处理',()=>{finishChallenge(state,true);render();},'choice mini-skip'));}
  else{const opts=n.routeChoice?availableRoutes(state):n.choices;opts.forEach((o,i)=>{
   const b=button('',()=>{if(choose(state,i))render();},'choice'),num=document.createElement('span'),txt=document.createElement('span');num.className='choice-index';num.textContent=String(i+1).padStart(2,'0');txt.textContent=o.label;b.append(num,txt);
   if(o.locked){b.disabled=true;const small=document.createElement('small');small.textContent=o.reason;b.append(small);}$('choices').append(b);
  });}
 }
 saveAuto();if(auto){clearTimeout(timer);timer=setTimeout(next,Math.max(3500,$('text').textContent.length*130));}
}
function openMini(){
 const c=beginChallenge(state);if(!c)return;saveAuto();const box=document.createElement('div');box.className='minigame';modal(GAMES[c.id].title,box,true);
 miniCleanup=mountChallenge(box,c,{change:saveAuto,accept:()=>{if(finishChallenge(state)){closeModal();render();}},retry:()=>{state.challenge=createChallenge(c.id);openMini();},skip:()=>{finishChallenge(state,true);closeModal();render();}});
}
function next(){if(!state||$('modal').open||!$('ending').hidden)return;if(advance(state))render();}
function newGame(){
 music.unlock();const box=document.createElement('form');box.innerHTML='<p>今晚，你的血压也会参与剧情。</p><label for="player-name">怎么称呼你？</label><input id="player-name" name="playerName" maxlength="16" autocomplete="nickname" placeholder="输入你的名字" value="阿予"><p class="fine">三位角色都是成年人。玩家采用中性形象。可以恋爱，也可以直接下班。</p>';
 const submit=button('走上天台',()=>{},'primary');submit.type='submit';box.append(submit);box.onsubmit=e=>{e.preventDefault();state=fresh(box.elements.playerName.value);closeModal();render();if(!storageWorks)notify('浏览器限制了本地存储，请保持页面开启');};modal('在事故开始之前',box);setTimeout(()=>$('player-name').focus(),60);
}
function title(){stopAuto();show('title');music.scene('rooftop');const raw=read('auto');$('continue').disabled=!unpack(raw);}
function restart(){const box=document.createElement('div');box.innerHTML='<p>重新开始会更新自动进度。同版本的手动存档会保留。</p>';box.append(button('重新写下名字',()=>{closeModal();newGame();},'primary'),button('留在这一页',closeModal,'quiet'));modal('重新开始故事？',box);}
function slots(mode){
 const box=document.createElement('div'),lead=document.createElement('p');lead.className='fine';lead.textContent='保存在当前浏览器。小游戏中途关闭弹窗后也可以存档，已完成的操作会保留。';box.append(lead);
 for(let i=1;i<=3;i++){
  let parsed=null;try{parsed=JSON.parse(read('slot'+i));}catch{}const saved=parsed&&unpack(parsed.state);
  const detail=saved?`${saved.name} · ${saved.ending?endings[saved.ending].title:chapters[current(saved).chapter][1]} · ${new Date(parsed.time).toLocaleString('zh-CN')}`:parsed?'旧版或无效存档，请重新开始':'空白存档';
  const b=button(`位置 ${i}　${detail}`,()=>{
   if(mode==='save'){
    const commit=()=>{if(write('slot'+i,JSON.stringify({time:Date.now(),state:pack(state)}))){closeModal();notify('已保存到位置 '+i);}else notify('保存失败：浏览器不允许本地存储');};
    if(saved){const confirm=document.createElement('div'),p=document.createElement('p');p.textContent=`替换位置 ${i} 的「${saved.name}」进度？`;confirm.append(p,button('替换这个存档',commit,'primary'),button('返回存档列表',()=>slots(mode),'quiet'));modal('覆盖存档？',confirm);}else commit();
   }else if(saved){state=saved;closeModal();render();notify('已读取位置 '+i);}
  });b.disabled=mode==='load'&&!saved;box.append(b);
 }modal(mode==='save'?'保存这一刻':'回到某一刻',box);
}
function history(){const box=document.createElement('div');box.className='history-list';for(const line of state.log){const item=document.createElement('div'),b=document.createElement('b'),p=document.createElement('p');b.textContent=line.speaker==='你'?state.name:line.speaker;p.textContent=line.text;item.append(b,p);box.append(item);}modal('事故回放',box);box.lastElementChild?.scrollIntoView({block:'end'});}
function renderEnding(){
 stopAuto();show('ending');music.scene('diner');const e=endings[state.ending];$('ending-number').textContent=e.number;$('ending-title').textContent=e.title;$('ending-body').textContent=e.body;
 $('ending-note').textContent=e.note+(state.photo?'\n合照收藏：'+({soft:'暂时闭麦',bounce:'铁器退场',fun:'太阳也有今天'})[state.photo]:'');
 const incidents=document.createElement('div');incidents.className='incident-record';for(const [id,r] of Object.entries(state.games)){const p=document.createElement('p');p.textContent=GAMES[id].title+'：'+r.detail;incidents.append(p);}$('ending-note').append(incidents);
 let unlocked=[];try{unlocked=JSON.parse(read('endings-v2'))||[];}catch{}if(!Array.isArray(unlocked))unlocked=[];unlocked=unlocked.filter(x=>endings[x]);if(!unlocked.includes(state.ending))unlocked.push(state.ending);write('endings-v2',JSON.stringify(unlocked));const seen=document.createElement('p');seen.className='fine';seen.textContent=`已读结局 ${unlocked.length} / 3`;$('ending-note').append(seen);
}
$('start').onclick=newGame;
$('continue').onclick=()=>{music.unlock();const s=unpack(read('auto'));if(s){state=s;render();}else{notify('没有可读取的当前版本进度');title();}};
$('about').onclick=()=>modal('关于这份备忘录','原创虚构熟人喜剧。yqc、zzc 是虚构角色代号，所有人物均为成年人。性格与荒诞情节是创作推演，不代表真实人物言行。六章、六处场景、三个小游戏、三种结局。恋爱可选，性格不会一键修好。角色与背景采用原创生成插画，配乐为原创合成器纯音乐。点击或空格继续，数字键选择；小游戏支持点击与键盘，可随时跳过。');
$('dialogue').onclick=next;$('history').onclick=history;$('save').onclick=()=>slots('save');$('load').onclick=()=>slots('load');
$('auto').onclick=()=>{const n=current(state);if(!state.reply&&(n.choices||n.routeChoice||(n.game&&!state.games[n.game]))){notify('先处理当前选项或小游戏');return;}auto=!auto;$('auto').textContent=auto?'停止自动':'自动阅读';$('auto').setAttribute('aria-pressed',String(auto));if(auto)render();else clearTimeout(timer);};
$('restart').onclick=restart;$('replay').onclick=newGame;$('end-home').onclick=title;$('home').onclick=title;
$('menu').onclick=()=>{const box=document.createElement('div');box.append(music.controls(),button('保存进度',()=>slots('save')),button('读取存档',()=>slots('load')),button('返回标题',()=>{closeModal();title();}),button('继续故事',closeModal));modal('短暂停留',box);};
document.addEventListener('keydown',e=>{if($('modal').open||$('game').hidden||e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Space'&&(e.target===document.body||e.target===$('dialogue'))){e.preventDefault();next();}if(['1','2','3'].includes(e.key)&&!$('choices').hidden){const b=$('choices').children[Number(e.key)-1];if(b&&!b.disabled)b.click();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAuto();});title();
