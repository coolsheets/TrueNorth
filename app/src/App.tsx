import { Link, Outlet, useLocation } from 'react-router-dom';
import OfflineBadge from './components/OfflineBadge';

export default function App(){
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <Link to="/" className="font-bold tracking-wide">PPI Canada</Link>
        <nav className="flex gap-4 text-sm opacity-80">
          <Link to="/start" className={pathname==='/start'? 'underline':''}>Start</Link>
          <Link to="/review">Review</Link>
          <Link to="/export">Export</Link>
        </nav>
      </header>
      <OfflineBadge />
      <main className="p-4 max-w-3xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
