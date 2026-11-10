#!/usr/bin/env node
/* Validate links, basic Mermaid syntax, HTML conventions, and emoji.
   Run node verify.js beside build.js in the output directory.*/
const fs = require('fs');
const path = require('path');
const book = require('./book.config.js');

const CONTENT = path.join(__dirname, 'content');
const slugs = new Set();
book.parts.forEach(p => p.pages.forEach(pg => slugs.add(pg.slug)));

let problems = [];
let mermaidCount = 0, linkCount = 0;

book.parts.forEach(part => part.pages.forEach(pg => {
  const f = path.join(CONTENT, pg.slug + '.html');
  if (!fs.existsSync(f)) { problems.push(`[缺失] ${pg.slug}.html`); return; }
  const html = fs.readFileSync(f, 'utf8');

  // 1) Internal HTML links must reference known page slugs.
  const hrefs = [...html.matchAll(/href="([^"]+\.html)(#[^"]*)?"/g)];
  hrefs.forEach(m => {
    linkCount++;
    const target = m[1].replace(/^.*\//, '').replace('.html', '');
    if (target !== 'index' && !slugs.has(target))
      problems.push(`[死链] ${pg.slug}.html → ${m[1]}`);
  });

  // 2) Check Mermaid brackets, node labels, and angle brackets.
  const blocks = [...html.matchAll(/<div class="mermaid">([\s\S]*?)<\/div>/g)];
  blocks.forEach((m, i) => {
    mermaidCount++;
    const code = m[1].trim();
    const open = (code.match(/\[/g) || []).length, close = (code.match(/\]/g) || []).length;
    if (open !== close) problems.push(`[mermaid] ${pg.slug}.html 图${i+1} 方括号不配对 [${open} ]${close}`);
    // Ignore valid <br/> line breaks before checking angle brackets.
    const codeNoBr = code.replace(/<br\s*\/?>/g, '');
    if (/\[[^\]]*[<>][^\]]*\]/.test(codeNoBr))
      problems.push(`[mermaid] ${pg.slug}.html 图${i+1} 节点文字疑含裸 < 或 >`);
    if (!/^(flowchart|graph|sequenceDiagram|stateDiagram|quadrantChart|timeline|gantt|pie|erDiagram|classDiagram|mindmap|journey|gitGraph|xychart-beta|sankey-beta|block-beta)/m.test(code))
      problems.push(`[mermaid] ${pg.slug}.html 图${i+1} 未识别图类型`);
  });

  // 3) Reject shell tags and non-home h1 elements.
  if (!pg.home && /<h1[\s>]/.test(html)) problems.push(`[HTML] ${pg.slug}.html 含 <h1>（应由外壳生成）`);
  if (/<(html|body|head)[\s>]/.test(html)) problems.push(`[HTML] ${pg.slug}.html 含 html/body/head`);
  // Every callout must contain a .body element.
  const calloutOpen = (html.match(/<div class="callout/g) || []).length;
  const bodyCount = (html.match(/<div class="callout[^"]*">\s*<div class="body">/g) || []).length;
  if (calloutOpen !== bodyCount) problems.push(`[组件] ${pg.slug}.html callout(${calloutOpen}) 与 body(${bodyCount}) 数量不匹配`);
  // Reject decorative emoji while retaining functional symbols.
  const KEEP = '✓✕✗★☆○●◆◇■□▪▫◐◑◯⌘↵←→↑↓↔§※•·—–';
  for (const ch of html) {
    const o = ch.codePointAt(0);
    if (KEEP.includes(ch)) continue;
    if ((o>=0x1F000&&o<=0x1FAFF)||(o>=0x2600&&o<=0x27BF)||(o>=0x2B00&&o<=0x2BFF)||o===0x2705||o===0x274C||o===0x26A0||o===0x2B50||o===0xFE0F) {
      problems.push(`[emoji] ${pg.slug}.html 残留 emoji: ${ch}`); break;
    }
  }
}));

// Check required styling and interaction assets.
['style.css', 'app.js'].forEach(f => {
  if (!fs.existsSync(path.join(__dirname, 'assets', f))) problems.push(`[资产] assets/${f} 缺失`);
});
if (mermaidCount > 0 && !fs.existsSync(path.join(__dirname, 'assets', 'mermaid.min.js')))
  problems.push(`[资产] 用了 ${mermaidCount} 张 mermaid 图但 assets/mermaid.min.js 缺失`);

console.log(`检查 ${slugs.size} 页 · ${linkCount} 个内部链接 · ${mermaidCount} 张 mermaid 图`);
if (problems.length) {
  console.log(`\n⚠ 发现 ${problems.length} 个问题：`); problems.forEach(p => console.log('  ' + p));
  process.exitCode = 1;   // Expose failures to callers and CI.
}
else console.log('✓ 未发现链接/mermaid/HTML/资产问题');
