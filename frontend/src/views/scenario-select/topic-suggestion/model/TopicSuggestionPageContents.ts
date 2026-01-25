export interface VoiceOptionContents {
  id: string;
  name: string;
  description: string;
}

export interface TopicSuggestionPageContents {
  /** 메인 화면 */
  main: {
    title: string;
    description: string;
    showMoreButton: string;
    directSpeechButton: string;
  };

  /** 로딩 상태 */
  loading: {
    title: string;
    description: string;
  };

  /** 에러 상태 */
  error: {
    title: string;
    description: string;
  };

  /** 시나리오 상세 팝업 */
  detailPopup: {
    placeLabel: string;
    partnerLabel: string;
    goalLabel: string;
    settingsTitle: string;
    subtitleToggleLabel: string;
    voiceToneLabel: string;
    startButton: string;
  };

  /** 음성 옵션 */
  voiceOptions: VoiceOptionContents[];

  /** 에러 메시지 */
  errors: {
    sessionCreateFailed: string;
  };
}
