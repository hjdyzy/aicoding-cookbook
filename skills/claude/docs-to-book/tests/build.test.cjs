const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const vm = require('node:vm');

const TEMPLATES = path.resolve(__dirname, '../templates');
const PROCESS_TIMEOUT_MS = 10_000;
const TEMP_PREFIX = 'docs-to-book-test-';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), TEMP_PREFIX));
  t.after(() => {
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith(TEMP_PREFIX));
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(root, 'content'));
  fs.mkdirSync(path.join(root, 'assets'));
  for (const file of ['build.js', 'verify.js']) {
    fs.copyFileSync(path.join(TEMPLATES, file), path.join(root, file));
  }
  for (const file of ['style.css', 'app.js']) {
    fs.copyFileSync(path.join(TEMPLATES, file), path.join(root, 'assets', file));
  }
  const config = { title: 'Test book', subtitle: 'Guide', tagline: 'Offline', parts: [
    { label: 'Start', icon: '01', pages: [
      { slug: 'index', title: 'Home', home: true, lead: 'Start', time: 1 },
      { slug: 'overview', title: 'Overview', lead: 'Details', time: 2 },
    ] },
  ] };
  fs.writeFileSync(path.join(root, 'book.config.js'), 'module.exports = ' + JSON.stringify(config));
  fs.writeFileSync(path.join(root, 'content/index.html'), '<h1>Test book</h1><a href="pages/overview.html">Overview</a>');
  fs.writeFileSync(path.join(root, 'content/overview.html'), '<h2>Architecture</h2><p>Useful details</p>');
  return root;
}

function run(root, script = 'build.js') {
  const result = spawnSync(process.execPath, [script], {
    cwd: root, encoding: 'utf8', timeout: PROCESS_TIMEOUT_MS,
  });
  assert.ifError(result.error);
  return result;
}

function assertFailedBeforeOutput(root, expected) {
  const result = run(root);
  assert.equal(result.status, 1);
  const log = JSON.parse(result.stderr);
  assert.equal(log.result, 'failed');
  assert.match(log.errors.join('\n'), expected);
  for (const file of ['index.html', 'pages', 'assets/search-index.js']) {
    assert.equal(fs.existsSync(path.join(root, file)), false);
  }
}

test('builds linked pages and a searchable index repeatedly', (t) => {
  const root = fixture(t);
  const first = run(root);
  assert.equal(first.status, 0, first.stderr);
  assert.equal(JSON.parse(first.stdout).pages, 2);
  const output = fs.readFileSync(path.join(root, 'pages/overview.html'), 'utf8');
  assert.match(output, /href="\.\.\/index.html"/);
  assert.match(output, /<h2 id="s1">/);
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/search-index.js'), 'utf8'), context);
  assert.equal(context.window.__SEARCH_INDEX__.length, 2);
  assert.match(context.window.__SEARCH_INDEX__[1].text, /Useful details/);
  assert.equal(run(root, 'verify.js').status, 0);
  assert.equal(run(root).status, 0);
  assert.equal(fs.readFileSync(path.join(root, 'pages/overview.html'), 'utf8'), output);
});

for (const file of ['content/overview.html', 'assets/style.css', 'assets/app.js']) {
  test('fails before writing output when missing ' + file, (t) => {
    const root = fixture(t);
    fs.unlinkSync(path.join(root, file));
    assertFailedBeforeOutput(root, new RegExp(path.basename(file).replace('.', '\\.')));
  });
}

test('rejects empty content', (t) => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, 'content/overview.html'), ' \n');
  assertFailedBeforeOutput(root, /Required file empty/);
});

test('requires a local Mermaid library when diagrams exist', (t) => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, 'content/overview.html'), '<div class="mermaid">graph TD\n A-->B</div>');
  assertFailedBeforeOutput(root, /mermaid.min.js/);
});

test('rejects an empty configuration', (t) => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, 'book.config.js'), 'module.exports = {parts: []};');
  assertFailedBeforeOutput(root, /declares no pages/);
});

test('preserves previous output after failed preflight', (t) => {
  const root = fixture(t);
  assert.equal(run(root).status, 0);
  const output = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  fs.unlinkSync(path.join(root, 'content/overview.html'));
  assert.equal(run(root).status, 1);
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), output);
});

test('supports ESM hosts with a local CommonJS package boundary', (t) => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}');
  const site = path.join(root, 'site');
  fs.mkdirSync(site);
  for (const file of ['build.js', 'verify.js', 'book.config.js', 'content', 'assets']) {
    fs.renameSync(path.join(root, file), path.join(site, file));
  }
  fs.writeFileSync(path.join(site, 'package.json'), '{"private":true,"type":"commonjs"}');
  assert.equal(run(site).status, 0);
  assert.equal(run(site, 'verify.js').status, 0);
});

test('verification fails for unknown page links', (t) => {
  const root = fixture(t);
  fs.appendFileSync(path.join(root, 'content/overview.html'), '<a href="missing.html">Missing</a>');
  const result = run(root, 'verify.js');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /missing.html/);
});

test('Mermaid rendering exposes missing runtime and sync or async errors', async () => {
  const source = fs.readFileSync(path.join(TEMPLATES, 'app.js'), 'utf8');
  const start = source.indexOf('window.__renderMermaid = async function () {');
  const end = source.indexOf("  [].forEach.call(document.querySelectorAll('.mermaid')", start);
  assert.ok(start >= 0 && end > start);
  const context = {
    window: {}, root: { getAttribute: () => 'light' },
    document: { querySelectorAll: () => [{ dataset: {}, removeAttribute() {} }] },
  };
  vm.runInNewContext(source.slice(start, end), context);
  await assert.rejects(context.window.__renderMermaid(), /runtime is missing/);
  context.window.mermaid = { initialize() { throw new Error('initialize failed'); } };
  await assert.rejects(context.window.__renderMermaid(), /initialize failed/);
  context.window.mermaid = {
    initialize() {}, run: () => Promise.reject(new Error('render failed')),
  };
  await assert.rejects(context.window.__renderMermaid(), /render failed/);
});
