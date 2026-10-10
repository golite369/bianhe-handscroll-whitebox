# 汴河寻踪 · 来源与修改记录

Runtime copied from https://github.com/xianxie6/qingming-riverside at commit 40c8d63adaf3254776f31250b719d3e8a4674c59, as explicitly requested for this user's experiment. Original author links, project license, and third-party license files are retained. This record does not grant reuse rights.

User-requested difference: removed the visit-counter UI and its network script. Scene, people masks, movement rigs, resident definitions, boat crews, interactive ferry, bridge crossing, Three.js water, controls and existing artwork are otherwise retained from that commit. No generated replacement images were added.

Previous independently implemented demo is recoverable from Git commit ade68749883dbba37f24c4fe53bf16dd36203265 and local ignored directory .sites-runtime/previous-v4-dist.

2026-10-09 visual cleanup requested by user: removed procedural street dog, handcart and its cargo baskets, foreground baskets, and carrier basket/pole overlays from scene.js. Former cart/carrier NPCs now use the existing normal walking renderer; other inhabitants, boats, boatmen, water and interactions remain unchanged. Loader cache versions updated. No replacement images generated.

2026-10-09: removed the entry-screen X and GitHub navigation icons as requested. Source provenance and license files are retained here and in the runtime.

2026-10-09: added an approved UI interaction slice: Wang Wu (王五), an existing fixed resident at x=584, speaks through a measured/paginated typewriter dialogue box. Added camera/input adapter without changing movement.js, inhabitants.js, population.js or street-life.js. Existing world animation continues during conversations. Evidence viewer displays only the sketch region of the user-approved UI board using CSS clipping; no new character or scene assets. This is the first interaction slice, not the complete 3–5 minute story.

2026-10-10: synced the current approved game runtime: main quest to find Zhang Zeduan, location-based tea and currency side activities, restaurant checkout and direct exit, A/D controls, focus lighting and room motion refinements. Three user-approved generated prop images (invoice, blue bundle and fictional jiaozi v2) are registered in dist/src/quest-art.js; earlier “No generated replacement images” describes the original snapshot only. The exchange is explicitly a fictional Shu-region story using independent iron-money props, not a claim of general jiaozi use in Bianjing.

2026-10-10: renamed the game, entry heading, page titles and README to 汴河寻踪. Source painting titles, attribution and license files remain unchanged. Existing website and GitHub repository URLs are preserved.
