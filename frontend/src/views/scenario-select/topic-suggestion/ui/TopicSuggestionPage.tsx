"use client";

import { ChevronLeft, ChevronRight, Mic, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { type Scenario, useScenarios, useCreateChatSession } from "@/features/chat";
import { STORAGE_KEYS, Button, Toggle, MalangEE, Dialog } from "@/shared";

import { defaultTopicSuggestionContents } from "../config";
import type { TopicSuggestionPageContents } from "../model";

export interface TopicSuggestionPageProps {
  contents?: TopicSuggestionPageContents;
}

const getRandomScenarios = (scenarios: Scenario[]): Scenario[] => {
  if (scenarios.length <= 5) return scenarios;
  return [...scenarios].sort(() => Math.random() - 0.5).slice(0, 5);
};

export function TopicSuggestionPage({
  contents = defaultTopicSuggestionContents,
}: TopicSuggestionPageProps) {
  const router = useRouter();
  const { data: scenarios, isLoading, error } = useScenarios();
  const createSessionMutation = useCreateChatSession();

  const [displayedScenarios, setDisplayedScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);

  const [showSubtitle, setShowSubtitle] = useState(true);
  const [voiceIndex, setVoiceIndex] = useState(1);

  const voiceOptions = contents.voiceOptions;

  useEffect(() => {
    // 페이지 로드 시 이전 세션 정보 초기화
    localStorage.removeItem(STORAGE_KEYS.CHAT_SESSION_ID);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATION_GOAL);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATION_PARTNER);
    localStorage.removeItem(STORAGE_KEYS.PLACE);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_VOICE);
    localStorage.removeItem(STORAGE_KEYS.SUBTITLE_ENABLED);
  }, []);

  useEffect(() => {
    if (scenarios && scenarios.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayedScenarios(getRandomScenarios(scenarios));
    }
  }, [scenarios]);

  const handleShowMore = () => {
    if (scenarios && scenarios.length > 0) {
      setDisplayedScenarios(getRandomScenarios(scenarios));
    }
  };

  const handleDetailClick = (scenario: Scenario, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedScenario(scenario);
    setShowDetailPopup(true);
  };

  const handlePrevVoice = () => {
    setVoiceIndex((prev) => (prev === 0 ? voiceOptions.length - 1 : prev - 1));
  };

  const handleNextVoice = () => {
    setVoiceIndex((prev) => (prev === voiceOptions.length - 1 ? 0 : prev + 1));
  };

  const startConversation = async (
    scenario: Scenario,
    place: string,
    partner: string,
    goal: string,
    voice: string,
    showText: boolean
  ) => {
    try {
      const sessionData = {
        scenario_id: scenario.id,
        scenario_place: place,
        scenario_partner: partner,
        scenario_goal: goal,
        voice: voice,
        show_text: showText,
      };

      const sessionResult = await createSessionMutation.mutateAsync(sessionData);

      localStorage.setItem(STORAGE_KEYS.SELECTED_VOICE, voice);
      localStorage.setItem(STORAGE_KEYS.SUBTITLE_ENABLED, showText.toString());
      localStorage.setItem(STORAGE_KEYS.CHAT_SESSION_ID, sessionResult.session_id);

      router.push(`/chat?sessionId=${sessionResult.session_id}`);
    } catch (err) {
      console.error("Failed to create session:", err);
      alert(contents.errors.sessionCreateFailed);
    }
  };

  const handleStartOriginal = () => {
    if (!selectedScenario) return;
    setShowDetailPopup(false);
    startConversation(
      selectedScenario,
      selectedScenario.place,
      selectedScenario.partner,
      selectedScenario.goal,
      voiceOptions[voiceIndex].id,
      showSubtitle
    );
  };

  if (isLoading) {
    return (
      <>
        <div className="character-box relative">
          <MalangEE status="default" size={120} />
        </div>
        <div id="topic-suggestion" className="flex w-full flex-col items-center">
          <div className="text-group text-center">
            <h1 className="scenario-title">{contents.loading.title}</h1>
            <p className="scenario-desc">{contents.loading.description}</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !scenarios || scenarios.length === 0) {
    return (
      <>
        <div className="character-box relative">
          <MalangEE status="humm" size={120} />
        </div>
        <div id="topic-suggestion" className="flex w-full flex-col items-center">
          <div className="text-group text-center">
            <h1 className="scenario-title">{contents.error.title}</h1>
            <p className="scenario-desc">{contents.error.description}</p>
          </div>
          <div className="mt-8">
            <Button asChild variant="outline-purple" size="xl" className="flex gap-2">
              <Link href="/scenario-select/direct-speech">
                <Mic size={20} />
                {contents.main.directSpeechButton}
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="character-box relative">
        <MalangEE status="default" size={120} />
      </div>

      <div id="topic-suggestion" className="flex w-full flex-col items-center">
        <div className="text-group text-center">
          <h1 className="scenario-title">{contents.main.title}</h1>
          <p className="scenario-desc">{contents.main.description}</p>
        </div>

        <div className="mt-8 flex w-full max-w-2xl flex-col gap-4">
          <div className="flex flex-wrap justify-center gap-3">
            {displayedScenarios.map((scenario) => (
              <div key={scenario.id} className="relative flex items-center gap-2">
                <Button
                  variant="outline-gray"
                  onClick={(e) => handleDetailClick(scenario, e)}
                  size="md"
                >
                  {scenario.title}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-center gap-3">
            <Button onClick={handleShowMore} variant="primary" size="lg" className="flex gap-2">
              <RefreshCw size={20} />
              {contents.main.showMoreButton}
            </Button>

            <Button asChild variant="outline-purple" size="lg" className="flex gap-2">
              <Link href="/scenario-select/direct-speech">
                <Mic size={20} />
                {contents.main.directSpeechButton}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {showDetailPopup && selectedScenario && (
        <Dialog onClose={() => setShowDetailPopup(false)} maxWidth="md" showCloseButton={true}>
          <div className="flex flex-col gap-6 py-6">
            <div id="detail-title" className="flex items-start gap-4 px-2">
              <div className="flex flex-shrink-0 items-center justify-center">
                <span className="text-brand text-4xl font-black leading-none tracking-tighter">
                  Lv{selectedScenario.level}
                </span>
              </div>

              <div className="flex flex-col text-left">
                <h2 className="text-text-primary text-xl font-bold leading-tight">
                  {selectedScenario.title}
                </h2>
                <p className="text-text-secondary mt-1 text-sm leading-snug">
                  {selectedScenario.description}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <div className="flex items-start gap-3">
                  <span className="text-brand min-w-[60px] text-sm font-bold">
                    {contents.detailPopup.placeLabel}
                  </span>
                  <span className="text-text-primary text-sm">{selectedScenario.place}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-brand min-w-[60px] text-sm font-bold">
                    {contents.detailPopup.partnerLabel}
                  </span>
                  <span className="text-text-primary text-sm">{selectedScenario.partner}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-brand min-w-[60px] text-sm font-bold">
                    {contents.detailPopup.goalLabel}
                  </span>
                  <span className="text-text-primary text-sm">{selectedScenario.goal}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="px-1 text-sm font-bold text-gray-700">
                  {contents.detailPopup.settingsTitle}
                </h3>
                <div className="space-y-5 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                  <Toggle
                    label={contents.detailPopup.subtitleToggleLabel}
                    enabled={showSubtitle}
                    onChange={setShowSubtitle}
                  />

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {contents.detailPopup.voiceToneLabel}
                    </p>
                    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                      <button
                        onClick={handlePrevVoice}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-50"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div className="flex-1 text-center">
                        <p className="font-bold text-gray-800">{voiceOptions[voiceIndex].name}</p>
                        <p className="text-[11px] leading-tight text-gray-500">
                          {voiceOptions[voiceIndex].description}
                        </p>
                      </div>
                      <button
                        onClick={handleNextVoice}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-50"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 flex gap-3">
              <Button
                variant="primary"
                size="lg"
                className="flex-1  text-lg font-bold  "
                onClick={handleStartOriginal}
              >
                {contents.detailPopup.startButton}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
