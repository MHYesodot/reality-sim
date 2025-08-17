import type { RtServerToClient, RtClientToServer } from '@reality-sim/types';
import type { Server as IOServer, Socket as IOSocket } from 'socket.io';

declare module 'socket.io' {
  interface ServerToClientEvents extends RtServerToClient {}
  interface ClientToServerEvents extends RtClientToServer {}
  // Optional: InterServerEvents, SocketData can be extended as needed
}
