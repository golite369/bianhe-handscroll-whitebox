const assert=require('node:assert/strict');
const {paginate}=require('../dist/src/dialogue.js');
const measure=s=>Array.from(s).length*10;
const original='五哥，张先生今日来过吗？约好在这里碰面的，我瞧了一圈，也没见着他。';
for(const width of [60,140,260]){
  const pages=paginate(original,measure,width,3);
  assert.equal(pages.join('').replace(/\n/g,''),original);
  for(const page of pages){assert.ok(page.split('\n').length<=3);for(const line of page.split('\n'))assert.ok(measure(line)<=width);}
}
assert.deepEqual(paginate('',measure,100),[]);
assert.equal(paginate('甲乙\n丙丁',measure,100).join(''),'甲乙\n丙丁');
assert.equal(paginate('甲😀乙',measure,10,1).join(''),'甲😀乙');
console.log('Dialogue pagination checks passed.');
