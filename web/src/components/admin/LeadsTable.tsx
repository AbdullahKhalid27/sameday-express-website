"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPounds } from "@/lib/money";

/**
 * Interactive leads table for the admin dashboard.
 *
 * Fetches /api/admin/leads with status/type filters + pagination, renders
 * the operational columns (date, type, customer, contact, value, status,
 * source), and reports row selection upward via onLeadSelect.
 */

// ── Types (mirror the API's include shape) ──────────────────────────────

type LeadType =
  | "QUOTE_REQUEST"
  | "CONTACT_ENQUIRY"
  | "TRADE_ACCOUNT_APPLICATION"
  | "NEWSLETTER_SIGNUP";

type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUOTE_SENT"
  | "CONVERTED"
  | "LOST"
  | "SPAM";

interface AdminLead {
  id: string;
  createdAt: string;
  type: LeadType;
  status: LeadStatus;
  source: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  customer: {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
  };
  quote: { totalPence: number } | null;
  tradeApp: { companyName: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Display maps ────────────────────────────────────────────────────────

const TYPE_BADGES: Record<LeadType, string> = {
  QUOTE_REQUEST: "bg-[#9c805c]/20 text-[#bda685] border border-[#9c805c]/30",
  CONTACT_ENQUIRY: "bg-[#3498db]/20 text-[#3498db]",
  TRADE_ACCOUNT_APPLICATION: "bg-[#8e44ad]/20 text-[#8e44ad]",
  NEWSLETTER_SIGNUP: "bg-[#52625a]/20 text-[#52625a]",
};

const STATUS_BADGES: Record<LeadStatus, string> = {
  NEW: "bg-[#3498db]/20 text-[#3498db]",
  CONTACTED: "bg-[#f39c12]/20 text-[#f39c12]",
  QUOTE_SENT: "bg-[#e67e22]/20 text-[#e67e22]",
  CONVERTED: "bg-[#27ae60]/20 text-[#27ae60]",
  LOST: "bg-[#c0392b]/20 text-[#c0392b]",
  SPAM: "bg-[#52625a]/20 text-[#52625a]",
};

const TYPE_OPTIONS: LeadType[] = [
  "QUOTE_REQUEST",
  "CONTACT_ENQUIRY",
  "TRADE_ACCOUNT_APPLICATION",
  "NEWSLETTER_SIGNUP",
];

const STATUS_OPTIONS: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUOTE_SENT",
  "CONVERTED",
  "LOST",
  "SPAM",
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Date → yyyy-mm-dd for <input type="date"> values. */
function formatDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** NEW leads untouched for >24h need chasing. */
function isOverdue(lead: AdminLead): boolean {
  return (
    lead.status === "NEW" &&
    new Date(lead.createdAt).getTime() < Date.now() - 24 * 60 * 60 * 1000
  );
}

// ── Component ───────────────────────────────────────────────────────────

export default function LeadsTable({
  onLeadSelect,
}: {
  onLeadSelect: (leadId: string) => void;
}) {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [status, setStatus] = useState<"" | LeadStatus>("");
  const [type, setType] = useState<"" | LeadType>("");
  const [search, setSearch] = useState("");
  // Date range: preset ("7d" | "30d" | "90d" | "custom" | "") or explicit dates.
  const [range, setRange] = useState<"" | "7d" | "30d" | "90d" | "custom">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [source, setSource] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const LIMIT = 20;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (status) params.set("status", status);
      if (type) params.set("type", type);
      if (source) params.set("source", source);
      if (dateFrom) params.set("dateFrom", new Date(`${dateFrom}T00:00:00`).toISOString());
      if (dateTo) params.set("dateTo", new Date(`${dateTo}T23:59:59`).toISOString());
      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch leads (${res.status})`);
      }
      const data = (await res.json()) as {
        leads: AdminLead[];
        sources?: string[];
        pagination: Pagination;
      };
      setLeads(data.leads);
      if (data.sources) setSources(data.sources);
      setPagination(data.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, type, source, dateFrom, dateTo]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  // Reset to page 1 whenever a filter changes.
  const handleStatusChange = (value: string) => {
    setStatus(value as "" | LeadStatus);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setType(value as "" | LeadType);
    setPage(1);
  };

  const handleSourceChange = (value: string) => {
    setSource(value);
    setPage(1);
  };

  // Preset range → set explicit dates; "custom" keeps/enables manual inputs.
  const handleRangeChange = (value: "" | "7d" | "30d" | "90d" | "custom") => {
    setRange(value);
    setPage(1);
    if (value === "custom") return;
    if (!value) {
      setDateFrom("");
      setDateTo("");
      return;
    }
    const days = value === "7d" ? 7 : value === "30d" ? 30 : 90;
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    setDateFrom(formatDateInput(from));
    setDateTo(formatDateInput(to));
  };

  const handleCustomDate = (setter: (v: string) => void, value: string) => {
    setRange("custom");
    setter(value);
    setPage(1);
  };

  // Client-side search over the loaded page (name or email).
  const visibleLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.customer.name.toLowerCase().includes(q) ||
        l.customer.email.toLowerCase().includes(q)
    );
  }, [leads, search]);

  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * LIMIT + 1;
  const to = Math.min(pagination.page * LIMIT, pagination.total);

  // ── Bulk selection helpers ──
  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected =
    visibleLeads.length > 0 &&
    visibleLeads.every((l) => selected.has(l.id));

  const toggleSelectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const l of visibleLeads) next.delete(l.id);
      } else {
        for (const l of visibleLeads) next.add(l.id);
      }
      return next;
    });
  };

  const runBulk = useCallback(
    async (method: "PATCH" | "DELETE", body: Record<string, unknown>) => {
      setBulkBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/leads/bulk", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error || `Bulk action failed (${res.status})`);
        }
        setSelected(new Set());
        await fetchLeads();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Bulk action failed");
      } finally {
        setBulkBusy(false);
      }
    },
    [fetchLeads]
  );

  const bulkSetStatus = (status: string) => {
    if (selected.size === 0 || bulkBusy) return;
    void runBulk("PATCH", { ids: [...selected], status });
  };

  const bulkDelete = () => {
    if (selected.size === 0 || bulkBusy) return;
    if (
      !window.confirm(
        `Delete ${selected.size} selected lead${selected.size === 1 ? "" : "s"}? They will be hidden from the dashboard (soft delete).`
      )
    )
      return;
    void runBulk("DELETE", { ids: [...selected] });
  };

  // Compact page-number window around the current page.
  const pageNumbers = useMemo(() => {
    const totalPages = pagination.totalPages;
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const current = pagination.page;
    const pages = new Set<number>([1, totalPages, current, current - 1, current + 1]);
    if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
    if (current >= totalPages - 2)
      [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => pages.add(p));
    return [...pages]
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }, [pagination.page, pagination.totalPages]);

  return (
    <div className="overflow-hidden rounded-[6px] border border-[#52625a]/40 bg-[#243028]">
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 p-4">
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-[6px] border border-[#52625a]/50 bg-[#1c2821] px-3 py-1.5 text-sm text-[#faf9f6] outline-none focus:border-[#9c805c]"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="rounded-[6px] border border-[#52625a]/50 bg-[#1c2821] px-3 py-1.5 text-sm text-[#faf9f6] outline-none focus:border-[#9c805c]"
        >
          <option value="">All types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by date range"
          value={range}
          onChange={(e) =>
            handleRangeChange(e.target.value as "" | "7d" | "30d" | "90d" | "custom")
          }
          className="rounded-[6px] border border-[#52625a]/50 bg-[#1c2821] px-3 py-1.5 text-sm text-[#faf9f6] outline-none focus:border-[#9c805c]"
        >
          <option value="">All time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="custom">Custom</option>
        </select>

        {range === "custom" && (
          <>
            <input
              type="date"
              aria-label="From date"
              value={dateFrom}
              onChange={(e) => handleCustomDate(setDateFrom, e.target.value)}
              className="rounded-[6px] border border-[#52625a]/50 bg-[#1c2821] px-2 py-1.5 text-sm text-[#faf9f6] outline-none focus:border-[#9c805c]"
            />
            <span className="text-xs text-[#52625a]">→</span>
            <input
              type="date"
              aria-label="To date"
              value={dateTo}
              onChange={(e) => handleCustomDate(setDateTo, e.target.value)}
              className="rounded-[6px] border border-[#52625a]/50 bg-[#1c2821] px-2 py-1.5 text-sm text-[#faf9f6] outline-none focus:border-[#9c805c]"
            />
          </>
        )}

        <select
          aria-label="Filter by source"
          value={source}
          onChange={(e) => handleSourceChange(e.target.value)}
          className="rounded-[6px] border border-[#52625a]/50 bg-[#1c2821] px-3 py-1.5 text-sm text-[#faf9f6] outline-none focus:border-[#9c805c]"
        >
          <option value="">All Sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          type="search"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-[6px] border border-[#52625a]/50 bg-[#1c2821] px-3 py-1.5 text-sm text-[#faf9f6] placeholder:text-[#52625a] outline-none focus:border-[#9c805c]"
        />

        <span className="text-xs text-[#52625a]">
          Showing {from}-{to} of {pagination.total} leads
        </span>
      </div>

      {error && (
        <div className="border-t border-[#c0392b]/30 bg-[#c0392b]/10 px-4 py-3 text-sm text-[#c0392b]">
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-y border-[#52625a]/30 text-xs uppercase tracking-wider text-[#52625a]">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all visible leads"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  className="h-4 w-4 cursor-pointer accent-[#9c805c]"
                />
              </th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#52625a]/20">
            {loading && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-[#52625a]">
                  Loading leads…
                </td>
              </tr>
            )}
            {!loading && visibleLeads.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-[#52625a]">
                  {search
                    ? "No leads match your search."
                    : "No leads found for these filters."}
                </td>
              </tr>
            )}
            {!loading &&
              visibleLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onLeadSelect(lead.id)}
                  className="cursor-pointer transition-colors hover:bg-[#1e2b23]"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select lead from ${lead.customer.name}`}
                      checked={selected.has(lead.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelected(lead.id)}
                      className="h-4 w-4 cursor-pointer accent-[#9c805c]"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#faf9f6]/70">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGES[lead.type]}`}
                    >
                      {lead.type
                        .toLowerCase()
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#faf9f6]">
                    {lead.customer.name}
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-[#faf9f6]/70">
                    {lead.customer.company || lead.tradeApp?.companyName || "—"}
                  </td>
                  <td
                    className="max-w-[140px] truncate px-4 py-3 text-[#faf9f6]/70"
                    title={lead.customer.phone || ""}
                  >
                    {lead.customer.phone || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#faf9f6]/70">
                    {lead.quote ? formatPounds(lead.quote.totalPence) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {isOverdue(lead) && (
                        <span
                          aria-label="Overdue follow-up"
                          title="NEW and untouched for over 24 hours"
                          className="h-2 w-2 shrink-0 rounded-full bg-[#c0392b]"
                        />
                      )}
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGES[lead.status]}`}
                      >
                        {lead.status.replace(/_/g, " ")}
                      </span>
                      {isOverdue(lead) && (
                        <span className="text-xs text-[#c0392b]/80">Overdue</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-[#52625a]/20 px-2.5 py-0.5 text-xs text-[#faf9f6]/70">
                      {lead.utmSource || lead.source || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLeadSelect(lead.id);
                      }}
                      className="rounded-[6px] border border-[#9c805c]/40 px-2.5 py-1 text-xs text-[#bda685] transition-colors hover:bg-[#9c805c]/20"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between gap-4 border-t border-[#52625a]/30 p-4">
        <span className="text-xs text-[#52625a]">
          Showing {from}-{to} of {pagination.total} leads
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-[6px] border border-[#52625a]/50 min-h-[40px] px-4 text-xs text-[#faf9f6]/80 transition-colors hover:bg-[#1e2b23] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>
          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              disabled={loading}
              onClick={() => setPage(p)}
              className={`min-h-[40px] min-w-[40px] rounded-[6px] px-2 text-xs transition-colors ${
                p === pagination.page
                  ? "bg-[#9c805c] font-semibold text-[#1c2821]"
                  : "border border-[#52625a]/50 text-[#faf9f6]/80 hover:bg-[#1e2b23]"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-[6px] border border-[#52625a]/50 min-h-[40px] px-4 text-xs text-[#faf9f6]/80 transition-colors hover:bg-[#1e2b23] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>

      {/* ── Sticky bulk action bar ── */}
      {selected.size > 0 && (
        <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-[6px] border border-[#2e3d33] bg-[#243028] p-3 shadow-2xl">
            <span className="px-1 text-sm text-[#faf9f6]/80">
              {selected.size} selected
            </span>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => bulkSetStatus("CONTACTED")}
              className="rounded-[4px] border border-[#f39c12]/50 px-3 py-1.5 text-xs font-medium text-[#f39c12] transition-colors hover:bg-[#f39c12]/10 disabled:cursor-default disabled:opacity-40"
            >
              Mark Contacted
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => bulkSetStatus("LOST")}
              className="rounded-[4px] border border-[#c0392b]/50 px-3 py-1.5 text-xs font-medium text-[#c0392b] transition-colors hover:bg-[#c0392b]/10 disabled:cursor-default disabled:opacity-40"
            >
              Mark Lost
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={bulkDelete}
              className="rounded-[4px] border border-[#c0392b] bg-[#c0392b]/20 px-3 py-1.5 text-xs font-medium text-[#c0392b] transition-colors hover:bg-[#c0392b]/30 disabled:cursor-default disabled:opacity-40"
            >
              Delete Selected
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => setSelected(new Set())}
              className="rounded-[4px] px-3 py-1.5 text-xs text-[#52625a] transition-colors hover:text-[#faf9f6] disabled:cursor-default"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
