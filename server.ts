import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

const PORT = 3000;

type PlotType = 'empty' | 'stay' | 'eat' | 'explore' | 'event';

interface Plot {
  id: string;
  type: PlotType;
  title?: string;
  description?: string;
  time?: string;
  addedBy?: string;
  date?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

interface TripState {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  plots: Plot[];
  messages: ChatMessage[];
  users: { id: string; name: string }[];
}

// In-memory store for simplicity
const generatePlots = (start: string, end: string) => {
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

const defaultPlots = generatePlots('2026-10-10', '2026-10-14');
defaultPlots[0] = { ...defaultPlots[0], type: 'stay', title: 'Ryokan', time: '15:00', addedBy: 'System' };
defaultPlots[2] = { ...defaultPlots[2], type: 'eat', title: 'Sushi', time: '18:30', addedBy: 'System' };
defaultPlots[13] = { ...defaultPlots[13], type: 'explore', title: 'Fushimi Inari', time: '09:00', addedBy: 'System' };
defaultPlots[25] = { ...defaultPlots[25], type: 'event', title: 'Tea Ceremony', time: '14:00', addedBy: 'System' };

const trips: Record<string, TripState> = {
  'kyoto-2026': {
    id: 'kyoto-2026',
    name: 'Kyoto Garden',
    destination: 'Kyoto, Japan',
    startDate: '2026-10-10',
    endDate: '2026-10-14',
    plots: defaultPlots,
    messages: [],
    users: [],
  }
};


async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    }
  });

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/trips/:id', (req, res) => {
    const trip = trips[req.params.id];
    if (trip) {
      res.json(trip);
    } else {
      res.status(404).json({ error: 'Trip not found' });
    }
  });

  // Socket.io logic
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-trip', ({ tripId, user }) => {
      socket.join(tripId);
      
      if (!trips[tripId]) {
        const start = new Date().toISOString().split('T')[0];
        const end = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        // Create if doesn't exist for demo purposes
        trips[tripId] = {
          id: tripId,
          name: 'New Trip',
          destination: 'Unknown',
          startDate: start,
          endDate: end,
          plots: generatePlots(start, end),
          messages: [],
          users: [],
        };
      }

      const trip = trips[tripId];
      // Add user if not exists
      if (!trip.users.find(u => u.id === user.id)) {
        trip.users.push(user);
      }

      // Send current state to the joining user
      socket.emit('trip-state', trip);
      
      // Broadcast user joined
      socket.to(tripId).emit('user-joined', user);
      io.to(tripId).emit('users-updated', trip.users);
    });

    socket.on('update-plot', ({ tripId, plotIndex, plotData }) => {
      const trip = trips[tripId];
      if (trip && trip.plots[plotIndex]) {
        trip.plots[plotIndex] = { ...trip.plots[plotIndex], ...plotData };
        io.to(tripId).emit('plot-updated', { index: plotIndex, plot: trip.plots[plotIndex] });
      }
    });

    socket.on('send-message', ({ tripId, message }) => {
      const trip = trips[tripId];
      if (trip) {
        const newMessage = {
          ...message,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
        };
        trip.messages.push(newMessage);
        io.to(tripId).emit('new-message', newMessage);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // In a real app, we'd remove the user from the room's user list
      // But we need to map socket.id to user.id first. Skipping for simplicity.
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
