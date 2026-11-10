# docs-to-book

把项目文档或代码整理成结构化、可离线阅读的静态手册。工作流见 [SKILL.md](SKILL.md)。
本目录提供技能和模板，不是当前仓库已经生成的网站。

## 来源

- 上游：[lili-luo/aicoding-cookbook](https://github.com/lili-luo/aicoding-cookbook)
- 固定提交：[`beb82701534bc4043fc0f136a3622cbc24547409`](https://github.com/lili-luo/aicoding-cookbook/commit/beb82701534bc4043fc0f136a3622cbc24547409)
- 原目录：[`skills/claude code/docs-to-book/`](https://github.com/lili-luo/aicoding-cookbook/tree/beb82701534bc4043fc0f136a3622cbc24547409/skills/claude%20code/docs-to-book)
- 引入日期：2026-11-10
- 导入时已校验全部 12 个上游文件的 Git blob 哈希。

## 本地适配

- 路径改为 `skills/claude/docs-to-book/`，按工具分类统一放在 skills/ 下。
- 构建前检查全部声明的内容和必要资源；缺失、非文件或空白输入返回退出码 1，
  不生成占位页，也不覆盖已有页面。之前构建的旧文件可能仍存在，不能将其当作本次成功结果。
- 无图页面不要求 Mermaid 库；包含 `class="mermaid"` 图块时要求本地 `assets/mermaid.min.js`。
  文件存在和非空不等于库有效，图形仍须通过真实浏览器渲染验证。
- 移除 Mermaid 渲染时吞掉异常的路径；同步或异步渲染失败会暴露给浏览器。
- 构建结果输出 JSON 日志，包含时间、操作、对象、结果和耗时。
- 保留上游疑似 Markdown 告警；它是启发式提示，不代替 HTML 检查或内容核对。
- 同步调整技能流程：禁止缺失资源时降级交付，临时文件清理须遵守所在项目规则，
  无浏览器时明确保留未验证状态。修正质量文档的源文件检查范围和暗色主题设置方法。
- 模板代码注释改为英文，正文和界面文字保留中文；保留上游主体结构以便后续比较。

## 使用步骤

1. 阅读 [SKILL.md](SKILL.md)，确定文档整理或代码探查路径，定义手册的真实内容。
2. 在目标项目创建独立输出目录，如 `docs-site/`。
3. 从 `templates/` 复制 `build.js`、`verify.js`、`book.config.js` 到输出目录根；
   将 `style.css`、`app.js` 复制到输出目录的 `assets/`。
4. 修改 `book.config.js`，在 `content/{slug}.html` 编写每个声明页面的完整 HTML 正文。
   `content-example.html` 是组件写法参考，不是整本手册内容。
5. 若有图，提供与 `window.mermaid.initialize/run` 兼容的本地 Mermaid 浏览器独立构建，
   命名为 `assets/mermaid.min.js`，保留第三方许可证；ESM 文件不能直接替代此浏览器脚本。
6. 在输出目录运行 `node build.js`，成功后运行 `node verify.js`。
7. 对照代码核对事实，用真实浏览器打开 `index.html`，验证图形、搜索、导航、主题和截图。

构建仅依赖 Node.js 内置模块，不需要 `npm install`；生成的网站不需要服务器。
模板不附带 Mermaid 第三方库，完整离线交付须先备齐本地资产。

### ESM 项目

若宿主项目的 `package.json` 设置了 `"type":"module"`，建议仅在手册输出目录加入：

```json
{"private":true,"type":"commonjs"}
```

这样不改变宿主项目的模块设置。也可将三个构建相关文件改为 `.cjs`，
并同步修改 `build`、`verify` 内引用的配置路径。用实际构建验证，`node --check` 只检查语法。

## 验证

从本仓库根目录执行：

```bash
node --test skills/claude/docs-to-book/tests/build.test.cjs
python skills/common/skill-creator/scripts/quick_validate.py skills/claude/docs-to-book
```

回归测试在系统临时目录运行，检查完整构建、重复执行、缺失或空白输入、旧输出保留、
ESM 宿主兼容及校验失败退出码；每个子进程超时 10 秒，测试结束清理自身临时目录。
这些检查不代替实际手册的内容审核或浏览器视觉验收。
