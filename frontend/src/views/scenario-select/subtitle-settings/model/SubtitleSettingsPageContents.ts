export interface SubtitleSettingsPageContents {
  /** 페이지 제목 */
  title: string;

  /** 설명 */
  description: string;

  /** 버튼 텍스트 */
  buttons: {
    showSubtitle: string;
    hideSubtitle: string;
  };
}
