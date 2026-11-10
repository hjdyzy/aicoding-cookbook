#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   build.js compiles content/<slug>.html into a static multipage site.
   Run node build.js from the output directory.
   Inputs: book.config.js and content/<slug>.html fragments.
   Outputs: index.html, pages/*.html, and assets/search-index.js.
   ══════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'content');
const PAGES = path.join(ROOT, 'pages');
const ASSETS = path.join(ROOT, 'assets');
const book = require('./book.config.js');
const startedAt = Date.now();

// Flatten pages with their part metadata and global position.
const flat = [];
book.parts.forEach((part) => {
  part.pages.forEach((pg) => {
    flat.push({ ...pg, part, partLabel: part.label, partIcon: part.icon });
  });
});
flat.forEach((p, i) => {
  p.n = i;
  p.url = p.home ? 'index.html' : 'pages/' + p.slug + '.html';
});

// Validate all required inputs before writing any generated output.
function readRequiredFile(file, problems) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    problems.push(`Required file missing: ${path.relative(ROOT, file)}`);
    return '';
  }
  const content = fs.readFileSync(file, 'utf8');
  if (!content.trim()) problems.push(`Required file empty: ${path.relative(ROOT, file)}`);
  return content;
}

function validateInputs() {
  const problems = [];
  const fragments = new Map();
  if (!flat.length) problems.push('book.config.js declares no pages');
  flat.forEach((p) => {
    fragments.set(p.slug, readRequiredFile(path.join(CONTENT, p.slug + '.html'), problems));
  });
  const assets = ['style.css', 'app.js'];
  if ([...fragments.values()].some((html) => /class="mermaid"/.test(html))) {
    assets.push('mermaid.min.js');
  }
  assets.forEach((file) => readRequiredFile(path.join(ASSETS, file), problems));
  if (problems.length) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(), operation: 'build', target: ROOT,
      result: 'failed', duration_ms: Date.now() - startedAt, errors: problems,
    }));
    process.exit(1);
  }
  return fragments;
}

const fragments = validateInputs();
fs.mkdirSync(PAGES, { recursive: true });

// Compute a relative link from fromUrl to toUrl.
function rel(fromUrl, toUrl) {
  const fromDir = path.posix.dirname(fromUrl);
  let r = path.posix.relative(fromDir, toUrl);
  return r || path.posix.basename(toUrl);
}
// Asset prefix for the root home page and nested pages.
function base(p) { return p.home ? '' : '../'; }

// Assign heading IDs and collect TOC entries.
function processHeadings(html) {
  const toc = [];
  let n = 0;
  const out = html.replace(/<(h2|h3)(\s[^>]*)?>([\s\S]*?)<\/\1>/g, (m, tag, attrs, inner) => {
    attrs = attrs || '';
    let id;
    const idMatch = attrs.match(/id="([^"]+)"/);
    if (idMatch) { id = idMatch[1]; }
    else { id = 's' + (++n); attrs += ` id="${id}"`; }
    const text = inner.replace(/<[^>]+>/g, '').trim();
    toc.push({ level: tag === 'h2' ? 2 : 3, id, text });
    return `<${tag}${attrs}><a class="anchor" href="#${id}" aria-hidden="true"></a>${inner}</${tag}>`;
  });
  return { html: out, toc };
}

// Extract plain text for search.
function plain(html) {
  return html.replace(/<(script|style|pre)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2400);
}

// ── Sidebar HTML ──────────────────────────────────────────────────
function sidebar(curr) {
  const b = base(curr);
  let html = `<div class="brand"><a href="${b}index.html">
    <span class="logo"><span class="mark">LOGO</span>${book.title}</span>
    <span class="sub">${book.subtitle} · ${book.tagline}</span>
  </a></div><nav class="nav">`;
  book.parts.forEach((part) => {
    html += `<div class="part"><div class="part-label"><span class="pn">${part.icon}</span>${part.label}</div>`;
    part.pages.forEach((pg) => {
      const target = flat.find((f) => f.slug === pg.slug);
      const href = rel(curr.url, target.url);
      const active = pg.slug === curr.slug ? ' class="active"' : '';
      const idx = (target.n).toString().padStart(2, '0');
      html += `<a href="${href}"${active}><span class="idx">${idx}</span><span>${pg.title}</span></a>`;
    });
    html += `</div>`;
  });
  html += `</nav>`;
  // Show version and repository metadata in the colophon.
  const colophon = [book.version, book.repo].filter(Boolean).join(' · ');
  if (colophon) html += `<div class="colophon">${colophon}</div>`;
  return html;
}

// ── TOC HTML ──────────────────────────────────────────────────────
function tocHtml(toc) {
  if (toc.length < 2) return '';
  let items = toc.map((t) =>
    `<li class="h${t.level}"><a href="#${t.id}">${t.text}</a></li>`).join('');
  return `<aside class="toc"><div class="toc-title">本页目录</div><ul>${items}</ul></aside>`;
}

// ── Page header ──────────────────────────────────────────────────────────
function pageHead(p) {
  const srcLine = p.src && p.src.length
    ? `<span class="src" title="原始文档来源">源自 ${p.src.join(' · ')}</span>` : '';
  const tag = p.partIcon === '◆'
    ? `<span class="part-tag">${p.partLabel}</span>`
    : `<span class="part-tag"><span class="pn">${p.partIcon}</span> ${p.partLabel}</span>`;
  return `<header class="page-head">
    ${tag}
    <h1>${p.title}</h1>
    <p class="lead">${p.lead}</p>
    <div class="meta">
      <span><span class="lbl">阅读约</span> ${p.time} 分钟</span>
      <span><span class="lbl">第</span> ${p.n + 1} / ${flat.length} 篇</span>
      ${srcLine}
    </div>
  </header>`;
}

// ── Pagination ────────────────────────────────────────────────────────
function pager(p) {
  const prev = p.n > 0 ? flat[p.n - 1] : null;
  const next = p.n < flat.length - 1 ? flat[p.n + 1] : null;
  const prevA = prev
    ? `<a class="prev" href="${rel(p.url, prev.url)}"><span class="dir">← 上一篇</span><span class="ttl">${prev.title}</span></a>`
    : `<a class="prev disabled"></a>`;
  const nextA = next
    ? `<a class="next" href="${rel(p.url, next.url)}"><span class="dir">下一篇 →</span><span class="ttl">${next.title}</span></a>`
    : `<a class="next disabled"></a>`;
  return `<nav class="pager">${prevA}${nextA}</nav>`;
}

// ── Breadcrumbs ────────────────────────────────────────────────────────
function crumbs(p) {
  return `<b>${p.partLabel}</b> &nbsp;/&nbsp; ${p.title}`;
}

// ── Complete HTML shell ────────────────────────────────────────────────
function shell(p, bodyHtml, toc) {
  const b = base(p);
  const indexHref = p.home ? 'index.html' : '../index.html';
  const needMermaid = /class="mermaid"/.test(bodyHtml);
  const mermaidTag = needMermaid
    ? `<script src="${b}assets/mermaid.min.js"></script>`
    : '';
  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title} · ${book.title}</title>
<meta name="description" content="${(p.lead || '').replace(/"/g, '')}">
<link rel="stylesheet" href="${b}assets/style.css">
<script>window.__BASE__='${b}';</script>
</head>
<body>
<div class="scrim"></div>
<div class="layout">
  <aside class="sidebar">${sidebar(p)}</aside>
  <script>
  /* Restore sidebar scroll position before painting.*/
  (function(){try{
    var sb=document.querySelector('.sidebar');if(!sb)return;
    var saved=sessionStorage.getItem('docsbook-nav-scroll');
    var act=sb.querySelector('.nav a.active');
    function inView(){if(!act)return true;var r=act.getBoundingClientRect(),s=sb.getBoundingClientRect();
      return r.top>=s.top&&r.bottom<=s.bottom;}
    function center(){if(!act)return;var r=act.getBoundingClientRect(),s=sb.getBoundingClientRect();
      sb.scrollTop+=(r.top-s.top)-(sb.clientHeight/2)+(r.height/2);}
    if(saved!==null){sb.scrollTop=parseInt(saved,10)||0;if(!inView())center();}
    else if(act&&!inView())center();
  }catch(e){}})();
  </script>
  <div class="main">
    <header class="topbar">
      <button class="icon-btn menu-btn" id="menuBtn" aria-label="菜单">≡</button>
      <div class="crumbs">${crumbs(p)}</div>
      <button class="search-trigger" data-search-open>
        <span>搜索手册</span><span class="k">⌘K</span>
      </button>
      <button class="icon-btn" id="themeBtn" aria-label="切换主题" title="切换深浅色 (t)">◐</button>
      <div class="progress" aria-hidden="true"><i id="progressBar"></i></div>
    </header>
    <div class="content-wrap">
      <article class="article fade">
        ${bodyHtml}
        ${pager(p)}
      </article>
      ${toc}
    </div>
  </div>
</div>

<div class="search-mask"></div>
<div class="search-box">
  <input id="searchInput" type="text" placeholder="搜索页面、概念、术语…" autocomplete="off" spellcheck="false">
  <div class="search-results"></div>
  <div class="search-hint"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>↵</kbd> 打开</span><span><kbd>esc</kbd> 关闭</span></div>
</div>

<script src="${b}assets/search-index.js"></script>
${mermaidTag}
<script src="${b}assets/app.js"></script>
</body>
</html>`;
}

// ══════════════════════════════════════════════════════════════════
//  Main build
// ══════════════════════════════════════════════════════════════════
const searchIndex = [];
let built = 0;

flat.forEach((p) => {
  const frag = fragments.get(p.slug);

  // ── Detect Markdown syntax inside HTML fragments. ─────────────────────
  // content/*.html must contain HTML; this builder does not convert Markdown.
  // Warn about syntax that would otherwise render as literal text.
  const mdWarnings = [];
  const fragLines = frag.split('\n');
  fragLines.forEach((line, i) => {
    const ln = i + 1;
    if (/^## /.test(line)) mdWarnings.push(`  L${ln}: Markdown h2 "## …" → 应改为 <h2>…</h2>`);
    if (/^### /.test(line)) mdWarnings.push(`  L${ln}: Markdown h3 "### …" → 应改为 <h3>…</h3>`);
    if (/^\|.*\|.*\|/.test(line) && !/<(thead|tbody|tr|th|td)/i.test(line))
      mdWarnings.push(`  L${ln}: Markdown 表格 "|…|" → 应改为 <table> 标签`);
    if (/^- /.test(line) && !/<li>/i.test(line))
      mdWarnings.push(`  L${ln}: Markdown 列表 "- …" → 应改为 <ul><li>…</li></ul>`);
  });
  if (mdWarnings.length) {
    console.warn(`\n⚠ ${p.slug}.html 疑似含 Markdown 语法（将原样显示为裸文本）：`);
    mdWarnings.forEach(w => console.warn(w));
  }

  const { html: withIds, toc } = processHeadings(frag);
  const head = p.home ? '' : pageHead(p);   // Home fragments provide their own hero.
  const fullBody = (head ? head + '\n' : '') + withIds;
  const outHtml = shell(p, fullBody, tocHtml(toc));

  const outPath = p.home ? path.join(ROOT, 'index.html') : path.join(PAGES, p.slug + '.html');
  fs.writeFileSync(outPath, outHtml, 'utf8');
  built++;

  searchIndex.push({
    url: p.url, title: p.title, part: p.partLabel,
    lead: p.lead || '', text: plain(frag),
  });
});

// Write the search index.
fs.writeFileSync(
  path.join(ROOT, 'assets', 'search-index.js'),
  'window.__SEARCH_INDEX__=' + JSON.stringify(searchIndex) + ';',
  'utf8'
);

console.log(JSON.stringify({
  timestamp: new Date().toISOString(), operation: 'build', target: ROOT,
  result: 'success', duration_ms: Date.now() - startedAt, pages: built,
}));
