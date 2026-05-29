import Link from "next/link";

const items = [
  { label: "總覽", href: "/dashboard" },
  { label: "裝置", href: "/dashboard" },
  { label: "綁定", href: "/dashboard" },
  { label: "股票", href: "/dashboard/stocks" },
  { label: "小助手", href: "/dashboard/companion" },
  { label: "API 偵錯", href: "/dashboard/api-debug" },
  { label: "展示模式", href: "/demo" },
];

export function Sidebar() {
  return (
    <aside className="border-r border-slate-700/60 bg-slate-950/75 p-4">
      <Link href="/" className="brand-mark block">
        Market Light
      </Link>
      <nav className="mt-8 space-y-2">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="block rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-900/80 hover:text-slate-50"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
