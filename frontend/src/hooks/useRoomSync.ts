import { useState, useEffect } from 'react';
import { Room } from '../types';

export function useRoomSync(code: string | undefined, enabled: boolean = true) {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !enabled) return;

    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const connect = () => {
      eventSource = new EventSource(`/api/rooms/${code}/events`);

      eventSource.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          setRoom(data);
          setError(null);
        } catch (err) {
          console.error('Failed to parse SSE data', err);
        }
      };

      eventSource.onerror = () => {
        if (!isMounted) return;
        setError('Conexão perdida. Tentando reconectar...');
        eventSource?.close();
        retryTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
      clearTimeout(retryTimeout);
    };
  }, [code, enabled]);

  return { room, setRoom, error };
}
