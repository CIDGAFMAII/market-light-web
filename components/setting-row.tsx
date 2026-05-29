type SettingRowProps = {
  label: string;
  value: string | number | boolean;
  hint?: string;
};

export function SettingRow({ label, value, hint }: SettingRowProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-700/60 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-semibold text-slate-100">{label}</div>
        {hint ? <div className="mt-1 text-xs text-slate-300">{hint}</div> : null}
      </div>
      <div className="font-mono text-indigo-200">{typeof value === "boolean" ? (value ? "開啟" : "關閉") : value}</div>
    </div>
  );
}
