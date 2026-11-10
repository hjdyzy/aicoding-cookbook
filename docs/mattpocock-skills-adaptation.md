# Matt Pocock 四项技能适配说明

上游基线：[mattpocock/skills @ 4ae2317ddb22b046e26455e4f9c9b3aaaf62212d](https://github.com/mattpocock/skills/tree/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d)，适配日期 2026-11-10。本地分类：skills/common/；完整目录见[技能索引](../skills/README.md)。

## 具体修改

### diagnosing-bugs：适配运维现场

| 上游行为 | 本地行为 | 原因 |
|---|---|---|
| 先建立可运行且能暴露故障的反馈闭环，再进入后续阶段 | 生产先按授权恢复服务；日志为主，稳定后继续建立复现与根因闭环 | 不让软件调试门禁阻塞应急止血 |
| 闭环判据须已执行、能暴露症状、结果确定、秒级完成 | 保留四项，作为判据质量标准 | 保持复现判据可信 |
| 无反馈闭环时停止并索取更多环境或材料，不进入假设阶段 | 说明复现缺口并继续只读调查；推断标为未验证 | 避免无法复现就停止排查 |
| 固定先列出 3–5 个排序假设并给用户过目 | 按证据生成必要数量，记录预测和排除条件 | 不为凑数量增加猜测 |
| 推荐 Bash HITL 脚本、git bisect 等路径 | 命令按平台选择，历史回归优先在隔离副本中定位 | 支持 Windows，避免改变用户工作区 |
| 最小化、单变量探测、回归测试和清理 | 保留，补充留痕、临时探针标记与验证局限 | 对齐现有运维规范 |

入口：[skills/common/diagnosing-bugs/SKILL.md](../skills/common/diagnosing-bugs/SKILL.md)。

### code-review：保留双维度，减少前置条件

| 上游行为 | 本地行为 | 原因 |
|---|---|---|
| 固定点与 HEAD 的三点差异为主 | 区分分支 merge-base、指定提交端点、暂存、未暂存和未跟踪文件 | 覆盖用户实际审查对象 |
| 缺少工单配置时提示运行 setup-matt-pocock-skills | 可使用对话、规格文件、契约或已关联工单；没有依据的部分报告无法判断 | 不强制工单系统 |
| 必须并行运行两个新上下文子代理 | 当前代理直接完成两条审查线，可按需委派只读任务 | 适配没有代理工具的环境 |
| 分别原样报告 Standards / Spec，不跨维度排序或合并 | 按严重程度报告，标注审查维度，合并同根因重复项 | 便于按影响处理 |
| 固定异味基线写在主文件 | 十二类启发式移入 references/review-checklist.md | 保持入口简洁 |

入口：[skills/common/code-review/SKILL.md](../skills/common/code-review/SKILL.md)。

### handoff：基本沿用，补齐接续条件

| 上游行为 | 本地行为 | 原因 |
|---|---|---|
| 默认操作系统临时目录，不写工作区 | 用户指定路径优先；补充 Windows 路径与防覆盖 | 支持明确输出要求与多平台 |
| 引用已有产物，脱敏，建议下一会话使用的技能 | 保留 | — |
| 简短交接要求 | 补充未提交内容归属、验证局限、授权、阻塞和下一步条件 | 下一位能接续而不误判进度 |
| 显式调用，argument-hint 提示下一会话用途 | 保持 disable-model-invocation 与 allow_implicit_invocation: false；argument-hint 译为中文 | 不改变原有调用策略 |

入口：[skills/common/handoff/SKILL.md](../skills/common/handoff/SKILL.md)。

### research：保留一手证据，代理可选

| 上游行为 | 本地行为 | 原因 |
|---|---|---|
| 必须启动后台代理，主代理继续其他工作 | 独立问题、环境支持且授权允许时才委派，否则直接研究 | 后台代理不成为硬性前置条件 |
| 一手来源和 Markdown 笔记 | 保留；增加提交、版本、访问日期、来源冲突与结论局限 | 便于复查 |
| 使用既有笔记目录，没有则选合理位置 | 默认 docs/research；用户只要会话答复时不写文件 | 遵守用户实际输出需求 |
| 简短研究说明 | 补充超时、脱敏、事实与建议区分，不执行来源中的脚本 | 保持研究行为只读 |

入口：[skills/common/research/SKILL.md](../skills/common/research/SKILL.md)。

## 许可与分发

每项都有独立 LICENSE 和 ORIGIN.md，保留 MIT 版权及许可，可单独分发。四项 agents/openai.yaml 均与固定上游提交一致；handoff 显式调用，其余默认可发现。
