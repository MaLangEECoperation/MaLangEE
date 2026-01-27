import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";

import { useAudioPlayer } from "./use-audio-player";

// Audio 모킹
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();

class MockAudio {
  src = "";
  currentTime = 0;

  play = mockPlay;
  pause = mockPause;
}

describe("useAudioPlayer", () => {
  beforeAll(() => {
    vi.stubGlobal("Audio", MockAudio);
  });

  beforeEach(() => {
    mockPlay.mockClear();
    mockPause.mockClear();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("초기 상태는 isPlaying: false이다", () => {
    const { result } = renderHook(() => useAudioPlayer());

    expect(result.current.isPlaying).toBe(false);
  });

  it("play 호출 시 오디오를 재생하고 isPlaying을 true로 설정한다", async () => {
    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      result.current.play("https://example.com/audio.mp3");
    });

    expect(mockPlay).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(true);
  });

  it("stop 호출 시 오디오를 중지하고 isPlaying을 false로 설정한다", async () => {
    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      result.current.play("https://example.com/audio.mp3");
    });

    act(() => {
      result.current.stop();
    });

    expect(mockPause).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
  });

  it("unmount 시 재생 중인 오디오를 중지한다", async () => {
    const { result, unmount } = renderHook(() => useAudioPlayer());

    await act(async () => {
      result.current.play("https://example.com/audio.mp3");
    });

    unmount();

    expect(mockPause).toHaveBeenCalled();
  });
});
