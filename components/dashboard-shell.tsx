import type { ReactNode } from "react";
import { DashboardPreviewProvider } from "./dashboard-preview-context";
import { DeviceCard } from "./device-card";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen terminal-grid">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[240px_1fr_360px]">
        <DashboardPreviewProvider>
          <Sidebar />
          <main className="p-5 lg:p-8">{children}</main>
          <aside className="border-l border-slate-700/60 bg-slate-950/70 p-5 lg:p-6">
            <DeviceCard />
          </aside>
        </DashboardPreviewProvider>
      </div>
    </div>
  );
}
