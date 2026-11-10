# 技能与规则模板索引

按 common（通用）、codex、claude 分类维护。各技能互不依赖，按需安装，安装时复制完整目录（含 references/、scripts/ 等子目录）。

## 共用技能：common/

| 技能 | 使用时机 | 调用方式 |
|---|---|---|
| [diagnosing-bugs](common/diagnosing-bugs/SKILL.md) | 故障、错误结果、测试失败、性能回退 | 自动发现或显式指定 |
| [code-review](common/code-review/SKILL.md) | 分支、PR、指定范围或未提交改动审查 | 自动发现或显式指定 |
| [handoff](common/handoff/SKILL.md) | 为新会话或代理整理交接上下文 | 仅显式调用 |
| [research](common/research/SKILL.md) | 用一手来源研究问题、核实资料或比较方案 | 自动发现或显式指定 |
| [skill-creator](common/skill-creator/SKILL.md) | 创建、更新、校验和打包技能 | 自动发现或显式指定 |

Matt Pocock 四项技能目录中：ORIGIN.md 记录来源与本地差异，LICENSE 为上游 MIT 声明，agents/openai.yaml 为上游调用元数据。逐项对比见 [适配说明](../docs/mattpocock-skills-adaptation.md)。

## Codex 分类：codex/

- [AGENTS.md](codex/AGENTS.md)：全局规则模板，按目标环境配置后使用（不是本仓库的生效规则）。
- [taskmaster](codex/taskmaster/SKILL.md)：任务执行协议，Batch 流程依赖 spawn_agents_on_csv。
- [todo-list-csv](codex/todo-list-csv/SKILL.md)：与 update_plan 同步的 CSV 任务清单，附 Python 脚本。

## Claude 分类：claude/

- [docs-to-book](claude/docs-to-book/SKILL.md)：离线项目手册技能，附 Node.js 模板和测试，使用说明见 [README](claude/docs-to-book/README.md)。方法和模板也可用于其他工具。

## 与现有工作流配合

- 已有 taskmaster 或其他计划文件时，引用其状态来源。
- superpowers 与 diagnosing-bugs、code-review 职责重叠，单次任务选一个主流程，避免重复门禁。
- 用户已明确指定技能或工作流时沿用其选择。
- 原版和适配版同名，安装时每个技能只保留一个来源。
