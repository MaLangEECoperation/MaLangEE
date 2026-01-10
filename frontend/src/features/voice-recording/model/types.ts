/**
 * 오디오 샘플레이트 (Hz)
 */
export type AudioSampleRate = 16000 | 24000 | 44100 | 48000;

/**
 * 마이크 녹음 상태
 */
export type RecordingState = "idle" | "recording" | "paused";

/**
 * 오디오 버퍼 정보
 */
export interface AudioBuffer {
  /** PCM16 오디오 데이터 (Uint8Array) */
  data: Uint8Array;
  /** 샘플레이트 */
  sampleRate: AudioSampleRate;
  /** 채널 수 (모노=1, 스테레오=2) */
  channels: number;
}

/**
 * 마이크 캡처 옵션
 */
export interface MicrophoneCaptureOptions {
  /** 목표 샘플레이트 (기본: 16000) */
  sampleRate?: AudioSampleRate;
  /** 자동 다운샘플링 여부 (기본: true) */
  autoDownsample?: boolean;
  /** 에코 캔슬레이션 여부 (기본: true) */
  echoCancellation?: boolean;
  /** 노이즈 억제 여부 (기본: true) */
  noiseSuppression?: boolean;
}

/**
 * 오디오 재생 옵션
 */
export interface AudioPlaybackOptions {
  /** 재생 샘플레이트 (기본: 24000) */
  sampleRate?: AudioSampleRate;
  /** 자동 재생 여부 (기본: true) */
  autoplay?: boolean;
}

// TODO: Phase 3에서 구현 예정
// - useMicrophoneCapture hook
// - useAudioPlayback hook
// - PCM16 변환 유틸리티
