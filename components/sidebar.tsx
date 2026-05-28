import Link from "next/link";

const items = [
  { label: "總覽", href: "/dashboard" },
  { label: "裝置", href: "/dashboard" },
  { label: "綁定", href: "/dashboard" },
  { label: "股票", href: "/dashboard/stocks" },
  { label: "小助手", href: "/dashboard" },
  { label: "API 偵錯", href: "/dashboard/api-debug" },
  { label: "展示模式", href: "/demo" },
];

export function Sidebar() {
  return (
    <aside className="border-r border-cyan/15 bg-black/35 p-4">
      <Link href="/" className="block font-orbitron text-lg font-bold uppercase tracking-[0.18em] text-cyan">
        Market Light
      </Link>
      <nav className="mt-8 space-y-2">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="block rounded border border-transparent px-3 py-2 text-sm uppercase tracking-[0.14em] text-muted transition hover:border-[var(--border-cyan)] hover:text-cyan"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
