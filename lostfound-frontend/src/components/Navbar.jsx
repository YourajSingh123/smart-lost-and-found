import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Plus, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const linkClass = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleReport = () => {
    if (!user) return navigate("/login");
    navigate("/", { state: { openForm: Date.now() } });
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
              <Search size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Find<span className="text-indigo-600">It</span>
            </span>
          </Link>
          {user && (
            <div className="hidden items-center gap-1 sm:flex">
              <NavLink to="/my" className={linkClass}>My Activity</NavLink>
              {user.role === "ADMIN" && (
                <NavLink to="/admin" className={linkClass}>Admin</NavLink>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
              </div>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
                Login
              </Link>
              <Link to="/register" className="hidden rounded-xl px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 sm:block">
                Sign up
              </Link>
            </>
          )}
          <button
            onClick={handleReport}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={16} /> Report Item
          </button>
        </div>
      </div>
    </nav>
  );
}