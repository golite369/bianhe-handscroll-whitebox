(function(root){
  'use strict';
  const stages=['tea','ride','boat','invoice','landing','stall','search','zhang','return','complete'];
  function createQuest(initial='tea',save=()=>{}){
    let index=Math.max(0,stages.indexOf(initial));
    return {get stage(){return stages[index];},advance(expected){if(stages[index]!==expected||index===stages.length-1)return false;index++;save(stages[index]);return true;}};
  }
  if(typeof module==='object'&&module.exports){module.exports={createQuest,stages};return;}
  let savedStage='tea';try{savedStage=sessionStorage.getItem('handscroll-main-v1')||'tea';}catch{}
  if(['boat','invoice','landing'].includes(savedStage))savedStage='ride';
  const quest=createQuest(savedStage,stage=>{try{sessionStorage.setItem('handscroll-main-v1',stage);}catch{}}),scene=()=>root.HandscrollDialogueScene,dialogue=()=>root.HandscrollDialogue;
  const titles={tea:'去茶铺找王五',ride:'到河岸招船',boat:'向船夫问路',invoice:'看看船上的货单',landing:'随船到岸，下船寻踪',stall:'问问桥头的搬货伙计',search:'在摊棚寻找青布纸包',zhang:'找到张择端',return:'将纸包交还周六',complete:'画中寻人 · 已完成'};
  const objectives={tea:'张择端没有赴约。先问茶铺的王五。',ride:'画稿圈出了带篷船。到码头招船，跟船夫打听。',boat:'已登船。船夫赵三也许见过张先生。',invoice:'船上有一张货单。看看纸包送去了哪里。',landing:'货单写着桥头摊棚。先随船靠岸。',stall:'纸包被搬到了岸上。向摊棚伙计问清去处。',search:'青布包裹、下垫木板，应该就在摊棚里。',zhang:'纸包找到了。张先生还在摊棚附近看搬货。',return:'张先生托你将纸包送回蜀商周六手里。',complete:'找到张择端，也听懂了这张纸为何值得商旅珍惜。'};
  function target(){return ({tea:'wang',ride:'wang',boat:'boat',invoice:'boat',landing:'boat',stall:'stall',search:'stall',zhang:'zhang',return:'zhou',complete:'zhang'})[quest.stage];}
  function talk(lines,done){return dialogue()?.run(lines,target(),done);}
  function next(stage){quest.advance(stage);}
  const ui=document.createElement('div');ui.dataset.sideUi='';ui.id='mainQuestInspect';ui.hidden=true;
  ui.innerHTML='<section class="evidence-sheet main-quest-sheet" role="dialog" aria-modal="true" aria-labelledby="mainQuestTitle"><button class="evidence-close" aria-label="关闭">×</button><h2 id="mainQuestTitle"></h2><img class="quest-prop-image" hidden alt=""><p class="main-quest-copy"></p><div class="main-quest-options"></div></section>';
  document.body.append(ui);let ownsLock=false,previousFocus;
  function close(){ui.hidden=true;if(ownsLock){ownsLock=false;scene()?.unlock();document.body.dataset.dialogueMode='explore';}previousFocus?.focus({preventScroll:true});}
  function card(title,copy,options){
    if(ui.hidden){if(!scene()?.lock(false,target()))return;ownsLock=true;previousFocus=document.activeElement;}
    document.body.dataset.dialogueMode='side';ui.hidden=false;
    ui.querySelector('h2').textContent=title;ui.querySelector('p').textContent=copy;
    const artKey=({'桥头摊棚 · 货单':'invoice','找到青布纸包':'bundle'})[title],art=root.HandscrollQuestArt?.[artKey],image=ui.querySelector('.quest-prop-image');
    image.hidden=!art;if(art){image.src=art.src;image.alt=art.alt;}else image.removeAttribute('src');
    const container=ui.querySelector('.main-quest-options');container.replaceChildren();
    options.forEach(([label,action])=>{const b=document.createElement('button');b.textContent=label;b.addEventListener('click',action);container.append(b);});
    container.querySelector('button')?.focus({preventScroll:true});
  }
  ui.querySelector('.evidence-close').addEventListener('click',close);
  document.addEventListener('keydown',e=>{
    if(ui.hidden||e.target.closest?.('[data-sound-control]'))return;
    e.stopImmediatePropagation();
    if(e.key==='Escape'){e.preventDefault();close();}
    if(e.key==='Tab'){e.preventDefault();const buttons=[...ui.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}
  },true);
  function inspectCargo(){
    card('船上的货物','篷下的纸货垫着木板，旁边压着一张货单。船夫将绳头收好，示意你先看纸上的字。',[
      ['看货单',()=>card('桥头摊棚 · 货单','布二匹，纸一包。送至桥头摊棚。\n\n纸角另记了一行小字：青布包裹，勿近水。\n\n这张单子记的是货物和去处，并不是交子。',[
        ['记下去处，收好货单',()=>{next('invoice');close();}],['再看看别处',inspectCargo]])],
      ['看看垫纸的木板',()=>card('怕水的纸货','木板把纸包和湿船底隔开。青布上留着一道方方的折痕，纸包刚被搬走不久。', [['回到货物旁',inspectCargo]])],
      ['看看船边的画稿',()=>card('张先生的几笔画','几笔淡墨记下了船夫握橹的手和绳结。原来他一路追着这些细节画，并不是故意避着你。', [['继续找纸包的去处',inspectCargo]])]
    ]);
  }
  function search(){
    card('摊棚里找一找','伙计说：青布包着，下边垫块木板。东西虽多，不必急，一处处看看。',[
      ['翻看布匹旁',()=>card('几匹待交的布','布卷扎得很紧，木签上记着买家的姓名。这里没有纸包。', [['换一处看看',search]])],
      ['看看竹筐',()=>card('一筐零碎','竹筐里是麻绳和包货的旧布。摸一摸，没有垫纸的木板。', [['回摊棚继续找',search]])],
      ['查看木板上的青布包',()=>card('找到青布纸包','青布底下垫着木板，结扣系在右上角。包裹完好，没有湿痕。你把它抱稳，准备问问张先生。', [['收好纸包',()=>{next('search');close();}]])]
    ]);
  }
  function interact(){
    const s=scene()?.read(target());if(!s?.ready||s.inAtlas||scene().locked)return;
    if(quest.stage==='ride'){scene().ride();return;}
    if(quest.stage==='landing')return;
    if(quest.stage==='invoice'&&!s.aboard){inspectCargo();return;}
    if(quest.stage==='boat'&&!s.aboard){scene().ride();return;}
    if(!s.aboard&&Math.abs(s.player.x-s.npc.x)>110){scene().approach(target());return;}
    switch(quest.stage){
      case 'tea':dialogue().tea(()=>next('tea'));break;
      case 'boat':talk([
        ['沈照','船家，打听个人。张先生方才是不是坐过这条船？他留给我的画里，圈的就是这个船篷。'],
        ['赵三','是他，坐了没多久。看我收绳，看得比我自己还仔细。后来纸货要往桥头送，他又跟着去看搬货了。'],
        ['沈照','怪不得在茶铺没等到他。这一船的纸货，是他买的吗？'],
        ['赵三','不是，是蜀地周六的货。周六有个青布纸包，怕沾水，特意垫了木板。张先生帮着照看，嘴上还一直问交子的事。'],
        ['沈照','交子……他在茶铺也是听这个听入了神。我先认认货，到了岸上就不至于找错。'],
        ['赵三','那就看篷下这张货单。记的是货送哪儿，可别把它当交子。船钱不必给，我本来就往那头挪船卸货，顺带你一程。']
      ],()=>next('boat'));break;
      case 'invoice':inspectCargo();break;
      case 'stall':talk([
        ['沈照','劳驾，这里刚收过一包纸货吗？青布包着，底下垫木板的。我正找替人照看它的张先生。'],
        ['伙计','收过。方才岸边溅水，他连忙把包裹往里挪。我正扛着布，没腾出手，倒让一个画画的替我忙了一回。'],
        ['沈照','他人呢？茶铺说上了船，船家又说到这儿了，我总慢他一步。'],
        ['伙计','还在旁边呢！他瞧见我们搬货，又停下来画。先把纸包找出来吧，免得待会儿一堆货压着。青布，木板，认这两样就成。']
      ],()=>next('stall'));break;
      case 'search':search();break;
      case 'zhang':talk([
        ['沈照','先生，可算找到您了。画具在我背上，您的画却一路留到船上去了。这个纸包，是您替周六照看的吗？'],
        ['张择端','是，是这个。让你跑了一趟。原说回茶铺等你，可船夫收绳、伙计搬货，一件接一件，我停下来就忘了时候。'],
        ['沈照','我还当那张画藏着什么难解的意思。原来只是您画到了哪里，我就跟到哪里。'],
        ['张择端','哈哈，没那么玄。纸包怕湿，我先托伙计收进摊棚。周六在那边等着，烦你送过去，让他看看结扣，别弄混了。'],
        ['沈照','好。不过，您为什么对他的交子这么上心？'],
        ['张择端','他说一张纸能省去背许多铁钱的劳累。我画这条河，常看人搬货、扛钱，总想知道这些辛苦怎样能少一点。你去听他自己讲，比我转述明白。']
      ],()=>next('zhang'));break;
      case 'return':talk([
        ['沈照','您是周六吧？张先生让我把青布纸包送回来。下边的木板也带来了，没沾水。'],
        ['周六','对，右上角这结是我系的。账册还干着，多谢你。这一路最怕货丢了，也怕账认不清。'],
        ['沈照','船夫说您讲了交子的事。能让我看看吗？我认得铜钱，这种纸上的钱倒没亲眼见过。'],
        ['周六','可以看，手先擦干。在蜀地，铁钱沉，做大买卖带着累。有了交子，商旅不必事事扛着那么多钱走。你想想，这样一张纸，肩上能轻多少。'],
        ['沈照','嗯。不过我拿着它进汴京酒楼，伙计也肯收吗？'],
        ['周六','那可不能这样想。到什么地方，就得问什么地方的规矩。不是随便一张纸写了数，就有人肯认；也不是有了交子，天下都能拿它付账。'],
        ['沈照','明白了。货单记货物去哪儿，交子又是另一回事。先生追着您问的，原来是这张纸背后，大家怎样认账。'],
        ['周六','正是。今天先把这些分清就好。张先生还等着你的画具呢，快去吧，别叫他又画到别处去了。']
      ],()=>{next('return');card('画中寻人 · 完成','你找到了张择端，归还了青布纸包，也听周六说起交子。\n\n可回到张先生身边交画具，或继续逛街。\n\n本段人物相遇与事件为虚构；交子体验不代表北宋汴京可普遍兑换、使用交子。', [['回到画卷',close]]);});break;
      case 'complete':talk([['张择端','画具送到了？好，咱们就在这里画几笔。你看，那位伙计卸了担，正抬手擦汗——这些小动作，才是这条街的日子。']]);break;
    }
  }
  root.HandscrollMainQuest={target,interact,label:()=>({boat:'赵三 · 问路',invoice:'篷下货物 · 查看',stall:'伙计 · 打听',search:'摊棚 · 寻找',zhang:'张择端 · 交谈',return:'周六 · 归还',complete:'张择端 · 交谈'})[quest.stage]||'王五 · 交谈',available:()=>!['ride','landing'].includes(quest.stage),read:()=>({stage:quest.stage,title:titles[quest.stage],objective:objectives[quest.stage]}),track:interact};
  function tick(){const s=scene()?.read();if(s?.ready&&!s.inAtlas){if(quest.stage==='ride'&&s.aboard)next('ride');if(quest.stage==='landing'&&!s.aboard&&s.ferry.berth==='east'&&s.player.x>1800)next('landing');}requestAnimationFrame(tick);}
  requestAnimationFrame(tick);
})(typeof window!=='undefined'?window:globalThis);
