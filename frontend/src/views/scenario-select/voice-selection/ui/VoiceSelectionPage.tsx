"use client";

import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useRef, useEffect } from "react";

import { STORAGE_KEYS, debugError, Button, MalangEE } from "@/shared";

import { defaultVoiceSelectionContents } from "../config";
import type { VoiceSelectionPageContents } from "../model";

export interface VoiceSelectionPageProps {
  contents?: VoiceSelectionPageContents;
}

export function VoiceSelectionPage({
  contents = defaultVoiceSelectionContents,
}: VoiceSelectionPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <MalangEE status="default" size={150} />
        </div>
      }
    >
      <VoiceSelectionContent contents={contents} />
    </Suspense>
  );
}

interface VoiceSelectionContentProps {
  contents: VoiceSelectionPageContents;
}

function VoiceSelectionContent({ contents }: VoiceSelectionContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentVoiceIndex, setCurrentVoiceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voiceOptions = contents.voiceOptions;
  const currentVoice = voiceOptions[currentVoiceIndex];

  // sessionId가 있으면 그대로 전달
  const sessionId = searchParams.get("sessionId");

  const handlePrev = () => {
    stopSample();
    setCurrentVoiceIndex((prev) => (prev === 0 ? voiceOptions.length - 1 : prev - 1));
  };

  const handleNext = () => {
    stopSample();
    setCurrentVoiceIndex((prev) => (prev === voiceOptions.length - 1 ? 0 : prev + 1));
  };

  const playSample = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(currentVoice.sampleUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);

    audio.play().catch((err) => {
      debugError("Audio play failed:", err);
      setIsPlaying(false);
    });
  };

  const stopSample = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleNextStep = () => {
    stopSample();
    const selectedVoice = currentVoice?.id || "alloy";
    localStorage.setItem(STORAGE_KEYS.SELECTED_VOICE, selectedVoice);

    if (sessionId) {
      router.push(`/chat?sessionId=${sessionId}`);
    } else {
      router.push("/chat");
    }
  };

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className="character-box relative">
        <MalangEE status="default" size={120} />
      </div>

      <div id="voice-selection" className="flex w-full flex-col items-center">
        <div className="text-group text-center">
          <h1 className="scenario-title">{contents.title}</h1>
        </div>

        <div className="mt-4 w-full max-w-md">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handlePrev}
              className="flex h-10 w-10 cursor-pointer items-center justify-center text-gray-400 transition-all hover:text-gray-600"
              aria-label={contents.prevVoiceLabel}
            >
              <ChevronLeft size={32} strokeWidth={2.5} />
            </button>

            <div className="flex flex-1 flex-col items-center gap-3 py-4 text-center">
              <h2 className="text-text-primary text-3xl font-bold">{currentVoice.name}</h2>
              <p className="text-text-secondary text-sm">{currentVoice.description}</p>

              <button
                onClick={isPlaying ? stopSample : playSample}
                className={`mt-2 flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isPlaying ? "bg-brand text-white" : "bg-brand-50 text-brand hover:bg-brand-200"
                }`}
              >
                <Volume2 size={16} className={isPlaying ? "animate-pulse" : ""} />
                {isPlaying ? contents.preview.playing : contents.preview.default}
              </button>

              <div className="mt-4 flex justify-center gap-2">
                {voiceOptions.map((_, index) => (
                  <div
                    key={index}
                    className={`h-3 rounded-full transition-all ${
                      index === currentVoiceIndex ? "bg-brand w-10" : "bg-border w-3"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="flex h-10 w-10 cursor-pointer items-center justify-center text-gray-400 transition-all hover:text-gray-600"
              aria-label={contents.nextVoiceLabel}
            >
              <ChevronRight size={32} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="mt-10 w-full max-w-md">
          <Button onClick={handleNextStep} variant="primary" size="lg" fullWidth>
            {contents.startButton}
          </Button>
        </div>
      </div>
    </>
  );
}
