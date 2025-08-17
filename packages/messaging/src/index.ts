import amqp from 'amqplib';
import { cfg } from '@config/reality-sim';

let ch: any | undefined;

export async function getChannel(): Promise<any> {
  if (ch) return ch;
  const connection = await amqp.connect(cfg.RABBIT_URL);
  const channel = await connection.createChannel();
  await channel.assertExchange('world.topic', 'topic', { durable: true });
  ch = channel;
  return channel;
}

export async function publish(routingKey: string, payload: unknown) {
  const channel = await getChannel();
  channel.publish('world.topic', routingKey, Buffer.from(JSON.stringify(payload)), { contentType: 'application/json' });
}

export async function subscribe(bindingKey: string, onMsg: (payload: any) => Promise<void> | void) {
  const channel = await getChannel();
  const q = await channel.assertQueue('', { exclusive: true, durable: false, autoDelete: true });
  await channel.bindQueue(q.queue, 'world.topic', bindingKey);
  await channel.consume(q.queue, async (msg: any) => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      await onMsg(data);
      channel.ack(msg);
    } catch (e) {
      channel.nack(msg, false, false);
    }
  });
}
