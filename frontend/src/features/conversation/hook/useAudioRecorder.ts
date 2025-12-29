"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { DEFAULT_AUDIO_CONFIG, type AudioConfig } from "../model/types";

export interface UseAudioRecorderOptions {
  config?: AudioConfig;
  onAudioData?: (data: Float32Array) => void;
  onError?: (error: Error) => void;
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPermissionGranted: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  requestPermission: () => Promise<boolean>;
  error: Error | null;
}

export const useAudioRecorder = (
  options: UseAudioRecorderOptions = {}
): UseAudioRecorderReturn => {
  const { config = DEFAULT_AUDIO_CONFIG, onAudioData, onError } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // 마이크 권한 요청
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: config.sampleRate,
          channelCount: config.channelCount,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 권한 확인 후 스트림 정리
      stream.getTracks().forEach((track) => track.stop());
      setIsPermissionGranted(true);
      setError(null);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("마이크 권한을 얻을 수 없습니다.");
      setError(error);
      setIsPermissionGranted(false);
      onError?.(error);
      return false;
    }
  }, [config.sampleRate, config.channelCount, onError]);

  // 녹음 시작
  const startRecording = useCallback(async () => {
    try {
      // 이미 녹음 중이면 무시
      if (isRecording) return;

      // 마이크 스트림 획득
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: config.sampleRate,
          channelCount: config.channelCount,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      setIsPermissionGranted(true);

      // AudioContext 생성
      const audioContext = new AudioContext({
        sampleRate: config.sampleRate,
      });
      audioContextRef.current = audioContext;

      // AudioWorklet 모듈 로드
      await audioContext.audioWorklet.addModule(
        "/audio-worklet-processor.js"
      );

      // 소스 노드 생성
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // AudioWorklet 노드 생성
      const workletNode = new AudioWorkletNode(audioContext, "audio-processor");
      workletNodeRef.current = workletNode;

      // 오디오 데이터 수신
      workletNode.port.onmessage = (event) => {
        if (event.data.type === "audio-data" && onAudioData) {
          onAudioData(event.data.audioData);
        }
      };

      // 연결
      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      setIsRecording(true);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("녹음을 시작할 수 없습니다.");
      setError(error);
      onError?.(error);
    }
  }, [isRecording, config.sampleRate, config.channelCount, onAudioData, onError]);

  // 녹음 중지
  const stopRecording = useCallback(() => {
    // 미디어 스트림 정리
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // AudioWorklet 노드 연결 해제
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    // 소스 노드 연결 해제
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // AudioContext 종료
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    isPermissionGranted,
    startRecording,
    stopRecording,
    requestPermission,
    error,
  };
};
