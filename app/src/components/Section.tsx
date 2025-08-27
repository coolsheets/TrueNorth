import { StatusPill } from './StatusPill';

export default function Section({ title, children }: any){
  return (
    <section className="mb-8 p-4 bg-slate-900 rounded-xl border border-slate-800">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
