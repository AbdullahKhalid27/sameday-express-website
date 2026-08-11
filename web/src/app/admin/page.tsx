import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { isAdminKeyConfigured } from "@/lib/admin-auth";
import { formatPounds } from "@/lib/money";
import type { LeadType, LeadStatus, Prisma } from "@/generated/prisma/client";

/** The lead shape with relations included — used for the recent-leads list. */
type LeadWithRelations = Prisma.LeadGetPayload<{
  include: {
    customer: { select: { name: true; email: true; phone: true; company: true } };
    quote: { select: { totalPence: true; vehicleId: true; originPostcode: true; destPostcode: true } };
    tradeApp: { select: { companyName: true } };
  };
}>;

/**
 * /admin — the operational dashboard.
 *
 * Server component: auths via the admin_token cookie, fetches stats + recent
 * leads directly from Prisma (no API roundtrip), and renders the full view.
 *
 * Shows the client: where leads come from (UTM breakdown), what's new,
 * conversion status, newsletter subscribers, and abandoned-funnel analytics.
 *
 * If not authenticated → redirect to /admin/login.
 */

// ── Display helpers ─────────────────────────────────────────────────────
const TYPE_LABELS: Record<LeadType, string> = {
  QUOTE_REQUEST: "Quote Request",
  CONTACT_ENQUIRY: "Contact",
  TRADE_ACCOUNT_APPLICATION: "Trade Account",
  NEWSLETTER_SIGNUP: "Newsletter",
};

const TYPE_COLORS: Record<LeadType, string> = {
  QUOTE_REQUEST: "bg-brass-muted text-brass-bright",
  CONTACT_ENQUIRY: "bg-forest-light text-forest",
  TRADE_ACCOUNT_APPLICATION: "bg-success-muted text-success",
  NEWSLETTER_SIGNUP: "bg-ivory/20 text-ivory",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "bg-brass-muted text-brass-bright",
  CONTACTED: "bg-forest-light text-forest",
  QUOTE_SENT: "bg-success-muted text-success",
  CONVERTED: "bg-success text-ivory",
  LOST: "bg-danger-muted text-danger",
  SPAM: "bg-ivory/20 text-ivory/60",
};

export default async function AdminDashboard() {
  // ── Auth check ──
  const h = await headers();
  const c = await cookies();
  // Reconstruct a minimal request-like check from cookies.
  const token = c.get("admin_token")?.value;
  const expectedKey = process.env.ADMIN_API_KEY;
  const configured = isAdminKeyConfigured();

  // Dev fail-open: if no key configured and not in production, allow.
  // Prod without a key → block (misconfiguration).
  const isAuthed = configured
    ? token === expectedKey
    : process.env.NODE_ENV !== "production";

  if (!isAuthed) {
    redirect("/admin/login");
  }

  // ── Fetch dashboard data directly (server component → Prisma, no fetch) ──
  let recentLeads: LeadWithRelations[] = [];
  let leadsByType: Record<string, number> = {};
  let leadsByStatus: Record<string, number> = {};
  let leadsBySource: Record<string, number> = {};
  let newsletterCount = 0;
  let quoteAttemptCount = 0;
  let dbConnected = true;

  try {
    const [
      leads,
      typeGroups,
      statusGroups,
      sourceGroups,
      subs,
      attempts,
    ] = await Promise.all([
      prisma.lead.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 25,
        include: {
          customer: {
            select: { name: true, email: true, phone: true, company: true },
          },
          quote: { select: { totalPence: true, vehicleId: true, originPostcode: true, destPostcode: true } },
          tradeApp: { select: { companyName: true } },
        },
      }),
      prisma.lead.groupBy({ by: ["type"], _count: true, where: { deletedAt: null } }),
      prisma.lead.groupBy({ by: ["status"], _count: true, where: { deletedAt: null } }),
      prisma.lead.groupBy({
        by: ["utmSource"],
        _count: true,
        where: { deletedAt: null, utmSource: { not: null } },
      }),
      prisma.newsletterSubscriber.count({ where: { subscribed: true } }),
      prisma.quoteAttempt.count(),
    ]);

    recentLeads = leads;
    leadsByType = Object.fromEntries(typeGroups.map((g) => [g.type, g._count]));
    leadsByStatus = Object.fromEntries(statusGroups.map((g) => [g.status, g._count]));
    leadsBySource = Object.fromEntries(
      sourceGroups.map((g) => [g.utmSource || "(direct)", g._count])
    );
    newsletterCount = subs;
    quoteAttemptCount = attempts;
  } catch (error) {
    console.error("[/admin] DB error:", error);
    dbConnected = false;
  }

  const totalLeads = Object.values(leadsByType).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-dvh bg-forest text-ivory">
      {/* ── Admin header (separate from site chrome) ── */}
      <header className="border-b border-forest-highlight bg-forest-dark">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-heading text-xl font-bold">SDX Admin</h1>
            <p className="text-xs text-ivory/60">Lead &amp; order dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-ivory/60 hover:text-ivory"
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {!dbConnected && (
          <div className="mb-6 rounded-md border border-danger-muted bg-danger-muted p-4 text-sm text-danger">
            ⚠ Database connection failed. Check DATABASE_URL and that the
            migration has been applied (npm run db:deploy).
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Leads" value={totalLeads} />
          <StatCard label="New" value={leadsByStatus.NEW ?? 0} accent="brass" />
          <StatCard label="Converted" value={leadsByStatus.CONVERTED ?? 0} accent="success" />
          <StatCard label="Newsletter" value={newsletterCount} />
          <StatCard label="Quote Attempts" value={quoteAttemptCount} />
          <StatCard label="Lost" value={leadsByStatus.LOST ?? 0} accent="danger" />
        </div>

        {/* ── Source attribution (where leads come from) ── */}
        <section className="mt-8">
          <h2 className="mb-3 font-heading text-lg font-bold">
            Where Leads Come From
          </h2>
          <div className="rounded-xl border border-forest-highlight bg-forest-light p-5">
            {Object.keys(leadsBySource).length === 0 ? (
              <p className="text-sm text-ivory/60">
                No UTM-tracked leads yet. Leads from direct visits
                (no UTM params) won&apos;t appear here.
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(leadsBySource)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => {
                    const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                    return (
                      <div key={source}>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{source}</span>
                          <span className="text-ivory/70">
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-forest-dark">
                          <div
                            className="h-full bg-brass transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </section>

        {/* ── Recent leads table ── */}
        <section className="mt-8">
          <h2 className="mb-3 font-heading text-lg font-bold">Recent Leads</h2>
          <div className="overflow-x-auto rounded-xl border border-forest-highlight bg-forest-light">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-forest-highlight text-xs uppercase text-ivory/50">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-highlight">
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-ivory/50">
                      No leads yet. Submissions from the website will appear here.
                    </td>
                  </tr>
                )}
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-forest-dark/50">
                    <td className="whitespace-nowrap px-4 py-3 text-ivory/70">
                      {lead.createdAt.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[lead.type]}`}
                      >
                        {TYPE_LABELS[lead.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ivory">
                        {lead.customer.name}
                      </div>
                      {lead.customer.company && lead.customer.company !== "N/A" && (
                        <div className="text-xs text-ivory/50">
                          {lead.customer.company}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ivory/70">
                      <div>{lead.customer.phone}</div>
                      <div className="text-xs text-ivory/50">
                        {lead.customer.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ivory/70">
                      {lead.quote
                        ? formatPounds(lead.quote.totalPence)
                        : lead.tradeApp
                          ? "—"
                          : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status]}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ivory/60">
                      {lead.utmSource || "—"}
                      {lead.utmCampaign ? ` / ${lead.utmCampaign}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Type breakdown ── */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-forest-highlight bg-forest-light p-5">
            <h3 className="mb-3 text-sm font-semibold text-ivory/80">
              Leads by Type
            </h3>
            <div className="space-y-2">
              {(Object.keys(TYPE_LABELS) as LeadType[]).map((type) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-ivory/70">{TYPE_LABELS[type]}</span>
                  <span className="font-medium">{leadsByType[type] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-forest-highlight bg-forest-light p-5">
            <h3 className="mb-3 text-sm font-semibold text-ivory/80">
              Leads by Status
            </h3>
            <div className="space-y-2">
              {(Object.keys(STATUS_COLORS) as LeadStatus[]).map((status) => (
                <div key={status} className="flex justify-between text-sm">
                  <span className="text-ivory/70">{status}</span>
                  <span className="font-medium">{leadsByStatus[status] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "brass" | "success" | "danger";
}) {
  const accentClass =
    accent === "brass"
      ? "text-brass-bright"
      : accent === "success"
        ? "text-success"
        : accent === "danger"
          ? "text-danger"
          : "text-ivory";
  return (
    <div className="rounded-xl border border-forest-highlight bg-forest-light p-4">
      <p className="text-xs uppercase tracking-wide text-ivory/50">{label}</p>
      <p className={`mt-1 font-heading text-2xl font-bold ${accentClass}`}>
        {value}
      </p>
    </div>
  );
}
