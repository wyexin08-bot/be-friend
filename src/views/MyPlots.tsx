import React, { useState, useEffect, useMemo } from 'react';
import { Home, Utensils, Map as MapIcon, Ticket, Plus, Package, X, Clock, AlignLeft, Type, CalendarDays, LayoutGrid, Layers } from 'lucide-react';
import { clsx } from 'clsx';
import { Plot, PlotType, TripState } from '../hooks/useTripSocket';

interface MyPlotsProps {
  trip: TripState | null;
  onUpdatePlot: (index: number, data: Partial<Plot>) => void;
}

export function MyPlots({ trip, onUpdatePlot }: MyPlotsProps) {
  const [selectedPlotIndex, setSelectedPlotIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'schedule' | 'category'>('grid');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (trip && !selectedDate) {
      setSelectedDate(trip.startDate);
    }
  }, [trip, selectedDate]);

  const dates = useMemo(() => {
    if (!trip) return [];
    const d = [];
    let curr = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    while (curr <= end) {
      d.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return d;
  }, [trip]);

  const plotsByCategory = useMemo(() => {
    if (!trip) return {};
    const grouped: Record<string, { plot: Plot, index: number }[]> = {
      stay: [],
      eat: [],
      explore: [],
      event: []
    };
    trip.plots.forEach((plot, index) => {
      if (plot.type !== 'empty') {
        if (!grouped[plot.type]) grouped[plot.type] = [];
        grouped[plot.type].push({ plot, index });
      }
    });
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        if (a.plot.date !== b.plot.date) return (a.plot.date || '').localeCompare(b.plot.date || '');
        return (a.plot.time || '').localeCompare(b.plot.time || '');
      });
    });
    return grouped;
  }, [trip]);

  if (!trip || !selectedDate) {
    return <div className="flex items-center justify-center h-full">Loading Garden...</div>;
  }

  const handlePlotClick = (index: number) => {
    setSelectedPlotIndex(index);
  };

  const handleAddPlan = (type: PlotType) => {
    if (selectedPlotIndex !== null) {
      onUpdatePlot(selectedPlotIndex, { type, title: `New ${type}` });
      setSelectedPlotIndex(null);
    }
  };

  const currentPlotsWithIndex = trip.plots
    .map((plot, index) => ({ plot, index }))
    .filter(item => item.plot.date === selectedDate);

  const schedulePlots = trip.plots
    .map((plot, index) => ({ plot, index }))
    .filter(item => item.plot.type !== 'empty')
    .sort((a, b) => {
      if (a.plot.date !== b.plot.date) return (a.plot.date || '').localeCompare(b.plot.date || '');
      return (a.plot.time || '').localeCompare(b.plot.time || '');
    });

  const scheduleByDate = schedulePlots.reduce((acc, item) => {
    const d = item.plot.date || 'Unknown';
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {} as Record<string, typeof schedulePlots>);

  return (
    <main className="relative w-full h-full overflow-hidden pt-16 pb-20 flex flex-col">
      {/* Header Info & View Toggle */}
      <div className="px-6 pt-6 pb-2 shrink-0 flex justify-between items-end">
        <div className="space-y-1">
          <p className="font-headline text-on-surface-variant text-sm uppercase tracking-[0.2em]">Current Estate</p>
          <h2 className="font-headline text-3xl font-bold text-primary">{trip.name}</h2>
        </div>
        <div className="flex bg-stone-200/50 p-1 rounded-lg">
          <button onClick={() => setViewMode('grid')} className={clsx("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-primary" : "text-stone-400")}>
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button onClick={() => setViewMode('schedule')} className={clsx("p-2 rounded-md transition-all", viewMode === 'schedule' ? "bg-white shadow-sm text-primary" : "text-stone-400")}>
            <CalendarDays className="w-5 h-5" />
          </button>
          <button onClick={() => setViewMode('category')} className={clsx("p-2 rounded-md transition-all", viewMode === 'category' ? "bg-white shadow-sm text-primary" : "text-stone-400")}>
            <Layers className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Date Slider */}
      <div className="w-full overflow-x-auto hide-scrollbar px-6 py-4 shrink-0 flex gap-3 snap-x">
        {dates.map((date, i) => {
          const isSelected = date === selectedDate;
          const dateObj = new Date(date);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.getDate();
          return (
            <button
              key={date}
              onClick={() => {
                setSelectedDate(date);
                setViewMode('grid');
              }}
              className={clsx(
                "snap-start shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl pixel-border-sm transition-all",
                isSelected ? "bg-primary text-white scale-105 shadow-md" : "bg-white/60 text-stone-500 hover:bg-white"
              )}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Day {i + 1}</span>
              <span className="text-xl font-headline font-bold mt-1">{dayNum}</span>
              <span className="text-[10px] uppercase">{dayName}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative">
        {viewMode === 'grid' ? (
          <div className="w-full h-full flex items-center justify-center p-4 md:p-8 min-h-[400px]">
            <div className="isometric-container grid grid-cols-3 grid-rows-3 gap-4 md:gap-8 lg:gap-12 w-full max-w-[600px] aspect-square">
              {currentPlotsWithIndex.map(({ plot, index }) => (
                <PlotCell 
                  key={plot.id} 
                  plot={plot} 
                  onClick={() => handlePlotClick(index)} 
                  isSelected={selectedPlotIndex === index}
                />
              ))}
            </div>
          </div>
        ) : viewMode === 'schedule' ? (
          <div className="px-6 py-4 space-y-8">
            {dates.map(date => {
              const dayPlots = scheduleByDate[date] || [];
              const dateObj = new Date(date);
              return (
                <div key={date} className="relative">
                  <div className="sticky top-0 bg-surface/90 backdrop-blur-md py-2 z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex flex-col items-center justify-center shrink-0 pixel-border-sm">
                      <span className="text-sm font-bold">{dateObj.getDate()}</span>
                      <span className="text-[8px] uppercase font-bold">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                    <div className="h-px bg-stone-200 flex-1"></div>
                  </div>
                  
                  <div className="pl-6 mt-4 space-y-4 border-l-2 border-stone-100 ml-6">
                    {dayPlots.length === 0 ? (
                      <div className="text-sm text-stone-400 italic py-4 pl-4">No plans yet. Switch to Garden view to plant some seeds!</div>
                    ) : (
                      dayPlots.map(({ plot, index }) => (
                        <div 
                          key={plot.id} 
                          onClick={() => handlePlotClick(index)}
                          className="relative bg-white p-4 rounded-xl pixel-border-sm cursor-pointer hover:scale-[1.02] transition-transform ml-4"
                        >
                          <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-surface"></div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-primary bg-primary-container px-2 py-1 rounded uppercase tracking-widest">{plot.type}</span>
                            <span className="text-xs font-bold text-stone-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {plot.time || 'TBD'}</span>
                          </div>
                          <h4 className="font-bold text-stone-800 text-lg">{plot.title || plot.type}</h4>
                          {plot.description && <p className="text-sm text-stone-500 mt-2 line-clamp-2">{plot.description}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-4 space-y-8">
            {Object.entries(plotsByCategory).map(([type, items]) => {
              const plotItems = items as { plot: Plot, index: number }[];
              if (plotItems.length === 0) return null;
              let Icon = Plus;
              let colorClass = '';
              let bgClass = '';
              switch(type) {
                case 'stay': Icon = Home; colorClass = 'text-primary'; bgClass = 'bg-primary-container'; break;
                case 'eat': Icon = Utensils; colorClass = 'text-secondary'; bgClass = 'bg-secondary-container'; break;
                case 'explore': Icon = MapIcon; colorClass = 'text-tertiary'; bgClass = 'bg-tertiary-container'; break;
                case 'event': Icon = Ticket; colorClass = 'text-primary'; bgClass = 'bg-primary-container'; break;
              }

              return (
                <div key={type} className="relative">
                  <div className="sticky top-0 bg-surface/90 backdrop-blur-md py-2 z-10 flex items-center gap-3">
                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 pixel-border-sm", bgClass, colorClass)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-headline font-bold text-xl capitalize text-stone-800">{type} Collection</h3>
                    <div className="h-px bg-stone-200 flex-1 ml-2"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {plotItems.map(({ plot, index }) => {
                      const dateObj = new Date(plot.date || '');
                      const dateStr = isNaN(dateObj.getTime()) ? 'TBD' : `${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                      return (
                        <div
                          key={plot.id}
                          onClick={() => handlePlotClick(index)}
                          className="bg-white p-4 rounded-xl pixel-border-sm cursor-pointer hover:scale-[1.02] transition-transform flex gap-4 items-start"
                        >
                          <div className="flex flex-col items-center justify-center bg-stone-100 rounded-lg p-2 min-w-[3.5rem]">
                            <span className="text-xs font-bold text-stone-500 uppercase">{dateStr.split(' ')[0]}</span>
                            <span className="text-lg font-headline font-bold text-stone-800">{dateStr.split(' ')[1] || '-'}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-stone-800">{plot.title || plot.type}</h4>
                              <span className="text-xs font-bold text-stone-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {plot.time || 'TBD'}</span>
                            </div>
                            {plot.description && <p className="text-sm text-stone-500 line-clamp-2">{plot.description}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Inventory Button */}
      {viewMode === 'grid' && (
        <button className="absolute right-6 bottom-6 z-20 bg-primary text-white w-14 h-14 flex items-center justify-center pixel-border-primary active:translate-y-1 transition-all">
          <Package className="w-8 h-8" />
        </button>
      )}

      {/* Modal for adding plan */}
      {selectedPlotIndex !== null && trip.plots[selectedPlotIndex].type === 'empty' && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full pixel-border-primary">
            <h3 className="text-xl font-bold mb-4 font-headline text-primary">Plant a new seed</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleAddPlan('stay')} className="p-4 bg-primary-container/60 text-primary flex flex-col items-center gap-2 pixel-border-primary hover:scale-105 transition-transform">
                <Home /> <span className="text-xs font-bold uppercase tracking-widest">Stay</span>
              </button>
              <button onClick={() => handleAddPlan('eat')} className="p-4 bg-secondary-container/60 text-secondary flex flex-col items-center gap-2 pixel-border-secondary hover:scale-105 transition-transform">
                <Utensils /> <span className="text-xs font-bold uppercase tracking-widest">Eat</span>
              </button>
              <button onClick={() => handleAddPlan('explore')} className="p-4 bg-tertiary-container/60 text-tertiary flex flex-col items-center gap-2 pixel-border-tertiary hover:scale-105 transition-transform">
                <MapIcon /> <span className="text-xs font-bold uppercase tracking-widest">Explore</span>
              </button>
              <button onClick={() => handleAddPlan('event')} className="p-4 bg-primary-container/60 text-primary flex flex-col items-center gap-2 pixel-border-primary hover:scale-105 transition-transform">
                <Ticket /> <span className="text-xs font-bold uppercase tracking-widest">Event</span>
              </button>
            </div>
            <button onClick={() => setSelectedPlotIndex(null)} className="mt-6 w-full p-2 text-stone-500 font-bold uppercase tracking-widest text-sm hover:bg-stone-100">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal for co-creating an existing plan */}
      {selectedPlotIndex !== null && trip.plots[selectedPlotIndex].type !== 'empty' && (
        <PlotDetailModal 
          plot={trip.plots[selectedPlotIndex]} 
          onClose={() => setSelectedPlotIndex(null)} 
          onUpdate={(data) => onUpdatePlot(selectedPlotIndex, data)}
        />
      )}
    </main>
  );
}

function PlotCell({ plot, onClick, isSelected }: { key?: string | number, plot: Plot, onClick: () => void, isSelected: boolean }) {
  const isFilled = plot.type !== 'empty';
  
  const getStyles = () => {
    switch (plot.type) {
      case 'stay': return 'bg-primary-container/60 text-primary pixel-border-primary active-plot-shadow';
      case 'eat': return 'bg-secondary-container/60 text-secondary pixel-border-secondary plot-shadow';
      case 'explore': return 'bg-tertiary-container/60 text-tertiary pixel-border-tertiary plot-shadow';
      case 'event': return 'bg-primary-container/60 text-primary pixel-border-primary plot-shadow';
      default: return 'bg-white/40 text-outline-variant pixel-border-sm plot-shadow hover:bg-white/60 hover:text-primary';
    }
  };

  const getIcon = () => {
    switch (plot.type) {
      case 'stay': return <Home className="w-8 h-8 mb-2" />;
      case 'eat': return <Utensils className="w-8 h-8 mb-2" />;
      case 'explore': return <MapIcon className="w-8 h-8 mb-2" />;
      case 'event': return <Ticket className="w-8 h-8 mb-2" />;
      default: return <Plus className="w-6 h-6" />;
    }
  };

  return (
    <div className="relative group cursor-pointer transition-all active:translate-y-1" onClick={onClick}>
      <div className={clsx(
        "w-full h-full glass-effect flex flex-col items-center justify-center transform transition-transform",
        getStyles(),
        isFilled && "p-4 group-hover:scale-105",
        isSelected && "ring-4 ring-rose-400 ring-offset-4"
      )}>
        {getIcon()}
        {isFilled && (
          <span className="font-label text-[10px] font-bold uppercase tracking-widest text-center px-1 truncate w-full">
            {plot.title || plot.type}
          </span>
        )}
      </div>
    </div>
  );
}

function PlotDetailModal({ plot, onClose, onUpdate }: { plot: Plot, onClose: () => void, onUpdate: (data: Partial<Plot>) => void }) {
  const [title, setTitle] = useState(plot.title || '');
  const [time, setTime] = useState(plot.time || '');
  const [description, setDescription] = useState(plot.description || '');

  useEffect(() => {
    setTitle(plot.title || '');
    setTime(plot.time || '');
    setDescription(plot.description || '');
  }, [plot]);

  const handleBlur = () => {
    onUpdate({ title, time, description });
  };

  const getIcon = () => {
    switch (plot.type) {
      case 'stay': return <Home className="w-6 h-6 text-primary" />;
      case 'eat': return <Utensils className="w-6 h-6 text-secondary" />;
      case 'explore': return <MapIcon className="w-6 h-6 text-tertiary" />;
      case 'event': return <Ticket className="w-6 h-6 text-primary" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full pixel-border-primary overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-bold uppercase tracking-widest text-sm text-stone-700">{plot.type}</span>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 transition-colors rounded-full hover:bg-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
              <Type className="w-4 h-4" /> Title
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g., Sushi Dai"
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-stone-800"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
              <Clock className="w-4 h-4" /> Time
            </label>
            <input 
              type="text" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g., 18:00 - 20:00"
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-stone-800"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
              <AlignLeft className="w-4 h-4" /> Shared Notes
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleBlur}
              placeholder="Add notes, links, or ideas here... Everyone can see and edit this."
              rows={4}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-stone-800 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
