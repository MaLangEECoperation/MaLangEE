export interface VoiceOptionContents {
  id: string;
  name: string;
  description: string;
  sampleUrl: string;
}

export interface VoiceSelectionPageContents {
  /** 페이지 제목 */
  title: string;

  /** 네비게이션 버튼 aria-label */
  prevVoiceLabel: string;
  nextVoiceLabel: string;

  /** 미리듣기 버튼 */
  preview: {
    playing: string;
    default: string;
  };

  /** 시작 버튼 */
  startButton: string;

  /** 음성 옵션 목록 */
  voiceOptions: VoiceOptionContents[];
}
