import { FC } from "react";
import Image from "next/image";
import "./MicButton.css";

/**
 * 마이크 버튼 컴포넌트의 Props
 */
export interface MicButtonProps {
  /** 현재 음성 녹음 중인지 여부 */
  isListening: boolean;
  /** 버튼 클릭 시 호출되는 핸들러 */
  onClick: () => void;
  /** 버튼 크기 */
  size?: "sm" | "md" | "lg";
  /** 추가 CSS 클래스 */
  className?: string;
}

export const MicButton: FC<MicButtonProps> = ({
  isListening,
  onClick,
  size = "md",
  className = "",
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

  return (
    <div
      className={`mic-container ${sizeClasses[size]} ${isListening ? "is-listening" : ""} ${className}`}
      onClick={onClick}
    >
      {/* Waves */}
      <div className="waves">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />
      </div>

      {/* Main Mic Button */}
      <div className="mic-main">
        <Image
          src="/images/mic-icon.svg"
          alt="Microphone"
          width={iconSizes[size]}
          height={iconSizes[size]}
          priority
        />
      </div>
    </div>
  );
};
