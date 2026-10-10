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
  const titles={tea:'去茶铺找王五',ride:'到河岸招船',boat:'向船夫问路',invoice:'看看船上的货单',landing:'随船到岸，下船寻踪',stall:'问问桥头的搬货伙计',search:'在摊棚寻找青布纸包',zhang:'找到张择端',return:'将纸包交还周福',complete:'画中寻人 · 已完成'};
  const objectives={tea:'张择端没有赴约。先问茶铺的王五。',ride:'画稿圈出了带篷船。到码头招船，跟船夫打听。',boat:'已登船。船夫赵三也许见过张先生。',invoice:'船上有一张货单。看看纸包送去了哪里。',landing:'货单写着桥头摊棚。先随船靠岸。',stall:'纸包被搬到了岸上。向摊棚伙计问清去处。',search:'青布包裹、下垫木板，应该就在摊棚里。',zhang:'纸包找到了。张先生还在摊棚附近看搬货。',return:'张先生托你将纸包送回蜀商周福手里。',complete:'找到张择端，也听懂了这张纸为何值得商旅珍惜。'};
  function target(){return ({tea:'wang',ride:'wang',boat:'boat',invoice:'boat',landing:'boat',stall:'stall',search:'stall',zhang:'zhang',return:'zhou',complete:'zhang'})[quest.stage];}
  function talk(lines,done,cues){return dialogue()?.run(lines,target(),done,cues);}
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
      ['看货单',()=>card('桥头摊棚 · 货单','布二匹，纸一包。送至桥头摊棚。\n\n纸角另记了一行小字：青布包裹，勿近水。\n\n沈照：桥头摊棚……好，记住了。青布包着，底下还有木板。\n赵三：到岸上认这两样就成。货堆起来，都差不多一个模样。',[
        ['记下去处，收好货单',()=>{next('invoice');close();}],['再看看别处',inspectCargo]])],
      ['看看垫纸的木板',()=>card('怕水的纸货','木板边沿有水痕，上面却留着一块干燥的方印。\n\n沈照：纸包原先放在这里？\n赵三：对。你先生抱走了，板子也一并带去了。他怕搁在湿地上。', [['回到货物旁',inspectCargo]])],
      ['看看船边的画稿',()=>card('张先生的几笔画','纸上画着一只握绳的手，指节和绳结都只勾了几笔。\n\n沈照：连这个也画了。怪不得五哥叫不住他。\n赵三：我这双手天天摸绳，有什么好看的？他倒看了半天。', [['继续找纸包的去处',inspectCargo]])]
    ]);
  }
  function search(){
    card('摊棚里找一找','伙计说：青布包着，下边垫块木板。东西虽多，不必急，一处处看看。',[
      ['翻看布匹旁',()=>card('几匹待交的布','沈照：都是布，包得挺紧。不是这个。\n伙计：那几匹有人订了，别拆。纸包在靠里些的地方。', [['换一处看看',search]])],
      ['看看竹筐',()=>card('一筐零碎','筐里装着旧麻绳和几块包货布。\n\n沈照：也不在这里……这绳子倒缠得够乱。\n伙计：留着捆货的。先别理它，越理越乱。', [['回摊棚继续找',search]])],
      ['查看木板上的青布包',()=>card('找到青布纸包','青布包裹下垫着一块木板，右上角系着结。\n\n沈照：找到了。底下是干的，布也没湿。\n伙计：就是它。托稳了，你先生就在旁边。', [['收好纸包',()=>{next('search');close();}]])]
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
        ['赵三','站稳了！往里半步，别踩那根绳。'],
        ['沈照','好。船家，劳驾问个人。方才有没有一位拿着笔的张先生，上过您的船？'],
        ['赵三','有。怎么，你也找他？他蹲在那儿看我收绳，我收一回，他还让我再收一回。'],
        ['沈照','是他了。这船篷都画在纸上了。'],
        ['赵三','成，那没找错。他跟着货上岸去了。桥头的摊棚，就那边，你看见没有？'],
        ['沈照','看见了。他买了什么货？'],
        ['赵三','不是他的，是周福的。一个从蜀地来的客商。青布包着的纸货，底下垫块木板，碰不得水。'],
        ['沈照','张先生替他照看着？'],
        ['赵三','嗯。方才旁边一条船荡过来，溅了一阵水，他赶紧把那包东西抱起来。周福还没来得及谢，他先问上了：交子长什么样，怎么拿去换钱。问得那叫一个细。'],
        ['沈照','我先看看货送到哪里，免得上岸又走岔。'],
        ['赵三','货单压在篷下，你拿起来看。莫急，我正好过去卸货，捎你一程。'],
        ['沈照','船钱多少？'],
        ['赵三','顺路，不收你的。坐稳就成，别替我添个捞人的活儿。']
      ],()=>next('boat'));break;
      case 'invoice':inspectCargo();break;
      case 'stall':talk([
        ['伙计','借过，借过！别站这儿，后头还有一担。'],
        ['沈照','劳驾，问一句就走。你们刚才收过一个青布纸包吗？下面垫着木板的。'],
        ['伙计','收过。在棚里，你别往布底下翻，刚码好的。'],
        ['沈照','送纸包来的张先生，还在这里吗？'],
        ['伙计','在啊。方才替我挪完东西，转头就画上了。我让他往旁边站站，他还说，再看一眼。'],
        ['沈照','我从茶铺追到船上，又从船上追到这里。他倒一直没闲着。'],
        ['伙计','找画画的那位？就在棚子旁边。你先搭把手，把那包纸抱出来。待会儿这一担放下去，又得挪。'],
        ['沈照','青布、木板，对吧？'],
        ['伙计','对，结打在上头。别拽布角，托着底下抱。']
      ],()=>next('stall'));break;
      case 'search':search();break;
      case 'zhang':talk([
        ['沈照','先生。'],
        ['张择端','且慢，等他把担子放下……好了。沈照？你怎么到这里来了？'],
        ['沈照','您约我在茶铺见面。我问了王五，坐了赵三的船，又来棚里找纸包，这才见着您。'],
        ['张择端','哎，是我忘了。原想着看一会儿就回去，谁知船刚靠岸，这边又开始卸货。'],
        ['沈照','画具还在我背上呢。您再往前走，我就得背着它追到城门了。'],
        ['张择端','让你受累了，先放下来。这个纸包……对，就是周福的。方才怕它沾水，我托伙计收进棚里。'],
        ['沈照','他在哪儿？我给他送过去。'],
        ['张择端','就在河岸那边。叫一声周福，他便知道了。'],
        ['沈照','一路上都说您在问交子。您是要把它画下来？'],
        ['张择端','想看看。周福说，他在蜀地做买卖，一包铁钱得费力提着，换成交子，收进衣里就走。我没见过，便多问了几句。'],
        ['沈照','就为了看看一张纸，您把茶都忘了？'],
        ['张择端','哈哈，茶凉了还能添。人走了，下次未必遇得上。你送纸包时也问问他，他肯讲。'],
        ['沈照','好。这回您可别又走了。'],
        ['张择端','不走，就在这里。你看，我连画具都没有了，还能走到哪儿去？']
      ],()=>next('zhang'));break;
      case 'return':talk([
        ['沈照','劳驾，您是周福吗？张先生托我把这个送来。'],
        ['周福','是我。哎哟，可算拿来了！放这里，放这里。底下那块板也带着？多谢，多谢。'],
        ['周福','干的，好。方才那阵水溅过来，我正腾不开手，幸亏张先生替我抱起来。'],
        ['沈照','听说您带着交子。我还没见过，能看看吗？'],
        ['周福','要得。手上没水吧？来，托着看，别迎着风展开。'],
        ['沈照','比我想的小些。我还以为要像画卷一样，卷着带。'],
        ['周福','那还怎么带？折好，收在衣里就行。我从前提铁钱，手指都勒红了。换成这个，空出手来，多少还能提点别的。'],
        ['沈照','拿着它，就能把钱换回来？'],
        ['周福','在蜀地，要拿到能兑付的地方去。交过去，人家查验过，再兑钱给你。头一回换，我还站在柜前问了好几遍。'],
        ['沈照','问什么？'],
        ['周福','问明日来兑行不行，纸折了还能不能收。伙计都笑了，说我既舍不得那包钱，又嫌它沉。'],
        ['沈照','哈哈，那我替您问一句：拿它去前头酒楼，能付饭钱吗？'],
        ['周福','这儿？你还是带铜钱去。我到汴京吃饭买茶，用的也是铜钱。这个带着给人看看，可没拿它结过饭钱。'],
        ['沈照','那我收好钱袋，免得吃完饭才发现付不了。'],
        ['周福','对嘛。来，纸还我。你帮我送了东西，本该请你喝碗茶——张先生还等着你吧？'],
        ['沈照','等着他的画具呢。这回说好了，不许再走。'],
        ['周福','那赶紧去。我看未必，你瞧，他又盯着旁边那挑担的了。']
      ],()=>{next('return');card('画中寻人 · 完成','纸包已经送还，张先生还在摊棚旁等你。\n\n可以回去交画具，也可以继续逛街。\n\n本段人物相遇与事件为虚构；交子体验不代表北宋汴京可普遍兑换、使用交子。', [['回到画卷',close]]);},{5:{title:'周福带来的交子',art:root.HandscrollQuestArt.jiaozi,copy:'你托住纸张，展开看了看。\n交子图像为游戏复原示意，并非史实真券。'}});break;
      case 'complete':talk([['沈照','先生，纸包送到了。交子也看过了。'],['张择端','好。画具给我，你坐这边。'],['沈照','终于能歇一会儿了。'],['张择端','一路跑热了吧？待会儿回王五那里喝茶。东坡那句“人间有味是清欢”，倒让你五哥的一碗茶也沾点光。'],['沈照','他若听见，怕是要把这句话挂到柜上。'],['张择端','你可别告诉他。来，帮我压住这张纸，风起来了。']]);break;
    }
  }
  root.HandscrollMainQuest={target,interact,label:()=>({boat:'赵三 · 问路',invoice:'篷下货物 · 查看',stall:'伙计 · 打听',search:'摊棚 · 寻找',zhang:'张择端 · 交谈',return:'周福 · 归还',complete:'张择端 · 交谈'})[quest.stage]||'王五 · 交谈',available:()=>!['ride','landing'].includes(quest.stage),read:()=>({stage:quest.stage,title:titles[quest.stage],objective:objectives[quest.stage]}),track:interact};
  function tick(){const s=scene()?.read();if(s?.ready&&!s.inAtlas){if(quest.stage==='ride'&&s.aboard)next('ride');if(quest.stage==='landing'&&!s.aboard&&s.ferry.berth==='east'&&s.player.x>1800)next('landing');}requestAnimationFrame(tick);}
  requestAnimationFrame(tick);
})(typeof window!=='undefined'?window:globalThis);
