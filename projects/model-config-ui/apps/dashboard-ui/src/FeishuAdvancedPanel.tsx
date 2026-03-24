import React, { useEffect, useMemo, useState } from "react";
import get from "lodash/get";
import { useConfigStore } from "./store/configStore";

function safeStringify(v: any) {
  try {
    return JSON.stringify(v ?? null, null, 2);
  } catch {
    return "null";
  }
}

export function JsonPathEditor({
  title,
  path,
  placeholder,
  help,
  minRows = 10,
}: {
  title: string;
  path: string;
  placeholder?: string;
  help?: React.ReactNode;
  minRows?: number;
}) {
  const { draftState, updateDraft } = useConfigStore();

  const currentValue = useMemo(() => get(draftState, path), [draftState, path]);

  const [text, setText] = useState<string>(safeStringify(currentValue));
  const [err, setErr] = useState<string>("");
  const [dirty, setDirty] = useState(false);

  // Only auto-refresh when not editing.
  useEffect(() => {
    if (dirty) return;
    setText(safeStringify(currentValue));
    setErr("");
  }, [currentValue, dirty]);

  const apply = () => {
    try {
      const parsed = JSON.parse(text);
      updateDraft(path, parsed);
      setErr("");
      setDirty(false);
    } catch (e: any) {
      setErr(e?.message || "JSON 解析失败");
    }
  };

  const format = () => {
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed, null, 2));
      setErr("");
    } catch (e: any) {
      setErr(e?.message || "JSON 解析失败");
    }
  };

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{title}</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2, fontFamily: "ui-monospace, monospace" }}>{path}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" type="button" onClick={format}>
            格式化
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={apply}>
            应用到草稿
          </button>
        </div>
      </div>

      {help && <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>{help}</div>}

      <textarea
        className="input"
        style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, lineHeight: 1.35 }}
        rows={minRows}
        placeholder={placeholder || "请输入 JSON"}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setDirty(true);
        }}
      />

      {err && (
        <div className="banner banner-danger" style={{ marginTop: 10 }}>
          JSON 错误：{err}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-dim)" }}>
        提示：这里的修改只写入草稿（draft）。点击页面右上角保存后才会写入 openclaw.json。
      </div>
    </div>
  );
}

export function FeishuAdvancedPanel() {
  return (
    <div className="u-stack" style={{ gap: 12 }}>
      <div className="banner banner-primary">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontWeight: 700 }}>飞书高级设置（推荐用 JSON 编辑）</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
            说明：`channels.feishu.accounts.*` / `groups.*` 这类带 `*` 的路径在表单里很难正确编辑（`*` 代表任意 key）。
            你可以在下面直接编辑 JSON（例如 accounts 里用 `default` 或具体群组 id 作为 key）。
          </div>
        </div>
      </div>

      <JsonPathEditor
        title="channels.feishu（总配置）"
        path="channels.feishu"
        minRows={12}
        help={
          <>
            常用：<code>enabled</code> / <code>defaultAccount</code> / <code>connectionMode</code> / <code>renderMode</code> / <code>streaming</code>。
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <JsonPathEditor
          title="channels.feishu.accounts（多账号配置）"
          path="channels.feishu.accounts"
          minRows={10}
          help={
            <>
              例：<code>{{"default": {{"appId": "...", "enabled": true}}}}</code>
            </>
          }
        />
        <JsonPathEditor
          title="channels.feishu.groups（群组细粒度配置）"
          path="channels.feishu.groups"
          minRows={10}
          help={
            <>
              key 通常是 groupId。可在这里设置 <code>replyInThread</code> / <code>requireMention</code> / <code>topicSessionMode</code>。
            </>
          }
        />
      </div>
    </div>
  );
}
