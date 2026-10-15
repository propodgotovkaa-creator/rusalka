'use strict';

const $ = (s) => document.querySelector(s);
const STORAGE_KEY = 'pearl-wedding-v1';
const palettes = {
  hairColor: ['#653d32','#342b38','#ba7242','#eabf79','#f1debf','#d58b98','#a895cb','#718fbb','#77b5ae','#b35149','#755180','#dde4ed'],
  tailColor: ['#59b9ad','#7caccf','#ac8ac5','#e49cad','#7dccca','#d0ba7d','#578aa9','#d68f72','#879fd0','#88b986','#b9618b','#f0dcd9'],
  outfitColor: ['#efdfcf','#f1d1df','#c7b5de','#8dbdc2','#8aa8cf','#dcb67c','#f2e9dd','#375970','#a6739c','#a8c7b3'],
  skin: ['#f9dbbf','#efc6a4','#dba57d','#ba825d','#8e5d43','#684639','#d4ddea','#b8d8cd'],
  eyes: ['#51a89e','#709bc6','#9b83bf','#8a6b43','#516b48','#485568'],
  gemColor: ['#b695ce','#72c5bf','#e7a6bd','#8caee0','#e7c97c','#f4f0e5']
};
const names = {
  hair: [['Морская волна','Локоны','Жемчужный пучок','Длинная коса','Короткое каре','Хвостик','Принцесса','Облачко'],['Полубокс','Короткий пробор','Кроп','Ёжик','Кудри с фейдом','Короткие шипы','Андеркат','Короткий квифф']],
  tail: ['Классический','Лепестки','Вуаль','Лунный','Бабочка','Королевский','Рифовый','Двойной'],
  outfit: [['Ракушки','Лепестки','Корсет','Морской шёлк','Жемчужный','Бант','Королевский','Звёздный'],['Жилет с галстуком','Смокинг','Мундир принца','Адмирал','Льняная рубашка','Восточный костюм','Жилет с пластроном','Королевский камзол']],
  crown: ['Без венца','Тиара','Морская звезда','Жемчуг','Ракушки','Цветы','Корона','Лунный свет'],
  jewelry: ['Без украшений','Жемчужная нить','Кристалл','Морские звёзды','Лунный камень','Три нити','Золотое солнце','Капли моря'],
  veil: [['Без фаты','Лёгкая фата','Длинная фата','Жемчужная','Бант из шёлка','Цветочная'],['Без накидки','Лёгкая накидка','Мантия','Жемчужная','Шёлковый бант','Цветочная']],
  bouquet: ['Без букета','Розовые кораллы','Морские лилии','Лавандовый','Золотой','Белые розы','Сердце океана','Радужный'],
  makeup: ['Естественный','Розовый жемчуг','Сиреневый','Золотой свет','Морская бирюза','Вечерний']
};
const categories = [
  ['hair','Волосы','M7 21C2 15 5 4 12 4s10 10 5 17M6 11c7 0 6-6 6-6s1 6 6 6M8 15v6m8-6v6'],
  ['face','Лицо','M5 10c0-10 14-10 14 0v4c0 10-14 10-14 0ZM8 12h1m6 0h1M10 17q2 2 4 0'],
  ['tail','Хвост','M8 3c-1 8 9 9 5 15M13 18Q4 14 4 21q7 3 9-3 4 5 8 0-3-6-8 0Z'],
  ['outfit','Наряд','m7 3-4 7 5 3-1 9h10l-1-9 5-3-4-7-5 4Z'],
  ['crown','Венец','M3 7l5 4 4-7 4 7 5-4-3 12H6ZM6 21h12'],
  ['jewelry','Украшения','M4 4c0 15 16 15 16 0M12 16l-3 4 3 3 3-3Z'],
  ['veil','Фата','M5 7Q12-2 19 7l3 16-10-4-10 4ZM5 7q7 5 14 0'],
  ['bouquet','Букет','M12 12 8 23h8ZM12 4c-5-8-10 4-3 4-9 4 0 11 3 4 3 7 12 0 3-4 7 0 2-12-3-4Z']
];
const defaults = [
  {hair:0,hairColor:2,skin:0,eyes:0,makeup:1,tail:2,tailColor:0,outfit:0,outfitColor:0,crown:1,jewelry:1,gemColor:0,veil:1,bouquet:0},
  {hair:0,hairColor:0,skin:1,eyes:1,makeup:0,tail:0,tailColor:6,outfit:1,outfitColor:7,crown:0,jewelry:2,gemColor:1,veil:0,bouquet:0}
];
function limitFor(key) { return palettes[key]?.length || (Array.isArray(names[key]?.[0]) ? names[key][0].length : names[key]?.length) || 1; }
function sanitizePerson(person,index){if(index===1){person.veil=0;person.bouquet=0;}return person;}
function availableCategories(index=step){return index===1?categories.filter(([key])=>!['veil','bouquet'].includes(key)):categories;}
function readSave() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data?.version !== 1 || !Array.isArray(data.people)) return null;
    return defaults.map((d,i) => sanitizePerson(Object.fromEntries(Object.entries(d).map(([k,v]) => [k, Number.isInteger(data.people[i]?.[k]) && data.people[i][k]>=0 && data.people[i][k]<limitFor(k) ? data.people[i][k] : v])),i));
  } catch { return null; }
}
let people = readSave() || structuredClone(defaults);
let step = 0, category = 'hair', history = [[],[]], married = false;
let toastTimer, ceremonyTimers = [], audioContext, musicTimer, musicOn = false;
let serial = 0;
function save() { try { localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,people})); } catch { $('#save-status').textContent = 'Образ сохранён до закрытия страницы'; } }
function shade(hex, amount) { const n=parseInt(hex.slice(1),16);return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,v+amount)).toString(16).padStart(2,'0')).join(''); }
const ellipse = (x,y,rx,ry,fill,extra='') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const path = (d,fill,extra='') => `<path d="${d}" fill="${fill}" ${extra}/>`;
function pearl(x,y,r=4) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff3d9" stroke="#d3c6a6" stroke-width=".7"/><circle cx="${x-1}" cy="${y-1}" r="${r/3}" fill="white"/>`; }
function star(x,y,size,color) { return `<path d="M0 -10 3 -3 10 -3 5 2 6 9 0 5 -6 9 -5 2 -10 -3 -3 -3Z" transform="translate(${x} ${y}) scale(${size/10})" fill="${color}" stroke="#fff2bd" stroke-width=".8"/>`; }
function flower(x,y,color,r=10) { return `<g>${[0,60,120,180,240,300].map(a=>`<ellipse cx="${x}" cy="${y-r*.65}" rx="${r*.45}" ry="${r*.65}" fill="${color}" stroke="${shade(color,-15)}" stroke-width=".8" transform="rotate(${a} ${x} ${y})"/>`).join('')}${pearl(x,y,r*.35)}</g>`; }

function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
function currentNames(key){return Array.isArray(names[key][0])?names[key][step]:names[key];}
function drawCharacter(){ $('#character').innerHTML=renderPerson(people[step],step===1);$('#undo').disabled=!history[step].length; }
function drawCategories(){ $('#categories').innerHTML=availableCategories().map(([key,label,icon])=>`<button class="category-tab ${category===key?'active':''}" role="tab" id="tab-${key}" aria-controls="options" aria-selected="${category===key}" data-category="${key}"><svg viewBox="0 0 24 26" aria-hidden="true"><path d="${icon}" stroke-linejoin="round" stroke-linecap="round"/></svg>${key==='veil'&&step===1?'Накидка':label}</button>`).join('');$('#options').setAttribute('aria-labelledby',`tab-${category}`); }
function swatches(key,title){return `<h4 class="swatch-title">${title}</h4><div class="swatches" role="group" aria-label="${title}">${palettes[key].map((color,i)=>`<button class="swatch ${people[step][key]===i?'selected':''}" style="background:${color}" data-key="${key}" data-value="${i}" aria-label="${title}, оттенок ${i+1}" aria-pressed="${people[step][key]===i}" title="Оттенок ${i+1}"></button>`).join('')}</div>`;}
function cards(key,title){let items=currentNames(key);const views={hair:'140 35 215 265',tail:'135 396 235 360',outfit:'174 246 155 173',crown:'166 35 173 130',jewelry:'179 199 143 104',veil:'119 60 253 456',bouquet:'126 309 113 135',makeup:'180 137 142 105'};return `<div class="option-heading"><h3>${title}</h3><span class="option-count">${items.length} вариантов</span></div><div class="option-grid">${items.map((label,i)=>{const s={...people[step],[key]:i};if(key==='hair'){s.crown=0;s.veil=0;}return `<button class="option-card ${people[step][key]===i?'selected':''}" data-key="${key}" data-value="${i}" aria-label="${label}" aria-pressed="${people[step][key]===i}">${renderPerson(s,step===1,{thumb:true,viewBox:views[key],previewKey:key})}<span class="option-label">${label}</span></button>`;}).join('')}</div>`;}
function drawOptions(){let html='';switch(category){case'hair':html=cards('hair','Причёска')+swatches('hairColor','Цвет волос');break;case'face':html=swatches('skin','Цвет кожи')+swatches('eyes','Цвет глаз')+'<br>'+cards('makeup','Макияж');break;case'tail':html=cards('tail','Форма плавника')+swatches('tailColor','Цвет хвоста');break;case'outfit':html=cards('outfit',step?'Свадебный наряд':'Корсаж')+swatches('outfitColor','Цвет наряда');break;case'crown':html=cards('crown','Венец и украшения для волос')+swatches('gemColor','Цвет драгоценных камней');break;case'jewelry':html=cards('jewelry','Маленькие сокровища')+swatches('gemColor','Цвет драгоценных камней');break;case'veil':html=cards('veil',step?'Накидка':'Фата')+swatches('outfitColor',step?'Цвет накидки':'Цвет банта');break;case'bouquet':html=cards('bouquet','Букет из морского сада');break;}
$('#options').innerHTML=html+`<div class="tip-card"><span>✧</span><p>${({hair:'Морской ветер играет в волосах. Найди причёску, с которой начнётся сказка.',face:'Красота океана — в его разнообразии. Все оттенки прекрасны.',tail:'Плавник плавно движется, пока ты создаёшь образ.',outfit:'Сочетай цвет наряда с хвостом или попробуй неожиданный контраст.',crown:'Последний штрих для настоящей подводной королевской свадьбы.',jewelry:'Жемчуг, лунные камни или звёзды — какое сокровище твоё?',veil:'Нежный шёлк колышется в тёплых морских течениях.',bouquet:'В морском саду цветы никогда не вянут.'})[category]}</p></div>`;}
function clearCeremony(){ceremonyTimers.forEach(clearTimeout);ceremonyTimers=[];}
function setStep(next){clearCeremony();step=next;if(step<2&&!availableCategories().some(([key])=>key===category))category='hair';document.querySelectorAll('.step').forEach((b,i)=>{b.classList.toggle('active',i===step);b.classList.toggle('complete',i<step);b.setAttribute('aria-current',i===step?'step':'false');});$('#studio').classList.toggle('hidden',step===2);$('#ceremony').classList.toggle('hidden',step!==2);if(step===2){if(!married)$('#confetti').innerHTML='';$('#bride-final').innerHTML=renderPerson(people[0]);$('#groom-final').innerHTML=renderPerson(people[1],true);$('#vow-text').textContent=married?'Теперь и навсегда — вместе ♡':'Всё готово к вашей подводной свадьбе';$('#marry').textContent=married?'♡ Ещё раз «Да!»':'♡ Сказать «Да!»';return;}$('#scene-title').innerHTML=step?'Его лучший образ.<br>И её счастливый день.':'Самая волшебная<br>невеста — твоя.';$('#scene-subtitle').textContent=step?'Добавь немного магии в образ жениха':'Создай образ для её особенного дня';$('.wardrobe-heading h2').textContent=step?'Создай его образ':'Создай её образ';$('#character-name').textContent=step?'Кай':'Луна';$('#character-role').textContent=step?'принц глубин':'невеста океана';$('.ocean').setAttribute('aria-label',step?'Примерочная русала':'Примерочная русалки');$('#next').innerHTML=step?'На церемонию <span>→</span>':'Нарядить жениха <span>→</span>';drawCategories();drawCharacter();drawOptions();$('#wardrobe-scroll').scrollTop=0;}
function choose(key,value){if(step===1&&['veil','bouquet'].includes(key))return;history[step].push({...people[step]});if(history[step].length>40)history[step].shift();people[step][key]=value;married=false;save();drawCharacter();drawOptions();playChime();}
$('#categories').addEventListener('click',e=>{const button=e.target.closest('[data-category]');if(!button)return;category=button.dataset.category;drawCategories();drawOptions();$('#wardrobe-scroll').scrollTop=0;document.querySelector(`[data-category="${category}"]`).focus({preventScroll:true});});
$('#categories').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=availableCategories();let i=tabs.findIndex(c=>c[0]===category);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;category=tabs[i][0];drawCategories();drawOptions();document.querySelector(`[data-category="${category}"]`).focus();});
$('#options').addEventListener('click',e=>{let b=e.target.closest('[data-key]');if(b){const {key,value}=b.dataset;choose(key,Number(value));document.querySelector(`[data-key="${key}"][data-value="${value}"]`)?.focus({preventScroll:true});}});
$('#next').onclick=()=>{setStep(step+1);window.scrollTo({top:0,behavior:'smooth'});};
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>setStep(Number(b.dataset.step)));
$('#back').onclick=()=>setStep(1);
$('#randomize').onclick=()=>{history[step].push({...people[step]});if(history[step].length>40)history[step].shift();Object.keys(people[step]).forEach(k=>people[step][k]=Math.floor(Math.random()*limitFor(k)));sanitizePerson(people[step],step);married=false;save();drawCharacter();drawOptions();playChime();toast('Океан придумал новый образ ✧');};
$('#undo').onclick=()=>{if(history[step].length){people[step]=sanitizePerson(history[step].pop(),step);married=false;save();drawCharacter();drawOptions();toast('Предыдущий образ возвращён');}};
$('#help').onclick=()=>$('#help-dialog').showModal();$('.dialog-close').onclick=$('#help-done').onclick=()=>$('#help-dialog').close();$('#help-dialog').addEventListener('click',e=>{if(e.target===$('#help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('.brand').onclick=e=>{e.preventDefault();setStep(0);};

function addBubbles(){document.querySelectorAll('.bubbles').forEach(container=>{container.innerHTML=Array.from({length:19},(_,i)=>`<span class="bubble" style="left:${(i*37)%100}%;width:${5+i%5*5}px;height:${5+i%5*5}px;animation-duration:${13+i%7*3}s;animation-delay:-${i*2}s"></span>`).join('');});}
$('#marry').onclick=()=>{clearCeremony();married=true;const lines=['Кай: «С тобой любой океан — мой дом».','Луна: «Я выбираю тебя. Сегодня и навсегда».','Теперь и навсегда — вместе ♡'];$('#vow-text').textContent=lines[0];$('#confetti').innerHTML=Array.from({length:42},(_,i)=>`<span class="confetti-piece" style="left:${i*2.4}%;color:${['#f4d6b7','#f0bdd7','#dbd3fa','#d6f2e1'][i%4]};--duration:${5+i%4}s;--delay:-${i%6}s">${['♡','✧','✿','·'][i%4]}</span>`).join('');ceremonyTimers.push(setTimeout(()=>$('#vow-text').textContent=lines[1],2800),setTimeout(()=>{$('#vow-text').textContent=lines[2];$('#marry').textContent='♡ Ещё раз «Да!»';playChime(true);},5700));playChime(true);};

// Original, softly synthesized music: no external tracks or audio downloads.
function note(freq,start,duration,volume=.025){if(!audioContext)return;const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(volume,start+.035);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g);g.connect(audioContext.destination);o.start(start);o.stop(start+duration+.05);}
function playChime(wedding=false){if(!musicOn||!audioContext||document.hidden)return;[523.25,659.25,783.99,...(wedding?[1046.5]:[])].forEach((f,i)=>note(f,audioContext.currentTime+i*.12,1,.018));}
function musicPhrase(){if(!musicOn||document.hidden)return;const notes=[261.63,329.63,392,493.88,440,392,329.63,293.66];notes.forEach((f,i)=>note(f,audioContext.currentTime+i*.7,2.1,.017));note(130.81,audioContext.currentTime,5.5,.018);}
$('#sound').onclick=async()=>{try{audioContext||=new(window.AudioContext||window.webkitAudioContext)();await audioContext.resume();musicOn=!musicOn;$('#sound').classList.toggle('on',musicOn);$('#sound').setAttribute('aria-label',musicOn?'Выключить музыку':'Включить музыку');$('#sound').setAttribute('aria-pressed',String(musicOn));clearInterval(musicTimer);if(musicOn){musicPhrase();musicTimer=setInterval(musicPhrase,5600);}else await audioContext.suspend();}catch{toast('Этот браузер не поддерживает музыку');}};
document.addEventListener('visibilitychange',()=>{if(!audioContext||!musicOn)return;if(document.hidden)audioContext.suspend();else audioContext.resume();});

$('#photo').onclick=async()=>{
try {
$('#photo').disabled=true;
await Promise.all(ART_FILES.map(async name=>{if(ART_DATA[name])return;const response=await fetch(`assets/${name}.png`);if(!response.ok)throw new Error('asset');const blob=await response.blob();ART_DATA[name]=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});}));
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1100" viewBox="0 0 1200 1100"><defs><linearGradient id="sea" x2="0" y2="1"><stop stop-color="#79c4c0"/><stop offset="1" stop-color="#17506e"/></linearGradient></defs><rect width="1200" height="1100" fill="url(#sea)"/><image href="${artHref('ocean')}" width="1200" height="1100" preserveAspectRatio="xMidYMid slice"/><rect width="1200" height="1100" fill="#155a6d" opacity=".2"/><rect x="30" y="30" width="1140" height="1040" rx="70" fill="none" stroke="#f2e4c1" stroke-width="2"/><path d="M260 850V490A340 300 0 0 1 940 490V850" fill="none" stroke="#e9d4b0" stroke-width="14"/>${[0,1,2,3,4,5,6,7,8].map(i=>flower(265+i*84,450-Math.sin(i/8*Math.PI)*247,['#f1c1d5','#f4dfb8','#ddd0f0'][i%3],24)).join('')}<text x="600" y="115" text-anchor="middle" fill="#fff3d7" font-size="62" font-family="Georgia,serif">Луна &amp; Кай</text><text x="600" y="156" text-anchor="middle" fill="#f9f1e0" font-size="20" font-family="sans-serif">Два сердца. Один океан.</text><g transform="translate(220 220) scale(.92)">${renderPerson(people[0],false,{thumb:true,id:'card-bride'}).replace('<svg ','<svg width="440" height="740" ')}</g><g transform="translate(580 220) scale(.92)">${renderPerson(people[1],true,{thumb:true,id:'card-groom'}).replace('<svg ','<svg width="440" height="740" ')}</g><text x="600" y="983" text-anchor="middle" fill="#f9f1e0" font-size="29" font-family="Georgia,serif">${married?'Теперь и навсегда — вместе ♡':'Наша жемчужная свадьба'}</text><text x="600" y="1025" text-anchor="middle" fill="#c8e1db" font-size="15" font-family="sans-serif">Образы созданы с любовью тобой</text></svg>`;
const assetDefs=ART_FILES.map(name=>{const [w,h]=name==='ocean'?[1536,1024]:name.endsWith('body')?[1024,1536]:name==='tails-v2'?[1254,1254]:[1774,887];return `<symbol id="embedded-${name}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="${name==='ocean'?'xMidYMid slice':'none'}"><image href="${ART_DATA[name]}" width="${w}" height="${h}"/></symbol>`;}).join('');
svg=svg.replace(/<image href="assets\/([^"/]+)\.png"([^>]*?)\/>/g,(_,name,attrs)=>`<use href="#embedded-${name}"${attrs}/>`).replace('<defs>','<defs>'+assetDefs);
const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Жемчужная-свадьба.svg';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('Свадебная открытка сохранена ♡');
} catch {toast('Для открытки открой игру через сайт или локальный сервер');} finally {$('#photo').disabled=false;}
};
addBubbles();setStep(0);save();
