import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, MapPin, Clock, X, Package, Sparkles } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { API_BASE, authFetch } from "../api";
import { typeStyle, statusStyle, formatDate } from "../ui";

const emptyForm = {
  type: "LOST",
  title: "",
  category: "",
  color: "",
  brand: "",
  location: "",
  description: "",
};

const TABS = ["ALL", "LOST", "FOUND"];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export default function Home() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");

  const [claimItem, setClaimItem] = useState(null);
  const [claimMsg, setClaimMsg] = useState("");
  const [claimError, setClaimError] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);
  const [toast, setToast] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const loadItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/items`);
      setItems(await res.json());
    } catch (err) {
      console.error("Could not load items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Navbar "Report Item" button sends us here with openForm state
  useEffect(() => {
    if (location.state?.openForm) setShowForm(true);
  }, [location.state]);

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(""), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!user) return navigate("/login");

    try {
      const res = await authFetch("/items", user, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          eventTime: new Date().toISOString().slice(0, 19),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }
      if (!res.ok) {
        setFormError("Could not submit the report. Try again.");
        return;
      }
      setForm(emptyForm);
      setShowForm(false);
      loadItems();
      showToast("Report submitted.");
    } catch {
      setFormError("Cannot reach the server. Is the backend running?");
    }
  };

  const submitClaim = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    setClaimBusy(true);
    setClaimError("");
    try {
      const res = await authFetch("/claims", user, {
        method: "POST",
        body: JSON.stringify({ itemId: claimItem.id, message: claimMsg }),
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        setClaimError(
          text && !text.startsWith("{")
            ? text
            : "Please describe how you can prove this item is yours."
        );
        return;
      }
      setClaimItem(null);
      setClaimMsg("");
      showToast("Claim submitted! An admin will review it.");
    } catch {
      setClaimError("Cannot reach the server.");
    } finally {
      setClaimBusy(false);
    }
  };

  const closeClaim = () => {
    setClaimItem(null);
    setClaimMsg("");
    setClaimError("");
  };

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchType = filter === "ALL" || item.type === filter;
        const text =
          `${item.title} ${item.category} ${item.color} ${item.brand} ${item.location}`.toLowerCase();
        return matchType && text.includes(search.toLowerCase());
      })
      .sort((a, b) => b.id - a.id);
  }, [items, filter, search]);

  const lostCount = items.filter((i) => i.type === "LOST").length;
  const foundCount = items.filter((i) => i.type === "FOUND").length;

  return (
    <>
      {/* Hero */}
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 text-center sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Sparkles size={14} /> Smart matching for your campus
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Lost something? Found something?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Report it in seconds. We help you get it back to the right person.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-xl">
            <Search className="ml-3 shrink-0 text-slate-400" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by item, color, brand or location..."
              className="w-full bg-transparent px-2 py-2 text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="mt-8 flex justify-center gap-8 text-sm">
            <div>
              <div className="text-2xl font-bold">{lostCount}</div>
              <div className="text-indigo-100">Lost reports</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{foundCount}</div>
              <div className="text-indigo-100">Found reports</div>
            </div>
          </div>
        </div>
      </header>

      {/* Listing */}
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Recent reports</h2>
          <div className="flex rounded-xl bg-slate-200/70 p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                  filter === t
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t === "ALL" ? "All" : t === "LOST" ? "Lost" : "Found"}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-slate-500">Loading...</p>}

        {!loading && visibleItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Package className="mx-auto text-slate-300" size={40} />
            <p className="mt-3 font-medium text-slate-600">No items found</p>
            <p className="text-sm text-slate-400">
              Try a different search or report a new item.
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative grid h-40 place-items-center bg-gradient-to-br from-slate-100 to-slate-200">
                <Package className="text-slate-400" size={44} />
                <span
                  className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${typeStyle[item.type] || ""}`}
                >
                  {item.type}
                </span>
                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[item.status] || "bg-slate-100 text-slate-600"}`}
                >
                  {item.status}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {[item.category, item.color, item.brand].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {item.location || "Unknown"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {formatDate(item.eventTime)}
                  </span>
                </div>

                {item.type === "FOUND" && item.status === "OPEN" && (
                  <button
                    onClick={() => (user ? setClaimItem(item) : navigate("/login"))}
                    className="mt-4 w-full rounded-xl bg-indigo-50 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    This is mine · Claim
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Report modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Report an item</h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {["LOST", "FOUND"].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setForm({ ...form, type: t })}
                    className={`rounded-lg py-2 text-sm font-semibold transition ${
                      form.type === t
                        ? t === "LOST"
                          ? "bg-rose-500 text-white shadow"
                          : "bg-emerald-500 text-white shadow"
                        : "text-slate-500"
                    }`}
                  >
                    I {t === "LOST" ? "lost" : "found"} something
                  </button>
                ))}
              </div>

              <input
                name="title"
                placeholder="Item name *"
                value={form.title}
                onChange={handleChange}
                required
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="category"
                  placeholder="Category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  name="color"
                  placeholder="Color"
                  value={form.color}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="brand"
                  placeholder="Brand"
                  value={form.brand}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  name="location"
                  placeholder="Location"
                  value={form.location}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <textarea
                name="description"
                placeholder="Description (marks, stickers, details...)"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className={inputClass}
              />

              {formError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="mt-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Submit report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Claim modal */}
      {claimItem && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Claim this item</h2>
              <button
                onClick={closeClaim}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-600">
              <span className="font-semibold">{claimItem.title}</span>. Describe something only
              the real owner would know (marks, stickers, contents, lock screen...).
            </p>
            <form onSubmit={submitClaim} className="grid gap-3">
              <textarea
                rows={4}
                value={claimMsg}
                onChange={(e) => setClaimMsg(e.target.value)}
                placeholder="Proof of ownership"
                required
                maxLength={1000}
                className={inputClass}
              />
              {claimError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {claimError}
                </p>
              )}
              <button
                type="submit"
                disabled={claimBusy}
                className="rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {claimBusy ? "Submitting..." : "Submit claim"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </>
  );
}