type SettingRowProps = {
  label: string;
  value: string | number | boolean;
  hint?: string;
};

export function SettingRow({ label, value, hint }: SettingRowProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-cyan/10 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm uppercase tracking-[0.18em] text-muted">{label}</div>
        {hint ? <div className="mt-1 text-xs text-muted/70">{hint}</div> : null}
      </div>
      <div className="font-mono text-cyan">{typeof value === "boolean" ? (value ? "開啟" : "關閉") : value}</div>
    </div>
  );
}
