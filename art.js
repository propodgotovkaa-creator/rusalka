'use strict';

// All illustrated layers are local assets. A sprite remains a single PNG file;
// nested SVG viewports select its cell without distorting adjacent drawings.
const ART_FILES = ['ocean','bride-body','bride-hair','tails-v2','bride-outfits','groom-heads-v3','groom-torsos-v3'];
const ART_DATA = {};
function artHref(name){return `assets/${name}.png`;}
function sprite(name,index,x,y,w,h,filter=''){
  const size=name==='tails-v2'?[1254,1254]:[1774,887];
  const cw=size[0]/4,ch=name==='tails-v2'?(index<4?505:520):size[1]/2;
  const sy=name==='tails-v2'?(index<4?100:680):Math.floor(index/4)*ch;
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${index%4*cw} ${sy} ${cw} ${ch}" preserveAspectRatio="none" overflow="hidden"><image href="${artHref(name)}" width="${size[0]}" height="${size[1]}" ${filter?`filter="url(#${filter})"`:''}/></svg>`;
}
function tintDef(id,color,strength=1.5){const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255);return `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${rgb.map((c,i)=>`<feFunc${'RGB'[i]} type="linear" slope="${c*strength}" intercept=".015"/>`).join('')}</feComponentTransfer></filter>`;}
function renderPerson(s,m=false,{thumb=false,viewBox='70 25 370 740',id,previewKey}={}){
 if(m)return renderGroom(s,{thumb,viewBox,id,previewKey});
 const p=id||`art${serial++}`,base=m?'groom':'bride',skin=palettes.skin[s.skin],gem=palettes.gemColor[s.gemColor];
 const body=(extra='')=>`<image href="${artHref(base+'-body')}" x="135" y="85" width="230" height="345" ${extra}/>`;
 const eyePositions=m?[[236.2,149],[264.5,148.6]]:[[230.7,159],[270.8,157]];
 const hairW=m?[113,116,113,113,116,115,115,115][s.hair]:[240,239,221,230,220,224,237,242][s.hair];
 const hairTop=m?[.51,.51,.50,.51,.42,.44,.46,.42][s.hair]:[.18,.19,.39,.18,.27,.29,.19,.25][s.hair];
 const hx=250-hairW/2,hy=(m?132:124)-hairTop*hairW;
 const hairLayer=sprite(m?'groom-hair-short':'bride-hair',s.hair,hx,hy,hairW,hairW,p+'-hair');
 if(thumb && ['hair','tail','outfit','makeup'].includes(previewKey)){
   let content='', defs='';
   if(previewKey==='hair'){defs=tintDef(p+'-hair',palettes.hairColor[s.hairColor],2.6);content=body()+hairLayer;}
   if(previewKey==='tail'){defs=tintDef(p+'-tail',palettes.tailColor[s.tailColor],1.35);content=sprite('tails-v2',s.tail,79,370,320,375,p+'-tail');viewBox='70 385 345 355';}
   if(previewKey==='outfit'){defs=tintDef(p+'-cloth',palettes.outfitColor[s.outfitColor],1.18);content=sprite(base+'-outfits',s.outfit,175,240,150,160,p+'-cloth');viewBox='170 235 160 175';}
   if(previewKey==='makeup'){content=body()+ellipse(219,178,13,8,['#e9b4a3','#ed93b1','#c498cc','#e4c076','#83c8c9','#be81a2'][s.makeup],'opacity=".18"');}
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" aria-hidden="true"><defs>${defs}</defs>${content}</svg>`;
 }
 const alphaClean=`<filter id="${p}-clean"><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 1 1 1 1 1"/></feComponentTransfer></filter>`;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" class="merperson ${m?'groom':'bride'}" viewBox="${viewBox}" role="img" aria-label="${m?'Кай — русал':'Луна — русалка'}"><defs>${tintDef(p+'-hair',palettes.hairColor[s.hairColor],2.6)}${tintDef(p+'-tail',palettes.tailColor[s.tailColor],1.35)}${tintDef(p+'-cloth',palettes.outfitColor[s.outfitColor],1.18)}${tintDef(p+'-iris',palettes.eyes[s.eyes],2)}${alphaClean}<filter id="${p}-skin" color-interpolation-filters="sRGB"><feComponentTransfer>${[1,3,5].map((i,k)=>`<feFunc${'RGB'[k]} type="linear" slope="${parseInt(skin.slice(i,i+2),16)/[249,219,191][k]}"/>`).join('')}</feComponentTransfer></filter><clipPath id="${p}-vest"><path d="M220 195H278L305 237 298 343 295 402H202L198 343 196 237Z"/></clipPath><clipPath id="${p}-arms"><path d="M135 230H190L198 337 180 354 225 389 250 410 260 430H135ZM314 230H365V430H257L276 390 324 351 307 323Z"/></clipPath><clipPath id="${p}-eyes">${eyePositions.map(([x,y])=>ellipse(x,y,m?8:11,m?6.5:9,'white')).join('')}</clipPath><clipPath id="${p}-irises">${eyePositions.map(([x,y])=>ellipse(x,y,m?4:6,m?4.5:7,'white')).join('')}</clipPath><mask id="${p}-hair-front"><rect width="500" height="800" fill="white"/>${ellipse(250,m?171:172,m?35:39,m?42:45,'black')}</mask><radialGradient id="${p}-makeup"><stop stop-color="${['#dc9b94','#e876a0','#b583bd','#e5ba6e','#77b6b6','#c67a99'][s.makeup]}" stop-opacity=".38"/><stop offset="1" stop-color="#eaa1b6" stop-opacity="0"/></radialGradient><linearGradient id="${p}-veil"><stop stop-color="#fff9f3" stop-opacity=".12"/><stop offset=".5" stop-color="#f1e5ff" stop-opacity=".55"/><stop offset="1" stop-color="#fff8ed" stop-opacity=".18"/></linearGradient></defs><g class="${thumb?'':'body-float'}">`;
 if(s.veil){const bottom=[0,365,516,440,311,393][s.veil];svg+=path(`M205 103Q250 68 298 103L${338+s.veil*4} ${bottom}Q292 ${bottom+39} 250 ${bottom+8}Q207 ${bottom+39} 146 ${bottom}Z`,m?palettes.outfitColor[s.outfitColor]:`url(#${p}-veil)`,`opacity="${m?.85:1}" stroke="#f7efdc" stroke-opacity=".7" stroke-width="1.5"`);if(s.veil===3)for(let i=0;i<13;i++)svg+=pearl(153+i*16,bottom+Math.sin(i/12*Math.PI)*20,3);if(s.veil===5)for(let i=0;i<7;i++)svg+=flower(201+i*16,109-Math.sin(i/6*Math.PI)*24,'#f0cede',8);if(s.veil===4)svg+=path('M250 127Q185 83 185 135Q190 166 249 138Q311 171 315 133Q314 87 250 127Z',palettes.outfitColor[s.outfitColor],'stroke="#fff4db"');}
 svg+=`<g class="${thumb?'':'hair-float'}">${hairLayer}</g>`;
 // The attached tail is moved around its waist, keeping the upper-body seam fixed.
 svg+=`<g class="${thumb?'':'tail-sway'}">${sprite('tails-v2',s.tail,79,370,320,375,p+'-tail')}</g>`;
 svg+=body(`filter="url(#${p}-skin)"`);
 if(m)svg+=`<g clip-path="url(#${p}-vest)">${body(`filter="url(#${p}-cloth)"`)}</g>`;
 svg+=sprite(base+'-outfits',s.outfit,m?162:188,m?197:276,m?178:126,m?208:123,p+'-cloth');
 // Arms and hands pass over clothing rather than being painted under it.
 svg+=`<g clip-path="url(#${p}-arms)">${body(`filter="url(#${p}-skin)"`)}</g>`;
 svg+=`<g clip-path="url(#${p}-eyes)">${body()}</g><g clip-path="url(#${p}-irises)">${body(`filter="url(#${p}-iris)"`)}</g>`;
 if(s.makeup){svg+=ellipse(m?223:219,m?166:178,13,8,`url(#${p}-makeup)`)+ellipse(m?279:285,m?166:176,13,8,`url(#${p}-makeup)`);}
 if(!thumb)svg+=`<g class="painted-blink">${eyePositions.map(([x,y])=>ellipse(x,y,m?8.5:11.5,m?7:9.5,skin)+path(`M${x-(m?8:10)} ${y+1}Q${x} ${y+6} ${x+(m?8:10)} ${y}`,'none','stroke="#674739" stroke-width="1.4" stroke-linecap="round"')).join('')}</g>`;
 svg+=`<g class="${thumb?'':'hair-float'}" mask="url(#${p}-hair-front)">${hairLayer}</g>`;
 // These original small ornaments are drawn as resolution-independent artwork.
 const cy=m?107:102;
 if([1,6].includes(s.crown)){svg+=path(s.crown===6?`M205 ${cy+10}L199 ${cy-16} 224 ${cy-4} 249 ${cy-35} 274 ${cy-4} 300 ${cy-16} 295 ${cy+10}Z`:`M204 ${cy+9}L214 ${cy-11} 229 ${cy-1} 250 ${cy-26} 274 ${cy-1} 287 ${cy-11} 297 ${cy+9}Z`,'#e6cb8b','stroke="#fff5d0" stroke-width="1.5"');svg+=ellipse(250,cy-7,5,7,gem,'stroke="#fff3c4"');for(let i=0;i<9;i++)svg+=pearl(210+i*10,cy+8,2.4);}
 if(s.crown===2)svg+=star(289,cy+18,17,'#e6c08c')+star(305,cy+34,8,gem);
 if(s.crown===3)for(let i=0;i<12;i++)svg+=pearl(206+i*8,cy+18-Math.sin(i/11*Math.PI)*20,3.4);
 if(s.crown===4)for(let i=0;i<5;i++)svg+=path(`M${212+i*19} ${cy+7}q-16-17-7-21 8-5 15 3 11-1 12 10Z`,i%2?gem:'#f2debf','stroke="#fff3d8" stroke-width="1"');
 if(s.crown===5)for(let i=0;i<7;i++)svg+=flower(200+i*16,cy+18-Math.sin(i/6*Math.PI)*20,['#f1ccd6','#e8ddf0','#fff1d7'][i%3],8);
 if(s.crown===7)svg+=path(`M262 ${cy-33}a20 20 0 1 0 14 31 18 18 0 0 1-14-31Z`,'#f1d7a0')+path(`M210 ${cy+12}Q250 ${cy-8} 290 ${cy+12}`,'none','stroke="#ead6a4" stroke-width="2"');
 if(s.jewelry){const j=s.jewelry,y=m?238:245;svg+=path(`M226 ${y-10}Q250 ${y+23} 274 ${y-10}`,'none',`stroke="${j===6?'#e7c77a':'#fff0d5'}" stroke-width="${j===5?2:1.4}"`);if([1,5].includes(j)){for(let i=0;i<9;i++)svg+=pearl(227+i*5.6,y-10+Math.sin(i/8*Math.PI)*17,2.5);if(j===5)for(let i=0;i<10;i++)svg+=pearl(224+i*5.9,y-3+Math.sin(i/9*Math.PI)*20,2.2);}else if(j===3||j===6)svg+=star(250,y+9,j===6?10:7,j===6?'#e6c581':gem);else svg+=path(`M250 ${y+4}l-7 9 7 11 7-11Z`,gem,'stroke="#f6e5b7" stroke-width="1.3"');for(let x of [207,294])svg+=pearl(x,m?162:173,2.8)+(j!==1?ellipse(x,m?169:180,2.7,4.5,gem,'stroke="#edd9b6" stroke-width="1"'):'');}
 if(s.bouquet){let color=['','#e8a5b6','#f4ead1','#b7a1d1','#e8c581','#fff3e1','#77c1c3','#dca2cb'][s.bouquet];svg+=`<g transform="translate(218 381)">`+path('M-18-21L14 39 21 40 10-25','#669989','stroke="#b3cfb0" stroke-width="2"')+path('M-5 11L-21 7-17 26 5 21 22 28 26 10Z',palettes.outfitColor[s.outfitColor]);for(let i=0;i<7;i++){let a=i*2.4;svg+=flower(Math.cos(a)*21,Math.sin(a)*18-25,s.bouquet===7?['#edb4c5','#d0b1df','#f3dfa0'][i%3]:color,12);}svg+='</g>';}
 return svg+'</g></svg>';
}
