import Image from "next/image";
import React from "react";

export type MalangEEStatus = "default" | "talking" | "humm" | "sad";

interface MalangEEProps {
  status?: MalangEEStatus;
  size?: number;
  className?: string;
}

const statusImages: Record<MalangEEStatus, string> = {
  default: "/images/malangee.gif",
  talking: "/images/malangee-talking.gif",
  humm: "/images/malangee-humm.gif",
  sad: "/images/malangee-humm.gif", // sad 상태 이미지가 없으므로 humm으로 대체
};

export const MalangEE = ({ status = "default", size = 300, className = "" }: MalangEEProps) => {
  const imgSrc = statusImages[status] || statusImages.default;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src={imgSrc}
        alt={`MalangEE ${status}`}
        width={size}
        height={size}
        priority
        className="object-contain"
      />
    </div>
  );
};
