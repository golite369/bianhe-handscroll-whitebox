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
  const teaScript=[
    ['王五','哎，沈照！你可来了。背这么一大包，先放下，喝口茶？'],
    ['沈照','先不坐了，五哥。张先生不是约我在这里碰面吗？我从门口看到里头，也没见着他。'],
    ['王五','刚走。他坐你常坐的那张桌子，跟个蜀地客人聊了半晌。茶都凉了，我给他添水，两人还聊着呢。'],
    ['沈照','后来往哪儿去了？'],
    ['王五','桥边有人喊卸货，他听见就起身了。我想叫住他来着，说你一会儿就到。他倒没回来，留了这个，让我交给你。'],
    ['王五','来，画稿在这儿。'],
    ['沈照','我看看……桥脚，一条带篷的船。这里还圈了一笔。'],
    ['王五','对，就是这条船。那船夫我认得，叫赵三，常在这一带停船。你过去问问，总比满街找强。'],
    ['沈照','行。茶先替我留着，找到人再回来喝。'],
    ['王五','得嘞。可别学你先生，一出去就忘了回来！过桥看着脚下，别只顾看画。']
  ];
  let script=teaScript,targetKey='wang',completion=null,propCues={};
  let active=false,collected=!!root.HandscrollMainQuest&&root.HandscrollMainQuest.read().stage!=='tea',entry=0,pageIndex=0,pages=[],shown=0,characters=[],nextAt=0,lastClick=0,modalOwnsLock=false;
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
    if(root.HandscrollMainQuest){root.HandscrollMainQuest.interact();return;}
    run(teaScript,'wang');
  }
  function run(lines,key='wang',done=null,cues={}){
    const scene=engine()?.read(key);if(!scene?.ready||scene.inAtlas||active||!modal.hidden||engine().locked)return false;
    if(!scene.aboard&&Math.abs(scene.player.x-scene.npc.x)>110){engine().approach(key);return false;}
    if(!engine().lock(true,key))return false;
    script=lines;targetKey=key;completion=done;propCues=cues;
    active=true;entry=0;box.hidden=false;document.body.dataset.dialogueMode='talk';setPage();next.focus({preventScroll:true});
    return true;
  }
  function end(finished=false){
    active=false;box.hidden=true;engine()?.unlock();document.body.dataset.dialogueMode='explore';
    const done=completion;completion=null;if(finished)done?.();
  }
  function advance(){
    if(!active||!modal.hidden)return;
    const now=performance.now();if(now-lastClick<110)return;lastClick=now;
    if(shown<characters.length){finishPage();return;}
    if(++pageIndex<pages.length){showPage();return;}
    const finished=entry;entry++;
    if(entry===script.length){end(true);return;}
    setPage();
    if(script===teaScript&&finished===5){collected=true;evidenceButton.hidden=false;locate.hidden=true;ui.querySelector('#storyObjective').textContent='已获得画稿：沿河寻找画中的带篷船。';openEvidence();}
    if(propCues[entry])openEvidence(propCues[entry]);
  }
  function openEvidence(prop=null){
    // Click listeners pass an Event, not a prop descriptor.
    if(!prop?.art)prop=null;
    if((!collected&&!prop)||!modal.hidden)return;
    if(!active){if(!engine()?.lock(false))return;modalOwnsLock=true;}
    const figure=ui.querySelector('.evidence-art'),image=figure.querySelector('img');
    figure.classList.toggle('evidence-prop',!!prop);
    image.src=prop?prop.art.src:'assets/dialogue-approved-board-v1.png';
    image.alt=prop?prop.art.alt:'画稿中的桥边有一条带篷船，被红色圈记标出';
    ui.querySelector('#evidenceTitle').textContent=prop?prop.title:'画师留下的画稿';
    ui.querySelector('.evidence-sheet p').textContent=prop?prop.copy:'桥边的一条带篷船，被他特意圈了出来。';
    ui.querySelector('.evidence-keep').textContent=prop?'看好了，继续交谈':'收好';
    modal.hidden=false;box.hidden=true;document.body.dataset.dialogueMode='evidence';ui.querySelector('.evidence-keep').focus({preventScroll:true});
  }
  function closeEvidence(){
    if(modal.hidden)return;modal.hidden=true;
    if(modalOwnsLock){modalOwnsLock=false;engine()?.unlock();document.body.dataset.dialogueMode='explore';evidenceButton.focus({preventScroll:true});}
    else{box.hidden=!active;nextAt=performance.now()+100;document.body.dataset.dialogueMode='talk';next.focus({preventScroll:true});}
  }
  next.addEventListener('click',advance);npcButton.addEventListener('click',start);
  ui.querySelector('.dialogue-close').addEventListener('click',()=>end(false));
  evidenceButton.addEventListener('click',openEvidence);ui.querySelector('.evidence-close').addEventListener('click',closeEvidence);ui.querySelector('.evidence-keep').addEventListener('click',closeEvidence);
  locate.addEventListener('click',()=>{if(location.hash==='#tea')engine()?.approach();});
  // Capture shields original keyboard/pointer listeners without editing movement.
  document.addEventListener('keydown',e=>{
    if(e.target.closest?.('[data-sound-control]'))return;
    if(document.body.dataset.dialogueMode==='side')return;
    const locked=engine()?.locked;
    if(locked){
      e.preventDefault();e.stopImmediatePropagation();
      if(e.code==='Tab'&&!modal.hidden){const keep=ui.querySelector('.evidence-keep'),close=ui.querySelector('.evidence-close');(document.activeElement===keep?close:keep).focus();return;}
      if(e.repeat)return;
      if(e.code==='Escape'){if(!modal.hidden)closeEvidence();else end();}
      else if(['Space','Enter','KeyE'].includes(e.code)){if(!modal.hidden)closeEvidence();else advance();}
      return;
    }
    if(e.code==='KeyE'&&!e.repeat){const scene=engine()?.read(root.HandscrollMainQuest?.target()||'wang');if(scene&&!scene.inAtlas&&root.HandscrollMainQuest?.available()&&(scene.aboard||Math.abs(scene.player.x-scene.npc.x)<=110)){e.preventDefault();e.stopImmediatePropagation();start();}else if(root.HandscrollActivities?.interactNearby()){e.preventDefault();e.stopImmediatePropagation();}}
  },true);
  for(const type of ['pointerdown','pointerup','pointermove','wheel','dblclick','click'])document.addEventListener(type,e=>{
    if(engine()?.locked&&!ui.contains(e.target)&&!e.target.closest('[data-side-ui],[data-sound-control]')){e.preventDefault();e.stopImmediatePropagation();}
  },{capture:true,passive:false});
  function tick(now){
    const key=active?targetKey:(root.HandscrollMainQuest?.target()||'wang'),scene=engine()?.read(key);
    const visible=scene?.ready&&!scene.inAtlas;
    hint.hidden=!visible;if(!visible)npcButton.hidden=true;document.body.dataset.dialogueCollected=String(collected);
    if(visible){
      const x=(scene.npc.x-scene.camera)*scene.scale,y=(scene.npc.y-scene.viewY)*scene.scale;
      npcButton.hidden=active||engine()?.locked||!modal.hidden||!root.HandscrollMainQuest?.available()||x<25||x>scene.width-25;
      npcButton.textContent=root.HandscrollMainQuest?.label()||'王五 · 交谈';npcButton.setAttribute('aria-label',npcButton.textContent);
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
  root.HandscrollDialogue={run,tea(done){return run(teaScript,'wang',done);},evidence:openEvidence};
})(typeof window!=='undefined'?window:globalThis);
