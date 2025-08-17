import OpenAI from 'openai';
import { cfg } from '@config/reality-sim';
const client = () => new OpenAI({ apiKey: cfg.OPENAI_API_KEY });
export async function generateQuestFromEvent(ev, opts) {
    const model = opts?.priority ? 'gpt-4o' : 'gpt-4o-mini';
    const system = 'You are a quest generator for a live city-sim game.';
    const prompt = `Create a JSON quest with fields: title, description, rewardXp, targets:[{x,y}] based on event: ${JSON.stringify(ev)}`;
    const res = await client().responses.create({ model, input: [
            { role: 'system', content: system },
            { role: 'user', content: prompt }
        ] });
    const text = res.output_text || '{}';
    let quest;
    try {
        quest = JSON.parse(text);
    }
    catch {
        quest = {
            _id: '', title: 'Emergency Response', description: 'Handle the situation', targetTiles: ev.tiles.slice(0, 3),
            deadline: new Date(Date.now() + 20 * 60 * 1000).toISOString(), rewardXp: 50, status: 'active'
        };
    }
    return { quest, sourceEventId: '', at: new Date().toISOString() };
}
