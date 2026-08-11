"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * /admin/login — the admin entry point.
 *
 * Single password field. POSTs to /api/admin/login, which sets the
 * admin_token httpOnly cookie on success. Then redirects to /admin.
 *
 * This page is intentionally NOT styled with the SDX brand — it's a
 * stripped-down operational tool, not a marketing surface.
 */

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Login failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center font-heading text-2xl font-bold text-ivory">
          SDX Admin
        </h1>
        <p className="mb-6 text-center text-sm text-ivory/60">
          Sign in to view leads and orders
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-forest-highlight bg-forest-light p-6"
        >
          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-sm font-medium text-ivory"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-forest-highlight bg-forest-dark px-3.5 py-2.5 text-sm text-ivory focus:outline-none focus:ring-2 focus:ring-brass focus:border-brass"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-md bg-brass px-5 py-2.5 text-sm font-bold text-forest transition-colors hover:brightness-105 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ivory/40">
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
