import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, MapPin, Clock } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { authFetch } from "../api";
import { typeStyle, statusStyle, formatDate } from "../ui";

export default function MyActivity() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const load = async () => {
      try {
        const [r, c] = await Promise.all([
          authFetch("/my/items", user),
          authFetch("/claims/mine", user),
        ]);
        if ([r.status, c.status].some((s) => s === 401 || s === 403)) {
          logout();
          navigate("/login");
          return;
        }
        setReports(await r.json());
        setClaims(await c.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const tabs = [
    { key: "reports", label: `My Reports (${reports.length})` },
    { key: "claims", label: `My Claims (${claims.length})` },
  ];

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-2xl font-bold">My Activity</h1>
      <p className="mt-1 text-sm text-slate-500">Everything you reported and claimed.</p>

      <div className="mt-6 inline-flex rounded-xl bg-slate-200/70 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              tab === t.key ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="mt-6 text-slate-500">Loading...</p>}

      {!loading && tab === "reports" && (
        <div className="mt-6 grid gap-3">
          {reports.length === 0 && <Empty text="You have not reported anything yet." />}
          {reports.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeStyle[item.type] || ""}`}>{item.type}</span>
                  <h3 className="truncate font-semibold text-slate-900">{item.title}</h3>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={13} /> {item.location || "Unknown"}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {formatDate(item.eventTime)}</span>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[item.status] || ""}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "claims" && (
        <div className="mt-6 grid gap-3">
          {claims.length === 0 && <Empty text="You have not claimed anything yet." />}
          {claims.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-slate-900">{c.itemTitle}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[c.status] || ""}`}>
                  {c.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Your proof: {c.message}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Empty({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
      <Package className="mx-auto text-slate-300" size={36} />
      <p className="mt-3 text-sm text-slate-500">{text}</p>
    </div>
  );
}