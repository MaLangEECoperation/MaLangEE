// Public API
export { VoiceRecorder } from './ui';
export { useMicrophoneCapture, useAudioPlayback } from './hook';
export {
  base64ToBytes,
  bytesToBase64,
  pcm16ToFloat32,
  float32ToPcm16,
  float32ToBase64Pcm16,
  base64Pcm16ToFloat32,
  downsample,
  stereoToMono,
  calculateVolumeLevel,
} from './lib';
export type {
  AudioState,
  MicrophoneCaptureConfig,
  MicrophoneCaptureResult,
  AudioPlaybackConfig,
  AudioPlaybackResult,
  AudioChunk,
  VoiceRecorderProps,
} from './model';
