'use strict';

// The groom uses heads drawn with fitted hair and fully dressed torsos.
// No old vest, separate wig, cape, bouquet or bride clothing is composited here.
function groomClothingFilter(id, skin, cloth) {
  const rgb=[1,3,5].map(i=>parseInt(cloth.slice(i,i+2),16)/255);
  return `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3 0 3 1 0" result="fabricMask"/><feComponentTransfer in="fabricMask" result="fabricMask"><feFuncA type="linear" slope="3" intercept="-1"/></feComponentTransfer><feComponentTransfer in="SourceGraphic" result="skinTone">${[1,3,5].map((i,k)=>`<feFunc${'RGB'[k]} type="linear" slope="${parseInt(skin.slice(i,i+2),16)/[249,219,191][k]}"/>`).join('')}</feComponentTransfer><feColorMatrix in="SourceGraphic" type="saturate" values="0"/><feComponentTransfer>${rgb.map((c,i)=>`<feFunc${'RGB'[i]} type="linear" slope="${c*1.15}"/>`).join('')}</feComponentTransfer><feComposite in2="fabricMask" operator="in"/><feComposite in2="skinTone" operator="over"/></filter>`;
}
function renderGroom(s,{thumb=false,viewBox='70 25 370 740',id,previewKey}={}) {
  const p=id||`groom${serial++}`,skin=palettes.skin[s.skin],gem=palettes.gemColor[s.gemColor];
  const row=s.hair>3,shift=[18,2,1,-10,18,3,1,-9][s.hair]*140/443.5;
  const head=(filter='')=>sprite('groom-heads-v3',s.hair,180-shift,row?76:70,140,160,filter);
  const torso=()=>sprite('groom-torsos-v3',s.outfit,145,208,210,205,p+'-clothing');
  const hairline=[106,106,112,106,109,108,108,109][s.hair];
  const eyeY=row?145:145,eyes=[[234,eyeY],[266,eyeY]];
  let defs=`${tintDef(p+'-hair',palettes.hairColor[s.hairColor],2.6)}${tintDef(p+'-tail',palettes.tailColor[s.tailColor],1.35)}${tintDef(p+'-iris',palettes.eyes[s.eyes],2)}${groomClothingFilter(p+'-clothing',skin,palettes.outfitColor[s.outfitColor])}<filter id="${p}-skin" color-interpolation-filters="sRGB"><feComponentTransfer>${[1,3,5].map((i,k)=>`<feFunc${'RGB'[k]} type="linear" slope="${parseInt(skin.slice(i,i+2),16)/[249,219,191][k]}"/>`).join('')}</feComponentTransfer></filter><clipPath id="${p}-head-cut"><path d="M180 45H320V205H274L270 228H230L226 205H180Z"/></clipPath><clipPath id="${p}-hair-cap"><path d="M195 50H305V134H292L286 ${hairline+5}Q250 ${hairline-5} 213 ${hairline+5}L208 134H195Z"/></clipPath><clipPath id="${p}-eyes">${eyes.map(([x,y])=>ellipse(x,y,8,6,'white')).join('')}</clipPath><clipPath id="${p}-irises">${eyes.map(([x,y])=>ellipse(x,y,4.5,5,'white')).join('')}</clipPath>`;
  const portrait=()=>`<g clip-path="url(#${p}-head-cut)">`+head(p+'-skin')+`<g clip-path="url(#${p}-hair-cap)">${head(p+'-hair')}</g><g clip-path="url(#${p}-eyes)">${head()}</g><g clip-path="url(#${p}-irises)">${head(p+'-iris')}</g></g>`;
  if(thumb&&['hair','outfit','makeup','tail'].includes(previewKey)){
    let content;
    if(previewKey==='hair'||previewKey==='makeup'){content=portrait();viewBox='191 72 118 159';}
    if(previewKey==='outfit'){content=torso();viewBox='139 205 222 214';}
    if(previewKey==='tail'){content=sprite('tails-v2',s.tail,51,370,370,375,p+'-tail');viewBox='45 383 380 365';}
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" aria-hidden="true"><defs>${defs}</defs>${content}</svg>`;
  }
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" class="merperson groom" viewBox="${viewBox}" role="img" aria-label="Кай — русал"><defs>${defs}</defs><g class="${thumb?'':'body-float'}"><g class="${thumb?'':'tail-sway'}">${sprite('tails-v2',s.tail,51,370,370,375,p+'-tail')}</g>${portrait()}${torso()}`;
  if(!thumb)svg+=`<g class="painted-blink">${eyes.map(([x,y])=>ellipse(x,y,8,6,skin)+path(`M${x-7} ${y}q7 6 14 0`,'none','stroke="#674739" stroke-width="1.1"')).join('')}</g>`;
  if(s.makeup)svg+=ellipse(224,165,8,4,['#e9b4a3','#ed93b1','#c498cc','#e4c076','#83c8c9','#be81a2'][s.makeup],'opacity=".2"')+ellipse(277,165,8,4,['#e9b4a3','#ed93b1','#c498cc','#e4c076','#83c8c9','#be81a2'][s.makeup],'opacity=".2"');
  if(s.crown){
    if([1,6].includes(s.crown))svg+=path('M209 102L204 78 226 91 250 64 274 91 296 78 291 102Z','#dec387','stroke="#fff0c2" stroke-width="1.5"')+ellipse(250,88,5,7,gem);
    else if(s.crown===2)svg+=star(288,106,13,'#eccb8b');
    else if(s.crown===3)for(let i=0;i<10;i++)svg+=pearl(212+i*8.4,108-Math.sin(i/9*Math.PI)*13,2.7);
    else if(s.crown===4)for(let i=0;i<5;i++)svg+=star(215+i*17,103-Math.sin(i/4*Math.PI)*8,7,gem);
    else if(s.crown===5)for(let i=0;i<6;i++)svg+=flower(208+i*17,109-Math.sin(i/5*Math.PI)*16,'#d4dce1',7);
    else svg+=path('M263 66a17 17 0 1 0 12 27 16 16 0 0 1-12-27Z','#f0d49a');
  }
  if(s.jewelry){const j=s.jewelry;svg+=path('M225 224Q250 256 275 224','none',`stroke="${j===6?'#e7c77a':'#e1e6e8'}" stroke-width="1.5"`);if(j===1||j===5)for(let i=0;i<9;i++)svg+=pearl(226+i*6,225+Math.sin(i/8*Math.PI)*15,2);else if(j===3||j===6)svg+=star(250,244,8,gem);else svg+=path('M250 238l-6 8 6 9 6-9Z',gem,'stroke="#e5e5df" stroke-width="1"');}
  return svg+'</g></svg>';
}
