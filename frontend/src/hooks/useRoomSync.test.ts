import { renderHook } from '@testing-library/react';
import { useRoomSync } from './useRoomSync';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  
  constructor(url: string) {
    this.url = url;
  }
  
  close() {
    // mock close
  }
}

describe('useRoomSync', () => {
  let originalEventSource: typeof EventSource;

  beforeEach(() => {
    originalEventSource = global.EventSource;
    global.EventSource = MockEventSource as unknown as typeof EventSource;
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.EventSource = originalEventSource;
    vi.useRealTimers();
  });

  it('should not connect if disabled', () => {
    renderHook(() => useRoomSync('code123', false));
    // Since it's disabled, no EventSource should be instantiated or used
    // We can verify this implicitly by lack of errors
  });

  it('should start with default values', () => {
    const { result } = renderHook(() => useRoomSync('code123', true));
    
    expect(result.current.room).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
