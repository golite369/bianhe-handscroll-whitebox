// Extract literal text only; never execute the browser/game modules.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const literal = text => vm.runInNewContext('(' + text + ')', {}, {timeout:100});
const main = read('dist/src/main-quest.js');
const tea = read('dist/src/dialogue.js').match(/const teaScript=(\[[\s\S]*?\]);/);
if (!tea) throw Error('Tea dialogue not found');
const sections = [['茶铺 · 王五',literal(tea[1])]];
const labels = {boat:'船上 · 赵三',stall:'桥头 · 搬货伙计',zhang:'摊棚 · 张择端',return:'归还 · 周六'};
for (const match of main.matchAll(/case '(boat|stall|zhang|return)':talk\((\[[\s\S]*?\])\s*,\(\)=>/g)) {
  sections.push([labels[match[1]], literal(match[2])]);
}
if (sections.length !== 5) throw Error('Expected all five main conversations');
const ending = main.match(/case 'complete':talk\((\[\[[\s\S]*?\]\])\)/);
if (!ending) throw Error('Ending dialogue not found');
sections.push(['完成后 · 张择端',literal(ending[1])]);
let text = '# 汴河寻踪 · 主线完整台词\n\n此文件由现有游戏脚本提取；内容与当前实现一致，不补造新情节。\n\n';
for (const [title,lines] of sections) {
  text += '## ' + title + '\n\n';
  for (const [speaker,words] of lines) text += speaker + '：' + words + '\n\n';
}
text += '调查分支与物品描述见 [main-quest.js](../dist/src/main-quest.js)，支线文字见 [SIDE-TEXT.md](SIDE-TEXT.md)。\n';
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
fs.writeFileSync(path.join(root,'docs/DIALOGUE.md'),text);
const quoted = "'(?:\\\\.|[^'\\\\])*'";
const pattern = new RegExp('(?:show|card)\\(('+quoted+'),('+quoted+')','g');
let side = '# 汴河寻踪 · 支线与调查文字\n\n从当前源码中的固定标题与文字提取。动态账单、持有交子前后文案及按钮选择仍见对应源文件；这里不是替代运行逻辑的剧本。\n\n';
for (const [title,file] of [['主线调查','dist/src/main-quest.js'],['市井闲趣','dist/src/market-experiences.js']]) {
  side += '## '+title+'\n\n';
  for (const match of read(file).matchAll(pattern)) {
    side += '### '+literal(match[1])+'\n\n'+literal(match[2])+'\n\n';
  }
  side += '[完整代码与选项](../'+file+')\n\n';
}
fs.writeFileSync(path.join(root,'docs/SIDE-TEXT.md'),side);
console.log('Main dialogue and fixed side/investigation text exported');
