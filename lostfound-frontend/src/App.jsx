import { useEffect, useMemo, useState } from "react";
import { Search, Plus, MapPin, Clock, X, Package, Sparkles } from "lucide-react";

const API = "http://localhost:8081/api/items";

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

const typeStyle = {
  LOST: "bg-rose-100 text-rose-700",
  FOUND: "bg-emerald-100 text-emerald-700",
};

const statusStyle = {
  OPEN: "bg-amber-100 text-amber-700",
  MATCHED: "bg-sky-100 text-sky-700",
  CLAIMED: "bg-violet-100 text-violet-700",
  RETURNED: "bg-slate-200 text-slate-600",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      const res = await fetch(API);
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        eventTime: new Date().toISOString().slice(0, 19),
      }),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadItems();
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
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
              <Search size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Find<span className="text-indigo-600">It</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:block">
              Login
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus size={16} /> Report Item
            </button>
          </div>
        </div>
      </nav>

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
                  {[item.category, item.color, item.brand]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {item.location || "Unknown"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {formatDate(item.eventTime)}
                  </span>
                </div>
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
    </div>
  );
}