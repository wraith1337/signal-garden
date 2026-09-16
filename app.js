(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const svg = $('#garden'), input = $('#passage'), counter = $('#counter');
  const NS = 'http://www.w3.org/2000/svg';
  const palettes = {
    herbarium:{paper:'#eee9db',ink:'#19372b',muted:'#6f806f',accent:'#df6a3d',wash:'#d9d3c1'},
    midnight:{paper:'#17221e',ink:'#d9e5cc',muted:'#809687',accent:'#f2a65a',wash:'#22322b'},
    blueprint:{paper:'#d8e7e4',ink:'#154c52',muted:'#5f7d7f',accent:'#b83d3d',wash:'#c2d8d5'},
    ember:{paper:'#261c1a',ink:'#efd9bf',muted:'#9f8579',accent:'#ed7757',wash:'#3d2a25'}
  };
  const samples = [
    'A small idea enters quietly. It finds the light, bends around doubt, and keeps growing. What changes when we give our attention somewhere to root?',
    'We build our days from tiny choices: open the window, answer the question, take the longer road. Perhaps a life is simply the pattern they leave behind.',
    'At dusk the city exhales. Windows become constellations; footsteps keep time; somewhere, a kettle begins to sing! Who is still awake to hear it?',
    'Make room for unfinished things. A sketch can become a map, a mistake can become a door, and a pause can hold the answer we were chasing.'
  ];
  let theme = 'herbarium', growth = 'natural', sampleIndex = 0, renderTimer;

  function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function el(name,attrs={},parent=svg){const node=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v));parent.appendChild(node);return node}
  function splitSentences(text){return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(s=>s.trim()).filter(Boolean).slice(0,18)}
  function cleanWords(s){return s.match(/[\p{L}\p{N}'’-]+/gu)||[]}
  function setTheme(name){theme=name;const p=palettes[name];document.documentElement.style.setProperty('--paper',p.paper);document.documentElement.style.setProperty('--ink',p.ink);document.documentElement.style.setProperty('--muted',p.muted);document.documentElement.style.setProperty('--accent',p.accent);$$('.swatch').forEach(b=>{const on=b.dataset.theme===name;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on)});render()}
  function petal(g,x,y,r,count,color,rotation=0){for(let i=0;i<count;i++){const a=(Math.PI*2*i/count)+(rotation*Math.PI/180),px=x+Math.cos(a)*r*.65,py=y+Math.sin(a)*r*.65;el('ellipse',{cx:px,cy:py,rx:r*.7,ry:r*.28,fill:'none',stroke:color,'stroke-width':1.8,transform:`rotate(${a*180/Math.PI} ${px} ${py})`},g)}el('circle',{cx:x,cy:y,r:r*.2,fill:color},g)}
  function render(animate=false){
    const text=input.value.trim()||' '; const p=palettes[theme]; const random=rng(hash(text+'|'+growth));
    svg.replaceChildren();
    const title=el('title',{id:'gardenTitle'});title.textContent='A botanical visualization of the entered passage';
    const desc=el('desc',{id:'gardenDesc'});desc.textContent='Sentences form stems, words form leaves, and punctuation forms blooms.';
    el('rect',{width:900,height:900,fill:p.paper});
    const defs=el('defs'); const filter=el('filter',{id:'rough',x:'-10%',y:'-10%',width:'120%',height:'120%'},defs);el('feTurbulence',{type:'fractalNoise',baseFrequency:'.015',numOctaves:'2',seed:hash(text)%100,result:'noise'},filter);el('feDisplacementMap',{in:'SourceGraphic',in2:'noise',scale:'1.3'},filter);
    const sentences=splitSentences(text), allWords=cleanWords(text), unique=new Set(allWords.map(w=>w.toLowerCase())).size, variety=allWords.length?unique/allWords.length:0;
    $('#statWords').textContent=allWords.length;$('#statSentences').textContent=sentences.length;$('#statVariety').textContent=Math.round(variety*100)+'%';$('#statCadence').textContent=sentences.length?(allWords.length/sentences.length).toFixed(1):'0';
    const density=growth==='spare'?.58:growth==='wild'?1.38:1; const count=Math.max(1,sentences.length);
    const root=el('g',{filter:'url(#rough)'}); const groundY=790;
    el('path',{d:`M140 ${groundY+10} Q450 ${groundY-14} 760 ${groundY+8}`,fill:'none',stroke:p.muted,'stroke-width':1,opacity:.35},root);
    const stemSpread=Math.min(640,210+count*42);
    sentences.forEach((sentence,si)=>{
      const plant=el('g',{'class':'sentence-plant','data-sentence':si,'aria-label':`Sentence ${si+1}: ${sentence}`},root);
      const words=cleanWords(sentence), punct=(sentence.match(/[,.!?;:]/g)||[]); const t=count===1?.5:si/(count-1); const baseX=450-stemSpread/2+t*stemSpread+(random()-.5)*26;
      const height=Math.min(560,190+words.length*13*density+random()*90); const topY=groundY-height;
      const bend=(random()-.5)*(growth==='wild'?180:100); const c1x=baseX+(random()-.5)*60,c1y=groundY-height*.35,c2x=baseX+bend,c2y=groundY-height*.72,endX=baseX+bend*.78;
      const stem=el('path',{d:`M${baseX} ${groundY} C${c1x} ${c1y},${c2x} ${c2y},${endX} ${topY}`,fill:'none',stroke:p.ink,'stroke-width':1.7,'stroke-linecap':'round','pathLength':1},plant);
      if(animate){stem.style.strokeDasharray='1';stem.style.strokeDashoffset='1';stem.style.animation=`draw 1.2s ${si*.07}s ease forwards`}
      const leafEvery=Math.max(1,Math.round(2.2/density));
      words.forEach((word,wi)=>{
        if(wi%leafEvery!==0)return;const progress=.13+.78*(wi/Math.max(1,words.length-1));const y=groundY-height*progress;const curveX=baseX*(1-progress)+endX*progress + Math.sin(progress*Math.PI)*bend*.22;const side=wi%2?1:-1;const size=(7+Math.min(16,word.length*1.15))*(.8+variety*.35);const reach=size*(1.7+random()*.8)*side;const tilt=(random()-.5)*14;
        const leaf=el('path',{d:`M${curveX} ${y} Q${curveX+reach*.48} ${y-size*.9+tilt},${curveX+reach} ${y-size*.25} Q${curveX+reach*.5} ${y+size*.75},${curveX} ${y}`,'class':'word-leaf','data-word':word,tabindex:0,'aria-label':`Leaf shaped by ${word}`,fill:'none',stroke:p.ink,'stroke-width':1.2,opacity:.82},plant);const tip=el('title',{},leaf);tip.textContent=word;
        el('path',{d:`M${curveX} ${y} L${curveX+reach*.82} ${y-size*.18}`,stroke:p.muted,'stroke-width':.55,opacity:.55},plant);
      });
      const flower=el('g',{},plant); const mark=punct[punct.length-1]||'.'; const petals=mark==='?'?6:mark==='!'?9:mark===','?4:5;petal(flower,endX,topY,mark==='!'?18:14+random()*5,petals,p.accent,random()*50);
      punct.slice(0,-1).forEach((mark,pi)=>{if(pi>5*density)return;const prog=.35+pi*.09;const bx=baseX*(1-prog)+endX*prog+Math.sin(prog*Math.PI)*bend*.22;const by=groundY-height*prog;el(mark===','?'circle':'path',mark===','?{cx:bx+(pi%2?15:-15),cy:by,r:3.4,fill:p.accent}:{d:`M${bx} ${by} q${pi%2?18:-18} -15 ${pi%2?23:-23} -34`,fill:'none',stroke:p.accent,'stroke-width':1},plant)});
      el('path',{d:`M${baseX} ${groundY} q${-18-random()*22} 22 ${-38-random()*30} 28`,fill:'none',stroke:p.ink,'stroke-width':1,opacity:.55},plant);el('path',{d:`M${baseX} ${groundY} q${18+random()*22} 22 ${38+random()*30} 28`,fill:'none',stroke:p.ink,'stroke-width':1,opacity:.55},plant);
    });
    const label=el('g',{},svg);el('line',{x1:55,y1:58,x2:180,y2:58,stroke:p.ink,'stroke-width':1,opacity:.45},label);const meta=el('text',{x:55,y:42,fill:p.muted,'font-family':'DM Mono,monospace','font-size':10,'letter-spacing':1.4},label);meta.textContent=`${allWords.length} WORDS · ${sentences.length} STEM${sentences.length===1?'':'S'} · SEED ${hash(text).toString(16).toUpperCase().slice(0,6)}`;
    const sig=el('text',{x:845,y:850,fill:p.muted,'font-family':'DM Mono,monospace','font-size':9,'text-anchor':'end','letter-spacing':1.3},svg);sig.textContent='SIGNAL GARDEN / WRAITH';
  }
  function playRhythm(){
    const plants=[...svg.querySelectorAll('.sentence-plant')];if(!plants.length)return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){render(true);toast('Garden regrown');return}
    svg.classList.add('rhythm-playing');$('#play').disabled=true;let delay=0;
    const sentences=splitSentences(input.value.trim());
    plants.forEach((plant,i)=>{const words=cleanWords(sentences[i]||'').length;setTimeout(()=>{plants.forEach(p=>p.classList.remove('beat'));plant.classList.add('beat')},delay);delay+=Math.max(350,Math.min(1200,words*70))});
    setTimeout(()=>{svg.classList.remove('rhythm-playing');plants.forEach(p=>p.classList.remove('beat'));$('#play').disabled=false},delay+400)
  }
  function update(){counter.textContent=`${input.value.length} / 2400`;clearTimeout(renderTimer);renderTimer=setTimeout(render,120);updateURL(false)}
  function updateURL(push=true){const u=new URL(location.href);const value=input.value.trim();if(value&&value!==samples[0])u.searchParams.set('seed',btoa(unescape(encodeURIComponent(value))).replace(/=+$/,''));else u.searchParams.delete('seed');u.searchParams.set('paper',theme);u.searchParams.set('growth',growth);history[push?'pushState':'replaceState']({},'',u)}
  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2100)}
  function exportSVG(){const copy=svg.cloneNode(true);copy.setAttribute('xmlns',NS);const source=`<!-- Made with Signal Garden by Wraith · https://github.com/wraith1337/signal-garden -->\n`+new XMLSerializer().serializeToString(copy);const blob=new Blob([source],{type:'image/svg+xml'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`signal-garden-${hash(input.value).toString(16).slice(0,6)}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('SVG print exported')}
  async function copyLink(){updateURL(false);try{await navigator.clipboard.writeText(location.href);toast('Garden link copied')}catch{toast('Copy blocked - use the address bar')}}
  function restore(){const q=new URLSearchParams(location.search),seed=q.get('seed');if(seed){try{input.value=decodeURIComponent(escape(atob(seed.replace(/-/g,'+').replace(/_/g,'/'))))}catch{}}const paper=q.get('paper');if(palettes[paper])theme=paper;const g=q.get('growth');if(['spare','natural','wild'].includes(g))growth=g;$$('[data-growth]').forEach(b=>b.classList.toggle('active',b.dataset.growth===growth));setTheme(theme);update()}
  input.addEventListener('input',update);
  $('#sample').addEventListener('click',()=>{sampleIndex=(sampleIndex+1)%samples.length;input.value=samples[sampleIndex];update();render(true)});
  $('#themes').addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(b)setTheme(b.dataset.theme)});
  $$('.segmented button').forEach(b=>b.addEventListener('click',()=>{growth=b.dataset.growth;$$('.segmented button').forEach(x=>x.classList.toggle('active',x===b));render(true);updateURL(false)}));
  ['pointerover','focusin','click'].forEach(event=>svg.addEventListener(event,e=>{const leaf=e.target.closest&&e.target.closest('.word-leaf');if(leaf)$('#wordReveal').value=leaf.dataset.word}));
  svg.addEventListener('pointerleave',()=>{$('#wordReveal').value=''});
  $('#play').addEventListener('click',playRhythm);$('#regrow').addEventListener('click',()=>render(true));$('#export').addEventListener('click',exportSVG);$('#copy').addEventListener('click',copyLink);
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
  const style=document.createElement('style');style.textContent='@keyframes draw{to{stroke-dashoffset:0}}';document.head.appendChild(style);restore();
})();
