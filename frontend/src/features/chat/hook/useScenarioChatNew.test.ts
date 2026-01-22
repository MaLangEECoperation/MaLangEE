import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScenarioChatNew } from "./useScenarioChatNew";

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
}));

vi.mock("@/shared/lib/websocket", () => ({
  buildScenarioWebSocketUrl: vi.fn((token: string | null) =>
    token ? `ws://test.com/scenario?token=${token}` : "ws://test.com/guest-scenario"
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

describe("useScenarioChatNew", () => {
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
      const { result } = renderHook(() => useScenarioChatNew());

      expect(result.current.state.isConnected).toBe(false);
      expect(result.current.state.isReady).toBe(false);
      expect(result.current.state.aiMessage).toBe("");
      expect(result.current.state.aiMessageKR).toBe("");
      expect(result.current.state.userTranscript).toBe("");
      expect(result.current.state.isAiSpeaking).toBe(false);
      expect(result.current.state.isRecording).toBe(false);
      expect(result.current.state.scenarioResult).toBeNull();
    });
  });

  describe("connect and disconnect", () => {
    it("should connect to WebSocket", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      expect(global.WebSocket).toHaveBeenCalledWith("ws://test.com/scenario?token=mock-token");
      expect(result.current.state.isConnected).toBe(true);
    });

    it("should disconnect properly", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        result.current.disconnect();
      });

      expect(result.current.state.isConnected).toBe(false);
      expect(result.current.state.isReady).toBe(false);
    });
  });

  describe("message handling", () => {
    it("should handle 'ready' message and set isReady to true", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

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

    it("should handle 'input_audio.transcript' message", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({
          type: "input_audio.transcript",
          transcript: "Hello, I want to practice",
        });
      });

      expect(result.current.state.userTranscript).toBe("Hello, I want to practice");
    });

    it("should handle 'response.audio_transcript.delta' message", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({
          type: "response.audio_transcript.delta",
          transcript_delta: "Hello ",
        });
      });

      expect(result.current.state.aiMessage).toBe("Hello ");

      act(() => {
        mockWs.simulateMessage({
          type: "response.audio_transcript.delta",
          transcript_delta: "there!",
        });
      });

      expect(result.current.state.aiMessage).toBe("Hello there!");
    });

    it("should handle 'response.audio_transcript.done' message with translation", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({
          type: "response.audio_transcript.done",
          transcript: "Hello, how can I help you?",
        });
      });

      expect(result.current.state.aiMessage).toBe("Hello, how can I help you?");

      // Wait for translation promise to resolve using act
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.state.aiMessageKR).toBe("Hello, how can I help you? (한국어)");
    });

    it("should handle 'scenario.completed' message", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({
          type: "scenario.completed",
          json: {
            place: "Airport",
            conversation_partner: "Check-in staff",
            conversation_goal: "Get boarding pass",
            session_id: "session-123",
          },
        });
      });

      expect(result.current.state.scenarioResult).toEqual({
        place: "Airport",
        conversationPartner: "Check-in staff",
        conversationGoal: "Get boarding pass",
        sessionId: "session-123",
      });
    });

    it("should handle 'speech.started' message", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({ type: "speech.started" });
      });

      // The base hook handles this, but we can verify the log is added
      expect(result.current.state.logs.some((log) => log.includes("speech started"))).toBe(true);
    });

    it("should handle 'error' message", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        mockWs.simulateMessage({
          type: "error",
          message: "Connection error occurred",
        });
      });

      expect(result.current.state.logs.some((log) => log.includes("Error"))).toBe(true);
    });
  });

  describe("sendText", () => {
    it("should send text message through WebSocket", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        result.current.sendText("I want to practice at a coffee shop");
      });

      const sentMessage = mockWs.sentMessages.find((msg) => {
        const parsed = JSON.parse(msg);
        return parsed.type === "text";
      });

      expect(sentMessage).toBeDefined();
      expect(JSON.parse(sentMessage!)).toEqual({
        type: "text",
        text: "I want to practice at a coffee shop",
      });
    });
  });

  describe("audio controls", () => {
    it("should clear audio buffer", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      act(() => {
        result.current.clearAudioBuffer();
      });

      const sentMessage = mockWs.sentMessages.find((msg) => {
        const parsed = JSON.parse(msg);
        return parsed.type === "input_audio_clear";
      });

      expect(sentMessage).toBeDefined();
    });

    it("should commit audio buffer", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

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
        return parsed.type === "input_audio_commit";
      });

      expect(sentMessage).toBeDefined();
    });

    it("should initialize audio context", () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.initAudio();
      });

      // Verify by checking that the AudioContext was instantiated via logs
      expect(result.current.state.logs.some((log) => log.includes("AudioContext"))).toBe(true);
    });

    it("should toggle mute", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

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
      const { result } = renderHook(() => useScenarioChatNew());

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
      const { result } = renderHook(() => useScenarioChatNew());

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

  describe("startScenarioSession", () => {
    it("should start scenario session when ready", async () => {
      const { result } = renderHook(() => useScenarioChatNew());

      act(() => {
        result.current.connect();
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      // Simulate ready event
      act(() => {
        mockWs.simulateMessage({ type: "ready" });
      });

      // startScenarioSession is called automatically on ready
      expect(result.current.state.isReady).toBe(true);
      expect(result.current.state.logs.some((log) => log.includes("session"))).toBe(true);
    });
  });
});
