# diagnosing-bugs 来源与适配

- 上游：[mattpocock/skills](https://github.com/mattpocock/skills)
- 固定提交：`4ae2317ddb22b046e26455e4f9c9b3aaaf62212d`（2026-10-31）
- 原文件：[skills/engineering/diagnosing-bugs/SKILL.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/diagnosing-bugs/SKILL.md)
- 原 SKILL.md Git blob：`d039541ddd1c46e6ddbd662fe99d49b686fc5e12`
- 适配日期：2026-11-10
- 许可：保留 Matt Pocock 的 MIT 版权和许可声明，见 [LICENSE](LICENSE)。
- 调用元数据：`agents/openai.yaml` 与固定提交的对应文件一致。

## 本地差异

- 保留可捕获具体故障的反馈闭环、最小复现、可证伪假设、单变量验证与回归。
- 增加生产先止血、日志优先和操作留痕；不能复现时继续只读证据调查，显式标注未验证假设。
- 候选假设不固定数量；不强制 Bash、HITL 脚本或 git bisect，不自动操作当前工作区。
- 对齐所在项目已有的权限、变更与回滚流程，沿用任务状态来源。
