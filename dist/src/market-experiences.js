(() => {
  'use strict';
  const room=!!document.getElementById('sceneWorld');
  let purse=window.HandscrollWallet?.read().purse??200,bill=0,paid=false,teaDone=false,exchangeDone=false,previousFocus=null,ownsLock=false,typeTimer=null,reveal=null;
  const prices=[12,38,8,24,22,16,10,9,36];
  const ui=document.createElement('section');ui.dataset.sideUi='true';ui.className=room?'market-experiences':'market-experiences street-experiences';
  ui.innerHTML='<button class="quest-toggle" aria-expanded="true">行记 <span>−</span></button><div class="quest-content"><p class="quest-heading">主线 · 寻访画师</p><button class="quest-main">去茶铺找王五</button><p class="quest-objective"></p><p class="quest-heading quest-side-heading">市井闲趣</p><div class="market-actions"></div><small class="market-purse"></small></div>';
  const modal=document.createElement('div');modal.dataset.sideUi='true';modal.className='market-modal';modal.hidden=true;
  modal.innerHTML='<section class="market-sheet" role="dialog" aria-modal="true" aria-labelledby="marketTitle"><button class="market-close" aria-label="收起闲趣">×</button><h2 id="marketTitle"></h2><img class="quest-prop-image" hidden alt=""><p class="market-words" aria-live="polite"></p><div class="market-choices"></div><small>互动金额为游戏设定，不代表北宋真实物价。</small></section>';
  (room?document.querySelector('main'):document.body).append(ui);document.body.append(modal);
  const actions=ui.querySelector('.market-actions'),words=modal.querySelector('.market-words'),choices=modal.querySelector('.market-choices');
  function button(label,handler,container=choices){const b=document.createElement('button');b.textContent=label;b.addEventListener('click',handler);container.append(b);return b;}
  function refresh(){window.HandscrollWallet?.setPurse(purse);ui.querySelector('.market-purse').textContent=`钱袋 · ${purse} 文`+(window.HandscrollWallet?.read().ticket?' · 体验交子一张':'');for(const [b,done] of [[teaTask,teaDone],[exchangeTask,exchangeDone],[mealTask,paid]])if(b){b.classList.toggle('is-complete',done);b.setAttribute('aria-label',b.textContent+(done?' · 已体验':''));}}
  function show(title,text){
    if(modal.hidden){previousFocus=document.activeElement;if(!room){if(!window.HandscrollDialogueScene?.lock(false))return false;ownsLock=true;document.body.dataset.dialogueMode='side';}modal.hidden=false;}
    modal.querySelector('h2').textContent=title;clearInterval(typeTimer);words.textContent='';choices.replaceChildren();choices.hidden=true;
    modal.querySelector('small').textContent=['领到交子','交子兑回铁钱','蜀地兑铺 · 体验小剧情'].includes(title)?'虚构的蜀地兑换体验，使用独立剧情铁钱，不扣随身铜钱；不代表历史面额、费率或通行范围。':'互动金额为游戏设定，不代表北宋真实物价。';
    const art=['领到交子','蜀地兑铺 · 体验小剧情'].includes(title)&&window.HandscrollWallet?.read().ticket?window.HandscrollQuestArt?.jiaozi:null,image=modal.querySelector('.quest-prop-image');
    image.hidden=!art;if(art){image.src=art.src;image.alt=art.alt;}else image.removeAttribute('src');
    const chars=Array.from(text);let index=0;reveal=()=>{clearInterval(typeTimer);words.textContent=text;choices.hidden=false;reveal=null;};
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)reveal();else typeTimer=setInterval(()=>{words.textContent+=chars[index++]||'';if(index>=chars.length)reveal?.();},32);
    modal.querySelector('.market-close').focus({preventScroll:true});return true;
  }
  words.addEventListener('click',()=>reveal?.());
  function close(){clearInterval(typeTimer);reveal=null;modal.hidden=true;if(ownsLock){ownsLock=false;window.HandscrollDialogueScene?.unlock();document.body.dataset.dialogueMode='explore';}previousFocus?.focus({preventScroll:true});}
  modal.querySelector('.market-close').addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(modal.hidden||e.target.closest?.('[data-sound-control]'))return;e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){const items=[...modal.querySelectorAll('button')],i=items.indexOf(document.activeElement);e.preventDefault();items[(i+(e.shiftKey?-1:1)+items.length)%items.length].focus();}},true);
  function merchant(){
    show('邻桌的蜀客','邻桌客人拍了拍钱袋：“一路走来，这些钱压得肩膀疼。我们蜀地用过的铁钱更沉。交子轻巧，可出了门，也得看当地认不认。”');
    button('交子为什么方便？',()=>{show('蜀客说起交子','“做一笔大买卖，提着许多铁钱可不轻松。换成纸上的交子，带着省力。可它不是随手写个数就能用的，得有人认，有规矩可依。”');button('那这顿饭怎么付？',()=>{show('到一处，问一处','伙计接话：“客官，在我们这儿用铜钱结账就好。您的交子先收稳了，别让汤水湿了。”蜀客笑了笑，又从钱袋里数出铜钱。');button('收好钱袋，继续闲逛',close);});});
    button('汴京也能直接付交子吗？',()=>{show('一张纸，也要有人认','“不能把各地当成一样。交子的来历在蜀地，到了别处，先问行用的规矩。这顿饭，我还是付店家认的钱。”');button('再听听交子的来历',merchant);button('不打扰他用饭了',close);});
  }
  function leaveRoom(){close();window.dispatchEvent(new Event('sunyang-leave'));}
  function settle(){
    if(!bill){show('先用些酒食','伙计：“客官先落座点食，用完再结账，不急。”');button('去看看食单',close);return;}
    if(paid){show('这一席已经结清','伙计把账记好：“钱已收妥，客官慢慢坐，不再收第二回。”');button('吃完离开，回到长卷',leaveRoom);button('再坐一会儿',close);button('再听听邻桌聊天',merchant);return;}
    show('数钱结账',`伙计：“这一席共 ${bill} 文。您拿出 ${Math.ceil(bill/100)*100} 文，看看该找回多少？”`);
    const tender=Math.ceil(bill/100)*100,change=tender-bill;
    [...new Set([change,change+5,Math.max(0,change-5)])].sort(()=>.5-Math.random()).forEach(n=>button(`找回 ${n} 文`,()=>{
      if(n!==change){words.textContent=`“再数一遍吧：付出 ${tender} 文，饭钱 ${bill} 文。找零算对了，钱袋才不会少。”`;return;}
      if(purse<bill){words.textContent='钱袋不够了。这只是闲趣体验，可以重新入店再试，不影响主线。';return;}
      purse-=bill;paid=true;document.body.dataset.mealPaid='true';window.dispatchEvent(new Event('sunyang-paid'));refresh();show('账清了','铜钱一枚枚数清，伙计收下饭钱，把余钱交回你手里。“成了，客官慢用。”');button('吃完离开，回到长卷',leaveRoom);button('听邻桌说说交子',merchant);button('收好找零，继续歇脚',close);
    }));
  }
  function tea(){
    show('茶铺歇脚','王五：“走热了吧？花五文喝碗茶，歇歇脚再走。铜钱先数好，别落在桌缝里。”');
    button('付五文，喝碗茶',()=>{if(purse<5){words.textContent='钱袋里不够五文了，先歇歇脚吧。';return;}purse-=5;teaDone=true;refresh();show('茶钱收妥','王五收下五文，把热茶留在桌边：“这碗算您的。坐下歇歇脚，喝完再走。”');button('听听蜀客的趣事',merchant);button('收好钱袋去饮茶',()=>{close();window.HandscrollDialogueScene?.drinkTea();});});button('先听听交子的事',merchant);
  }
  function exchange(){
    if(!show('周六的蜀地旧事','沈照：“我也想试试把沉钱换成一张纸，究竟是怎么换的？”\n周六把账册合上：“汴京这儿不办这件事。不过，我给你讲一回在蜀地进兑铺的经历。你就当自己是那天的我，先把手里这包铁钱放稳。”'))return;
    button('走进故事里的蜀地兑铺',exchangeCounter);button('改日再听',close);
  }
  function exchangeCounter(){
    const holding=window.HandscrollWallet?.read().ticket;
    show('蜀地兑铺 · 体验小剧情',holding?'你收稳了交子，方才那包铁钱已经留在柜上。\n铺中伙计：“纸轻归轻，可别弄湿、弄破了。要兑回钱，也得按这里的规矩来。”':'你把故事中的一包铁钱放到柜上，木板闷闷一响。\n铺中伙计：“先数清这包钱，再给你相应的交子。你瞧，领的是等值的钱，不是白添一张纸。”');
    if(holding){button('拿交子兑回这包铁钱',()=>{if(!window.HandscrollWallet?.redeem())return;refresh();show('交子兑回铁钱','伙计核对收回的交子，把铁钱交还。你重新提起钱包，肩头又是一沉。\n这回亲手试过，你明白了周六说的“带着省力”。');button('回到汴河边',close);});button('收好交子，回到汴河边',close);}
    else button('交出铁钱，领等值交子',()=>{if(!window.HandscrollWallet?.exchange())return;exchangeDone=true;refresh();show('领到交子','伙计把纸张递过柜来。你接住，轻轻展平：刚才要用两手提的一包钱，如今能收进衣内。\n周六的声音从故事外传来：“明白了吧？但这只是讲给你试的一段蜀地经历，咱们汴京买茶吃饭，仍用你自己的铜钱。”');button('收好这张体验交子',close);button('再试试兑回',exchangeCounter);});
    modal.querySelector('small').textContent='虚构的蜀地兑换体验；使用独立剧情铁钱，不扣随身铜钱。整包与等值交子的简化操作不代表历史面额、费率或通行范围。';
  }
  function atTea(handler){const s=window.HandscrollDialogueScene?.read();if(!s?.ready||s.aboard)return;if(Math.abs(s.player.x-690)>160){location.hash='tea';return;}handler();}
  let teaTask,exchangeTask,mealTask;
  if(room){
    mealTask=button('酒楼一席 · 数钱结账',settle,actions);
    teaTask=button('茶铺歇脚',()=>location.href='index.html#tea',actions);
    exchangeTask=button('交子见闻 · 前往河岸',()=>location.href='index.html#bridge',actions);
    window.addEventListener('sunyang-meal',e=>{bill=e.detail.indices.reduce((sum,i)=>sum+prices[i],0);paid=false;document.body.dataset.mealPaid='false';refresh();});
    window.addEventListener('sunyang-checkout',e=>{if(e.detail?.leave&&paid){leaveRoom();return;}settle();});
    window.addEventListener('sunyang-reset',()=>{bill=0;paid=false;document.body.dataset.mealPaid='false';teaDone=false;exchangeDone=false;close();refresh();});
  }else{
    teaTask=button('茶铺歇脚 · 前往茶铺',()=>window.HandscrollActivities?.locate('tea'),actions);
    mealTask=button('酒楼一席 · 前往店门',()=>window.HandscrollDialogueScene?.visit(380),actions);
    exchangeTask=button('交子见闻 · 前往河岸',()=>window.HandscrollActivities?.locate('exchange'),actions);
    window.HandscrollActivities?.register('tea',tea);
    window.HandscrollActivities?.register('exchange',exchange);
  }
  ui.querySelector('.quest-toggle').addEventListener('click',e=>{const expanded=e.currentTarget.getAttribute('aria-expanded')==='true';e.currentTarget.setAttribute('aria-expanded',String(!expanded));ui.querySelector('.quest-content').hidden=expanded;ui.querySelector('.quest-toggle span').textContent=expanded?'＋':'−';});
  ui.querySelector('.quest-main').addEventListener('click',()=>{if(room){location.href='index.html#tea';return;}if(window.HandscrollMainQuest){window.HandscrollMainQuest.track();return;}document.querySelector('.story-npc')?.click();});
  function tick(){const s=window.HandscrollDialogueScene?.read(),q=window.HandscrollMainQuest?.read();ui.hidden=!room&&(!s?.ready||s.inAtlas);ui.classList.toggle('quest-muted',!modal.hidden||!!window.HandscrollDialogueScene?.locked);ui.querySelector('.quest-main').textContent=q?.title||'去茶铺找王五';ui.querySelector('.quest-objective').textContent=room?'回到茶铺，接着寻找张择端。':(q?.objective||'张择端没有赴约，先去茶铺打听。');for(const b of [teaTask,mealTask,exchangeTask])b.disabled=!!s?.aboard;requestAnimationFrame(tick);}
  requestAnimationFrame(tick);
  refresh();
})();
