"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LeadsTable from "@/components/admin/LeadsTable";
import LeadDetailPanel from "@/components/admin/LeadDetailPanel";
import OrdersTable from "@/components/admin/OrdersTable";
import StatCards from "@/components/admin/StatCards";
import LeadsBySource from "@/components/admin/charts/LeadsBySource";
import LeadsByType from "@/components/admin/charts/LeadsByType";
import WeeklyTrend from "@/components/admin/charts/WeeklyTrend";

/**
 * /admin — the operational dashboard (client layout).
 *
 * Auth: the admin_token cookie is verified indirectly — on mount we ping
 * /api/admin/stats, which returns 401 when the cookie is missing/expired,
 * and redirect to /admin/login. (Server-side redirect would require a
 * server wrapper; this keeps the interactive table + detail panel wiring
 * in one client tree. Detail panel arrives in a later task.)
 *
 * For now the page renders just the LeadsTable; onLeadSelect logs the id
 * until the detail panel exists.
 */

export default function AdminDashboard() {
  const router = useRouter();
  const [authState, setAuthState] = useState<"checking" | "authed" | "denied">(
    "checking"
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"leads" | "orders">("leads");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (cancelled) return;
        if (res.status === 401) {
          setAuthState("denied");
          router.replace("/admin/login");
        } else {
          setAuthState("authed");
        }
      } catch {
        if (!cancelled) setAuthState("authed"); // network hiccup — let the table surface errors
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-dvh bg-[#1c2821] text-[#faf9f6]">
      {/* ── Admin header (separate from site chrome) ── */}
      <header className="border-b border-[#52625a]/40 bg-[#243028]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">SDX Admin</h1>
            <p className="text-xs text-[#52625a]">Lead &amp; order dashboard</p>
          </div>
          <Link href="/" className="text-xs text-[#52625a] hover:text-[#faf9f6]">
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {authState === "checking" && (
          <div className="rounded-[6px] border border-[#52625a]/40 bg-[#243028] p-4 text-sm text-[#52625a]">
            Checking access…
          </div>
        )}

        {authState === "denied" && (
          <div className="rounded-[6px] border border-[#c0392b]/40 bg-[#243028] p-4 text-sm text-[#c0392b]">
            Unauthorized — redirecting to login…
          </div>
        )}

        {authState === "authed" && (
          <>
            <StatCards />

            {/* ── Tab navigation ── */}
            <div
              role="tablist"
              aria-label="Dashboard sections"
              className="mt-6 flex gap-1 border-b border-[#52625a]/40"
            >
              {(["leads", "orders"] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-t-[6px] px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-[#9c805c] bg-[#243028] text-[#faf9f6]"
                      : "text-[#52625a] hover:text-[#faf9f6]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "leads" && (
              <>
                <div className="mt-6">
                  <LeadsTable onLeadSelect={(leadId) => setSelectedLeadId(leadId)} />
                </div>
                <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                  <LeadsBySource />
                  <LeadsByType />
                  <WeeklyTrend />
                </section>
              </>
            )}

            {activeTab === "orders" && (
              <div className="mt-6">
                <OrdersTable />
              </div>
            )}
          </>
        )}

        {authState === "authed" && selectedLeadId && (
          <LeadDetailPanel
            leadId={selectedLeadId}
            onClose={() => setSelectedLeadId(null)}
          />
        )}
      </main>
    </div>
  );
}
