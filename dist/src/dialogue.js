(function(root){
  'use strict';
  // Layout against measured glyph widths, never a fixed character count.
  function paginate(text,measure,width,lines=3){
    const pages=[],glyphs=Array.from(text);let page='',line='',count=1;
    for(const [index,char] of glyphs.entries()){
      const next=glyphs[index+1]||'',reserve=/[，。！？；：、）】」』]/.test(next)?next:'';
      if(char==='\n'||(line&&measure(line+char+reserve)>width)){
        if(count===lines){pages.push(page);page='';count=1;}else{page+='\n';count++;}
        line='';if(char==='\n')continue;
      }
      line+=char;page+=char;
    }
    if(page)pages.push(page);return pages;
  }
  if(typeof module==='object'&&module.exports){module.exports={paginate};return;}
  const ui=document.createElement('div');ui.id='storyUI';
  ui.innerHTML=`<aside class="story-ui story-hint" hidden><p id="storyObjective">张择端没有赴约。先问问茶铺的王五。</p><a href="#tea" id="storyLocate">去茶铺找王五</a><button id="storyEvidence" hidden>查看画稿</button><small>靠近王五，按 E 或点击交谈</small></aside>
    <button class="story-ui story-npc" hidden aria-label="与王五交谈">王五 · 交谈</button>
    <section class="story-ui story-dialogue" role="dialog" aria-label="原地对话" hidden><button class="dialogue-close" aria-label="结束对话">×</button><button class="dialogue-next"><span class="dialogue-speaker"></span><span class="dialogue-text"></span><span class="dialogue-hint">点击继续</span></button><span class="story-sr" aria-live="polite"></span></section>
    <div class="evidence-modal" role="dialog" aria-modal="true" aria-labelledby="evidenceTitle" hidden><section class="evidence-sheet"><button class="evidence-close" aria-label="关闭画稿">×</button><h2 id="evidenceTitle">画师留下的画稿</h2><figure class="evidence-art"><img src="assets/dialogue-approved-board-v1.png" alt="画稿中的桥边有一条带篷船，被红色圈记标出"></figure><p>桥边的一条带篷船，被他特意圈了出来。</p><button class="evidence-keep">收好</button></section></div>`;
  document.body.append(ui);
  const hint=ui.querySelector('.story-hint'),npcButton=ui.querySelector('.story-npc'),box=ui.querySelector('.story-dialogue');
  const next=ui.querySelector('.dialogue-next'),speaker=ui.querySelector('.dialogue-speaker'),text=ui.querySelector('.dialogue-text'),instruction=ui.querySelector('.dialogue-hint');
  const modal=ui.querySelector('.evidence-modal'),evidenceButton=ui.querySelector('#storyEvidence'),locate=ui.querySelector('#storyLocate');
  const script=[
    ['沈照','五哥，张先生今日来过吗？约好在这里碰面的，我瞧了一圈，也没见着他。'],
    ['王五','来过，刚才还坐这儿呢。他跟一个蜀地来的客人聊得起劲，茶都顾不上喝。后来听见桥边有人招呼，就拿着笔出去了。'],
    ['沈照','那他有没有留下什么话？我带着画具，怕跟他走岔了。'],
    ['王五','有。这张画是给你的。他说沿河走，先认桥，再认船，就能找着他。我让他留句话，他倒好，又画了一张。'],
    ['沈照','嗯，我看看。桥边这条带篷的船，他特意圈了出来……看来得去那边问问。'],
    ['王五','对，别光顾着看画，路上留神脚下。那客人还在附近，说起蜀地的交子来挺有意思。先生方才就是听这个听入了神。']
  ];
  let active=false,collected=false,entry=0,pageIndex=0,pages=[],shown=0,characters=[],nextAt=0,lastClick=0,modalOwnsLock=false;
  const measureCanvas=document.createElement('canvas'),measureContext=measureCanvas.getContext('2d');
  const engine=()=>root.HandscrollDialogueScene;
  function setPage(){
    const style=getComputedStyle(text);measureContext.font=`${style.fontSize} ${style.fontFamily}`;
    pages=paginate(script[entry][1],s=>measureContext.measureText(s).width,text.clientWidth,3);
    pageIndex=0;showPage();
  }
  function showPage(){
    speaker.textContent=script[entry][0];characters=Array.from(pages[pageIndex]);shown=0;text.textContent='';nextAt=performance.now()+70;
    instruction.textContent='点击显示全文';ui.querySelector('.story-sr').textContent='';
  }
  function finishPage(){shown=characters.length;text.textContent=characters.join('');instruction.textContent=entry===script.length-1&&pageIndex===pages.length-1?'点击结束交谈':'点击继续';ui.querySelector('.story-sr').textContent=`${speaker.textContent}：${text.textContent}`;}
  function start(){
    const scene=engine()?.read();if(!scene||scene.inAtlas||scene.aboard||active||!modal.hidden)return;
    if(Math.abs(scene.player.x-scene.npc.x)>110){engine().approach();return;}
    if(!engine().lock(true))return;
    active=true;entry=0;box.hidden=false;document.body.dataset.dialogueMode='talk';setPage();next.focus({preventScroll:true});
  }
  function end(){
    active=false;box.hidden=true;engine()?.unlock();document.body.dataset.dialogueMode='explore';
  }
  function advance(){
    if(!active||!modal.hidden)return;
    const now=performance.now();if(now-lastClick<110)return;lastClick=now;
    if(shown<characters.length){finishPage();return;}
    if(++pageIndex<pages.length){showPage();return;}
    const finished=entry;entry++;
    if(entry===script.length){end();return;}
    setPage();
    if(finished===3){collected=true;evidenceButton.hidden=false;locate.hidden=true;ui.querySelector('#storyObjective').textContent='已获得画稿：沿河寻找画中的带篷船。';openEvidence();}
  }
  function openEvidence(){
    if(!collected||!modal.hidden)return;
    if(!active){if(!engine()?.lock(false))return;modalOwnsLock=true;}
    modal.hidden=false;box.hidden=true;document.body.dataset.dialogueMode='evidence';ui.querySelector('.evidence-keep').focus({preventScroll:true});
  }
  function closeEvidence(){
    if(modal.hidden)return;modal.hidden=true;
    if(modalOwnsLock){modalOwnsLock=false;engine()?.unlock();document.body.dataset.dialogueMode='explore';evidenceButton.focus({preventScroll:true});}
    else{box.hidden=!active;nextAt=performance.now()+100;document.body.dataset.dialogueMode='talk';next.focus({preventScroll:true});}
  }
  next.addEventListener('click',advance);npcButton.addEventListener('click',start);
  ui.querySelector('.dialogue-close').addEventListener('click',end);
  evidenceButton.addEventListener('click',openEvidence);ui.querySelector('.evidence-close').addEventListener('click',closeEvidence);ui.querySelector('.evidence-keep').addEventListener('click',closeEvidence);
  locate.addEventListener('click',()=>{if(location.hash==='#tea')engine()?.approach();});
  // Capture shields original keyboard/pointer listeners without editing movement.
  document.addEventListener('keydown',e=>{
    const locked=engine()?.locked;
    if(locked){
      e.preventDefault();e.stopImmediatePropagation();
      if(e.code==='Tab'&&!modal.hidden){const keep=ui.querySelector('.evidence-keep'),close=ui.querySelector('.evidence-close');(document.activeElement===keep?close:keep).focus();return;}
      if(e.repeat)return;
      if(e.code==='Escape'){if(!modal.hidden)closeEvidence();else end();}
      else if(['Space','Enter','KeyE'].includes(e.code)){if(!modal.hidden)closeEvidence();else advance();}
      return;
    }
    if(e.code==='KeyE'&&!e.repeat){const scene=engine()?.read();if(scene&&!scene.inAtlas&&!scene.aboard&&Math.abs(scene.player.x-scene.npc.x)<=110){e.preventDefault();e.stopImmediatePropagation();start();}}
  },true);
  for(const type of ['pointerdown','pointerup','pointermove','wheel','dblclick','click'])document.addEventListener(type,e=>{
    if(engine()?.locked&&!ui.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();}
  },{capture:true,passive:false});
  function tick(now){
    const scene=engine()?.read();
    const visible=scene?.ready&&!scene.inAtlas;
    hint.hidden=!visible;document.body.dataset.dialogueCollected=String(collected);
    if(visible){
      const x=(scene.npc.x-scene.camera)*scene.scale,y=(scene.npc.y-scene.viewY)*scene.scale;
      npcButton.hidden=active||!modal.hidden||scene.aboard||x<25||x>scene.width-25;
      npcButton.style.left=`${x}px`;npcButton.style.top=`${Math.min(scene.height-80,y+10)}px`;
      npcButton.classList.toggle('nearby',Math.abs(scene.player.x-scene.npc.x)<=110);
      if(active){
        const head=Math.min(scene.npc.y-scene.npc.h,scene.player.y-scene.player.h);
        box.style.left=`${Math.max(16,Math.min(scene.width-box.offsetWidth-16,x+20))}px`;
        box.style.top=`${Math.max(16,Math.min(scene.height-box.offsetHeight-20,(head-scene.viewY)*scene.scale-box.offsetHeight-18))}px`;
      }
    }
    if(active&&!document.hidden&&modal.hidden&&now>=nextAt&&shown<characters.length){
      const char=characters[shown++];text.textContent=characters.slice(0,shown).join('');nextAt=now+(/[，。！？；…]/.test(char)?160:38);
      if(shown===characters.length)finishPage();
    }
    requestAnimationFrame(tick);
  }
  addEventListener('atlas-enter',()=>{if(active)end();if(!modal.hidden)closeEvidence();});
  document.fonts?.ready.then(()=>{if(active){const complete=shown===characters.length;setPage();if(complete)finishPage();}});
  requestAnimationFrame(tick);
})(typeof window!=='undefined'?window:globalThis);
