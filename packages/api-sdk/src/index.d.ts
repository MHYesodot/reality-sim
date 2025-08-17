import { Socket } from 'socket.io-client';
import type { RtServerToClient, RtClientToServer } from '@reality-sim/types';
export declare function createHttp(baseURL: string, token?: string): import("ky").KyInstance;
export declare function createRealtime(url: string, token?: string): Socket<RtServerToClient, RtClientToServer>;
