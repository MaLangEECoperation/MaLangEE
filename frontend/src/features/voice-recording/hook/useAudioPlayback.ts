'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AudioPlaybackConfig, AudioPlaybackResult } from '../model/types';
import { base64Pcm16ToFloat32 } from '../lib/audio-utils';

const DEFAULT_CONFIG: Required<AudioPlaybackConfig> = {
  sampleRate: 24000,
  volume: 1,
};

interface UseAudioPlaybackOptions extends AudioPlaybackConfig {
  /** 재생 시작 콜백 */
  onPlayStart?: () => void;
  /** 재생 종료 콜백 */
  onPlayEnd?: () => void;
}

/**
 * 오디오 재생 훅
 * Web Audio API를 사용하여 PCM16 Base64 오디오를 재생
 */
export function useAudioPlayback(
  options: UseAudioPlaybackOptions = {}
): AudioPlaybackResult {
  const config = { ...DEFAULT_CONFIG, ...options };
  const { onPlayStart, onPlayEnd } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueLength, setQueueLength] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isProcessingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // AudioContext 초기화
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      const audioContext = new AudioContext({
        sampleRate: config.sampleRate,
      });
      audioContextRef.current = audioContext;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = config.volume;
      gainNode.connect(audioContext.destination);
      gainNodeRef.current = gainNode;
    }

    // suspended 상태면 resume
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, [config.sampleRate, config.volume]);

  // 큐 처리 및 재생
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    setIsPlaying(true);
    onPlayStart?.();

    const audioContext = initializeAudioContext();

    while (audioQueueRef.current.length > 0) {
      const samples = audioQueueRef.current.shift();
      if (!samples) continue;

      setQueueLength(audioQueueRef.current.length);

      try {
        // AudioBuffer 생성
        const audioBuffer = audioContext.createBuffer(
          1, // 모노
          samples.length,
          config.sampleRate
        );
        audioBuffer.getChannelData(0).set(samples);

        // AudioBufferSourceNode 생성 및 재생
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gainNodeRef.current || audioContext.destination);

        currentSourceRef.current = source;

        // 재생 완료 대기
        await new Promise<void>((resolve) => {
          source.onended = () => resolve();
          source.start();
        });
      } catch (err) {
        console.error('오디오 재생 오류:', err);
      }
    }

    isProcessingRef.current = false;
    setIsPlaying(false);
    setQueueLength(0);
    currentSourceRef.current = null;
    onPlayEnd?.();
  }, [config.sampleRate, initializeAudioContext, onPlayEnd, onPlayStart]);

  // 오디오 청크 추가
  const addAudioChunk = useCallback((base64Pcm16: string) => {
    try {
      const samples = base64Pcm16ToFloat32(base64Pcm16);
      audioQueueRef.current.push(samples);
      setQueueLength(audioQueueRef.current.length);
    } catch (err) {
      console.error('오디오 청크 추가 오류:', err);
      setError('오디오 데이터 처리에 실패했습니다.');
    }
  }, []);

  // 큐에 데이터가 추가되면 자동으로 재생 시작
  useEffect(() => {
    if (queueLength > 0 && !isProcessingRef.current) {
      // setTimeout을 사용하여 동기적 setState 호출 방지
      const timeoutId = setTimeout(() => {
        processQueue();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [queueLength, processQueue]);

  // 수동 재생 시작
  const play = useCallback(() => {
    if (!isProcessingRef.current && audioQueueRef.current.length > 0) {
      processQueue();
    }
  }, [processQueue]);

  // 재생 중지
  const stop = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {
        // 이미 중지된 경우 무시
      }
      currentSourceRef.current = null;
    }

    isProcessingRef.current = false;
    setIsPlaying(false);
  }, []);

  // 큐 비우기
  const clearQueue = useCallback(() => {
    audioQueueRef.current = [];
    setQueueLength(0);
    stop();
  }, [stop]);

  // 볼륨 변경 적용
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = config.volume;
    }
  }, [config.volume]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      audioQueueRef.current = [];
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isPlaying,
    error,
    addAudioChunk,
    play,
    stop,
    clearQueue,
  };
}
