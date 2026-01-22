import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConversationChatNew } from "./useConversationChatNew";

// Mock dependencies
vi.mock("@/features/auth", () => ({
  tokenStorage: {
    get: vi.fn(() => "mock-token"),
  },
}));

vi.mock("@/shared/lib/translate", () => ({
  translateToKorean: vi.fn((text: string) => Promise.resolve(`${text} (한국어)`)),
}));

vi.mock("@/shared/lib/debug", () => ({
  debugLog: vi.fn(),
  debugError: vi.fn(),
}));

vi.mock("@/shared/lib/websocket", () => ({
  buildConversationWebSocketUrl: vi.fn(
    (sessionId: string, token: string | null, voice: string, showText: boolean) =>
      token
        ? `ws://test.com/chat/${sessionId}?token=${token}&voice=${voice}&show_text=${showText}`
        : `ws://test.com/guest-chat/${sessionId}?voice=${voice}&show_text=${showText}`
  ),
  WEBSOCKET_CONSTANTS: {
    RECONNECT: { MAX_ATTEMPTS: 3 },
    AUDIO: {
      OUTPUT_SAMPLE_RATE: 24000,
      BUFFER_SIZE: 4096,
      SPEAKING_END_DELAY_MS: 200,
    },
    TIMEOUT: { DISCONNECT_MS: 5000 },
  },
  calculateBackoffDelay: vi.fn(() => 1000),
}));

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState: number = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
    setTimeout(() => this.onopen?.(), 0);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: 1000, reason: "Normal closure" } as CloseEvent);
  }

  // Helper to simulate receiving messages
  simulateMessage(data: object) {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }
}

// Mock AudioContext
class MockAudioContext {
  sampleRate = 24000;
  state = "running";
  destination = {};
  currentTime = 0;

  createGain = vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      value: 1,
      cancelScheduledValues: vi.fn(),
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
  }));

  createMediaStreamSource = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  createScriptProcessor = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    onaudioprocess: null,
  }));

  createBuffer = vi.fn((channels, length, sampleRate) => ({
    copyToChannel: vi.fn(),
    duration: length / sampleRate,
  }));

  createBufferSource = vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    buffer: null,
    onended: null,
  }));

  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn();
}

// Mock MediaStream
class MockMediaStream {
  tracks = [{ stop: vi.fn() }];
  getTracks() {
    return this.tracks;
  }
}

describe("useConversationChatNew", () => {
  let mockWs: MockWebSocket;
  const mockGetUserMedia = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock WebSocket
    global.WebSocket = vi.fn((url: string) => {
      mockWs = new MockWebSocket(url);
      return mockWs;
    }) as unknown as typeof WebSocket;

    (global.WebSocket as unknown as typeof MockWebSocket).OPEN = MockWebSocket.OPEN;
    (global.WebSocket as unknown as typeof MockWebSocket).CLOSED = MockWebSocket.CLOSED;
    (global.WebSocket as unknown as typeof MockWebSocket).CONNECTING = MockWebSocket.CONNECTING;
    (global.WebSocket as unknown as typeof MockWebSocket).CLOSING = MockWebSocket.CLOSING;

    // Mock AudioContext
    global.AudioContext = MockAudioContext as unknown as typeof AudioContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as unknown as Record<string, unknown>).window = {
      AudioContext: MockAudioContext,
      webkitAudioContext: MockAudioContext,
      atob: global.atob || ((str: string) => Buffer.from(str, "base64").toString("binary")),
      btoa: global.btoa || ((str: string) => Buffer.from(str, "binary").toString("base64")),
    };

    // Mock navigator.mediaDevices
    Object.defineProperty(global, "navigator", {
      value: {
        mediaDevices: {
          getUserMedia: mockGetUserMedia.mockResolvedValue(new MockMediaStream()),
        },
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      expect(result.current.state.isConnected).toBe(false);
      expect(result.current.state.isReady).toBe(false);
      expect(result.current.state.aiMessage).toBe("");
      expect(result.current.state.aiMessageKR).toBe("");
      expect(result.current.state.userTranscript).toBe("");
      expect(result.current.state.isAiSpeaking).toBe(false);
      expect(result.current.state.isUserSpeaking).toBe(false);
      expect(result.current.state.isRecording).toBe(false);
      expect(result.current.state.sessionReport).toBeNull();
      expect(result.current.state.lastAiAudioDoneAt).toBeNull();
    });

    it("should not connect if sessionId is empty", () => {
      const { result } = renderHook(() => useConversationChatNew(""));

      act(() => {
        result.current.connect();
      });

      expect(global.WebSocket).not.toHaveBeenCalled();
    });
  });

  describe("connect and disconnect", () => {
    it("should connect to WebSocket with correct URL", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123", "nova"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      expect(global.WebSocket).toHaveBeenCalledWith(
        "ws://test.com/chat/session-123?token=mock-token&voice=nova&show_text=true"
      );
      expect(result.current.state.isConnected).toBe(true);
    });

    it("should disconnect and return session report", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      // Start disconnect
      let disconnectPromise: Promise<unknown>;
      act(() => {
        disconnectPromise = result.current.disconnect();
      });

      // Simulate server response
      act(() => {
        mockWs.simulateMessage({
          type: "disconnected",
          reason: "User requested disconnect",
          report: {
            session_id: "session-123",
            total_duration_sec: 120,
            user_speech_duration_sec: 45,
            messages: [],
          },
        });
      });

      const report = await disconnectPromise!;

      expect(report).toEqual({
        session_id: "session-123",
        total_duration_sec: 120,
        user_speech_duration_sec: 45,
        messages: [],
      });
    });

    it("should handle disconnect timeout", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      let disconnectPromise: Promise<unknown>;
      act(() => {
        disconnectPromise = result.current.disconnect();
      });

      // Advance past the disconnect timeout (5000ms)
      await act(async () => {
        vi.advanceTimersByTime(6000);
      });

      const report = await disconnectPromise!;
      expect(report).toBeNull();
    });
  });

  describe("message handling", () => {
    it("should handle 'session.update' message and set isReady", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123", "nova"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({ type: "session.update" });
      });

      expect(result.current.state.isReady).toBe(true);

      // Should also send session.update back to server
      const sentSessionUpdate = mockWs.sentMessages.find((msg) => {
        const parsed = JSON.parse(msg);
        return parsed.type === "session.update" && parsed.config?.voice === "nova";
      });
      expect(sentSessionUpdate).toBeDefined();
    });

    it("should handle 'session.created' message and set isReady", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({ type: "session.created" });
      });

      expect(result.current.state.isReady).toBe(true);
    });

    it("should handle 'ready' message and set isReady", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({ type: "ready" });
      });

      expect(result.current.state.isReady).toBe(true);
    });

    it("should handle 'connected' message and set isReady", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({ type: "connected" });
      });

      expect(result.current.state.isReady).toBe(true);
    });

    it("should handle 'audio.delta' message and set isReady if not already ready", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
        result.current.initAudio();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      expect(result.current.state.isReady).toBe(false);

      act(() => {
        mockWs.simulateMessage({
          type: "audio.delta",
          delta: "YWJjZA==", // base64 encoded audio
        });
      });

      expect(result.current.state.isReady).toBe(true);
    });

    it("should handle 'audio.done' message and update lastAiAudioDoneAt", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      const beforeTime = Date.now();

      act(() => {
        mockWs.simulateMessage({ type: "audio.done" });
      });

      expect(result.current.state.lastAiAudioDoneAt).toBeGreaterThanOrEqual(beforeTime);
    });

    it("should handle 'transcript.done' message with translation", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({
          type: "transcript.done",
          transcript: "Hello, how are you?",
        });
      });

      expect(result.current.state.aiMessage).toBe("Hello, how are you?");

      // Wait for translation promise to resolve using act
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.state.aiMessageKR).toBe("Hello, how are you? (한국어)");
    });

    it("should handle 'speech.started' message", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      // Set lastAiAudioDoneAt first
      act(() => {
        mockWs.simulateMessage({ type: "audio.done" });
      });

      expect(result.current.state.lastAiAudioDoneAt).not.toBeNull();

      act(() => {
        mockWs.simulateMessage({ type: "speech.started" });
      });

      // lastAiAudioDoneAt should be reset to null when user starts speaking
      expect(result.current.state.lastAiAudioDoneAt).toBeNull();
    });

    it("should handle 'speech.stopped' message", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({ type: "speech.stopped" });
      });

      expect(result.current.state.logs.some((log) => log.includes("speech stopped"))).toBe(true);
    });

    it("should handle 'user.transcript' message", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({
          type: "user.transcript",
          transcript: "I would like to order a coffee",
        });
      });

      expect(result.current.state.userTranscript).toBe("I would like to order a coffee");
    });

    it("should handle 'error' message", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({
          type: "error",
          message: "Session expired",
        });
      });

      expect(result.current.state.logs.some((log) => log.includes("Error"))).toBe(true);
    });
  });

  describe("sendText", () => {
    it("should send text message and trigger response.create", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        result.current.sendText("Hello, I need help");
      });

      const sentTextMessage = mockWs.sentMessages.find((msg) => {
        const parsed = JSON.parse(msg);
        return parsed.type === "text" && parsed.text === "Hello, I need help";
      });
      expect(sentTextMessage).toBeDefined();

      const sentResponseCreate = mockWs.sentMessages.find((msg) => {
        const parsed = JSON.parse(msg);
        return parsed.type === "response.create";
      });
      expect(sentResponseCreate).toBeDefined();
    });
  });

  describe("commitAudio", () => {
    it("should send input_audio_buffer.commit message", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        result.current.commitAudio();
      });

      const sentMessage = mockWs.sentMessages.find((msg) => {
        const parsed = JSON.parse(msg);
        return parsed.type === "input_audio_buffer.commit";
      });
      expect(sentMessage).toBeDefined();
    });
  });

  describe("updateVoice", () => {
    it("should send session.update with new voice", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123", "alloy"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        result.current.updateVoice("nova");
      });

      const sentMessage = mockWs.sentMessages.find((msg) => {
        const parsed = JSON.parse(msg);
        return parsed.type === "session.update" && parsed.config?.voice === "nova";
      });
      expect(sentMessage).toBeDefined();
    });
  });

  describe("requestResponse", () => {
    it("should send response.create message", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        result.current.requestResponse();
      });

      const sentMessage = mockWs.sentMessages.find((msg) => {
        const parsed = JSON.parse(msg);
        return parsed.type === "response.create";
      });
      expect(sentMessage).toBeDefined();
    });
  });

  describe("audio controls", () => {
    it("should initialize audio context", () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.initAudio();
      });

      // Verify by checking that the AudioContext was instantiated via logs
      expect(result.current.state.logs.some((log) => log.includes("AudioContext"))).toBe(true);
    });

    it("should toggle mute", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.initAudio();
      });

      act(() => {
        result.current.toggleMute(true);
      });

      expect(result.current.state.logs.some((log) => log.includes("Muted"))).toBe(true);

      act(() => {
        result.current.toggleMute(false);
      });

      expect(result.current.state.logs.some((log) => log.includes("Unmuted"))).toBe(true);
    });
  });

  describe("microphone controls", () => {
    it("should start microphone", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      await act(async () => {
        await result.current.startMicrophone();
      });

      expect(mockGetUserMedia).toHaveBeenCalled();
      expect(result.current.state.isRecording).toBe(true);
    });

    it("should stop microphone", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      await act(async () => {
        await result.current.startMicrophone();
      });

      act(() => {
        result.current.stopMicrophone();
      });

      expect(result.current.state.isRecording).toBe(false);
    });
  });

  describe("duplicate disconnect prevention", () => {
    it("should prevent duplicate disconnect requests", async () => {
      const { result } = renderHook(() => useConversationChatNew("session-123"));

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      // Start first disconnect
      let promise1: Promise<unknown>;
      let promise2: Promise<unknown>;

      act(() => {
        promise1 = result.current.disconnect();
      });

      // Try second disconnect immediately
      act(() => {
        promise2 = result.current.disconnect();
      });

      // Second should return null immediately
      const result2 = await promise2!;
      expect(result2).toBeNull();

      // Clean up first disconnect
      act(() => {
        mockWs.simulateMessage({ type: "disconnected", reason: "test" });
      });

      await promise1!;
    });
  });
});
