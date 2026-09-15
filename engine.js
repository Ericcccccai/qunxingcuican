import {story,start,yRoute,zRoute,friendRoute} from './story.js';
import {GAMES,createChallenge,validChallenge,challengeResult} from './minigames.js';
export const VERSION=2;
export function fresh(name='你'){return {version:VERSION,name:name.trim().slice(0,16)||'你',node:start,y:0,z:0,self:0,photo:null,reply:null,log:[],ending:null,games:{},challenge:null};}
export function format(text,s){return text.replaceAll('{name}',s.name);}
export function availableRoutes(s){return [{label:'坐 yqc 对面，看看他到底有几句“就一句”',target:yRoute,locked:s.y<3,reason:'多接几次 yqc 的戏才会开放'},{label:'坐 zzc 那边，先抢回被肩甲占的凳子',target:zRoute,locked:s.z<3,reason:'多接几次 zzc 的戏才会开放'},{label:'坐中间。吃完各回各家，不接售后',target:friendRoute,locked:false}];}
export function current(s){return story[s.node];}
export function record(s,speaker,text){s.log.push({speaker,text:format(text,s)});}
export function advance(s){const n=current(s);if(s.ending)return false;if(s.reply){s.reply=null;if(n.next){s.node=n.next;return true;}return false;}if(n.ending){s.ending=n.ending;return true;}if(n.choices||n.routeChoice||(n.game&&!s.games[n.game]))return false;if(n.next){s.node=n.next;return true;}return false;}
export function choose(s,index){const n=current(s);if(s.reply||s.ending)return false;if(n.routeChoice){const r=availableRoutes(s)[index];if(!r||r.locked)return false;record(s,'你',r.label);s.node=r.target;return true;}const c=n.choices?.[index];if(!c)return false;record(s,'你',c.label);for(const k of ['y','z','self'])s[k]+=c.effect[k]||0;if(c.effect.photo)s.photo=c.effect.photo;s.reply=c.reply;if(c.effect.ending)s.ending=c.effect.ending;return true;}
export function beginChallenge(s){const id=current(s).game;if(!id||s.games[id])return null;if(!s.challenge)s.challenge=createChallenge(id);return s.challenge;}
export function finishChallenge(s,skip=false){const id=current(s).game;if(!id||s.games[id]||(!skip&&s.challenge?.id!==id))return false;const result=skip?{status:'skip',score:0,detail:'交给当事人处理'}:s.challenge&&challengeResult(s.challenge);if(!result)return false;s.games[id]=result;s.challenge=null;s.reply=GAMES[id][result.status];record(s,'事件记录',GAMES[id].title+'：'+result.detail);return true;}
export function pack(s){return JSON.stringify(s);}
export function unpack(raw){try{
 const s=JSON.parse(raw);if(!s||s.version!==VERSION||!story[s.node]||typeof s.name!=='string'||!s.name.trim()||s.name.length>16)return null;
 if(!['y','z','self'].every(k=>Number.isInteger(s[k])&&s[k]>=0&&s[k]<=30))return null;
 if(!Array.isArray(s.log)||s.log.length>1000||!s.log.every(x=>x&&typeof x.speaker==='string'&&typeof x.text==='string'))return null;
 if(s.reply!==null&&typeof s.reply!=='string')return null;
 if(![null,'y','z','friend'].includes(s.ending)||![null,'soft','bounce','fun'].includes(s.photo))return null;
 if(!s.games||typeof s.games!=='object'||Array.isArray(s.games)||Object.entries(s.games).some(([id,r])=>!GAMES[id]||!r||!['success','rough','skip'].includes(r.status)||!Number.isInteger(r.score)||r.score<0||r.score>10000||typeof r.detail!=='string'))return null;
 if(s.challenge!==null&&(!validChallenge(s.challenge)||s.challenge.id!==story[s.node].game||s.games[s.challenge.id]))return null;
 return s;
}catch{return null;}}
