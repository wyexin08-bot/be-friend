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

export function useTripSocket(tripId: string, user: { id: string; name: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [trip, setTrip] = useState<TripState | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-trip', { tripId, user });
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
      newSocket.close();
    };
  }, [tripId, user.id, user.name]);

  const updatePlot = useCallback((plotIndex: number, plotData: Partial<Plot>) => {
    if (socket && isConnected) {
      socket.emit('update-plot', { tripId, plotIndex, plotData });
    }
  }, [socket, isConnected, tripId]);

  const sendMessage = useCallback((text: string) => {
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
  }, [socket, isConnected, tripId, user]);

  return { trip, isConnected, updatePlot, sendMessage };
}
