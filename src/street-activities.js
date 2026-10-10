(function(root){
  'use strict';
  const places=[
    {id:'tea',actor:'wang',x:584,radius:135,title:'茶铺歇脚',call:'王五：哎，走热了没有？坐会儿，茶刚添的！'},
    {id:'exchange',actor:'zhou',x:2010,radius:130,title:'交子见闻',call:'周福：沈照，刚才没看够？来，我再给你讲讲这纸是怎么换来的。'}
  ];
  function nearPlaces(x){return places.filter(p=>Math.abs(p.x-x)<=p.radius);}
  if(typeof module==='object'&&module.exports){module.exports={places,nearPlaces};return;}
  if(document.getElementById('sceneWorld'))return;
  const layer=document.createElement('div');layer.id='streetActivityPlaces';layer.dataset.sideUi='true';document.body.append(layer);
  const handlers={},buttons=new Map(),entered=new Map();
  for(const p of places){const b=document.createElement('button');b.className='street-activity-trigger';b.hidden=true;b.addEventListener('click',()=>activate(p.id));layer.append(b);buttons.set(p.id,b);}
  function activate(id){const p=places.find(p=>p.id===id),s=root.HandscrollDialogueScene?.read(p?.actor);if(!p||!s?.ready||s.inAtlas||s.aboard||root.HandscrollDialogueScene.locked||Math.abs(s.player.x-s.npc.x)>p.radius)return false;handlers[id]?.();return !!handlers[id];}
  root.HandscrollActivities={register(id,fn){handlers[id]=fn;},locate(id){const p=places.find(p=>p.id===id);if(p)root.HandscrollDialogueScene?.visit(p.x-42);},interactNearby(){const s=root.HandscrollDialogueScene?.read();if(!s)return false;const p=nearPlaces(s.player.x).sort((a,b)=>Math.abs(a.x-s.player.x)-Math.abs(b.x-s.player.x))[0];return p?activate(p.id):false;}};
  function tick(now){
    for(const p of places){
      const s=root.HandscrollDialogueScene?.read(p.actor),b=buttons.get(p.id);
      const near=s?.ready&&!s.inAtlas&&!s.aboard&&Math.abs(s.player.x-s.npc.x)<=p.radius;
      if(near&&!entered.has(p.id))entered.set(p.id,now);
      if(!near)entered.delete(p.id);
      b.hidden=!near||root.HandscrollDialogueScene.locked||!handlers[p.id];
      if(!b.hidden){
        const calling=now-entered.get(p.id)<6500;
        b.textContent=calling?p.call:`${p.title} · 点击体验`;
        b.setAttribute('aria-label',`${p.title} · 就地互动`);
        const x=(s.npc.x-s.camera)*s.scale,y=(s.npc.y-s.npc.h-s.viewY)*s.scale;
        b.style.left=`${Math.max(16,Math.min(s.width-b.offsetWidth-16,x-b.offsetWidth/2))}px`;
        b.style.top=`${Math.max(65,Math.min(s.height-b.offsetHeight-95,y-b.offsetHeight-18))}px`;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})(typeof window!=='undefined'?window:globalThis);
