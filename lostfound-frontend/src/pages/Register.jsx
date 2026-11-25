import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../auth/AuthContext";
import { API_BASE } from "../api";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 409) {
        setError("This email is already registered. Try logging in.");
        return;
      }
      if (res.status === 400) {
        setError("Please enter a valid email and a password of at least 6 characters.");
        return;
      }
      if (!res.ok) {
        setError("Something went wrong. Try again.");
        return;
      }
      login(await res.json());
      navigate("/");
    } catch {
      setError("Cannot reach the server. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="relative">
          <User className="absolute left-3 top-3 text-slate-400" size={18} />
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required className={inputClass} />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className={inputClass} />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
          <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} required minLength={6} className={inputClass} />
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </AuthLayout>
  );
}