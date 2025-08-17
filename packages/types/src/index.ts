export type Source = 'ingestion' | 'simulation';
export type EventType = 'traffic_spike' | 'flood' | 'power_outage' | 'custom';
export type QuestStatus = 'active' | 'completed' | 'expired';

export interface Vec2 { x: number; y: number; }
export interface TileDelta { x: number; y: number; economy?: number; traffic?: number; pollution?: number; }

export interface User {
  _id: string; email: string; displayName: string;
  teamId?: string; xp: number; level: number; createdAt: string;
}

export interface Tile {
  _id: string; gridId: string; x: number; y: number;
  economy: number; traffic: number; pollution: number; updatedAt: string;
}

export interface WorldEvent {
  _id: string; type: EventType; tiles: Vec2[]; severity: 1|2|3|4|5;
  source: Source; createdAt: string; meta?: Record<string, unknown>;
}

export interface Quest {
  _id: string; title: string; description: string;
  targetTiles: Vec2[]; deadline: string; rewardXp: number; status: QuestStatus;
  steps?: string[]; estimatedMinutes?: number;
}

export interface IngestionNormalized { kind: 'weather'|'news'; city: string; payload: any; at: string; }
export interface SimTick { tick: number; deltas: TileDelta[]; at: string; }
export interface OrchestratedEvent { type: EventType; tiles: Vec2[]; severity: number; reason: string; at: string; }
export interface GeneratedQuest { quest: Quest; sourceEventId?: string; at: string; }

export type RtServerToClient =
  | { t: 'world:delta'; data: SimTick }
  | { t: 'world:event'; data: OrchestratedEvent }
  | { t: 'quest:new'; data: Quest }
  | { t: 'chat:message'; data: { room: string; user: string; text: string; at: string } };

export type RtClientToServer =
  | { t: 'join'; room: string }
  | { t: 'quest:accept'; questId: string }
  | { t: 'quest:complete'; questId: string }
  | { t: 'chat:send'; room: string; text: string };


export interface QuestProgress {
  _id?: string;
  userId: string;
  questId: string;
  acceptedAt?: string;
  completedAt?: string;
  rewardClaimed?: boolean;
}

export interface QuestCompletedMsg {
  questId: string;
  userId: string;
  rewardXp: number;
  at: string;
}
