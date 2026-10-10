const assert=require('node:assert/strict');
const {createQuest,stages}=require('../dist/src/main-quest.js');
const q=createQuest();
assert.equal(q.stage,'tea');
assert.equal(q.advance('return'),false,'Cannot skip prerequisites');
for(let i=0;i<stages.length-1;i++){
  assert.equal(q.advance(stages[i]),true);
  assert.equal(q.stage,stages[i+1]);
  assert.equal(q.advance(stages[i]),false,'Duplicate completion must be ignored');
}
assert.equal(q.advance('complete'),false);
assert.equal(createQuest().stage,'tea','Fresh game starts independently');
console.log('Main quest sequence and duplicate guards passed');
assert.equal(createQuest('search').stage,'search','Restore progress across restaurant visits');
assert.equal(createQuest('corrupt').stage,'tea','Invalid stored progress is safe');
let savedStage;const restored=createQuest('zhang',value=>savedStage=value);
restored.advance('zhang');assert.equal(savedStage,'return');
