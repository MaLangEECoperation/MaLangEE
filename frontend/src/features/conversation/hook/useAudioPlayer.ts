"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { DEFAULT_AUDIO_CONFIG, type AudioConfig } from "../model/types";

export interface UseAudioPlayerOptions {
  config?: AudioConfig;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  playAudio: (audioData: ArrayBuffer | Float32Array) => Promise<void>;
  stopAudio: () => void;
  appendAudio: (audioData: ArrayBuffer | Float32Array) => void;
  clearBuffer: () => void;
  error: Error | null;
}

export const useAudioPlayer = (
  options: UseAudioPlayerOptions = {}
): UseAudioPlayerReturn => {
  const { config = DEFAULT_AUDIO_CONFIG, onPlaybackStart, onPlaybackEnd, onError } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferQueueRef = useRef<Float32Array[]>([]);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isProcessingRef = useRef(false);

  // AudioContext 초기화
  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = new AudioContext({
        sampleRate: config.sampleRate,
      });
    }

    // suspended 상태면 resume
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, [config.sampleRate]);

  // ArrayBuffer를 Float32Array로 변환
  const convertToFloat32Array = useCallback(
    (data: ArrayBuffer | Float32Array): Float32Array => {
      if (data instanceof Float32Array) {
        return data;
      }

      // PCM 16-bit를 Float32로 변환
      const int16Array = new Int16Array(data);
      const float32Array = new Float32Array(int16Array.length);

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      return float32Array;
    },
    []
  );

  // 버퍼 큐에서 다음 오디오 재생
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || audioBufferQueueRef.current.length === 0) {
      if (audioBufferQueueRef.current.length === 0 && isPlaying) {
        setIsPlaying(false);
        onPlaybackEnd?.();
      }
      return;
    }

    isProcessingRef.current = true;

    try {
      const audioContext = getAudioContext();
      const audioData = audioBufferQueueRef.current.shift()!;

      // AudioBuffer 생성
      const audioBuffer = audioContext.createBuffer(
        config.channelCount,
        audioData.length,
        config.sampleRate
      );
      audioBuffer.getChannelData(0).set(audioData);

      // AudioBufferSourceNode 생성 및 재생
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      currentSourceRef.current = source;

      source.onended = () => {
        isProcessingRef.current = false;
        processQueue();
      };

      source.start();

      if (!isPlaying) {
        setIsPlaying(true);
        onPlaybackStart?.();
      }
    } catch (err) {
      isProcessingRef.current = false;
      const error = err instanceof Error ? err : new Error("오디오 재생에 실패했습니다.");
      setError(error);
      onError?.(error);
    }
  }, [
    config.channelCount,
    config.sampleRate,
    getAudioContext,
    isPlaying,
    onPlaybackStart,
    onPlaybackEnd,
    onError,
  ]);

  // 오디오 데이터 추가 (스트리밍용)
  const appendAudio = useCallback(
    (audioData: ArrayBuffer | Float32Array) => {
      const float32Data = convertToFloat32Array(audioData);
      audioBufferQueueRef.current.push(float32Data);
      processQueue();
    },
    [convertToFloat32Array, processQueue]
  );

  // 단일 오디오 재생
  const playAudio = useCallback(
    async (audioData: ArrayBuffer | Float32Array) => {
      // 기존 재생 중지
      stopAudio();

      const float32Data = convertToFloat32Array(audioData);
      audioBufferQueueRef.current.push(float32Data);
      processQueue();
    },
    [convertToFloat32Array, processQueue]
  );

  // 재생 중지
  const stopAudio = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {
        // 이미 중지된 경우 무시
      }
      currentSourceRef.current = null;
    }

    audioBufferQueueRef.current = [];
    isProcessingRef.current = false;
    setIsPlaying(false);
  }, []);

  // 버퍼 초기화
  const clearBuffer = useCallback(() => {
    audioBufferQueueRef.current = [];
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stopAudio]);

  return {
    isPlaying,
    playAudio,
    stopAudio,
    appendAudio,
    clearBuffer,
    error,
  };
};
