# 汴河寻踪 · 代码与开发

## 运行形式

静态 HTML / CSS / JavaScript 网站，使用 Canvas、局部 SVG 与本地 Three.js 水面模块。无后台、数据库或必须安装的外部游戏引擎。运行文件在 `dist/`，可用静态服务器托管。

## 模块

| 文件 | 职责 |
| --- | --- |
| dist/index.html、sunyang.html | 长卷与酒楼入口 |
| dist/src/atlas.js | 全景选景 |
| dist/src/dynamic-loader.js | 加载、交谈镜头与输入适配 |
| dist/src/scene.js、movement.js | 主场景与移动 |
| dist/src/inhabitants.js、street-life.js | NPC 与街市生活动作 |
| dist/src/water-three.js | 水面 |
| dist/src/dialogue.js | 王五对白、分页、逐字显示、画稿窗口 |
| dist/src/main-quest.js | 主线阶段、对白、调查分支与推进 |
| dist/src/street-activities.js | 地点检测、喊话 |
| dist/src/market-experiences.js | 茶铺、酒楼、蜀客与交子体验 |
| dist/src/market-wallet.js、quest-art.js | 钱袋和已确认的道具图 |
| dist/src/room-motion.js、sunyang-*.js | 室内动作与用餐 |
| dist/styles/、assets/、vendor/ | 样式、素材与本地第三方模块 |

## 测试

安装 Node.js 后，在根目录执行：

```sh
node tests/main-quest.test.cjs
node tests/dialogue.test.cjs
node tests/street-activities.test.cjs
node tests/keyboard-movement.test.cjs
node tests/quest-art.test.cjs
node tests/room-motion.test.cjs
```

覆盖推进、重复触发、分页、地点范围、兑换与钱袋恢复、按键、道具图及动作边界，不代替浏览器视觉与声音验收。

## 文档维护

`STORY.md` 记录骨架，`GAMEPLAY.md` 记录规则。执行 `node scripts/export-dialogue.cjs` 从脚本中的台词字面量生成 `docs/DIALOGUE.md`，不运行游戏。支线和调查全文以源码为准。

新图先确认再放入素材与注册表。上传代码、素材、文档、测试，不上传凭证、临时发布包、Git 内部文件或本机缓存。网站专属部署身份不复制进此仓库。许可文件在 `dist/LICENSE`、`dist/vendor/THREE-LICENSE.txt`。
