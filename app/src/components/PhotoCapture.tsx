import { useRef } from 'react';

export default function PhotoCapture({ onSelect }: { onSelect: (file: File) => void }){
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2">
      <button className="px-3 py-1.5 rounded bg-sky-600" onClick={() => inputRef.current?.click()}>Add Photo</button>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
             onChange={e => { const f=e.target.files?.[0]; if (f) onSelect(f); }} />
    </div>
  );
}
