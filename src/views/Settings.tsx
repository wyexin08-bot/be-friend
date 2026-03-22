import { User, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';

export function Settings() {
  return (
    <div className="pt-20 pb-24 px-6 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold font-headline text-primary mb-6">Settings</h2>
      
      <div className="bg-white/60 backdrop-blur-md rounded-2xl pixel-border-sm overflow-hidden mb-6">
        <div className="p-4 flex items-center gap-4 border-b border-stone-200">
          <img src="https://picsum.photos/seed/me/100/100" alt="Profile" className="w-16 h-16 rounded-full border-2 border-primary-container" referrerPolicy="no-referrer" />
          <div>
            <h3 className="font-bold text-stone-800 text-lg">Traveler</h3>
            <p className="text-sm text-stone-500">Level 12 Architect</p>
          </div>
        </div>
        
        <div className="divide-y divide-stone-100">
          <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-3 text-stone-700">
              <User className="w-5 h-5 text-stone-400" />
              <span className="font-medium">Edit Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-3 text-stone-700">
              <Bell className="w-5 h-5 text-stone-400" />
              <span className="font-medium">Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-3 text-stone-700">
              <Shield className="w-5 h-5 text-stone-400" />
              <span className="font-medium">Privacy & Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300" />
          </button>
        </div>
      </div>

      <button className="w-full bg-rose-50 text-rose-600 flex items-center justify-center gap-2 p-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-rose-100 transition-colors pixel-border-sm">
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </div>
  );
}
