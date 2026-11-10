# aicoding-cookbook

面向运维 / SRE 的 AI 编码技能库，适用于 Claude Code 和 Codex CLI。基于 [lili-luo/aicoding-cookbook](https://github.com/lili-luo/aicoding-cookbook) 整理，另有 4 项技能改编自 [mattpocock/skills](https://github.com/mattpocock/skills)。

## 技能一览

| 技能 | 适用工具 | 用途 |
|---|---|---|
| [diagnosing-bugs](skills/common/diagnosing-bugs/SKILL.md) | 通用 | 排查故障，靠日志和复现定位问题，生产环境先止血 |
| [code-review](skills/common/code-review/SKILL.md) | 通用 | 审查分支、PR 或未提交的改动 |
| [handoff](skills/common/handoff/SKILL.md) | 通用 | 给新会话整理交接文档（需手动调用） |
| [research](skills/common/research/SKILL.md) | 通用 | 查一手资料核实结论，并注明出处 |
| [skill-creator](skills/common/skill-creator/SKILL.md) | 通用 | 创建、校验、打包技能 |
| [taskmaster](skills/codex/taskmaster/SKILL.md) | Codex | 跟踪多步骤任务（SPEC / PROGRESS / CSV） |
| [todo-list-csv](skills/codex/todo-list-csv/SKILL.md) | Codex | 轻量 CSV 待办，和 update_plan 保持同步 |
| [docs-to-book](skills/claude/docs-to-book/SKILL.md) | Claude | 把文档或代码库整理成离线手册 |

另有 [`skills/codex/AGENTS.md`](skills/codex/AGENTS.md)：一份运维向的全局 Agent 规则模板。

## 安装

技能放在仓库里不会自动生效，需要把整个技能目录复制到工具的技能目录：

```bash
# Claude Code
cp -r skills/common/code-review ~/.claude/skills/
# Codex CLI
cp -r skills/common/code-review ~/.codex/skills/
```

如果已经装了 superpowers 等功能重叠的工作流，同一个任务只选一套主流程。

## 依赖

- Python 3：skill-creator、todo-list-csv 的脚本需要
- Node.js 22+：docs-to-book 的构建和测试需要

## 更多

- [各技能的来源与改动](docs/mattpocock-skills-adaptation.md)
- [上游 AGENT v2 规则对比](docs/AGENT-v2-comparison.md)

## 致谢

[lili-luo/aicoding-cookbook](https://github.com/lili-luo/aicoding-cookbook) ·
[mattpocock/skills](https://github.com/mattpocock/skills)（MIT） ·
[OpenAI Codex CLI](https://developers.openai.com/codex/cli)
