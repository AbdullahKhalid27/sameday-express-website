"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FLEET, type VehicleId } from "@/lib/fleet";
import { formatPounds } from "@/lib/money";

/**
 * Orders table for the dispatch console.
 *
 * Fetches GET /api/admin/orders with date/status filters + pagination.
 * Each row has an inline driver dropdown (PATCH driverId); clicking a row
 * opens a detail modal with all fields, a status selector, and driver
 * reassignment.
 */

// ── Types (mirror the API response) ─────────────────────────────────────

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED";

interface Driver {
  id: string;
  name: string;
  phone: string;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  originPostcode: string;
  destPostcode: string;
  distanceMiles: number;
  vehicleId: string;
  totalPence: number;
  paymentStatus: string;
  specialInstructions: string | null;
  driverId: string | null;
  customer: { id: string; name: string; email: string; phone: string | null };
  driver: { id: string; name: string; phone: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Display maps ────────────────────────────────────────────────────────

const STATUS_BADGES: Record<OrderStatus, string> = {
  PENDING: "bg-[#3498db]/20 text-[#3498db]",
  CONFIRMED: "bg-[#9c805c]/20 text-[#bda685]",
  DISPATCHED: "bg-[#f39c12]/20 text-[#f39c12]",
  IN_TRANSIT: "bg-[#e67e22]/20 text-[#e67e22]",
  DELIVERED: "bg-[#27ae60]/20 text-[#27ae60]",
  CANCELLED: "bg-[#c0392b]/20 text-[#c0392b]",
  FAILED: "bg-[#c0392b]/20 text-[#c0392b]",
};

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];

function vehicleName(vehicleId: string): string {
  return FLEET[vehicleId as VehicleId]?.name ?? vehicleId;
}

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

const inputClass =
  "rounded-[6px] border border-[#52625a]/50 bg-[#1c2821] px-3 py-1.5 text-sm text-[#faf9f6] outline-none focus:border-[#9c805c]";

// ── Component ───────────────────────────────────────────────────────────

export default function OrdersTable() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [vehicle, setVehicle] = useState("");
  const [range, setRange] = useState<"" | "7d" | "30d" | "90d" | "custom">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [busy, setBusy] = useState(false);

  const LIMIT = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });
      if (status) params.set("status", status);
      if (dateFrom)
        params.set("dateFrom", new Date(`${dateFrom}T00:00:00`).toISOString());
      if (dateTo) params.set("dateTo", new Date(`${dateTo}T23:59:59`).toISOString());
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
      const data = (await res.json()) as { orders: AdminOrder[]; pagination: Pagination };
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, dateFrom, dateTo]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  // Active drivers for the assignment dropdowns.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/drivers");
        if (!res.ok) return;
        const data = (await res.json()) as { drivers: Driver[] };
        if (!cancelled) setDrivers(data.drivers);
      } catch {
        // Non-fatal — dropdowns just stay empty.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStatusChange = (value: string) => {
    setStatus(value as "" | OrderStatus);
    setPage(1);
  };

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

  // Client-side vehicle filter over the loaded page (the API has no
  // vehicle param; manual orders may carry arbitrary vehicleId strings).
  const visibleOrders = useMemo(() => {
    const q = vehicle.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.vehicleId.toLowerCase().includes(q) ||
        vehicleName(o.vehicleId).toLowerCase().includes(q)
    );
  }, [orders, vehicle]);

  // PATCH an order (status and/or driverId), patching the row in place.
  const patchOrder = useCallback(
    async (orderId: string, body: Record<string, unknown>) => {
      setBusy(true);
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
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
        const data = (await res.json()) as { order: AdminOrder };
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        setSelected((prev) => (prev && prev.id === orderId ? data.order : prev));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Update failed");
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * LIMIT + 1;
  const to = Math.min(pagination.page * LIMIT, pagination.total);

  const driverSelect = (order: AdminOrder, className?: string) => (
    <select
      aria-label={`Assign driver to ${order.orderNumber}`}
      value={order.driverId || ""}
      disabled={busy || drivers.length === 0}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        void patchOrder(order.id, { driverId: e.target.value || null });
      }}
      className={`${inputClass} ${className || ""} py-1 text-xs`}
    >
      <option value="">Unassigned</option>
      {drivers.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="overflow-hidden rounded-[6px] border border-[#52625a]/40 bg-[#243028]">
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 p-4">
        <select
          aria-label="Filter by date range"
          value={range}
          onChange={(e) =>
            handleRangeChange(e.target.value as "" | "7d" | "30d" | "90d" | "custom")
          }
          className={inputClass}
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
              className={`${inputClass} px-2`}
            />
            <span className="text-xs text-[#52625a]">→</span>
            <input
              type="date"
              aria-label="To date"
              value={dateTo}
              onChange={(e) => handleCustomDate(setDateTo, e.target.value)}
              className={`${inputClass} px-2`}
            />
          </>
        )}

        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={inputClass}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <input
          type="search"
          placeholder="Filter by vehicle…"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          className={`${inputClass} min-w-[160px] flex-1 placeholder:text-[#52625a]`}
        />

        <span className="text-xs text-[#52625a]">
          Showing {from}-{to} of {pagination.total} orders
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
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Distance</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Driver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#52625a]/20">
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[#52625a]">
                  Loading orders…
                </td>
              </tr>
            )}
            {!loading && visibleOrders.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[#52625a]">
                  No orders found for these filters.
                </td>
              </tr>
            )}
            {!loading &&
              visibleOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className="cursor-pointer transition-colors hover:bg-[#1e2b23]"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-[#faf9f6]">
                    {order.orderNumber}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#faf9f6]/70">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-[#faf9f6]">
                    {order.customer.name}
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-[#faf9f6]/70">
                    {vehicleName(order.vehicleId)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-[#faf9f6]/70">
                    {order.originPostcode} → {order.destPostcode}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#faf9f6]/70">
                    {order.distanceMiles} mi
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#faf9f6]/70">
                    {formatPounds(order.totalPence)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGES[order.status]}`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">{driverSelect(order)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between gap-4 border-t border-[#52625a]/30 p-4">
        <span className="text-xs text-[#52625a]">
          Showing {from}-{to} of {pagination.total} orders
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="min-h-[40px] rounded-[6px] border border-[#52625a]/50 px-4 text-xs text-[#faf9f6]/80 transition-colors hover:bg-[#1e2b23] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="min-h-[40px] rounded-[6px] border border-[#52625a]/50 px-4 text-xs text-[#faf9f6]/80 transition-colors hover:bg-[#1e2b23] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div
          role="dialog"
          aria-label={`Order ${selected.orderNumber}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-[6px] border border-[#2e3d33] bg-[#243028] p-4"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-[#faf9f6]">
                  {selected.orderNumber}
                </h3>
                <p className="text-sm text-[#52625a]">
                  {formatDate(selected.createdAt)}
                </p>
              </div>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGES[selected.status]}`}
              >
                {selected.status.replace(/_/g, " ")}
              </span>
            </div>

            <dl className="mb-4 space-y-2 border-b border-[#2e3d33] pb-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#52625a]">Customer</dt>
                <dd className="text-right text-[#faf9f6]">
                  {selected.customer.name}
                  <span className="block text-xs text-[#52625a]">
                    {selected.customer.phone || selected.customer.email}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#52625a]">Route</dt>
                <dd className="text-right text-[#faf9f6]">
                  {selected.originPostcode} → {selected.destPostcode}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#52625a]">Distance</dt>
                <dd className="text-right text-[#faf9f6]">
                  {selected.distanceMiles} miles
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#52625a]">Vehicle</dt>
                <dd className="text-right text-[#faf9f6]">
                  {vehicleName(selected.vehicleId)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#52625a]">Value</dt>
                <dd className="text-right font-heading text-lg font-bold text-[#faf9f6]">
                  {formatPounds(selected.totalPence)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#52625a]">Payment</dt>
                <dd className="text-right text-[#faf9f6]">
                  {selected.paymentStatus.replace(/_/g, " ")}
                </dd>
              </div>
              {selected.specialInstructions && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#52625a]">Instructions</dt>
                  <dd className="max-w-[300px] text-right text-[#faf9f6]">
                    {selected.specialInstructions}
                  </dd>
                </div>
              )}
            </dl>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-wide text-[#52625a]">
                  Status
                </span>
                <select
                  value={selected.status}
                  disabled={busy}
                  onChange={(e) =>
                    void patchOrder(selected.id, { status: e.target.value })
                  }
                  className={`${inputClass} w-full`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-wide text-[#52625a]">
                  Driver
                </span>
                {driverSelect(selected, "w-full py-1.5 text-sm")}
              </label>
            </div>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-4 w-full rounded-[4px] border border-[#52625a]/50 px-3 py-2 text-sm text-[#faf9f6]/80 transition-colors hover:bg-[#1e2b23]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
