import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, PackageCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { authFetch } from "../api";
import { statusStyle } from "../ui";

const TABS = ["PENDING", "APPROVED", "REJECTED"];

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("PENDING");
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const load = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    try {
      const res = await authFetch(`/admin/claims?status=${tab}`, user);
      if (res.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      if (res.ok) setClaims(await res.json());
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, tab]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    load();
  }, [load]);

  const act = async (url, okText) => {
    setMsg("");
    const res = await authFetch(url, user, { method: "PATCH" });
    if (res.ok) {
      setMsg(okText);
      load();
    } else {
      const text = await res.text();
      setMsg(text && !text.startsWith("{") ? text : "Action failed.");
    }
  };

  if (user && !isAdmin) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <ShieldAlert className="mx-auto text-rose-400" size={40} />
        <h1 className="mt-3 text-xl font-bold">Admins only</h1>
        <p className="mt-1 text-sm text-slate-500">You do not have access to this page.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Review claims and hand over items.</p>

      <div className="mt-6 inline-flex rounded-xl bg-slate-200/70 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
              tab === t ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.toLowerCase()}
          </button>
        ))}
      </div>

      {msg && (
        <p className="mt-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">{msg}</p>
      )}
      {loading && <p className="mt-6 text-slate-500">Loading...</p>}

      {!loading && claims.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">
          No {tab.toLowerCase()} claims.
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {claims.map((c) => (
          <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{c.itemTitle}</h3>
                <p className="text-xs text-slate-500">
                  Claimed by {c.claimerName} ({c.claimerEmail})
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[c.status] || ""}`}>
                {c.status}
              </span>
            </div>

            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{c.message}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {c.status === "PENDING" && (
                <>
                  <button
                    onClick={() => act(`/admin/claims/${c.id}/approve`, "Claim approved.")}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    onClick={() => act(`/admin/claims/${c.id}/reject`, "Claim rejected.")}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    <X size={16} /> Reject
                  </button>
                </>
              )}
              {c.status === "APPROVED" && (
                <button
                  onClick={() => act(`/admin/items/${c.itemId}/returned`, "Item marked as returned.")}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <PackageCheck size={16} /> Mark as returned
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}