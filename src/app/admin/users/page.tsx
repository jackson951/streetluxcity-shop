"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { AdminUser } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";

function isUserEnabled(user: AdminUser) {
  if (typeof user.enabled === "boolean") return user.enabled;
  if (typeof user.accountNonLocked === "boolean") return user.accountNonLocked;
  return true;
}

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    api
      .adminListUsers(token)
      .then(setUsers)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (entry) =>
        entry.fullName?.toLowerCase().includes(q) ||
        entry.email?.toLowerCase().includes(q) ||
        entry.roles?.join(" ").toLowerCase().includes(q)
    );
  }, [query, users]);

  async function setAccess(target: AdminUser, enabled: boolean) {
    if (!token) return;
    setPendingUserId(target.id);
    setError(null);
    try {
      const updated = await api.adminSetUserAccess(token, target.id, enabled);
      setUsers((prev) =>
        prev.map((entry) =>
          entry.id === target.id
            ? {
                ...entry,
                ...updated,
                enabled
              }
            : entry
        )
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <RequireAdmin>
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Users</h1>
            <p className="mt-1 text-sm text-slate-600">Control account access across the platform.</p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none ring-brand-500 focus:ring"
          />
        </div>

        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading users...</p> : null}
        {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {!loading && !error && !filteredUsers.length ? <p className="rounded-xl bg-white p-4 text-sm">No users found.</p> : null}

        <div className="space-y-3">
          {filteredUsers.map((entry) => {
            const enabled = isUserEnabled(entry);
            const isCurrentUser = currentUser?.id === entry.id;
            const isPending = pendingUserId === entry.id;
            return (
              <article key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{entry.fullName}</p>
                    <p className="text-sm text-slate-600">{entry.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">Roles: {entry.roles?.join(", ") || "N/A"}</p>
                  {entry.createdAt ? <p className="text-xs text-slate-500">Created {formatDate(entry.createdAt)}</p> : null}
                </div>

                <div className="mt-4">
                  {enabled ? (
                    <button
                      onClick={() => setAccess(entry, false)}
                      disabled={isPending || isCurrentUser}
                      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending ? "Updating..." : isCurrentUser ? "Cannot disable self" : "Disable access"}
                    </button>
                  ) : (
                    <button
                      onClick={() => setAccess(entry, true)}
                      disabled={isPending}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending ? "Updating..." : "Enable access"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </RequireAdmin>
  );
}
