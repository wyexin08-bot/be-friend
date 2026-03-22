import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type PlotType = 'empty' | 'stay' | 'eat' | 'explore' | 'event';

export interface Plot {
  id: string;
  type: PlotType;
  title?: string;
  description?: string;
  time?: string;
  addedBy?: string;
  date?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface TripState {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  plots: Plot[];
  messages: ChatMessage[];
  users: { id: string; name: string }[];
}

const SOCKET_URL = '/'; // Since we are serving from the same host

// Fallback generator for offline/static hosting (like Cloudflare Pages)
const generateFallbackPlots = (start: string, end: string) => {
  const plots: Plot[] = [];
  let curr = new Date(start);
  const endDate = new Date(end);
  let id = 0;
  while (curr <= endDate) {
    const dateStr = curr.toISOString().split('T')[0];
    for (let i = 0; i < 9; i++) {
      plots.push({ id: `plot-${id++}`, type: 'empty', date: dateStr });
    }
    curr.setDate(curr.getDate() + 1);
  }
  return plots;
};

export function useTripSocket(tripId: string, user: { id: string; name: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [trip, setTrip] = useState<TripState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      timeout: 3000,
      reconnectionAttempts: 2
    });
    setSocket(newSocket);

    // Fallback timer: if we don't connect in 2 seconds, assume offline mode
    const fallbackTimer = setTimeout(() => {
      if (!isConnected) {
        console.warn('Socket connection timeout. Falling back to offline mode.');
        setIsOfflineMode(true);
        const start = new Date().toISOString().split('T')[0];
        const end = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setTrip({
          id: tripId,
          name: 'Offline Trip (Local)',
          destination: 'Local',
          startDate: start,
          endDate: end,
          plots: generateFallbackPlots(start, end),
          messages: [],
          users: [user],
        });
      }
    }, 2000);

    newSocket.on('connect', () => {
      clearTimeout(fallbackTimer);
      setIsConnected(true);
      setIsOfflineMode(false);
      newSocket.emit('join-trip', { tripId, user });
    });

    newSocket.on('connect_error', () => {
      // Don't clear timer here, let it trigger the fallback
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('trip-state', (state: TripState) => {
      setTrip(state);
    });

    newSocket.on('plot-updated', ({ index, plot }) => {
      setTrip(prev => {
        if (!prev) return prev;
        const newPlots = [...prev.plots];
        newPlots[index] = plot;
        return { ...prev, plots: newPlots };
      });
    });

    newSocket.on('new-message', (message: ChatMessage) => {
      setTrip(prev => {
        if (!prev) return prev;
        return { ...prev, messages: [...prev.messages, message] };
      });
    });

    newSocket.on('users-updated', (users) => {
      setTrip(prev => {
        if (!prev) return prev;
        return { ...prev, users };
      });
    });

    return () => {
      clearTimeout(fallbackTimer);
      newSocket.close();
    };
  }, [tripId, user.id, user.name]);

  const updatePlot = useCallback((plotIndex: number, plotData: Partial<Plot>) => {
    if (isOfflineMode) {
      setTrip(prev => {
        if (!prev) return prev;
        const newPlots = [...prev.plots];
        newPlots[plotIndex] = { ...newPlots[plotIndex], ...plotData };
        return { ...prev, plots: newPlots };
      });
      return;
    }
    
    if (socket && isConnected) {
      socket.emit('update-plot', { tripId, plotIndex, plotData });
    }
  }, [socket, isConnected, tripId, isOfflineMode]);

  const sendMessage = useCallback((text: string) => {
    const newMessage = {
      id: Math.random().toString(36).substring(7),
      userId: user.id,
      userName: user.name,
      text,
      timestamp: new Date().toISOString(),
    };

    if (isOfflineMode) {
      setTrip(prev => {
        if (!prev) return prev;
        return { ...prev, messages: [...prev.messages, newMessage] };
      });
      return;
    }

    if (socket && isConnected) {
      socket.emit('send-message', {
        tripId,
        message: {
          userId: user.id,
          userName: user.name,
          text,
        }
      });
    }
  }, [socket, isConnected, tripId, user, isOfflineMode]);

  return { trip, isConnected, updatePlot, sendMessage, isOfflineMode };
}
