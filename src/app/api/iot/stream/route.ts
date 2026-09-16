import { waterEngine } from '@/lib/waterEngine';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial state immediately
      const initialData = `data: ${JSON.stringify(waterEngine.getState())}\n\n`;
      controller.enqueue(encoder.encode(initialData));

      // Listen for updates from waterEngine
      const unsubscribe = waterEngine.subscribe(() => {
        try {
          const chunk = `data: ${JSON.stringify(waterEngine.getState())}\n\n`;
          controller.enqueue(encoder.encode(chunk));
        } catch {
          unsubscribe();
        }
      });

      // Keepalive heartbeat
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(interval);
          unsubscribe();
        }
      }, 10000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
