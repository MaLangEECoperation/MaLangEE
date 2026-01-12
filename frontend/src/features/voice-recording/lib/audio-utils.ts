/**
 * PCM16 오디오 변환 유틸리티
 *
 * 브라우저 마이크 입력(Float32) ↔ WebSocket 전송용(PCM16 Base64) 변환
 */

/**
 * Base64 문자열을 Uint8Array로 변환
 * @param base64 - Base64 인코딩된 문자열
 * @returns Uint8Array 바이트 배열
 */
export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Uint8Array를 Base64 문자열로 변환
 * @param bytes - Uint8Array 바이트 배열
 * @returns Base64 인코딩된 문자열
 */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * PCM16 바이트 배열을 Float32 샘플로 변환 (재생용)
 * PCM16: 16비트 정수 (-32768 ~ 32767)
 * Float32: 부동소수점 (-1.0 ~ 1.0)
 *
 * @param bytes - PCM16 Uint8Array (리틀 엔디안)
 * @returns Float32Array 오디오 샘플
 */
export function pcm16ToFloat32(bytes: Uint8Array): Float32Array {
  const samples = new Float32Array(Math.floor(bytes.length / 2));
  for (let i = 0; i < samples.length; i++) {
    const lo = bytes[i * 2];
    const hi = bytes[i * 2 + 1];
    let sample = (hi << 8) | lo;
    // 부호 있는 16비트 정수로 변환
    if (sample >= 0x8000) sample -= 0x10000;
    // -1.0 ~ 1.0 범위로 정규화
    samples[i] = sample / 32768;
  }
  return samples;
}

/**
 * Float32 샘플을 PCM16 바이트 배열로 변환 (전송용)
 * Float32: 부동소수점 (-1.0 ~ 1.0)
 * PCM16: 16비트 정수 (-32768 ~ 32767)
 *
 * @param float32 - Float32Array 오디오 샘플
 * @returns Uint8Array PCM16 데이터 (리틀 엔디안)
 */
export function float32ToPcm16(float32: Float32Array): Uint8Array {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32.length; i++) {
    // -1.0 ~ 1.0 범위로 클램핑
    let sample = Math.max(-1, Math.min(1, float32[i]));
    // 16비트 정수로 변환
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(i * 2, sample, true); // 리틀 엔디안
  }
  return new Uint8Array(buffer);
}

/**
 * Float32 샘플을 Base64 PCM16으로 변환 (WebSocket 전송용)
 * @param float32 - Float32Array 오디오 샘플
 * @returns Base64 인코딩된 PCM16 문자열
 */
export function float32ToBase64Pcm16(float32: Float32Array): string {
  const pcm16 = float32ToPcm16(float32);
  return bytesToBase64(pcm16);
}

/**
 * Base64 PCM16을 Float32 샘플로 변환 (재생용)
 * @param base64 - Base64 인코딩된 PCM16 문자열
 * @returns Float32Array 오디오 샘플
 */
export function base64Pcm16ToFloat32(base64: string): Float32Array {
  const bytes = base64ToBytes(base64);
  return pcm16ToFloat32(bytes);
}

/**
 * 오디오 다운샘플링 (48kHz → 16kHz 등)
 * @param inputSamples - 입력 Float32Array 샘플
 * @param inputSampleRate - 입력 샘플레이트
 * @param outputSampleRate - 출력 샘플레이트
 * @returns 다운샘플링된 Float32Array
 */
export function downsample(
  inputSamples: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number
): Float32Array {
  if (inputSampleRate === outputSampleRate) {
    return inputSamples;
  }

  const ratio = inputSampleRate / outputSampleRate;
  const outputLength = Math.floor(inputSamples.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const index = Math.floor(i * ratio);
    output[i] = inputSamples[index];
  }

  return output;
}

/**
 * 스테레오를 모노로 변환
 * @param stereoSamples - 인터리브된 스테레오 샘플 (L, R, L, R, ...)
 * @returns 모노 샘플
 */
export function stereoToMono(stereoSamples: Float32Array): Float32Array {
  const monoLength = Math.floor(stereoSamples.length / 2);
  const mono = new Float32Array(monoLength);

  for (let i = 0; i < monoLength; i++) {
    // 좌우 채널 평균
    mono[i] = (stereoSamples[i * 2] + stereoSamples[i * 2 + 1]) / 2;
  }

  return mono;
}

/**
 * 오디오 볼륨 레벨 계산 (RMS)
 * @param samples - Float32Array 오디오 샘플
 * @returns 0-1 범위의 볼륨 레벨
 */
export function calculateVolumeLevel(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}
