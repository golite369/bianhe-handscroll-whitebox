# 道具图片内置记录

状态：用户于 2026-10-10 明确回复“确认内置进去”，批准以下三张图片进入游戏。

使用内置图像生成工具。参考风格：宋代市井长卷的细墨线、淡彩、暖纸色；单独道具，不生成整体 UI。

- invoice-v1.png：货单，全文为“货单／布二匹／纸一包／送至桥头摊棚／勿近水”。拟用于船上货单调查。
- bundle-v1.png：淡青布纸包、右上绳结、下垫木板。拟用于主线找到纸包时展示。
- jiaozi-v2.png：虚构游戏交子示意，上部市井兑铺图，保留“交子”和“游戏复原示意”。删除生成初稿中的不准确历史文字，下部栏位留白。不是史实真券的复刻。

生成提示：historical-scene，standalone quest object illustration，traditional fine ink and muted watercolor，complete silhouette，warm ivory background，no modern banknote elements，no game UI frame。

交子修正提示：保留纸形、上部人物与商铺、印章、边框、交子标题、游戏复原示意脚注；删除下半部所有自发生成的文字，不补造年份、法令、面额或通行范围。

兑换剧情：汴河边周六讲述旧事，玩家进入虚构的“蜀地兑铺”小剧情。独立的一包剧情铁钱可换等值体验交子，再兑回；不影响汴京铜钱余额，不宣称铜钱可在汴京普遍兑换交子，不使用未考证的历史固定汇率。

已批准内置到 dist/assets：quest-invoice-v1.png、quest-blue-bundle-v1.png、quest-jiaozi-v2.png。注册表为 dist/src/quest-art.js；分别在船上查看货单、找到青布纸包、领到交子及持有交子时再次进入兑铺的窗口展示。
