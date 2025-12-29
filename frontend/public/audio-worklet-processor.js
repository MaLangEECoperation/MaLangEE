/* eslint-disable no-undef */
/**
 * AudioWorklet Processor for real-time audio capture
 * Captures audio from microphone and sends to main thread
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor
 */

// @ts-nocheck
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096; // 버퍼 크기
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  /**
   * @param {Float32Array[][]} inputs - 입력 오디오 데이터
   * @param {Float32Array[][]} _outputs - 출력 오디오 데이터 (미사용)
   * @param {Record<string, Float32Array>} _parameters - 파라미터 (미사용)
   * @returns {boolean} - true를 반환하면 계속 처리
   */
  process(inputs, _outputs, _parameters) {
    const input = inputs[0];

    if (input && input.length > 0) {
      const channelData = input[0];

      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.bufferIndex++] = channelData[i];

        // 버퍼가 가득 차면 메인 스레드로 전송
        if (this.bufferIndex >= this.bufferSize) {
          this.port.postMessage({
            type: "audio-data",
            audioData: this.buffer.slice(),
          });
          this.bufferIndex = 0;
        }
      }
    }

    return true; // 계속 처리
  }
}

registerProcessor("audio-processor", AudioProcessor);
