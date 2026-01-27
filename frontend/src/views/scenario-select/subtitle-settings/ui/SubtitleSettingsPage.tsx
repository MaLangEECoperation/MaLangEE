"use client";

import { useRouter } from "next/navigation";

import { STORAGE_KEYS, Button, MalangEE } from "@/shared";

import { defaultSubtitleSettingsContents } from "../config";
import type { SubtitleSettingsPageContents } from "../model";

export interface SubtitleSettingsPageProps {
  contents?: SubtitleSettingsPageContents;
}

export function SubtitleSettingsPage({
  contents = defaultSubtitleSettingsContents,
}: SubtitleSettingsPageProps) {
  const router = useRouter();

  const handleChoice = (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEYS.SUBTITLE_ENABLED, enabled.toString());
    router.push("/scenario-select/voice-selection");
  };

  return (
    <>
      <div className="character-box relative">
        <MalangEE status="default" size={120} />
      </div>

      <div id="subtitle-settings" className="flex w-full flex-col items-center">
        <div className="text-group text-center">
          <h1 className="scenario-title">{contents.title}</h1>
          <p className="scenario-desc">{contents.description}</p>
        </div>

        <div className="mt-8 flex w-full max-w-md flex-col gap-4">
          <Button
            onClick={() => handleChoice(true)}
            className="h-14 w-full rounded-full bg-[#7666f5] text-base font-semibold text-white shadow-[0_10px_30px_rgba(118,102,245,0.35)] transition hover:bg-[#6758e8] disabled:opacity-60"
          >
            {contents.buttons.showSubtitle}
          </Button>
          <Button
            onClick={() => handleChoice(false)}
            variant="outline"
            className="h-14 w-full rounded-full border-2 border-[#7B6CF6] bg-white text-base font-semibold text-[#7B6CF6] transition hover:bg-[#f6f4ff] disabled:opacity-60"
          >
            {contents.buttons.hideSubtitle}
          </Button>
        </div>
      </div>
    </>
  );
}
