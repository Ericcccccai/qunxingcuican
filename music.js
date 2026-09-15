// Static original instrumental music; play starts only after an explicit interaction.
export function createMusic({button,audio,read,write,notify}){
 let enabled=read('music')!=='off',unlocked=false;let track='backstage';
 const saved=read('volume');let volume=saved===null?.24:Number(saved);if(!Number.isFinite(volume)||volume<0||volume>1)volume=.24;
 audio.volume=volume;audio.loop=true;audio.preload='none';audio.src=new URL('./assets/backstage.mp3',import.meta.url).href;
 function update(){const playing=!audio.paused&&!audio.ended;button.textContent=playing?'音乐：开':'音乐：关';button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',playing?'关闭背景音乐':'开启背景音乐');}
 async function play(){if(!enabled||!unlocked||document.hidden)return;try{await audio.play();}catch(e){if(e.name!=='AbortError')notify('点击“音乐”即可开启背景音乐');}update();}
 button.onclick=()=>{unlocked=true;enabled=audio.paused;write('music',enabled?'on':'off');if(enabled)play();else audio.pause();update();};
 audio.addEventListener('playing',update);audio.addEventListener('pause',update);audio.addEventListener('error',()=>{update();notify('音乐暂时没能加载，剧情可以继续');});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();else play();});
 update();return {
  unlock(){unlocked=true;play();},
  scene(scene){const next=scene==='diner'?'afterhours':'backstage';if(next===track)return;track=next;audio.src=new URL(`./assets/${track}.mp3`,import.meta.url).href;play();},
  controls(){const box=document.createElement('label');box.className='volume-control';box.textContent='音乐音量';const input=document.createElement('input');input.type='range';input.min='0';input.max='100';input.value=String(Math.round(volume*100));input.setAttribute('aria-label','背景音乐音量');const output=document.createElement('output');output.textContent=input.value+'%';input.oninput=()=>{volume=Number(input.value)/100;audio.volume=volume;write('volume',String(volume));output.textContent=input.value+'%';};box.append(input,output);return box;}
 };
}
