const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const movement=require('../dist/src/movement.js');
let vertices=[];
function Inhabitants(){}
Inhabitants.prototype.cell=(_c,_t,...points)=>vertices.push(...points);
const sandbox={window:{},Inhabitants,ScrollMovement:movement};
vm.runInNewContext(fs.readFileSync(require.resolve('../dist/src/room-motion.js'),'utf8'),sandbox);
const c={save(){},restore(){},scale(){}};
for(const robe of [false,true])for(const weight of [0,.25,.5,1])for(let distance=0;distance<400;distance+=17){
  vertices=[];
  sandbox.window.RoomMotion.draw(c,{texture:{width:130,height:300},contacts:[{x:35,y:296},{x:95,y:300}],robe},{height:252,distance,weight});
  assert(vertices.length>0);
  for(const vertex of vertices){
    assert(vertex.target.every(Number.isFinite));
    assert(Math.abs(vertex.target[0])<160);
    assert(vertex.target[1]>-270&&vertex.target[1]<20);
    if(weight===0){assert(Math.abs(vertex.target[0]-(vertex.source[0]/130-.5)*252*130/300)<1e-8);}
  }
}
for(const activity of ['drink','eat'])for(let t=0;t<7;t+=.05){const p=movement.activityAt(activity,t);assert(p.gesture>=0&&p.gesture<=1);assert(Number.isFinite(p.handY));assert(Math.abs(p.nod)<.06);}
console.log('Room rigs: bounded joints, intact resting silhouettes and smooth activity envelopes passed.');
