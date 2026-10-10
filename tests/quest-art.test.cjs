const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'dist/src/quest-art.js'),'utf8'), context);
const art = context.window.HandscrollQuestArt;
assert.deepEqual(Object.keys(art).sort(), ['bundle','invoice','jiaozi']);
assert.ok(Object.isFrozen(art));
for (const entry of Object.values(art)) {
  assert.ok(entry.alt && Object.isFrozen(entry));
  const bytes = fs.readFileSync(path.join(root,'dist',entry.src));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
}
assert.equal(art.jiaozi.src,'assets/quest-jiaozi-v2.png');
for (const page of ['index.html','sunyang.html']) {
  assert.ok(fs.readFileSync(path.join(root,'dist',page),'utf8').includes('quest-art.js?v=2-approved'));
}
console.log('Approved prop registry, PNG assets and cache versions passed');
