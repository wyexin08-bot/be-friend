import { Search, MapPin, Calendar, Users } from 'lucide-react';

export function Explore() {
  const buddies = [
    { id: 1, name: 'Alice Chen', destination: 'Kyoto, Japan', dates: 'Oct 10 - Oct 22', match: '98%', avatar: 'https://picsum.photos/seed/alice/100/100' },
    { id: 2, name: 'Bob Smith', destination: 'Kyoto, Japan', dates: 'Oct 12 - Oct 20', match: '85%', avatar: 'https://picsum.photos/seed/bob/100/100' },
    { id: 3, name: 'Charlie', destination: 'Osaka, Japan', dates: 'Oct 15 - Oct 25', match: '60%', avatar: 'https://picsum.photos/seed/charlie/100/100' },
  ];

  return (
    <div className="pt-20 pb-24 px-6 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold font-headline text-primary mb-6">Find Buddies</h2>
      
      <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl pixel-border-sm mb-8">
        <div className="flex items-center gap-3 mb-4 border-b border-stone-200 pb-3">
          <MapPin className="text-stone-400 w-5 h-5" />
          <input type="text" placeholder="Where to?" defaultValue="Kyoto, Japan" className="bg-transparent outline-none w-full font-body text-stone-700" />
        </div>
        <div className="flex items-center gap-3 mb-4 border-b border-stone-200 pb-3">
          <Calendar className="text-stone-400 w-5 h-5" />
          <input type="text" placeholder="Dates" defaultValue="Oct 2026" className="bg-transparent outline-none w-full font-body text-stone-700" />
        </div>
        <button className="w-full bg-primary text-white py-3 rounded-lg font-bold uppercase tracking-widest text-sm pixel-border-primary active:translate-y-1 transition-transform">
          Search
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4">Top Matches</h3>
        {buddies.map(buddy => (
          <div key={buddy.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl flex items-center gap-4 pixel-border-sm hover:scale-[1.02] transition-transform cursor-pointer">
            <img src={buddy.avatar} alt={buddy.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary-container" referrerPolicy="no-referrer" />
            <div className="flex-1">
              <h4 className="font-bold text-stone-800">{buddy.name}</h4>
              <p className="text-xs text-stone-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {buddy.destination}</p>
              <p className="text-xs text-stone-500 flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {buddy.dates}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">{buddy.match} Match</span>
              <button className="text-primary bg-primary-container/50 p-2 rounded-full hover:bg-primary hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
