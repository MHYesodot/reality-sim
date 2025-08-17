import ky from 'ky';
import { io, Socket } from 'socket.io-client';
import type { RtServerToClient, RtClientToServer } from '@reality-sim/types';

export function createHttp(baseURL: string, token?: string) {
  return ky.create({
    prefixUrl: baseURL.replace(/\/$/, ''),
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

export function createRealtime(url: string, token?: string): Socket<RtServerToClient, RtClientToServer> {
  return io(url, { transports: ['websocket'], auth: token ? { token } : undefined });
}
