'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { MicrophoneCaptureConfig, MicrophoneCaptureResult, AudioChunk } from '../model/types';
import { float32ToBase64Pcm16, downsample, calculateVolumeLevel } from '../lib/audio-utils';

const DEFAULT_CONFIG: Required<MicrophoneCaptureConfig> = {
  sampleRate: 16000,
  channelCount: 1,
  chunkDurationMs: 100,
};

interface UseMicrophoneCaptureOptions extends MicrophoneCaptureConfig {
  /** 오디오 청크 전송 콜백 */
  onAudioChunk?: (chunk: AudioChunk) => void;
  /** 볼륨 레벨 변경 콜백 (0-1) */
  onVolumeChange?: (level: number) => void;
}

/**
 * 마이크 캡처 훅
 * Web Audio API를 사용하여 마이크 입력을 캡처하고 PCM16 Base64로 변환
 */
export function useMicrophoneCapture(
  options: UseMicrophoneCaptureOptions = {}
): MicrophoneCaptureResult & { volumeLevel: number } {
  const config = { ...DEFAULT_CONFIG, ...options };
  const { onAudioChunk, onVolumeChange } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'unknown'>('unknown');
  const [error, setError] = useState<string | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 마이크 권한 상태 확인
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((result) => {
          setPermissionStatus(result.state);
          result.onchange = () => setPermissionStatus(result.state);
        })
        .catch(() => {
          setPermissionStatus('unknown');
        });
    }
  }, []);

  // 녹음 시작
  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // 마이크 스트림 획득
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: config.channelCount,
          sampleRate: config.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setAudioStream(stream);

      // AudioContext 생성
      const audioContext = new AudioContext({
        sampleRate: config.sampleRate,
      });
      audioContextRef.current = audioContext;

      // MediaStream을 AudioNode로 연결
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      // ScriptProcessorNode 사용 (AudioWorklet 대체, 더 넓은 호환성)
      const bufferSize = Math.floor((config.sampleRate * config.chunkDurationMs) / 1000);
      const processorNode = audioContext.createScriptProcessor(
        bufferSize,
        config.channelCount,
        config.channelCount
      );

      processorNode.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const samples = new Float32Array(inputData);

        // 볼륨 레벨 계산
        const level = calculateVolumeLevel(samples);
        setVolumeLevel(level);
        onVolumeChange?.(level);

        // 다운샘플링 (필요한 경우)
        const downsampledSamples = downsample(
          samples,
          audioContext.sampleRate,
          config.sampleRate
        );

        // PCM16 Base64로 변환하여 전송
        const base64Data = float32ToBase64Pcm16(downsampledSamples);
        const chunk: AudioChunk = {
          data: base64Data,
          sampleRate: config.sampleRate,
          timestamp: Date.now(),
        };

        onAudioChunk?.(chunk);
      };

      // 노드 연결
      sourceNode.connect(processorNode);
      processorNode.connect(audioContext.destination);

      setIsRecording(true);
      setPermissionStatus('granted');
    } catch (err) {
      const message = err instanceof Error ? err.message : '마이크 접근에 실패했습니다.';
      setError(message);
      setPermissionStatus('denied');
      console.error('마이크 캡처 오류:', err);
    }
  }, [config.channelCount, config.chunkDurationMs, config.sampleRate, onAudioChunk, onVolumeChange]);

  // 녹음 중지
  const stopRecording = useCallback(() => {
    // 오디오 컨텍스트 정리
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // 스트림 정리
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    sourceNodeRef.current = null;
    workletNodeRef.current = null;

    setIsRecording(false);
    setAudioStream(null);
    setVolumeLevel(0);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    permissionStatus,
    error,
    audioStream,
    volumeLevel,
    startRecording,
    stopRecording,
  };
}
