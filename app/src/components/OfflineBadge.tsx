import { useEffect, useState } from 'react';
export default function OfflineBadge(){
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (online) return null;
  return <div className="bg-amber-500 text-black text-sm p-2 text-center">Offline mode – changes will sync when online</div>;
}
