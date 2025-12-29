"use client";

import { FC, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ConversationState } from "../model/types";

export interface MicButtonProps {
  isRecording: boolean;
  isPermissionGranted: boolean;
  conversationState: ConversationState;
  onPress: () => void;
  onRelease: () => void;
  onRequestPermission: () => void;
  disabled?: boolean;
  className?: string;
}

export const MicButton: FC<MicButtonProps> = ({
  isRecording,
  isPermissionGranted,
  conversationState,
  onPress,
  onRelease,
  onRequestPermission,
  disabled = false,
  className,
}) => {
  const isProcessing = conversationState === "processing";
  const isSpeaking = conversationState === "speaking";
  const isListening = conversationState === "listening";

  const handleMouseDown = useCallback(() => {
    if (!isPermissionGranted) {
      onRequestPermission();
      return;
    }
    if (!disabled && !isProcessing && !isSpeaking) {
      onPress();
    }
  }, [isPermissionGranted, disabled, isProcessing, isSpeaking, onPress, onRequestPermission]);

  const handleMouseUp = useCallback(() => {
    if (isRecording) {
      onRelease();
    }
  }, [isRecording, onRelease]);

  const getStateLabel = () => {
    if (!isPermissionGranted) return "터치하여 마이크 권한 허용";
    if (isRecording || isListening) return "말하고 있어요...";
    if (isProcessing) return "AI가 생각하는 중...";
    if (isSpeaking) return "AI가 말하고 있어요";
    return "터치하고 말해보세요";
  };

  const getButtonColor = () => {
    if (!isPermissionGranted) return "bg-gray-400";
    if (isRecording || isListening) return "bg-red-500 animate-pulse";
    if (isProcessing) return "bg-yellow-500";
    if (isSpeaking) return "bg-blue-500 animate-pulse";
    return "bg-primary hover:bg-primary/90";
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={disabled}
        className={cn(
          "relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200",
          getButtonColor(),
          disabled && "cursor-not-allowed opacity-50",
          (isRecording || isListening) && "scale-110"
        )}
        aria-label={getStateLabel()}
      >
        {isProcessing ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : isRecording || isListening ? (
          <Mic className="h-8 w-8" />
        ) : !isPermissionGranted ? (
          <MicOff className="h-8 w-8" />
        ) : (
          <Mic className="h-8 w-8" />
        )}

        {/* 녹음 중 파동 효과 */}
        {(isRecording || isListening) && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="absolute inset-0 animate-pulse rounded-full bg-red-400 opacity-50" />
          </>
        )}

        {/* AI 말하는 중 파동 효과 */}
        {isSpeaking && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-75" />
          </>
        )}
      </button>

      <p className="text-sm text-muted-foreground">{getStateLabel()}</p>
    </div>
  );
};
