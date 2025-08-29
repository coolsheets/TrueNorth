import React from 'react';

export function StatusPill({ children }: { children?: React.ReactNode }){
  return <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-sm">{children}</span>;
}

export default StatusPill;
