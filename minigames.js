export const GAMES = {
  focus: {title:'主角捕获实验', description:'两位主角正在抢镜。光点进入金色区域时按下快门，共拍三张；拍中两次就算稳住场面。', success:'你拍到了两位主角都在焦内的照片。北美叶勤聪 说自己其实还能更好，纽约三星堆 说肩甲不完整。你把相机转给他们：这叫合照，不叫两张单人海报同时开庭。', rough:'三张照片各有各的想法：北美叶勤聪 的丝带、纽约三星堆 的肩甲，以及一张全员失去物理边界的抽象画。两人一致要求重拍，你把它命名为《关系很好，信号不好》。', skip:'你切成自动连拍。相机响了二十声，两个人各自认领了十八张封面。数学在这个天台上暂时没有管辖权。'},
  packing: {title:'客厅领土回收战', description:'选中物品，再点击格子放入箱子。可以旋转。将三件物品全部装进左侧 3 × 4 区域，右侧虚线是客厅通道，不能占。没有倒计时。', success:'箱子居然合上了。纽约三星堆 看着恢复通行的客厅，若有所思：“那刚才其实还能再放一件。”你直接坐在箱盖上，宣布本轮招商结束。', rough:'箱子不服，你也不服。最后 纽约三星堆 自己把装甲抱在怀里，睡袋绑在箱顶。它们形成一座有身份证的移动山脉。', skip:'你把空箱子推给 纽约三星堆：“这是你的副本。”十分钟后，他抱着装甲出来，说箱子空间设计有待优化。你的客厅拒绝承担研发成本。'},
  archive: {title:'返图失忆症', description:'翻开卡片，找出四对相同的返图。不同的两张会在下一次翻牌时盖回。不限时间，七轮内配完可拿到“人类缓存”称号。', success:'四组照片全部找回。纽约三星堆 说“我就知道你记得”，手指已经滑向退出。你把下载按钮点亮给他看，他终于当场存了——存到一个叫“新建文件夹（最终）2”的文件夹。', rough:'照片找齐了，你也短暂体验了 纽约三星堆 的记忆管理方式。他安慰你：“没事，下次再找。”你决定把这句话设成他的手机锁屏。', skip:'你把相册搜索栏交给 纽约三星堆。他输入自己的名字，得到四百八十二个结果。北美叶勤聪 在旁边点评：“这个数据库只收录一种生物。”'}
};
export const PIECES=[{id:'bag',name:'睡袋',w:1,h:3},{id:'armor',name:'肩甲',w:2,h:2},{id:'prop',name:'道具杆',w:2,h:1}];
export function createChallenge(id,random=Math.random){
 if(!GAMES[id])throw new Error('Unknown challenge');
 if(id==='focus')return {id,shots:[]};
 if(id==='packing')return {id,selected:'bag',rotated:false,placed:[],notice:''};
 const cards=[0,0,1,1,2,2,3,3];for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
 return {id,cards,open:[],matched:[],turns:0};
}
export function cellsFor(piece,row,col,rotated=false){const w=rotated?piece.h:piece.w,h=rotated?piece.w:piece.h;return Array.from({length:w*h},(_,i)=>({r:row+Math.floor(i/w),c:col+i%w}));}
export function challengeResult(c){
 if(c.id==='focus'&&c.shots.length===3){const hits=c.shots.filter(v=>v>=38&&v<=62).length;return {status:hits>=2?'success':'rough',score:hits,detail:`抓拍命中 ${hits} / 3`};}
 if(c.id==='packing'&&c.placed.length===3)return {status:'success',score:3,detail:'三件行李归箱，客厅通道畅通'};
 if(c.id==='archive'&&c.matched.length===8)return {status:c.turns<=7?'success':'rough',score:c.turns,detail:`返图配对完成，用了 ${c.turns} 轮`};
 return null;
}
export function actChallenge(c,action){
 if(challengeResult(c))return false;
 if(c.id==='focus'){if(action.type!=='shoot'||!Number.isFinite(action.position)||action.position<0||action.position>100)return false;c.shots.push(Math.round(action.position));return true;}
 if(c.id==='packing'){
  if(action.type==='select'){if(!PIECES.some(p=>p.id===action.id)||c.placed.some(p=>p.id===action.id))return false;c.selected=action.id;c.rotated=false;c.notice='';return true;}
  if(action.type==='rotate'){c.rotated=!c.rotated;return true;}
  if(action.type!=='place'||!Number.isInteger(action.row)||!Number.isInteger(action.col))return false;
  const piece=PIECES.find(p=>p.id===c.selected);if(!piece)return false;
  const cells=cellsFor(piece,action.row,action.col,c.rotated),occupied=c.placed.flatMap(p=>cellsFor(PIECES.find(x=>x.id===p.id),p.row,p.col,p.rotated));
  if(cells.some(x=>x.r<0||x.r>=4||x.c<0||x.c>=3)){c.notice='放不下。右边是通道，不是箱子的拓展坞。';return true;}
  if(cells.some(x=>occupied.some(y=>x.r===y.r&&x.c===y.c))){c.notice='撞到了。物品不能靠“我们很熟”挤进同一格。';return true;}
  c.placed.push({id:piece.id,row:action.row,col:action.col,rotated:c.rotated});c.selected=PIECES.find(p=>!c.placed.some(x=>x.id===p.id))?.id||null;c.rotated=false;c.notice=`${piece.name}已归箱。`;return true;
 }
 if(action.type!=='flip'||!Number.isInteger(action.index)||action.index<0||action.index>7||c.matched.includes(action.index)||c.open.includes(action.index))return false;
 if(c.open.length===2)c.open=[];c.open.push(action.index);
 if(c.open.length===2){c.turns++;if(c.cards[c.open[0]]===c.cards[c.open[1]]){c.matched.push(...c.open);c.open=[];}}return true;
}
export function validChallenge(c){
 if(!c||!GAMES[c.id])return false;
 if(c.id==='focus')return Array.isArray(c.shots)&&c.shots.length<=3&&c.shots.every(v=>Number.isInteger(v)&&v>=0&&v<=100);
 if(c.id==='archive'){const indexList=a=>Array.isArray(a)&&new Set(a).size===a.length&&a.every(i=>Number.isInteger(i)&&i>=0&&i<8);return Array.isArray(c.cards)&&c.cards.length===8&&[0,1,2,3].every(v=>c.cards.filter(x=>x===v).length===2)&&indexList(c.open)&&c.open.length<=2&&indexList(c.matched)&&c.matched.length%2===0&&c.open.every(i=>!c.matched.includes(i))&&[0,1,2,3].every(v=>c.matched.filter(i=>c.cards[i]===v).length%2===0)&&Number.isInteger(c.turns)&&c.turns>=0&&c.turns<=10000;}
 if(!Array.isArray(c.placed)||c.placed.length>3||new Set(c.placed.map(p=>p.id)).size!==c.placed.length||typeof c.rotated!=='boolean'||typeof c.notice!=='string')return false;
 const occupied=[];for(const p of c.placed){const piece=PIECES.find(x=>x.id===p.id);if(!piece||!Number.isInteger(p.row)||!Number.isInteger(p.col)||typeof p.rotated!=='boolean')return false;for(const cell of cellsFor(piece,p.row,p.col,p.rotated)){const key=cell.r*4+cell.c;if(cell.r<0||cell.r>=4||cell.c<0||cell.c>=3||occupied.includes(key))return false;occupied.push(key);}}
 return c.placed.length===3?c.selected===null:PIECES.some(p=>p.id===c.selected)&&!c.placed.some(p=>p.id===c.selected);
}
