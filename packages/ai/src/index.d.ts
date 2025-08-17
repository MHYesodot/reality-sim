import type { GeneratedQuest, OrchestratedEvent } from '@reality-sim/types';
export declare function generateQuestFromEvent(ev: OrchestratedEvent, opts?: {
    priority?: boolean;
}): Promise<GeneratedQuest>;
