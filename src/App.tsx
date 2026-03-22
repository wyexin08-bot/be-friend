import { useState, useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { MyPlots } from './views/MyPlots';
import { Explore } from './views/Explore';
import { Journal } from './views/Journal';
import { Settings } from './views/Settings';
import { useTripSocket } from './hooks/useTripSocket';

type Tab = 'plots' | 'explore' | 'journal' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('plots');
  
  // Generate a random user ID for this session
  const currentUser = useMemo(() => ({
    id: `user-${Math.random().toString(36).substring(7)}`,
    name: `Traveler ${Math.floor(Math.random() * 1000)}`
  }), []);

  const { trip, isConnected, updatePlot, sendMessage } = useTripSocket('kyoto-2026', currentUser);

  return (
    <div className="h-full w-full flex flex-col bg-surface text-on-surface font-body selection:bg-primary-container overflow-hidden">
      <TopBar />
      
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'plots' && <MyPlots trip={trip} onUpdatePlot={updatePlot} />}
        {activeTab === 'explore' && <Explore />}
        {activeTab === 'journal' && <Journal messages={trip?.messages || []} onSendMessage={sendMessage} currentUser={currentUser} />}
        {activeTab === 'settings' && <Settings />}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Background Decorations */}
      <div className="fixed top-1/2 -left-12 opacity-10 pointer-events-none z-[-1]">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[200px] h-[200px] text-primary">
          <path d="M17 12h2L12 2 5 12h2v8H5v2h14v-2h-2v-8z" />
        </svg>
      </div>
      <div className="fixed bottom-32 -right-8 opacity-10 pointer-events-none z-[-1]">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[150px] h-[150px] text-secondary">
          <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z" />
        </svg>
      </div>
    </div>
  );
}

