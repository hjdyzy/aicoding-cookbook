# aicoding-cookbook

运维工程师的 AI 编码工具库，收集了可复用的 AI 助手技能、运维导向的 Agent 规范和辅助脚本。定位不是应用或框架，而是一套围绕实际工作场景整理出来的 cookbook，用于配置工具、复用技能，以及标准化日常的 AI 辅助运维、脚本开发、自动化处理和少量项目改造流程。

## 适用对象

- 使用 Codex CLI、Claude Code 等 AI 编码工具的运维工程师 / SRE
- 日常工作涉及生产故障处理、安全漏洞修复、项目部署、日志排查、shell/Python 脚本编写、自动化处理的技术人员
- 需要编写操作文档、部署文档，或从 0 开发小工具、改造现有项目的个人或团队

## 仓库内容

### 1. Codex CLI 技能包

[`codex/`](./codex) 目录包含运维导向的 Agent 规范和 3 个可复用技能：

- [`AGENTS.md`](./codex/AGENTS.md)：全局 Agent 规则，涵盖故障处理、部署变更、安全响应、监控排查、脚本自动化等运维核心规范
- [`taskmaster`](./codex/taskmaster)：多步骤任务跟踪技能，带任务规格、进度日志和基于 CSV 的里程碑管理
- [`todo-list-csv`](./codex/todo-list-csv)：轻量级 CSV 任务跟踪技能，用于把待办文件和 agent 计划保持同步
- [`skill-creator`](./codex/skill-creator)：用于创建、校验和打包新技能的说明与脚本集合

### 2. Claude Code 资产（占位）

[`claude/`](./claude) 目录预留用于存放 Claude Code 的 CLAUDE.md、自定义 commands、skills 等配置资产，后续按需填充。

### 3. 辅助脚本与模板

- [`codex/todo-list-csv/scripts/todo_csv.py`](./codex/todo-list-csv/scripts/todo_csv.py)：Python CLI，用来创建和推进任务 CSV
- [`codex/skill-creator/scripts/init_skill.py`](./codex/skill-creator/scripts/init_skill.py)：从模板初始化一个新技能目录
- [`codex/skill-creator/scripts/package_skill.py`](./codex/skill-creator/scripts/package_skill.py)：先校验技能，再把技能目录打包成 zip
- [`codex/skill-creator/scripts/quick_validate.py`](./codex/skill-creator/scripts/quick_validate.py)：对技能 `SKILL.md` 的元数据做轻量校验
- [`codex/taskmaster/assets/`](./codex/taskmaster/assets)：可复用的 `SPEC.md`、`PROGRESS.md`、`TODO.csv` 模板

## 仓库结构

```text
aicoding-cookbook/
├── README.md
├── codex/
│   ├── AGENTS.md
│   ├── skill-creator/
│   │   ├── LICENSE.txt
│   │   ├── SKILL.md
│   │   └── scripts/
│   ├── taskmaster/
│   │   ├── SKILL.md
│   │   └── assets/
│   └── todo-list-csv/
│       ├── SKILL.md
│       └── scripts/
└── claude/
    └── README.md
```

## 如何使用

### 复用 Codex Skills

1. 浏览 [`codex/`](./codex) 下的各个技能目录
2. 阅读每个 `SKILL.md`，确认其触发条件和工作流
3. 优先直接使用随技能附带的脚本和模板

### 直接复用脚本

- `todo_csv.py`：CSV 任务推进
- `init_skill.py`：技能脚手架初始化
- `package_skill.py`：技能打包
- `quick_validate.py`：技能元数据快速校验

## 依赖与前提

- `codex/` 下的辅助脚本需要 Python 3
- 建议熟悉 Codex CLI 的基本用法（`~/.codex/config.toml`）

## 安全说明

- 不要把真实 API token、私钥或机器相关凭据提交进这个仓库

## 致谢

- [OpenAI Codex CLI](https://developers.openai.com/codex/cli)
