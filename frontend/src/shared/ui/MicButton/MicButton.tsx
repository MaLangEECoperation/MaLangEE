import { Mic, MicOff } from "lucide-react";
import { FC, KeyboardEvent } from "react";

import { MIC_BUTTON_LABELS } from "@/shared/config";

import "./MicButton.css";

interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  isMuted?: boolean;
  disabled?: boolean;
}

export const MicButton: FC<MicButtonProps> = ({
  isListening = false,
  onClick,
  size = "md",
  className = "",
  isMuted = false,
  disabled = false,
}) => {
  const sizeClasses = {
    sm: "mic-container-sm",
    md: "mic-container-md",
    lg: "mic-container-lg",
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 36,
  };

  // Determine aria-label based on state
  const getAriaLabel = (): string => {
    if (isMuted) return MIC_BUTTON_LABELS.MUTED;
    if (isListening) return MIC_BUTTON_LABELS.LISTENING;
    return MIC_BUTTON_LABELS.IDLE;
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`mic-container mb-6 mt-6 ${sizeClasses[size]} ${isListening ? "is-listening" : ""} ${isMuted ? "is-muted" : ""} ${disabled ? "is-disabled" : ""} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isListening}
      aria-label={getAriaLabel()}
      disabled={disabled}
    >
      {/* Waves */}
      <div className="waves">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />
      </div>

      {/* Main Mic Button */}
      <div className="mic-main">
        {isMuted ? (
          <MicOff size={iconSizes[size]} strokeWidth={2} />
        ) : (
          <Mic size={iconSizes[size]} strokeWidth={2} />
        )}
      </div>
    </button>
  );
};
