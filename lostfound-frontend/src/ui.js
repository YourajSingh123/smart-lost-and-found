export const typeStyle = {
  LOST: "bg-rose-100 text-rose-700",
  FOUND: "bg-emerald-100 text-emerald-700",
};

export const statusStyle = {
  OPEN: "bg-amber-100 text-amber-700",
  MATCHED: "bg-sky-100 text-sky-700",
  CLAIMED: "bg-violet-100 text-violet-700",
  RETURNED: "bg-slate-200 text-slate-600",
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}