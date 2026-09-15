import {GAMES,PIECES,actChallenge,challengeResult,cellsFor} from './minigames.js';
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;}
function btn(text,fn,cls='mini-button'){const b=el('button',cls,text);b.type='button';b.onclick=fn;return b;}
export function mountChallenge(root,c,{change,accept,retry,skip}){
 let frame=0,disposed=false,start=performance.now();
 const title=el('p','mini-instruction',GAMES[c.id].description);root.append(title);
 const board=el('div','mini-board');root.append(board);
 const actions=el('div','mini-actions');root.append(actions);
 const cleanup=()=>{disposed=true;cancelAnimationFrame(frame);};
 function action(a){if(actChallenge(c,a)){change(c);draw();}}
 function draw(){cancelAnimationFrame(frame);board.replaceChildren();actions.replaceChildren();const result=challengeResult(c);
  if(result){board.append(el('p','mini-result-label',result.status==='success'?'阶段性胜利':'抽象成果已出炉'),el('h3','mini-result',result.detail),el('p','mini-reaction',GAMES[c.id][result.status]));actions.append(btn('带着结果回去',()=>accept(result),'primary'),btn('再试一次',retry),btn('直接继续',()=>accept(result)));return;}
  if(c.id==='focus'){
   const meter=el('div','focus-meter');meter.setAttribute('aria-hidden','true');meter.append(el('div','focus-zone'));const cursor=el('div','focus-cursor');meter.append(cursor);board.append(el('p','mini-score',`已拍 ${c.shots.length} / 3　命中 ${c.shots.filter(v=>v>=38&&v<=62).length}`),meter,el('p','fine','光点在金色区域内时拍摄。可以点按钮，或聚焦按钮后按空格。'));
   const shoot=btn('按下快门',()=>action({type:'shoot',position:position()}),'primary shutter');actions.append(shoot);start=performance.now();
   function position(){return 50+48*Math.sin((performance.now()-start)/800-Math.PI/2);}
   function animate(){if(disposed)return;cursor.style.left=position()+'%';frame=requestAnimationFrame(animate);}animate();shoot.focus({preventScroll:true});
  }else if(c.id==='packing'){
   const tools=el('div','piece-tools');for(const p of PIECES){const b=btn(p.name+` ${p.w}×${p.h}`,()=>action({type:'select',id:p.id}));b.disabled=c.placed.some(x=>x.id===p.id);b.setAttribute('aria-pressed',String(c.selected===p.id));tools.append(b);}board.append(tools);
   const selected=PIECES.find(p=>p.id===c.selected);board.append(el('p','mini-score',`当前：${selected.name}　${c.rotated?selected.h:selected.w} × ${c.rotated?selected.w:selected.h}　已装 ${c.placed.length} / 3`));
   const grid=el('div','packing-grid');grid.setAttribute('aria-label','行李箱格子，第四列是不可占用的客厅通道');for(let r=0;r<4;r++)for(let col=0;col<4;col++){const p=c.placed.find(p=>cellsFor(PIECES.find(x=>x.id===p.id),p.row,p.col,p.rotated).some(cell=>cell.r===r&&cell.c===col));const b=btn(col===3?'通道':p?PIECES.find(x=>x.id===p.id).name:'·',()=>action({type:'place',row:r,col}),'packing-cell');b.dataset.row=r;b.dataset.col=col;b.setAttribute('aria-label',`第 ${r+1} 行第 ${col+1} 列${col===3?' 通道':p?' '+p.id:' 空位'}`);b.dataset.piece=p?.id||'';if(col===3){b.classList.add('corridor');b.disabled=true;}grid.append(b);}board.append(grid);const notice=el('p','mini-notice',c.notice||'点击一个空格，放置物品的左上角。');notice.setAttribute('role','status');board.append(notice);actions.append(btn('旋转物品',()=>action({type:'rotate'})),btn('清空重装',retry));
  }else{
   board.append(el('p','mini-score',`已找回 ${c.matched.length/2} / 4 对　翻牌 ${c.turns} 轮`));const grid=el('div','memory-grid');const names=['北美叶勤聪 正片','纽约三星堆 肩甲','三人合照','蛋糕物证'];for(let i=0;i<8;i++){const open=c.open.includes(i)||c.matched.includes(i),card=c.cards[i];const b=btn('',()=>action({type:'flip',index:i}),'memory-card');b.dataset.index=i;b.dataset.open=String(open);b.disabled=c.matched.includes(i);b.setAttribute('aria-label',open?names[card]+(b.disabled?' 已配对':' 已翻开'):`翻开第 ${i+1} 张返图`);if(open){const pic=el('div','memory-image photo-'+card);pic.setAttribute('aria-hidden','true');b.append(pic,el('span','',names[card]));}else b.append(el('span','memory-back','未下载'),el('small','',String(i+1).padStart(2,'0')));grid.append(b);}board.append(grid,el('p','mini-notice',c.open.length===2?'这两张不是一对。点击下一张继续。':'点开两张相同的照片。'));
  }
  actions.append(btn('跳过，交给他们处理',skip,'quiet'));
 }
 draw();return cleanup;
}
