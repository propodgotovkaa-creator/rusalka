const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const nodes=new Map();let resultBlob;
function node(){return {innerHTML:'',textContent:'',disabled:false,dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},focus(){},scrollTop:0,append(){},click(){},remove(){}};}
const document={querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);},querySelectorAll(){return[];},addEventListener(){},body:node(),createElement:node};
class Reader{async readAsDataURL(blob){this.result='data:image/png;base64,'+Buffer.from(await blob.arrayBuffer()).toString('base64');this.onload();}}
const context=vm.createContext({document,localStorage:{getItem(){return null},setItem(){}},structuredClone,console,setTimeout,clearTimeout,setInterval,clearInterval,Blob,FileReader:Reader,URL:{createObjectURL(b){resultBlob=b;return'blob:test'},revokeObjectURL(){}},fetch:async url=>({ok:fs.existsSync(path.join(root,url)),blob:async()=>new Blob([fs.readFileSync(path.join(root,url))])})});
vm.runInContext(fs.readFileSync(path.join(root,'art.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'groom.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'game.js'),'utf8').replace('addBubbles();setStep(0);save();',''),context);
const results=vm.runInContext(`(()=>{let count=0;for(let m=0;m<2;m++){for(const key of Object.keys(defaults[m]))for(let value=0;value<limitFor(key);value++){const svg=renderPerson({...defaults[m],[key]:value},!!m,{thumb:true});if(/undefined|NaN/.test(svg))throw new Error(key+value);count++;}}return {count,assets:ART_FILES};})()`,context);
const checks=vm.runInContext(`(()=>{
const a=renderGroom({...defaults[1],veil:5,bouquet:7},{thumb:true,id:'same'});
const b=renderGroom(defaults[1],{thumb:true,id:'same'});
if(a!==b)throw new Error('Groom still renders bridal accessories');
if(availableCategories(1).some(([k])=>['veil','bouquet'].includes(k)))throw new Error('Groom categories');
if(!availableCategories(0).some(([k])=>k==='veil'))throw new Error('Bride veil missing');
const old={...defaults[1],veil:5,bouquet:7};
localStorage.getItem=()=>JSON.stringify({version:1,people:[defaults[0],old]});
const restored=readSave();if(restored[1].veil||restored[1].bouquet)throw new Error('Old save not migrated');
step=1;category='veil';setStep(1);if(category!=='hair')throw new Error('Invalid category on switch');
drawCharacter=()=>{};drawOptions=()=>{};playChime=()=>{};toast=()=>{};
return true;})()`,context);
for(let i=0;i<100;i++){nodes.get('#randomize').onclick();assert(vm.runInContext('people[1].veil===0&&people[1].bouquet===0',context));}
for(const f of results.assets)assert(fs.existsSync(path.join(root,'assets',f+'.png')),f);
(async()=>{await nodes.get('#photo').onclick();assert(resultBlob,'postcard generated');const svg=await resultBlob.text();assert(!svg.includes('href="assets/'),'postcard is self-contained');assert(svg.includes('embedded-groom-heads-v3'));assert.equal((svg.match(/<symbol /g)||[]).length,7);console.log(JSON.stringify({renderedVariants:results.count,assets:results.assets.length,postcardBytes:Buffer.byteLength(svg),selfContained:true}));process.exit(0);})().catch(e=>{console.error(e);process.exit(1)});
