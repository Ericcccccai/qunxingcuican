import {rm,mkdir,cp,access} from 'node:fs/promises';
const root=new URL('../',import.meta.url),dist=new URL('../dist/',import.meta.url);
for(const name of ['keyvisual.webp','rooftop.webp','birthday.webp','cast.webp','cast-cosplay.webp','cast-casual.webp','convention.webp','lounge.webp','ktv.webp','diner.webp','backstage.mp3','afterhours.mp3']) await access(new URL('assets/'+name,root));
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const file of ['index.html','style.css','app.js','story.js','engine.js','minigames.js','minigame-ui.js','music.js','assets']) await cp(new URL(file,root),new URL(file,dist),{recursive:true});
console.log('Build complete: dist, all paths relative.');
