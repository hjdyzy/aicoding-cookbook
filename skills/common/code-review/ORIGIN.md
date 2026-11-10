# code-review 来源与适配

- 上游：[mattpocock/skills](https://github.com/mattpocock/skills)
- 固定提交：`4ae2317ddb22b046e26455e4f9c9b3aaaf62212d`（2026-10-31）
- 原文件：[skills/engineering/code-review/SKILL.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/code-review/SKILL.md)
- 原 SKILL.md Git blob：`83183e0ad36fd0eef25d37c7e483284b7e34c1f0`
- 适配日期：2026-11-10
- 许可：保留 Matt Pocock 的 MIT 版权和许可声明，见 [LICENSE](LICENSE)。
- 调用元数据：`agents/openai.yaml` 与固定提交的对应文件一致。

## 本地差异

- 保留规范和需求两条审查线、项目标准优先，以及作为判断依据而非硬性违规的代码异味。
- 增加暂存、未暂存与未跟踪文件范围，区分分支比较与用户明确指定的提交区间。
- 移除工单初始化技能的前置要求；需求可来自对话、本地规格或现有工单。
- 并行只读代理改为可选；按严重程度合并报告，同时保留每项审查维度和证据。
- 默认只读，不自动修复、提交或发布远程 PR 评论。
