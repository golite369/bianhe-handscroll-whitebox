(() => {
  'use strict';
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const painter=Object.create(Inhabitants.prototype);let mesh;
  function renderer(){return painter;}
  function frame(texture,robe=false){
    const w=texture.width,h=texture.height,data=texture.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;
    const contacts=ScrollMovement.footContacts(data,w,h),seam=new Float32Array(h);
    let previous=(contacts[0].x+contacts[1].x)/2;
    for(let y=h-1;y>=0;y--){
      let first=-1,last=-1;for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>96){if(first<0)first=x;last=x;}
      let best=null,start=-1;
      for(let x=Math.max(0,first);x<=last;x++){
        if(data[(y*w+x)*4+3]<32){if(start<0)start=x;}
        else if(start>=0){const mid=(start+x)/2;if(x-start>=3&&(!best||Math.abs(mid-previous)<Math.abs(best-previous)))best=mid;start=-1;}
      }
      if(best!==null&&y>h*.6)previous=best;seam[y]=Math.max(.05,Math.min(.95,previous/w));
    }
    return {texture,robe,contacts,seam};
  }
  function draw(c,art,{height=252,distance=0,weight=0,facing=1,time=0,activity=null,hand=[.65,.45]}={}){
    const f={w:art.texture.width,h:art.texture.height},w=height*f.w/f.h,h=height;
    const contacts=art.contacts,bottom=Math.max(...contacts.map(p=>p.y));
    const center=((contacts[0].x+contacts[1].x)/(2*f.w)-.5)*w;
    const stride=art.robe?.15:.23;
    const gait=ScrollMovement.gaitAt(distance,h,weight,stride).reverse();
    const feet=contacts.map((contact,i)=>{const rest=(contact.x/f.w-.5)*w,p=gait[i];return {...p,x:rest+(center+p.x-rest)*weight,y:(contact.y-bottom)/f.h*h-p.lift};});
    const pose={phase:distance*.15,gaitWeight:weight,handX:0,handY:0,nod:0,lean:0,sway:0};
    if(activity){const p=ScrollMovement.activityAt(activity,time,0,6.8);pose.nod=p.nod*.28;pose.sway=Math.sin(time*.7)*h*.001;}
    const rig={w,h,f,contacts,feet,pose,hand,walking:weight>0,natural:1,stride,skeletal:weight>0};
    const hip=art.robe?.83:.60,cut=art.robe?.91:.60;
    const split=(contacts[0].x+contacts[1].x)/(2*f.w);
    const gesture=activity?ScrollMovement.activityAt(activity,time,0,6.8).gesture:0;
    const panels=weight>0?[
      {cols:[0,split/2,split],rows:[cut,(cut+1)/2,.975,1],leg:0},
      {cols:[split,(split+1)/2,1],rows:[cut,(cut+1)/2,.975,1],leg:1},
      {cols:Array.from({length:9},(_,i)=>i/8),rows:Array.from({length:15},(_,i)=>i*cut/14),cloth:art.robe}
    ]:[{cols:Array.from({length:13},(_,i)=>i/12),rows:Array.from({length:19},(_,i)=>i/18)}];
    c.save();c.scale(facing,1);c.imageSmoothingQuality='high';const r=renderer();
    if(!mesh&&Inhabitants.MeshRenderer)mesh=new Inhabitants.MeshRenderer();
    const gpu=!!mesh?.active,density=3,pw=Math.ceil((w+24)*density),ph=Math.ceil((h+16)*density);
    if(gpu)mesh.begin(pw,ph,density,w,h);
    for(const panel of panels){
      const pr={...rig,leg:panel.leg,cloth:panel.cloth};
      if(panel.leg!==undefined){
        const contact=contacts[panel.leg],cx=(contact.x/f.w-.5)*w,cy=(contact.y-bottom)/f.h*h-h*.035;
        const a=[center+(cx-center)*.25,(hip-bottom/f.h)*h],b=[cx,cy],len=Math.hypot(b[0]-a[0],b[1]-a[1])/2;
        const cycle=distance/(h*stride*2)*Math.PI*2,bob=-(1-Math.cos(cycle*2))*h*.004*weight;
        const knee=art.legKnees?[(art.legKnees[panel.leg]-.5)*w,(.77-bottom/f.h)*h]:[(a[0]+b[0])/2,(a[1]+b[1])/2];
        pr.skeleton={source:[a,knee,b],target:ScrollMovement.legJoints([a[0],a[1]+bob],[feet[panel.leg].x,feet[panel.leg].y-h*.035],len*1.005,len*1.005,1),hipY:a[1],ankleY:b[1],bottom};
      }
      const points=panel.rows.map(v=>panel.cols.map(originalU=>{
        let u=originalU;
        if(panel.leg!==undefined&&art.seam){
          const edge=art.seam[Math.min(f.h-1,Math.floor(v*f.h))];
          u=panel.leg===0?originalU/split*edge:edge+(originalU-split)/(1-split)*(1-edge);
        }
        let target=ScrollMovement.deform(u,v,pr);
        if(panel.leg!==undefined&&weight<1){const rest=[(u-.5)*w,(v-bottom/f.h)*h];target=target.map((n,i)=>rest[i]+(n-rest[i])*weight);}
        if(activity){
          // Rotate the painted hand, sleeve and held object together around the elbow.
          
          const elbow=[hand[0]-.10,hand[1]+.15],angle=-gesture*(activity==='eat'?.10:.065);
          const du=u-elbow[0],dv=v-elbow[1],influence=Math.exp(-(((u-hand[0])/.19)**2+((v-hand[1])/.18)**2))*smooth((v-.18)/.16);
          target[0]+=((du*Math.cos(angle)-dv*Math.sin(angle))-du)*w*influence;
          target[1]+=((du*Math.sin(angle)+dv*Math.cos(angle))-dv)*h*influence;
        }
        return {source:[u*f.w,v*f.h],target};
      }));
      if(gpu){mesh.draw(art.texture,points);continue;}
      for(let j=0;j<points.length-1;j++)for(let i=0;i<points[j].length-1;i++)r.cell(c,art.texture,points[j][i],points[j][i+1],points[j+1][i],points[j+1][i+1]);
    }
    if(gpu)c.drawImage(mesh.canvas,0,0,pw,ph,-w/2-12,-h-8,pw/density,ph/density);
    c.restore();
  }
  window.RoomMotion={frame,draw};
})();
