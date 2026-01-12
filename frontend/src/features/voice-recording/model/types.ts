/**
 * 음성 녹음 관련 타입 정의
 */

/** 오디오 상태 */
export type AudioState = 'idle' | 'recording' | 'playing' | 'processing';

/** 마이크 캡처 설정 */
export interface MicrophoneCaptureConfig {
  /** 샘플 레이트 (기본값: 16000) */
  sampleRate?: number;
  /** 채널 수 (기본값: 1, 모노) */
  channelCount?: number;
  /** 오디오 청크 크기 (ms 단위, 기본값: 100) */
  chunkDurationMs?: number;
}

/** 마이크 캡처 결과 */
export interface MicrophoneCaptureResult {
  /** 녹음 상태 */
  isRecording: boolean;
  /** 마이크 권한 상태 */
  permissionStatus: PermissionState | 'unknown';
  /** 에러 메시지 */
  error: string | null;
  /** 녹음 시작 */
  startRecording: () => Promise<void>;
  /** 녹음 중지 */
  stopRecording: () => void;
  /** 오디오 스트림 */
  audioStream: MediaStream | null;
}

/** 오디오 재생 설정 */
export interface AudioPlaybackConfig {
  /** 샘플 레이트 (기본값: 24000) */
  sampleRate?: number;
  /** 볼륨 (0-1, 기본값: 1) */
  volume?: number;
}

/** 오디오 재생 결과 */
export interface AudioPlaybackResult {
  /** 재생 상태 */
  isPlaying: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 오디오 청크 추가 (base64 PCM16) */
  addAudioChunk: (base64Pcm16: string) => void;
  /** 재생 시작 */
  play: () => void;
  /** 재생 중지 */
  stop: () => void;
  /** 큐 비우기 */
  clearQueue: () => void;
}

/** 오디오 청크 데이터 */
export interface AudioChunk {
  /** Base64 인코딩된 PCM16 데이터 */
  data: string;
  /** 샘플 레이트 */
  sampleRate: number;
  /** 타임스탬프 */
  timestamp: number;
}

/** 녹음기 Props */
export interface VoiceRecorderProps {
  /** 녹음 상태 변경 콜백 */
  onRecordingChange?: (isRecording: boolean) => void;
  /** 오디오 청크 전송 콜백 */
  onAudioChunk?: (chunk: AudioChunk) => void;
  /** 에러 발생 콜백 */
  onError?: (error: string) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 클래스 */
  className?: string;
}
