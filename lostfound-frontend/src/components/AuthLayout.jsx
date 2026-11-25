import { Search, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-[calc(100vh-62px)] place-items-center bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-100 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20">
            <Search size={22} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold leading-tight">
              Get your belongings back, faster.
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-indigo-100">
              <li className="flex items-center gap-2">
                <Sparkles size={16} /> Smart matching of lost and found items
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} /> Verified claims, no fake owners
              </li>
            </ul>
          </div>
          <p className="text-xs text-indigo-200">FindIt · Campus Lost &amp; Found</p>
        </div>

        <div className="p-8 sm:p-10">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
        </div>
      </div>
    </div>
  );
}