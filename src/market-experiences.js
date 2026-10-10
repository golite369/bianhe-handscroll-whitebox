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
  // Keep each spoken exchange short; preserve the existing typewriter and choices.
  function conversation(title,pages,done){
    let index=0;
    function page(){if(!show(title,pages[index]))return;if(index<pages.length-1)button('继续',()=>{index++;page();});else done?.();}
    page();
  }
  function close(){clearInterval(typeTimer);reveal=null;modal.hidden=true;if(ownsLock){ownsLock=false;window.HandscrollDialogueScene?.unlock();document.body.dataset.dialogueMode='explore';}previousFocus?.focus({preventScroll:true});}
  modal.querySelector('.market-close').addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(modal.hidden||e.target.closest?.('[data-sound-control]'))return;e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){const items=[...modal.querySelectorAll('button')],i=items.indexOf(document.activeElement);e.preventDefault();items[(i+(e.shiftKey?-1:1)+items.length)%items.length].focus();}},true);
  function merchant(){
    conversation('邻桌的蜀客',[
      '邻桌客人把钱袋放到桌下，揉了揉手指。\n\n蜀客：哎，总算能坐坐了。这钱袋拎了一路，手都勒麻了。\n沈照：怎么不系在腰上？',
      '蜀客：腰上还挂着东西呢。你要是在蜀地提过铁钱，就知道我这还算轻的。\n沈照：我刚听人说起交子。您用过吗？',
      '蜀客：用过。做买卖要带的钱多，换成交子，揣着方便。不然一手拎钱，一手拿货，连擦把汗都腾不出来。\n沈照：那您怎么还带这袋钱？',
      '蜀客：到了这里，总要吃饭、住店嘛。你看——小二，结账！\n小二：来喽。客官，铜钱放这里就好。',
      '蜀客：听见了吧？我说带着方便，也没说走到哪儿都能用。\n沈照：我还想着少带个钱袋呢。\n蜀客：该带还是得带。来，挪挪脚，我的钱滚到你那边去了。'
    ],()=>button('帮他拾起铜钱，继续歇脚',close));
  }
  function leaveRoom(){close();window.dispatchEvent(new Event('sunyang-leave'));}
  function settle(){
    if(!bill){show('先用些酒食','小二：食单在桌上，您慢慢挑。点好了叫我一声，我去灶上催催。');button('去看看食单',close);return;}
    if(paid){show('这一席已经结清','小二：这桌付过了，我记着呢。您是还要添点什么，还是这就走？');button('吃完离开，回到长卷',leaveRoom);button('再坐一会儿',close);button('再听听邻桌聊天',merchant);return;}
    show('数钱结账',`沈照：小二，结账。\n小二：哎，来了。这一席共 ${bill} 文。您给的是 ${Math.ceil(bill/100)*100} 文，稍等，我给您找钱。`);
    const tender=Math.ceil(bill/100)*100,change=tender-bill;
    [...new Set([change,change+5,Math.max(0,change-5)])].sort(()=>.5-Math.random()).forEach(n=>button(`找回 ${n} 文`,()=>{
      if(n!==change){words.textContent=`小二：不对，您再瞧瞧。给了 ${tender} 文，扣去 ${bill} 文，剩下的才是找您的。`;return;}
      if(purse<bill){words.textContent='沈照：钱没带够……我再摸摸袖子。\n小二：您先别急，慢慢找。\n\n钱袋不足，暂不能结账。';return;}
      purse-=bill;paid=true;document.body.dataset.mealPaid='true';window.dispatchEvent(new Event('sunyang-paid'));refresh();show('账清了',`小二：对，${change} 文。您点点，收好。`);button('吃完离开，回到长卷',leaveRoom);button('听邻桌说说交子',merchant);button('收好找零，继续歇脚',close);
    }));
  }
  function tea(){
    show('茶铺歇脚','沈照：五哥，来碗茶。我这一路走得口都干了。\n王五：得嘞，五文。坐里边，那张桌子不晒。');
    button('付五文，喝碗茶',()=>{
      if(purse<5){words.textContent='王五：少了些？你再摸摸袖子。没有也不急，先坐着歇口气。';return;}
      purse-=5;teaDone=true;refresh();show('茶钱收妥','王五：够了，够了。这碗你的。慢些喝，刚倒的，还烫。');
      button('问问有什么可吃的',()=>{show('茶铺闲话','沈照：您这儿有什么可吃的？\n王五：眼下先喝茶。饿了去前头酒楼，我这儿可不能拿茶水哄你一顿饭。');button('收好钱袋去饮茶',()=>{close();window.HandscrollDialogueScene?.drinkTea();});});
      button('听听蜀客的趣事',merchant);button('收好钱袋去饮茶',()=>{close();window.HandscrollDialogueScene?.drinkTea();});
    });button('先听听交子的事',merchant);
  }
  function exchange(){
    if(!show('周福的蜀地旧事','沈照：您说得轻巧，我还是想试试。真把一包钱放下，只带一张纸走？\n周福：我头一回也这么问。那天提着铁钱进铺子，走到柜前，手指都松不开。来，你就当自己是那天的我——先把钱放下。'))return;
    button('走进故事里的蜀地兑铺',exchangeCounter);button('改日再听',close);
  }
  function exchangeCounter(){
    const holding=window.HandscrollWallet?.read().ticket;
    show('蜀地兑铺 · 体验小剧情',holding?'你折好交子，收进袖袋。\n\n沈照：我想再试试，把钱兑回来。\n铺中伙计：把交子给我，我查验一下。':'蜀地兑铺，周福的回忆。\n\n铺中伙计：哎，搁柜上吧。一路提来的？手都红了。\n沈照：我想换成交子。\n铺中伙计：好。等我把钱数过，你先松松手。');
    function returnToRiver(){conversation('回到汴河边',[
      '周福：怎么样？我那时舍不得放下，提回来又嫌累。来来回回，自己都觉得好笑。\n沈照：这回知道了。可今天吃饭那袋铜钱，我还是得带着。',
      '周福：要得。你没把两边的事弄混就好。走，站这儿说了半晌，挡着人家卸货了。'
    ],()=>button('收好钱袋，继续逛街',close));}
    if(holding){button('拿交子兑回这包铁钱',()=>{if(!window.HandscrollWallet?.redeem())return;refresh();conversation('交子兑回铁钱',[
      '铺中伙计：好，钱在这里，你点过再提。\n\n你重新提起钱袋。\n沈照：唔……还是这么沉。',
      '铺中伙计：钱又没少，自然还是那个分量。提好了，别磕着柜角。'
    ],()=>button('回到汴河边',returnToRiver));});button('收好交子，回到汴河边',returnToRiver);}
    else button('交出铁钱，领等值交子',()=>{if(!window.HandscrollWallet?.exchange())return;exchangeDone=true;refresh();conversation('领到交子',[
      '铺中伙计：数好了。这张交子给你，接稳。\n\n你接过交子，轻轻展平。',
      '沈照：这就行了？刚才还得两只手提，现在一个袖袋就装得下。\n铺中伙计：是轻些。可别跟湿衣裳放一处，折好再收。',
      '周福的声音：我那天也是，接过来还掂了掂。空着手出门，倒有点不习惯。'
    ],()=>{button('收好交子，回到汴河边',returnToRiver);button('再试试兑回',exchangeCounter);});});
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
