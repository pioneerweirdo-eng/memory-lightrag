# Step B 安全加固记录（file_source 防伪造 + details 脱敏）

Date: 2026-03-25 14:18 UTC

## 1) 变更目标
1. 写入侧 `file_source` 强制由策略层生成，拒绝/忽略外部伪造输入。
2. `details/results` 脱敏门禁：不在 details 与日志输出候选内容，避免泄露过滤前结果。

## 2) 代码改动
- `src/adapter/lightrag.ts`
  - `insertText(...)` 改为策略参数入参（`domain/actorUserId/groupId/topic`）
  - 内部调用 `buildPolicyFileSource(...)` 生成 `file_source`
  - 外部 `userProvidedFileSource` 仅接受但完全忽略（防伪造）

- `src/index.ts`
  - `details` 中移除 `results`
  - 仅保留统计字段：`filteredDropped`、`resultCount`
  - 增加 `redaction: "details.results_omitted"`
  - 日志不再输出结果正文

## 3) 验证证据

### 3.1 TypeScript 校验
```bash
npx tsc -p /home/node/.openclaw/workspace/projects/memory-lightrag/tsconfig.json --noEmit
```
结果：通过（无输出）。

### 3.2 file_source 防伪造
执行（tsx one-shot）：group 域写入时伪造 `userProvidedFileSource='u__victim__evil'`。

返回：
```json
{"success":true,"fileSource":"g__demo_group__spoof"}
```
说明：最终写入 source 由策略层生成，伪造值未生效。

## 4) 结论
- 两项硬要求均已落地：
  - ✅ 写入侧 file_source 防伪造
  - ✅ details/results 脱敏门禁
