'use client';

import { FC, useCallback, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { MicButton } from '@/shared/ui/MicButton';
import { useMicrophoneCapture } from '../hook/useMicrophoneCapture';
import { useAudioPlayback } from '../hook/useAudioPlayback';
import type { VoiceRecorderProps, AudioChunk } from '../model/types';

/**
 * 음성 녹음기 컴포넌트
 * 마이크 캡처와 오디오 재생을 통합 관리
 */
export const VoiceRecorder: FC<VoiceRecorderProps> = ({
  onRecordingChange,
  onAudioChunk,
  onError,
  disabled = false,
  className,
}) => {
  const handleAudioChunk = useCallback(
    (chunk: AudioChunk) => {
      onAudioChunk?.(chunk);
    },
    [onAudioChunk]
  );

  const {
    isRecording,
    permissionStatus,
    error: micError,
    startRecording,
    stopRecording,
  } = useMicrophoneCapture({
    sampleRate: 16000,
    channelCount: 1,
    chunkDurationMs: 100,
    onAudioChunk: handleAudioChunk,
  });

  const {
    isPlaying,
    error: playbackError,
    stop: stopPlayback,
    clearQueue,
  } = useAudioPlayback({
    sampleRate: 24000,
  });

  // 에러 처리
  const error = micError || playbackError;
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // 녹음 토글
  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      onRecordingChange?.(false);
    } else {
      // 재생 중이면 중지
      if (isPlaying) {
        stopPlayback();
        clearQueue();
      }
      await startRecording();
      onRecordingChange?.(true);
    }
  }, [isRecording, isPlaying, stopRecording, startRecording, stopPlayback, clearQueue, onRecordingChange]);

  // 현재 상태 결정
  const getRecordingState = () => {
    if (isRecording) return 'recording';
    if (isPlaying) return 'playing';
    return 'idle';
  };

  const isDisabled = disabled || permissionStatus === 'denied';

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <MicButton
        isListening={isRecording}
        onClick={handleToggleRecording}
        isMuted={isDisabled}
        size="lg"
      />

      {/* 상태 표시 */}
      <div className="text-sm text-text-secondary">
        {getRecordingState() === 'recording' && (
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            녹음 중...
          </span>
        )}
        {getRecordingState() === 'playing' && (
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            재생 중...
          </span>
        )}
        {permissionStatus === 'denied' && (
          <span className="text-red-500">마이크 권한이 필요합니다</span>
        )}
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </div>
  );
};

// Public API로 재생 기능도 노출
export { useAudioPlayback } from '../hook/useAudioPlayback';
