import { Grid, UserCircle } from 'lucide-react';

export function TopBar() {
  return (
    <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-white/70 backdrop-blur-xl z-50 shadow-[0_4px_0_0_var(--color-surface-variant)]">
      <div className="flex items-center gap-4">
        <Grid className="text-rose-900 w-6 h-6" />
        <h1 className="text-2xl font-bold tracking-tighter text-rose-900 font-headline">Digital Garden</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-stone-100/50 transition-colors rounded-full">
          <UserCircle className="text-rose-900 w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
