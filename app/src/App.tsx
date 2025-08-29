// app/src/App.tsx
import { Link, Outlet, useLocation } from "react-router-dom";
import OfflineBadge from "./components/OfflineBadge";

export default function App() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
        <Link to="/" className="font-bold tracking-wide text-sky-400">
          PPI Canada
        </Link>
        <nav className="flex gap-4 text-sm opacity-90">
          <Link to="/start" className={pathname === "/start" ? "underline" : ""}>
            Start
          </Link>
          <Link to="/review" className={pathname === "/review" ? "underline" : ""}>
            Review
          </Link>
          <Link to="/export" className={pathname === "/export" ? "underline" : ""}>
            Export
          </Link>
        </nav>
      </header>

      <OfflineBadge />

      <main className="flex-1 p-4 max-w-3xl mx-auto w-full">
        <Outlet />
      </main>

      <footer className="px-4 py-3 border-t border-slate-800 text-sm text-slate-400 text-center">
        © {new Date().getFullYear()} PPI Canada
      </footer>
    </div>
  );
}
