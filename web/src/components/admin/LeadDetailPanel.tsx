"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { formatPounds } from "@/lib/money";

/**
 * Slide-in detail panel for a single lead (admin).
 *
 * Fetches GET /api/admin/leads/[id] (lead + notes + activity in one
 * response), supports status changes via PATCH, note creation via
 * POST /api/admin/leads/[id]/notes, and soft-delete via PATCH deletedAt.
 *
 * Animates in from the right on mount and out on close (Escape key,
 * backdrop click, or the X button). The parent unmounts it via onClose
 * once the slide-out finishes.
 */

// ── Types (mirror the API response shape) ───────────────────────────────

type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUOTE_SENT"
  | "CONVERTED"
  | "LOST"
  | "SPAM";

type LeadType =
  | "QUOTE_REQUEST"
  | "CONTACT_ENQUIRY"
  | "TRADE_ACCOUNT_APPLICATION"
  | "NEWSLETTER_SIGNUP";

interface LeadDetail {
  id: string;
  createdAt: string;
  type: LeadType;
  status: LeadStatus;
  source: string;
  utmSource: string | null;
  customer: {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
  };
  quote: { totalPence: number } | null;
}

interface LeadNoteItem {
  id: string;
  createdAt: string;
  content: string;
}

interface ActivityItem {
  id: string;
  createdAt: string;
  action: string;
  actor: string;
}

interface DetailResponse {
  lead: LeadDetail;
  notes: LeadNoteItem[];
  activity: ActivityItem[];
}

// ── Display maps ────────────────────────────────────────────────────────

const STATUS_BADGES: Record<LeadStatus, string> = {
  NEW: "bg-[#3498db]/20 text-[#3498db]",
  CONTACTED: "bg-[#f39c12]/20 text-[#f39c12]",
  QUOTE_SENT: "bg-[#e67e22]/20 text-[#e67e22]",
  CONVERTED: "bg-[#27ae60]/20 text-[#27ae60]",
  LOST: "bg-[#c0392b]/20 text-[#c0392b]",
  SPAM: "bg-[#52625a]/20 text-[#52625a]",
};

const TYPE_BADGES: Record<LeadType, string> = {
  QUOTE_REQUEST: "bg-[#9c805c]/20 text-[#bda685] border border-[#9c805c]/30",
  CONTACT_ENQUIRY: "bg-[#3498db]/20 text-[#3498db]",
  TRADE_ACCOUNT_APPLICATION: "bg-[#8e44ad]/20 text-[#8e44ad]",
  NEWSLETTER_SIGNUP: "bg-[#52625a]/20 text-[#52625a]",
};

/** The linear happy-path stepper. LOST/SPAM sit outside it as buttons. */
const STEPS: LeadStatus[] = ["NEW", "CONTACTED", "QUOTE_SENT", "CONVERTED"];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date}, ${time}`;
}

// ── Component ───────────────────────────────────────────────────────────

export default function LeadDetailPanel({
  leadId,
  onClose,
}: {
  leadId: string;
  onClose: () => void;
}) {
  // Slide-in/out: start translated off-screen, flip to open after mount.
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignedTo, setAssignedTo] = useState(""); // editable — persistence comes later
  const [noteDraft, setNoteDraft] = useState("");
  const [busy, setBusy] = useState(false); // PATCH/POST in flight
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Slide in after first paint.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Fetch lead detail (notes + activity ride along).
  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`);
      if (!res.ok) throw new Error(`Failed to fetch lead (${res.status})`);
      setData((await res.json()) as DetailResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch lead");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  // Close path: animate out, then hand back to parent for unmount.
  const close = useCallback(() => {
    setOpen(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(onClose, 250);
  }, [onClose]);

  // Escape to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [close]);

  // PATCH the lead (status change or soft delete), then refetch.
  const patchLead = useCallback(
    async (body: Record<string, unknown>) => {
      setBusy(true);
      try {
        const res = await fetch(`/api/admin/leads/${leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error || `Update failed (${res.status})`);
        }
        await fetchDetail();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Update failed");
      } finally {
        setBusy(false);
      }
    },
    [leadId, fetchDetail]
  );

  const addNote = useCallback(async () => {
    const content = noteDraft.trim();
    if (!content || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(`Failed to add note (${res.status})`);
      setNoteDraft("");
      await fetchDetail(); // re-fetch → new note appears at top of list
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add note");
    } finally {
      setBusy(false);
    }
  }, [noteDraft, busy, leadId, fetchDetail]);

  const deleteLead = useCallback(async () => {
    if (!window.confirm("Delete this lead? It will be hidden from the dashboard (soft delete)."))
      return;
    await patchLead({ deletedAt: new Date().toISOString() });
    close();
  }, [patchLead, close]);

  const openWhatsApp = useCallback(() => {
    const phone = data?.lead.customer.phone;
    if (!phone) return;
    window.open(`https://wa.me/44${phone.replace(/^0/, "")}`, "_blank");
  }, [data]);

  const lead = data?.lead;
  const currentStep = lead ? STEPS.indexOf(lead.status) : -1;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={close}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-250 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ── Panel ── */}
      <aside
        role="dialog"
        aria-label="Lead details"
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[480px] max-w-full flex-col bg-[#243028] text-[#faf9f6] shadow-2xl transition-transform duration-250 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 border-b border-[#2e3d33] p-4">
          <div className="min-w-0">
            {loading && !lead ? (
              <p className="text-sm text-[#52625a]">Loading lead…</p>
            ) : (
              <>
                <h2 className="font-heading truncate text-xl font-bold text-[#faf9f6]">
                  {lead?.customer.name || "Unknown"}
                </h2>
                <p className="truncate text-sm text-[#52625a]">
                  {lead?.customer.company || ""}
                </p>
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {lead && (
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGES[lead.status]}`}
              >
                {lead.status.replace(/_/g, " ")}
              </span>
            )}
            <button
              type="button"
              onClick={close}
              aria-label="Close panel"
              className="rounded-[4px] p-1.5 text-[#52625a] transition-colors hover:bg-[#1a2620] hover:text-[#faf9f6]"
            >
              <Icon.Close width={18} height={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="border-b border-[#2e3d33] bg-[#c0392b]/10 px-4 py-3 text-sm text-[#c0392b]">
              {error}
            </div>
          )}

          {loading && !lead && (
            <p className="p-4 text-sm text-[#52625a]">Loading…</p>
          )}

          {lead && (
            <>
              {/* ── Contact info ── */}
              <section className="border-b border-[#2e3d33] p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon.Phone width={16} height={16} className="shrink-0 text-[#52625a]" />
                    {lead.customer.phone ? (
                      <a
                        href={`tel:${lead.customer.phone}`}
                        className="text-sm text-[#faf9f6] hover:underline"
                      >
                        {lead.customer.phone}
                      </a>
                    ) : (
                      <span className="text-sm text-[#52625a]">No phone</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon.Mail width={16} height={16} className="shrink-0 text-[#52625a]" />
                    <a
                      href={`mailto:${lead.customer.email}`}
                      className="truncate text-sm text-[#faf9f6] hover:underline"
                    >
                      {lead.customer.email}
                    </a>
                  </div>
                </div>
              </section>

              {/* ── Lead meta ── */}
              <section className="space-y-3 border-b border-[#2e3d33] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGES[lead.type]}`}
                  >
                    {lead.type
                      .toLowerCase()
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <span className="inline-block rounded-full bg-[#52625a]/20 px-2.5 py-0.5 text-xs text-[#faf9f6]/70">
                    {lead.utmSource || lead.source || "—"}
                  </span>
                </div>
                <p className="text-sm text-[#52625a]">
                  Received {formatDateTime(lead.createdAt)}
                </p>
                <label className="block">
                  <span className="mb-1 block text-xs uppercase tracking-wide text-[#52625a]">
                    Assigned to
                  </span>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="Unassigned"
                    className="w-full rounded-[4px] border border-[#3a4f40] bg-[#1a2620] px-3 py-1.5 text-sm text-[#faf9f6] placeholder:text-[#52625a] outline-none focus:border-[#9c805c]"
                  />
                </label>
              </section>

              {/* ── Quote value ── */}
              <section className="border-b border-[#2e3d33] p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-[#52625a]">
                  Quote value
                </p>
                <p className="font-heading text-2xl font-bold text-[#faf9f6]">
                  {lead.quote ? formatPounds(lead.quote.totalPence) : "—"}
                </p>
              </section>

              {/* ── Status stepper ── */}
              <section className="border-b border-[#2e3d33] p-4">
                <div className="flex items-start justify-between">
                  {STEPS.map((step, idx) => {
                    const isDone = currentStep >= 0 && idx < currentStep;
                    const isCurrent = idx === currentStep;
                    const isFuture = currentStep >= 0 && idx > currentStep;
                    const clickable = isFuture && !busy;
                    return (
                      <button
                        key={step}
                        type="button"
                        disabled={!clickable}
                        onClick={() => void patchLead({ status: step })}
                        title={clickable ? `Move to ${step}` : undefined}
                        className="group flex flex-1 flex-col items-center gap-1.5 disabled:cursor-default"
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                            isDone
                              ? "border-[#9c805c] bg-[#9c805c] text-[#1c2821]"
                              : isCurrent
                                ? "border-[#9c805c] bg-[#faf9f6] text-[#1c2821]"
                                : "border-[#52625a] bg-transparent text-[#52625a] group-enabled:group-hover:border-[#9c805c]"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span
                          className={`text-center text-[10px] uppercase tracking-wide ${
                            isDone || isCurrent ? "text-[#faf9f6]" : "text-[#52625a]"
                          }`}
                        >
                          {step.replace(/_/g, " ")}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={busy || lead.status === "LOST"}
                    onClick={() => void patchLead({ status: "LOST" })}
                    className="flex-1 rounded-[4px] border border-[#c0392b]/60 px-3 py-1.5 text-xs font-medium text-[#c0392b] transition-colors hover:bg-[#c0392b]/10 disabled:cursor-default disabled:opacity-40"
                  >
                    Mark as Lost
                  </button>
                  <button
                    type="button"
                    disabled={busy || lead.status === "SPAM"}
                    onClick={() => void patchLead({ status: "SPAM" })}
                    className="flex-1 rounded-[4px] border border-[#c0392b]/60 px-3 py-1.5 text-xs font-medium text-[#c0392b] transition-colors hover:bg-[#c0392b]/10 disabled:cursor-default disabled:opacity-40"
                  >
                    Mark as Spam
                  </button>
                </div>
              </section>

              {/* ── Notes ── */}
              <section className="border-b border-[#2e3d33] p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-[#52625a]">
                  Notes
                </p>
                <textarea
                  rows={4}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add an internal note…"
                  className="w-full resize-y rounded-[4px] border border-[#3a4f40] bg-[#1a2620] px-3 py-2 text-sm text-[#faf9f6] placeholder:text-[#52625a] outline-none focus:border-[#9c805c]"
                />
                <button
                  type="button"
                  disabled={busy || !noteDraft.trim()}
                  onClick={() => void addNote()}
                  className="mt-2 rounded-[4px] bg-[#9c805c] px-4 py-1.5 text-sm font-semibold text-[#1c2821] transition-colors hover:bg-[#bda685] disabled:cursor-default disabled:opacity-40"
                >
                  Add Note
                </button>

                <ul className="mt-4 space-y-3">
                  {data?.notes.length === 0 && (
                    <li className="text-sm text-[#52625a]">No notes yet.</li>
                  )}
                  {data?.notes.map((note) => (
                    <li key={note.id} className="text-sm">
                      <p className="whitespace-pre-wrap text-[#faf9f6]/90">
                        {note.content}
                      </p>
                      <p className="mt-0.5 text-xs text-[#52625a]">
                        {formatDateTime(note.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              {/* ── Activity log ── */}
              <section className="p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-[#52625a]">
                  Activity
                </p>
                <ul className="space-y-2">
                  {data?.activity.length === 0 && (
                    <li className="text-sm text-[#52625a]">No activity recorded.</li>
                  )}
                  {data?.activity.map((entry) => (
                    <li key={entry.id} className="flex items-center gap-2 text-sm text-[#52625a]">
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#52625a]"
                      />
                      <span className="whitespace-nowrap text-xs">
                        {formatDateTime(entry.createdAt)}
                      </span>
                      <span className="truncate text-[14px]">
                        {entry.action.replace(/_/g, " ")} · {entry.actor}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>

        {/* ── Sticky footer ── */}
        <div className="flex items-center justify-between gap-3 border-t border-[#2e3d33] bg-[#243028] p-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => void deleteLead()}
            className="rounded-[4px] border border-[#c0392b]/60 px-3 py-2 text-sm font-medium text-[#c0392b] transition-colors hover:bg-[#c0392b]/10 disabled:cursor-default disabled:opacity-40"
          >
            Delete Lead
          </button>
          <button
            type="button"
            disabled={!data?.lead.customer.phone}
            onClick={openWhatsApp}
            className="rounded-[4px] bg-[#9c805c] px-3 py-2 text-sm font-semibold text-[#1c2821] transition-colors hover:bg-[#bda685] disabled:cursor-default disabled:opacity-40"
          >
            Open WhatsApp
          </button>
        </div>
      </aside>
    </>
  );
}
