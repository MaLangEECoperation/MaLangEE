class AudioController:
    """
    [현재 사용되지 않음 / Future Use Only]
    
    이 클래스는 현재 프로젝트 구조(프론트엔드 오디오 캡처 + OpenAI 서버 VAD)에서는 사용되지 않습니다.
    모든 오디오 로직은 LLM과 클라이언트 측에서 처리됩니다.

    [나중에 이 파일이 필요할 수 있는 경우]
    1. 서버 사이드 노이즈 캔슬링:
       - 클라이언트에서 raw PCM을 받아 노이즈 필터링 후 OpenAI로 전송하고 싶을 때.
    
    2. 커스텀 VAD (Voice Activity Detection):
       - OpenAI의 VAD가 너무 민감하거나 둔감해서, 직접 파이썬 라이브러리(webrtcvad, silero-vad)로
         정밀하게 발화를 감지하고 끊고 싶을 때.
    
    3. 오디오 저장/분석:
       - 대화 내용을 서버 파일로 저장하거나, 감정 분석 모델을 별도로 돌리고 싶을 때
         process_audio_stream() 메서드를 통해 오디오 데이터를 후킹(Hooking)할 수 있습니다.
    """
    def __init__(self):
        self.is_listening = False
        self.is_speaking = False

    def start_listening(self):
        """오디오 입력 캡처를 시작합니다. (현재 미사용)"""
        self.is_listening = True
        pass

    def stop_listening(self):
        """오디오 입력 캡처를 중지합니다. (현재 미사용)"""
        self.is_listening = False
        pass

    def process_audio_stream(self, audio_chunk):
        """
        오디오 데이터 청크를 처리합니다. (현재 미사용)
        
        [활용 예시]
        def process_audio_stream(self, audio_chunk):
            cleaned_audio = self.noise_filter.apply(audio_chunk) # 노이즈 제거
            if self.vad.is_speech(cleaned_audio):                # 발화 감지
                return cleaned_audio
            return None
        """
        pass
