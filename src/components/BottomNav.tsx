import { Tractor, Map, BookOpen, Settings } from 'lucide-react';
import { clsx } from 'clsx';

type Tab = 'plots' | 'explore' | 'journal' | 'settings';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'plots', icon: Tractor, label: 'My Plots' },
    { id: 'explore', icon: Map, label: 'Explore' },
    { id: 'journal', icon: BookOpen, label: 'Journal' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <nav className="fixed bottom-0 w-full flex justify-around items-center h-20 px-4 pb-safe bg-white/60 backdrop-blur-lg z-50 shadow-[0_-4px_0_0_var(--color-surface-variant)]">
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={clsx(
              "flex flex-col items-center justify-center p-2 transition-all cursor-pointer",
              isActive 
                ? "bg-emerald-100 text-emerald-900 shadow-[4px_4px_0_0_var(--color-primary)] scale-95" 
                : "text-stone-500 hover:text-rose-700"
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
